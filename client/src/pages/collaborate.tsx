import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Calendar, MapPin, Plus, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/utils";

export default function Collaborate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = { id: 1 }; // Mock user

  const { data: studyGroups } = useQuery({
    queryKey: ["/api/study-groups"],
  });

  const { data: myGroups } = useQuery({
    queryKey: [`/api/users/${currentUser.id}/study-groups`],
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await apiRequest("POST", `/api/study-groups/${groupId}/join`, {
        userId: currentUser.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}/study-groups`] });
      toast({
        title: "Success!",
        description: "You have joined the study group successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join the study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getGroupIcon = (type: string) => {
    switch (type) {
      case "speaking":
        return <MessageCircle className="w-5 h-5" />;
      case "writing":
        return <Users className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getGroupColor = (type: string) => {
    switch (type) {
      case "speaking":
        return "from-primary to-blue-600";
      case "writing":
        return "from-secondary to-green-600";
      default:
        return "from-accent to-yellow-600";
    }
  };

  const isUserInGroup = (groupId: number) => {
    return myGroups?.some((group: any) => group.id === groupId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Collaborate & Learn</h1>
        <p className="text-muted-foreground">
          Join study groups, practice with peers, and improve together
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          placeholder="Search study groups..."
          className="flex-1"
        />
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* My Groups */}
      {myGroups && myGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">My Study Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group: any) => (
              <Card key={group.id} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${getGroupColor(group.type)}`}>
                      <div className="text-white">
                        {getGroupIcon(group.type)}
                      </div>
                    </div>
                    <Badge variant="default">Member</Badge>
                  </div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{group.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {group.memberCount} members
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {group.type}
                      </Badge>
                    </div>

                    {group.nextSession && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        Next: {formatDate(group.nextSession)} at {formatTime(group.nextSession)}
                      </div>
                    )}

                    <Button className="w-full" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Groups */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Available Study Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyGroups?.map((group: any) => {
            const userInGroup = isUserInGroup(group.id);
            
            return (
              <Card 
                key={group.id} 
                className={`hover:shadow-lg transition-all ${userInGroup ? 'opacity-50' : ''}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${getGroupColor(group.type)}`}>
                      <div className="text-white">
                        {getGroupIcon(group.type)}
                      </div>
                    </div>
                    <Badge variant={group.memberCount < group.maxMembers ? "default" : "secondary"}>
                      {group.memberCount < group.maxMembers ? "Open" : "Full"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{group.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {group.memberCount}/{group.maxMembers} members
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {group.type}
                      </Badge>
                    </div>

                    {group.nextSession && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        Next: {formatDate(group.nextSession)} at {formatTime(group.nextSession)}
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      disabled={userInGroup || group.memberCount >= group.maxMembers || joinGroupMutation.isPending}
                      onClick={() => joinGroupMutation.mutate(group.id)}
                    >
                      {userInGroup ? "Already Joined" : 
                       group.memberCount >= group.maxMembers ? "Group Full" :
                       joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
