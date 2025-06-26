import { useQuery } from "@tanstack/react-query";
import { Mic, Pen, Book, MessageCircle, Play, Clock, Target } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PracticeModal } from "@/components/practice-modal";

export default function Practice() {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const currentUser = { id: 1 }; // Mock user

  const { data: practiceModules } = useQuery({
    queryKey: ["/api/practice-modules"],
  });

  const { data: userProgress } = useQuery({
    queryKey: [`/api/users/${currentUser.id}/progress`],
  });

  const handleModuleClick = (module: any) => {
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
        return <Mic className="w-6 h-6" />;
      case "writing":
        return <Pen className="w-6 h-6" />;
      case "reading":
        return <Book className="w-6 h-6" />;
      default:
        return <MessageCircle className="w-6 h-6" />;
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case "speaking":
        return "from-primary/20 to-primary/10 border-primary/20";
      case "writing":
        return "from-secondary/20 to-secondary/10 border-secondary/20";
      case "reading":
        return "from-accent/20 to-accent/10 border-accent/20";
      default:
        return "from-primary/20 to-primary/10 border-primary/20";
    }
  };

  const filteredModules = practiceModules?.filter((module: any) => {
    if (activeTab === "all") return true;
    return module.type === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">English Practice</h1>
        <p className="text-muted-foreground">
          Improve your English skills with our comprehensive practice modules
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Modules</TabsTrigger>
          <TabsTrigger value="speaking">Speaking</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules?.map((module: any) => {
              const progress = getProgressForModule(module.id);
              const isCompleted = progress === 100;
              
              return (
                <Card 
                  key={module.id}
                  className={`cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br ${getModuleColor(module.type)}`}
                  onClick={() => handleModuleClick(module)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${
                        module.type === "speaking" ? "from-primary to-blue-600" :
                        module.type === "writing" ? "from-secondary to-green-600" :
                        "from-accent to-yellow-600"
                      }`}>
                        <div className="text-white">
                          {getModuleIcon(module.type)}
                        </div>
                      </div>
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {module.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <p className="text-muted-foreground">{module.description}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.duration} minutes
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Target className="w-4 h-4 mr-1" />
                          {module.exercises?.length || 5} exercises
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <Button 
                        className="w-full" 
                        variant={isCompleted ? "outline" : "default"}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isCompleted ? "Review" : progress > 0 ? "Continue" : "Start"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Practice Modal */}
      <PracticeModal
        isOpen={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
        module={selectedModule}
      />
    </div>
  );
}
