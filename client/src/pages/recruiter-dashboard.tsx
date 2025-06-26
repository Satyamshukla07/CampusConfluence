import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Filter,
  Users,
  Play,
  Mail,
  Download,
  Star,
  Eye,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Send,
  Heart,
  MessageSquare,
  Building,
  UserCheck,
  TrendingUp,
  FileText,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock recruiter data - in real app this would come from auth context
const currentRecruiter = {
  id: "recruiter-123",
  firstName: "Sarah",
  lastName: "Johnson",
  company: "Tech Corp",
  role: "recruiter"
};

// Career Categories and Sub-Categories
const CAREER_CATEGORIES = {
  "Technology": [
    "Engineering",
    "Software Development", 
    "Data Science",
    "Cybersecurity",
    "AI & ML",
    "Cloud Computing",
    "Game Development"
  ],
  "Finance & Management": [
    "CA",
    "CS", 
    "Investment Banking",
    "Finance Management",
    "Business Analyst",
    "Project Management",
    "HR",
    "Marketing",
    "Sales"
  ],
  "Healthcare": [
    "Medicine (MBBS, BDS)",
    "Pharmacy",
    "Nursing", 
    "Healthcare Management"
  ],
  "Other Promising Fields": [
    "Digital Marketing",
    "Animation & Multimedia",
    "Architecture",
    "Law",
    "Content Creation",
    "Civil Services",
    "Renewable Energy",
    "Teaching",
    "Research",
    "Entrepreneurship"
  ]
};

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const COURSE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"];
const GENDERS = ["Male", "Female", "Other"];

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState("search");
  const [showFilters, setShowFilters] = useState(true);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCefrLevels, setSelectedCefrLevels] = useState<string[]>([]);
  const [selectedCareerCategories, setSelectedCareerCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Interest form state
  const [interestSubject, setInterestSubject] = useState("");
  const [interestMessage, setInterestMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch colleges for filter
  const { data: colleges = [] } = useQuery({
    queryKey: ["/api/colleges"],
    queryFn: () => apiRequest("/api/colleges")
  });

  // Search video resumes with filters
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: [
      "/api/video-resumes/search",
      selectedColleges,
      selectedGender,
      searchQuery,
      selectedCourse,
      selectedYear,
      selectedCefrLevels,
      selectedCareerCategories,
      selectedSubCategories,
      currentPage
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      
      if (selectedColleges.length > 0) {
        selectedColleges.forEach(id => params.append('collegeIds', id));
      }
      if (selectedGender) params.set('gender', selectedGender);
      if (searchQuery) params.set('studentName', searchQuery);
      if (selectedCourse) params.set('courseName', selectedCourse);
      if (selectedYear) params.set('courseYear', selectedYear);
      if (selectedCefrLevels.length > 0) {
        selectedCefrLevels.forEach(level => params.append('cefrLevel', level));
      }
      if (selectedCareerCategories.length > 0) {
        selectedCareerCategories.forEach(cat => params.append('careerCategories', cat));
      }
      if (selectedSubCategories.length > 0) {
        selectedSubCategories.forEach(sub => params.append('careerSubCategories', sub));
      }
      
      params.set('limit', '20');
      params.set('offset', String((currentPage - 1) * 20));
      
      return apiRequest(`/api/video-resumes/search?${params.toString()}`);
    }
  });

  // Fetch recruiter activities
  const { data: activities = [] } = useQuery({
    queryKey: ["/api/recruiter-activities", currentRecruiter.id],
    queryFn: () => apiRequest(`/api/recruiter-activities?recruiterId=${currentRecruiter.id}`)
  });

  // Fetch sent notifications
  const { data: sentNotifications = [] } = useQuery({
    queryKey: ["/api/interest-notifications", currentRecruiter.id],
    queryFn: () => apiRequest(`/api/interest-notifications?recruiterId=${currentRecruiter.id}`)
  });

  // Send interest notification mutation
  const sendInterestMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/interest-notifications", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interest-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter-activities"] });
      setShowInterestDialog(false);
      setInterestSubject("");
      setInterestMessage("");
      toast({ title: "Success", description: "Interest notification sent successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send interest notification", variant: "destructive" });
    }
  });

  // Record activity mutation
  const recordActivityMutation = useMutation({
    mutationFn: (activity: any) => apiRequest("/api/recruiter-activities", {
      method: "POST",
      body: JSON.stringify(activity)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter-activities"] });
    }
  });

  const handleCollegeToggle = (collegeId: string) => {
    setSelectedColleges(prev => 
      prev.includes(collegeId) 
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId]
    );
  };

  const handleCefrToggle = (level: string) => {
    setSelectedCefrLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCareerCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleViewProfile = (student: any, videoResume: any) => {
    recordActivityMutation.mutate({
      recruiterId: currentRecruiter.id,
      studentId: student.id,
      videoResumeId: videoResume.id,
      activityType: "viewed_profile",
      notes: `Viewed ${student.firstName} ${student.lastName}'s video resume`
    });
  };

  const handleSendInterest = () => {
    if (!selectedStudent || !interestSubject.trim() || !interestMessage.trim()) {
      toast({ 
        title: "Error", 
        description: "Please fill in all fields", 
        variant: "destructive" 
      });
      return;
    }

    sendInterestMutation.mutate({
      recruiterId: currentRecruiter.id,
      studentId: selectedStudent.user.id,
      videoResumeId: selectedStudent.id,
      subject: interestSubject,
      message: interestMessage
    });
  };

  const clearFilters = () => {
    setSelectedColleges([]);
    setSelectedGender("");
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedCefrLevels([]);
    setSelectedCareerCategories([]);
    setSelectedSubCategories([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Technology": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Finance & Management": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Healthcare": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Other Promising Fields": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Other": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const getCefrColor = (level: string) => {
    const colors = {
      "A1": "bg-red-100 text-red-700",
      "A2": "bg-orange-100 text-orange-700",
      "B1": "bg-yellow-100 text-yellow-700",
      "B2": "bg-blue-100 text-blue-700",
      "C1": "bg-green-100 text-green-700",
      "C2": "bg-purple-100 text-purple-700"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-blue-600" />
            Recruiter Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find and connect with talented students through their video resumes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profiles Viewed</p>
                  <p className="text-xl font-bold">
                    {activities.filter((a: any) => a.activityType === 'viewed_profile').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Sent</p>
                  <p className="text-xl font-bold">{sentNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Responses</p>
                  <p className="text-xl font-bold">
                    {sentNotifications.filter((n: any) => n.status === 'responded').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Searches</p>
                  <p className="text-xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Students
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              My Activity
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Sent Notifications
            </TabsTrigger>
          </TabsList>

          {/* Search Students Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search Box */}
                    <div>
                      <Label>Student Name</Label>
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Colleges */}
                    <div>
                      <Label>Colleges</Label>
                      <ScrollArea className="h-32 mt-2">
                        <div className="space-y-2">
                          {colleges.map((college: any) => (
                            <div key={college.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={college.id}
                                checked={selectedColleges.includes(college.id)}
                                onCheckedChange={() => handleCollegeToggle(college.id)}
                              />
                              <Label htmlFor={college.id} className="text-sm">
                                {college.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Gender */}
                    <div>
                      <Label>Gender</Label>
                      <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Genders</SelectItem>
                          {GENDERS.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Course */}
                    <div>
                      <Label>Course</Label>
                      <Input
                        placeholder="e.g., Computer Science"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {/* Year */}
                    <div>
                      <Label>Year</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Years</SelectItem>
                          {COURSE_YEARS.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* CEFR Levels */}
                    <div>
                      <Label>CEFR Levels</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {CEFR_LEVELS.map((level) => (
                          <div key={level} className="flex items-center space-x-1">
                            <Checkbox
                              id={level}
                              checked={selectedCefrLevels.includes(level)}
                              onCheckedChange={() => handleCefrToggle(level)}
                            />
                            <Label htmlFor={level} className="text-xs">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Career Categories */}
                    <div>
                      <Label>Career Categories</Label>
                      <ScrollArea className="h-32 mt-2">
                        <div className="space-y-2">
                          {Object.keys(CAREER_CATEGORIES).map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={category}
                                checked={selectedCareerCategories.includes(category)}
                                onCheckedChange={() => handleCategoryToggle(category)}
                              />
                              <Label htmlFor={category} className="text-sm">
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search Results */}
              <div className="lg:col-span-3 space-y-4">
                {searchLoading ? (
                  <div className="text-center py-12">Loading student profiles...</div>
                ) : !searchResults?.resumes || searchResults.resumes.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Students Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Try adjusting your filters to find more candidates
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Found {searchResults.total} students
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={searchResults.resumes.length < 20}
                          onClick={() => setCurrentPage(p => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {searchResults.resumes.map((resume: any) => (
                        <Card key={resume.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                              {/* Video Thumbnail */}
                              <div className="relative bg-gray-100 dark:bg-gray-800">
                                <div className="aspect-video flex items-center justify-center">
                                  <Play className="h-12 w-12 text-gray-400" />
                                </div>
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.floor(resume.duration / 60)}:{String(resume.duration % 60).padStart(2, '0')}
                                  </Badge>
                                </div>
                              </div>

                              {/* Student Info */}
                              <div className="p-6 md:col-span-3">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarFallback>
                                        {resume.user?.firstName?.[0]}{resume.user?.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <div>
                                      <h3 className="text-lg font-semibold">
                                        {resume.user?.firstName} {resume.user?.lastName}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {resume.title}
                                      </p>
                                      
                                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                          <Building className="h-4 w-4" />
                                          {resume.college?.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <GraduationCap className="h-4 w-4" />
                                          {resume.user?.course} - {resume.user?.year}
                                        </div>
                                        {resume.user?.gender && (
                                          <span>{resume.user.gender}</span>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge className={getCategoryColor(resume.careerCategory)}>
                                          {resume.careerCategory}
                                        </Badge>
                                        <Badge variant="outline">
                                          {resume.careerSubCategory}
                                        </Badge>
                                        {resume.cefrLevel && (
                                          <Badge className={getCefrColor(resume.cefrLevel)}>
                                            CEFR {resume.cefrLevel}
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Eye className="h-4 w-4" />
                                          {resume.viewsCount || 0} views
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          {formatTimeAgo(resume.createdAt)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewProfile(resume.user, resume)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStudent(resume);
                                        setShowInterestDialog(true);
                                      }}
                                    >
                                      <Heart className="h-4 w-4 mr-1" />
                                      Interest
                                    </Button>
                                  </div>
                                </div>

                                {resume.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {resume.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent interactions with student profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No activity yet. Start exploring student profiles!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.notes}</p>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sent Interest Notifications</CardTitle>
                <CardDescription>
                  Track your interest notifications and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No notifications sent yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentNotifications.map((notification: any) => (
                      <div key={notification.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{notification.subject}</h4>
                          <Badge 
                            variant={notification.status === 'responded' ? 'default' : 'secondary'}
                          >
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          Sent {formatTimeAgo(notification.createdAt)}
                          {notification.viewedAt && (
                            <span className="ml-2">
                              • Viewed {formatTimeAgo(notification.viewedAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Send Interest Dialog */}
        <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Interest to Interview</DialogTitle>
              <DialogDescription>
                Express your interest in interviewing this candidate
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar>
                    <AvatarFallback>
                      {selectedStudent.user?.firstName?.[0]}{selectedStudent.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedStudent.user?.firstName} {selectedStudent.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.title}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Interview Opportunity - Software Developer"
                    value={interestSubject}
                    onChange={(e) => setInterestSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your message to the student..."
                    value={interestMessage}
                    onChange={(e) => setInterestMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSendInterest}
                    disabled={sendInterestMutation.isPending}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendInterestMutation.isPending ? "Sending..." : "Send Interest"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInterestDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}