import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Trophy, 
  Target,
  BookOpen,
  Video,
  Mic,
  PenTool,
  Headphones,
  Globe,
  Lock,
  UserPlus,
  Settings,
  Star,
  TrendingUp,
  Award,
  Activity,
  MessageSquare,
  Brain
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

export default function Collaborate() {
  const [activeTab, setActiveTab] = useState("groups");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupFocus, setNewGroupFocus] = useState("general");
  const [newGroupType, setNewGroupType] = useState("public");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch study groups
  const { data: studyGroups = [], isLoading: studyGroupsLoading } = useQuery({
    queryKey: ["/api/study-groups"],
    queryFn: () => apiRequest("/api/study-groups")
  });

  // Fetch chat groups for collaboration
  const { data: chatGroups = [], isLoading: chatGroupsLoading } = useQuery({
    queryKey: ["/api/chat-groups", currentUser.collegeId],
    queryFn: () => apiRequest(`/api/chat-groups?collegeId=${currentUser.collegeId}&type=collaboration`)
  });

  // Fetch user's groups
  const { data: userGroups = [], isLoading: userGroupsLoading } = useQuery({
    queryKey: ["/api/users", currentUser.id, "chat-groups"],
    queryFn: () => apiRequest(`/api/users/${currentUser.id}/chat-groups`)
  });

  // Fetch forum posts for collaboration category
  const { data: collaborationPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/forum/posts", currentUser.collegeId, "collaboration"],
    queryFn: () => apiRequest(`/api/forum/posts?collegeId=${currentUser.collegeId}&categoryId=collaboration`)
  });

  // Create study group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: any) => apiRequest("/api/study-groups", {
      method: "POST",
      body: JSON.stringify(groupData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      setNewGroupName("");
      setNewGroupDescription("");
      toast({ title: "Success", description: "Study group created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create study group", variant: "destructive" });
    }
  });

  // Create collaboration chat group mutation
  const createChatGroupMutation = useMutation({
    mutationFn: (groupData: any) => apiRequest("/api/chat-groups", {
      method: "POST",
      body: JSON.stringify(groupData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-groups"] });
      setNewGroupName("");
      setNewGroupDescription("");
      toast({ title: "Success", description: "Collaboration group created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create collaboration group", variant: "destructive" });
    }
  });

  // Join study group mutation
  const joinStudyGroupMutation = useMutation({
    mutationFn: (groupId: string) => apiRequest(`/api/study-groups/${groupId}/join`, {
      method: "POST",
      body: JSON.stringify({ userId: currentUser.id })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      toast({ title: "Success", description: "Joined study group successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to join study group", variant: "destructive" });
    }
  });

  // Join chat group mutation
  const joinChatGroupMutation = useMutation({
    mutationFn: (groupId: string) => apiRequest(`/api/chat-groups/${groupId}/join`, {
      method: "POST",
      body: JSON.stringify({ userId: currentUser.id })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-groups"] });
      toast({ title: "Success", description: "Joined collaboration group successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to join collaboration group", variant: "destructive" });
    }
  });

  const handleCreateStudyGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Error", description: "Group name is required", variant: "destructive" });
      return;
    }

    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription,
      focus: newGroupFocus,
      creatorId: currentUser.id,
      collegeId: currentUser.collegeId,
      isActive: true,
      memberCount: 1,
      maxMembers: 50
    });
  };

  const handleCreateChatGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Error", description: "Group name is required", variant: "destructive" });
      return;
    }

    createChatGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription,
      type: "collaboration",
      visibility: newGroupType,
      collegeId: currentUser.collegeId,
      creatorId: currentUser.id,
      isActive: true,
      memberCount: 1,
      maxMembers: newGroupType === "private" ? 20 : 100
    });
  };

  const getFocusColor = (focus: string) => {
    const colors = {
      speaking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      writing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      reading: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      listening: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[focus as keyof typeof colors] || colors.general;
  };

  const getFocusIcon = (focus: string) => {
    const icons = {
      speaking: <Mic className="h-4 w-4" />,
      writing: <PenTool className="h-4 w-4" />,
      reading: <BookOpen className="h-4 w-4" />,
      listening: <Headphones className="h-4 w-4" />,
      general: <Brain className="h-4 w-4" />
    };
    return icons[focus as keyof typeof icons] || icons.general;
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Collaborate & Learn Together
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join study groups, practice with peers, and improve your English collaboratively
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Groups
            </TabsTrigger>
            <TabsTrigger value="my-groups" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              My Groups
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
          </TabsList>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            {/* Create Study Group Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Study Group
                </CardTitle>
                <CardDescription>
                  Start a structured study group with specific learning goals and regular sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Study group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Select value={newGroupFocus} onValueChange={setNewGroupFocus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          General English
                        </div>
                      </SelectItem>
                      <SelectItem value="speaking">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          Speaking Practice
                        </div>
                      </SelectItem>
                      <SelectItem value="writing">
                        <div className="flex items-center gap-2">
                          <PenTool className="h-4 w-4" />
                          Writing Skills
                        </div>
                      </SelectItem>
                      <SelectItem value="reading">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Reading Comprehension
                        </div>
                      </SelectItem>
                      <SelectItem value="listening">
                        <div className="flex items-center gap-2">
                          <Headphones className="h-4 w-4" />
                          Listening Skills
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Describe your study group goals, meeting schedule, and activities..."
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="mb-4"
                />
                <Button
                  onClick={handleCreateStudyGroup}
                  disabled={createGroupMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {createGroupMutation.isPending ? "Creating..." : "Create Study Group"}
                </Button>
              </CardContent>
            </Card>

            {/* Study Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyGroupsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading study groups...</div>
                </div>
              ) : studyGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Study Groups Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Be the first to create a study group and start collaborating!
                  </p>
                </div>
              ) : (
                studyGroups.map((group: any) => (
                  <Card key={group.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 flex items-center gap-2">
                            {getFocusIcon(group.focus)}
                            {group.name}
                          </CardTitle>
                          <Badge className={getFocusColor(group.focus)}>
                            {group.focus.charAt(0).toUpperCase() + group.focus.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          {group.memberCount}/{group.maxMembers}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {group.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          Created {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                        
                        {/* Group Stats */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                          <div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                              <Activity className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-green-600 dark:text-green-400 text-sm">
                              Active
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                              <TrendingUp className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-sm">
                              Level 3
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                              <Award className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm">
                              Gold
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => joinStudyGroupMutation.mutate(group.id)}
                          disabled={joinStudyGroupMutation.isPending}
                          size="sm"
                          className="flex-1"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getFocusIcon(group.focus)}
                                {group.name}
                              </DialogTitle>
                              <DialogDescription>
                                Study group details and information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {group.description}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Focus Area</h4>
                                <Badge className={getFocusColor(group.focus)}>
                                  {group.focus.charAt(0).toUpperCase() + group.focus.slice(1)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-1 text-sm">Members</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {group.memberCount}/{group.maxMembers}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1 text-sm">Status</h4>
                                  <p className="text-sm text-green-600 dark:text-green-400">
                                    {group.isActive ? "Active" : "Inactive"}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                onClick={() => joinStudyGroupMutation.mutate(group.id)}
                                disabled={joinStudyGroupMutation.isPending}
                                className="w-full"
                              >
                                Join Study Group
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Chat Groups Tab */}
          <TabsContent value="chat" className="space-y-6">
            {/* Create Chat Group Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Collaboration Group
                </CardTitle>
                <CardDescription>
                  Create a real-time chat group for instant collaboration and discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Collaboration group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Select value={newGroupType} onValueChange={setNewGroupType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Group visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public Group
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private Group
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Describe the purpose and goals of this collaboration group..."
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="mb-4"
                />
                <Button
                  onClick={handleCreateChatGroup}
                  disabled={createChatGroupMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {createChatGroupMutation.isPending ? "Creating..." : "Create Chat Group"}
                </Button>
              </CardContent>
            </Card>

            {/* Chat Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatGroupsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading chat groups...</div>
                </div>
              ) : chatGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Collaboration Groups Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create the first collaboration group for real-time discussions!
                  </p>
                </div>
              ) : (
                chatGroups.map((group: any) => (
                  <Card key={group.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {group.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {group.visibility === "private" ? (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Private
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Public
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          {group.memberCount}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {group.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          Last active {formatTimeAgo(group.updatedAt)}
                        </div>
                        
                        {/* Online indicator */}
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {Math.floor(Math.random() * 5) + 1} members online
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => joinChatGroupMutation.mutate(group.id)}
                          disabled={joinChatGroupMutation.isPending}
                          size="sm"
                          className="flex-1"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join Chat
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Groups Tab */}
          <TabsContent value="my-groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  My Groups
                </CardTitle>
                <CardDescription>
                  Groups you've joined and created
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userGroupsLoading ? (
                  <div className="text-center py-8">Loading your groups...</div>
                ) : userGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      You haven't joined any groups yet. Explore and join groups to start collaborating!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userGroups.map((group: any) => (
                      <Card key={group.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{group.name}</h4>
                            <Badge variant="outline">
                              {group.type || "Study Group"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {group.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Users className="h-3 w-3" />
                              {group.memberCount} members
                            </div>
                            <Button size="sm" variant="outline">
                              Open Chat
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Collaboration Discussions
                </CardTitle>
                <CardDescription>
                  Forum discussions about collaboration and group learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">Loading discussions...</div>
                ) : collaborationPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No collaboration discussions yet. Start a discussion about group learning!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collaborationPosts.map((post: any) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>by {post.author?.firstName} {post.author?.lastName}</span>
                                <span>{formatTimeAgo(post.createdAt)}</span>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.repliesCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}