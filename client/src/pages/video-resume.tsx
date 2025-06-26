import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Upload, 
  Play, 
  Trash2, 
  Edit,
  Eye,
  Download,
  Star,
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  FileVideo,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock user data - in real app this would come from auth context
const currentUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "Arjun",
  lastName: "Student",
  collegeId: "a9590d22-c0dc-489c-838f-5edae744e094",
  role: "student"
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

export default function VideoResume() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form data for new video resume
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [careerCategory, setCareerCategory] = useState("");
  const [careerSubCategory, setCareerSubCategory] = useState("");
  const [customCareerPath, setCustomCareerPath] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's video resumes
  const { data: videoResumes = [], isLoading } = useQuery({
    queryKey: ["/api/video-resumes", currentUser.id],
    queryFn: () => apiRequest(`/api/video-resumes?userId=${currentUser.id}`)
  });

  // Fetch interest notifications for the user
  const { data: interestNotifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/interest-notifications", currentUser.id],
    queryFn: () => apiRequest(`/api/interest-notifications?studentId=${currentUser.id}`)
  });

  // Create video resume mutation
  const createVideoResumeMutation = useMutation({
    mutationFn: (videoData: any) => apiRequest("/api/video-resumes", {
      method: "POST",
      body: JSON.stringify(videoData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-resumes"] });
      setShowUploadDialog(false);
      resetForm();
      toast({ title: "Success", description: "Video resume uploaded successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload video resume", variant: "destructive" });
    }
  });

  // Delete video resume mutation
  const deleteVideoResumeMutation = useMutation({
    mutationFn: (videoId: string) => apiRequest(`/api/video-resumes/${videoId}`, {
      method: "DELETE",
      body: JSON.stringify({ userId: currentUser.id })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-resumes"] });
      toast({ title: "Success", description: "Video resume deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete video resume", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCareerCategory("");
    setCareerSubCategory("");
    setCustomCareerPath("");
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({ 
          title: "Error", 
          description: "Video file size must be less than 100MB", 
          variant: "destructive" 
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({ 
          title: "Error", 
          description: "Please select a valid video file", 
          variant: "destructive" 
        });
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !title || !careerCategory || !careerSubCategory) {
      toast({ 
        title: "Error", 
        description: "Please fill all required fields and select a video", 
        variant: "destructive" 
      });
      return;
    }

    if (careerCategory === "Other" && !customCareerPath) {
      toast({ 
        title: "Error", 
        description: "Please specify your custom career path", 
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // In a real app, you would upload the video file to a storage service
      // For now, we'll simulate with a mock URL
      const mockVideoUrl = "https://example.com/video/" + Date.now();
      
      await createVideoResumeMutation.mutateAsync({
        title,
        description,
        videoUrl: mockVideoUrl,
        duration: 120, // Mock duration
        careerCategory,
        careerSubCategory: careerCategory === "Other" ? customCareerPath : careerSubCategory,
        customCareerPath: careerCategory === "Other" ? customCareerPath : null,
        userId: currentUser.id,
        isPublic: true
      });

      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Video className="h-10 w-10 text-purple-600" />
            My Video Resume
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Showcase your skills and personality with a 2-minute video resume
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
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-bold">
                    {videoResumes.reduce((sum: number, resume: any) => sum + (resume.viewsCount || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recruiter Views</p>
                  <p className="text-xl font-bold">
                    {videoResumes.reduce((sum: number, resume: any) => sum + (resume.recruiterViews || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Received</p>
                  <p className="text-xl font-bold">{interestNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">CEFR Level</p>
                  <p className="text-xl font-bold">
                    {videoResumes.find((r: any) => r.cefrLevel)?.cefrLevel || "Not Set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Resume Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload New Video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Video Resume
                </CardTitle>
                <CardDescription>
                  Create a 2-minute video showcasing your skills and personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Create Video Resume
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Upload Video Resume</DialogTitle>
                      <DialogDescription>
                        Upload a 2-minute video showcasing your candidacy
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Video Upload */}
                      <div>
                        <Label>Video File (Max 100MB, 2 minutes)</Label>
                        <div className="mt-2">
                          {!videoPreview ? (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                              <FileVideo className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Select your video resume file
                              </p>
                              <Input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoSelect}
                                className="max-w-xs mx-auto"
                              />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <video
                                src={videoPreview}
                                controls
                                className="w-full max-h-64 rounded-lg"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setVideoFile(null);
                                  setVideoPreview(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Video
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            placeholder="e.g., Software Developer Resume"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of your video content..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Career Path Selection */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Career Path Categories *</h4>
                        
                        <div>
                          <Label>Category</Label>
                          <Select value={careerCategory} onValueChange={setCareerCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select career category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(CAREER_CATEGORIES).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {careerCategory && careerCategory !== "Other" && (
                          <div>
                            <Label>Sub-Category</Label>
                            <Select value={careerSubCategory} onValueChange={setCareerSubCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub-category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CAREER_CATEGORIES[careerCategory as keyof typeof CAREER_CATEGORIES]?.map((subCategory) => (
                                  <SelectItem key={subCategory} value={subCategory}>
                                    {subCategory}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {careerCategory === "Other" && (
                          <div>
                            <Label>Custom Career Path</Label>
                            <Input
                              placeholder="Specify your career path..."
                              value={customCareerPath}
                              onChange={(e) => setCustomCareerPath(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="w-full" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || createVideoResumeMutation.isPending}
                          className="flex-1"
                        >
                          {isUploading ? "Uploading..." : "Upload Video Resume"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowUploadDialog(false)}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Existing Video Resumes */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Your Video Resumes</h3>
              
              {isLoading ? (
                <div className="text-center py-8">Loading your video resumes...</div>
              ) : videoResumes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Video Resume Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first video resume to showcase your skills to recruiters
                    </p>
                    <Button onClick={() => setShowUploadDialog(true)}>
                      Create Video Resume
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                videoResumes.map((resume: any) => (
                  <Card key={resume.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                        {/* Video Thumbnail */}
                        <div className="relative bg-gray-100 dark:bg-gray-800 md:col-span-1">
                          <div className="aspect-video flex items-center justify-center">
                            <Play className="h-16 w-16 text-gray-400" />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {Math.floor(resume.duration / 60)}:{String(resume.duration % 60).padStart(2, '0')}
                            </Badge>
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-6 md:col-span-2">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold mb-2">{resume.title}</h4>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {resume.description}
                              </p>
                              
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
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteVideoResumeMutation.mutate(resume.id)}
                                disabled={deleteVideoResumeMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {resume.viewsCount || 0} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {resume.recruiterViews || 0} recruiters
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {resume.interestCount || 0} interested
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-500">
                            Uploaded {formatTimeAgo(resume.createdAt)}
                            {resume.cefrAssignedBy && (
                              <span className="ml-2">
                                • CEFR level assigned by admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interest Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recruiter Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : interestNotifications.length === 0 ? (
                  <div className="text-center py-6">
                    <Star className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No recruiter interest yet
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {interestNotifications.map((notification: any) => (
                        <div key={notification.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{notification.subject}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            <Badge 
                              variant={notification.status === 'sent' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {notification.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Video Resume Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Keep it concise - aim for 90-120 seconds</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Good lighting and clear audio are essential</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Practice your introduction beforehand</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Highlight relevant skills and experiences</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Show your personality and enthusiasm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CEFR Level Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  CEFR Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Your English proficiency level will be assigned by an admin or master trainer.
                  </p>
                  {CEFR_LEVELS.map((level) => (
                    <div key={level} className="flex items-center gap-2">
                      <Badge className={getCefrColor(level)} size="sm">
                        {level}
                      </Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {level === "A1" && "Beginner"}
                        {level === "A2" && "Elementary"}
                        {level === "B1" && "Intermediate"}
                        {level === "B2" && "Upper Intermediate"}
                        {level === "C1" && "Advanced"}
                        {level === "C2" && "Proficient"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}