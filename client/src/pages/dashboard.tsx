import { useQuery } from "@tanstack/react-query";
import { Rocket, TrendingUp, Mic, Pen, Book, MessageCircle, Building, MapPin, Clock, IndianRupee } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { PracticeModal } from "@/components/practice-modal";
import { getGreeting } from "@/lib/utils";

export default function Dashboard() {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  // Get colleges and set current college context
  const { data: colleges } = useQuery({
    queryKey: ["/api/colleges"],
  });

  const currentCollege = colleges?.[0]; // Use first college for demo
  
  // Mock user data - in real app, get from auth context with actual UUID
  const currentUser = {
    id: "550e8400-e29b-41d4-a716-446655440000", // Mock UUID for demo
    firstName: "Arjun",
    lastName: "Kumar",
    college: currentCollege?.name || "Delhi University",
    collegeId: currentCollege?.id,
    englishLevel: "intermediate",
    practiceHours: 24,
    streak: 7,
    speakingScore: 78,
    writingScore: 85,
    readingScore: 92,
  };

  const { data: practiceModules } = useQuery({
    queryKey: ["/api/practice-modules"],
    queryFn: () => 
      fetch(`/api/practice-modules?collegeId=${currentUser.collegeId}`)
        .then(res => res.json()),
    enabled: !!currentUser.collegeId,
  });

  const { data: userProgress } = useQuery({
    queryKey: [`/api/users/${currentUser.id}/progress`],
    enabled: !!currentUser.id,
  });

  const { data: studyGroups } = useQuery({
    queryKey: ["/api/study-groups"],
    queryFn: () => 
      fetch(`/api/study-groups?collegeId=${currentUser.collegeId}`)
        .then(res => res.json()),
    enabled: !!currentUser.collegeId,
  });

  const { data: jobPostings } = useQuery({
    queryKey: ["/api/job-postings"],
    queryFn: () => 
      fetch(`/api/job-postings?collegeId=${currentUser.collegeId}`)
        .then(res => res.json()),
    enabled: !!currentUser.collegeId,
  });

  const handleSidebarAction = (action: string) => {
    if (action === "speaking-practice") {
      const speakingModule = practiceModules?.find((m: any) => m.type === "speaking");
      if (speakingModule) {
        setSelectedModule(speakingModule);
        setShowPracticeModal(true);
      }
    }
  };

  const handlePracticeModuleClick = (module: any) => {
    setSelectedModule(module);
    setShowPracticeModal(true);
  };

  const getProgressForModule = (moduleId: number) => {
    const progress = userProgress?.find((p: any) => p.moduleId === moduleId);
    return progress?.progress || 0;
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "speaking":
        return <Mic className="w-5 h-5" />;
      case "writing":
        return <Pen className="w-5 h-5" />;
      case "reading":
        return <Book className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case "speaking":
        return "text-primary bg-primary/10";
      case "writing":
        return "text-secondary bg-secondary/10";
      case "reading":
        return "text-accent bg-accent/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar user={currentUser} onAction={handleSidebarAction} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Welcome Section */}
          <div className="gradient-primary rounded-xl text-white p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {currentUser.firstName}! 👋
                </h1>
                <p className="text-blue-100 mb-4">
                  Ready to boost your English skills today? You're on a {currentUser.streak}-day streak!
                </p>
                <Button className="bg-white text-primary hover:bg-blue-50">
                  Continue Learning
                </Button>
              </div>
              <div className="hidden md:block">
                <Rocket className="w-24 h-24 text-blue-200" />
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg">Speaking Score</CardTitle>
                  <Mic className="text-primary w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{currentUser.speakingScore}</div>
                <div className="flex items-center text-sm text-secondary">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+5 from last week</span>
                </div>
                <Progress value={currentUser.speakingScore} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg">Writing Score</CardTitle>
                  <Pen className="text-secondary w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-secondary mb-2">{currentUser.writingScore}</div>
                <div className="flex items-center text-sm text-secondary">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+8 from last week</span>
                </div>
                <Progress value={currentUser.writingScore} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg">Reading Score</CardTitle>
                  <Book className="text-accent w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-accent mb-2">{currentUser.readingScore}</div>
                <div className="flex items-center text-sm text-secondary">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+3 from last week</span>
                </div>
                <Progress value={currentUser.readingScore} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Practice Modules */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Today's Practice</CardTitle>
                <Button variant="link" className="text-primary">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {practiceModules?.map((module: any) => {
                  const progress = getProgressForModule(module.id);
                  const isCompleted = progress === 100;
                  
                  return (
                    <div
                      key={module.id}
                      className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handlePracticeModuleClick(module)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getModuleColor(module.type)}`}>
                            {getModuleIcon(module.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{module.title}</h4>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                          {isCompleted ? "Complete" : `${module.duration} min`}
                        </Badge>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {isCompleted 
                          ? "Great job! All exercises completed"
                          : `${Math.round(progress / 20)} of ${module.exercises?.length || 5} exercises completed`
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Study Groups */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Study Groups</CardTitle>
                  <Button variant="link" className="text-primary">
                    Join More
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studyGroups?.slice(0, 3).map((group: any) => (
                    <div
                      key={group.id}
                      className="flex items-center space-x-4 p-3 border border-border rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                        <MessageCircle className="text-white w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.memberCount} active members • Next session: {group.nextSession ? "Today 6 PM" : "Weekly sessions"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Opportunities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recommended Jobs</CardTitle>
                  <Button variant="link" className="text-primary">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPostings?.slice(0, 3).map((job: any) => (
                    <div
                      key={job.id}
                      className="border border-border rounded-lg p-4 hover:border-accent hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Building className="text-accent w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          95% match
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.duration}
                        </span>
                        <span className="flex items-center">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Practice Modal */}
      <PracticeModal
        isOpen={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
        module={selectedModule}
      />
    </div>
  );
}
