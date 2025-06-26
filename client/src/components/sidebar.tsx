import { User, Clock, Target, UserPen, Mic, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getEnglishLevelProgress } from "@/lib/utils";

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    college: string;
    englishLevel: string;
    practiceHours: number;
    streak: number;
  };
  onAction?: (action: string) => void;
}

export function Sidebar({ user, onAction }: SidebarProps) {
  const englishLevelProgress = getEnglishLevelProgress(user.englishLevel);
  const progressToNext = user.englishLevel === "intermediate" ? 35 : 
                        user.englishLevel === "beginner" ? 75 : 10;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl font-bold">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-muted-foreground text-sm">{user.college}</p>
          </div>

          {/* English Proficiency Level */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">English Level</span>
              <span className="text-sm font-semibold text-secondary capitalize">
                {user.englishLevel}
              </span>
            </div>
            <Progress value={englishLevelProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progressToNext}% to {user.englishLevel === "beginner" ? "Intermediate" : 
                                 user.englishLevel === "intermediate" ? "Advanced" : "Expert"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user.practiceHours}</div>
              <div className="text-xs text-muted-foreground">Practice Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{user.streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          <Button 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onAction?.("edit-profile")}
          >
            <UserPen className="mr-2 w-4 h-4" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start p-3 h-auto border-border hover:border-primary hover:bg-primary/5"
              onClick={() => onAction?.("speaking-practice")}
            >
              <Mic className="text-primary mr-3 w-5 h-5" />
              <span className="text-foreground">Speaking Practice</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start p-3 h-auto border-border hover:border-secondary hover:bg-secondary/5"
              onClick={() => onAction?.("find-partner")}
            >
              <Users className="text-secondary mr-3 w-5 h-5" />
              <span className="text-foreground">Find Study Partner</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start p-3 h-auto border-border hover:border-accent hover:bg-accent/5"
              onClick={() => onAction?.("browse-jobs")}
            >
              <Briefcase className="text-accent mr-3 w-5 h-5" />
              <span className="text-foreground">Browse Jobs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
