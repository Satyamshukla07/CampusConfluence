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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Send, 
  FileText, 
  Image, 
  Video, 
  Music,
  Rss,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Upload,
  Download,
  Globe,
  Lock,
  UserPlus,
  MessageCircle,
  ThumbsUp,
  Reply,
  Hash,
  BookOpen,
  Brain,
  Sparkles
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

export default function Community() {
  const [activeTab, setActiveTab] = useState("forums");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [enableGrammarCheck, setEnableGrammarCheck] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupType, setNewGroupType] = useState("public");
  const [newRssFeedUrl, setNewRssFeedUrl] = useState("");
  const [newRssFeedTitle, setNewRssFeedTitle] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat groups
  const { data: chatGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/chat-groups", currentUser.collegeId],
    queryFn: () => apiRequest(`/api/chat-groups?collegeId=${currentUser.collegeId}`)
  });

  // Fetch forum categories
  const { data: forumCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/forum/categories", currentUser.collegeId],
    queryFn: () => apiRequest(`/api/forum/categories?collegeId=${currentUser.collegeId}`)
  });

  // Fetch forum posts
  const { data: forumPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/forum/posts", currentUser.collegeId, selectedCategory],
    queryFn: () => {
      let url = `/api/forum/posts?collegeId=${currentUser.collegeId}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      return apiRequest(url);
    }
  });

  // Fetch messages for selected group
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedGroup],
    queryFn: () => apiRequest(`/api/messages?groupId=${selectedGroup}`),
    enabled: !!selectedGroup
  });

  // Fetch RSS feeds
  const { data: rssFeeds = [], isLoading: feedsLoading } = useQuery({
    queryKey: ["/api/rss-feeds", currentUser.collegeId],
    queryFn: () => apiRequest(`/api/rss-feeds?collegeId=${currentUser.collegeId}`)
  });

  // Fetch user files
  const { data: userFiles = [], isLoading: filesLoading } = useQuery({
    queryKey: ["/api/users", currentUser.id, "files"],
    queryFn: () => apiRequest(`/api/users/${currentUser.id}/files`)
  });

  // Create chat group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: any) => apiRequest("/api/chat-groups", {
      method: "POST",
      body: JSON.stringify(groupData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-groups"] });
      setNewGroupName("");
      setNewGroupDescription("");
      toast({ title: "Success", description: "Chat group created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create chat group", variant: "destructive" });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest("/api/messages", {
      method: "POST",
      body: JSON.stringify(messageData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
      toast({ title: "Success", description: "Message sent successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  });

  // Create forum post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: any) => apiRequest("/api/forum/posts", {
      method: "POST",
      body: JSON.stringify(postData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setNewPostTitle("");
      setNewPostContent("");
      toast({ title: "Success", description: "Forum post created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create forum post", variant: "destructive" });
    }
  });

  // Submit RSS feed mutation
  const submitRssFeedMutation = useMutation({
    mutationFn: (feedData: any) => apiRequest("/api/rss-feeds", {
      method: "POST",
      body: JSON.stringify(feedData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
      setNewRssFeedUrl("");
      setNewRssFeedTitle("");
      toast({ title: "Success", description: "RSS feed submitted for approval!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit RSS feed", variant: "destructive" });
    }
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => apiRequest(`/api/chat-groups/${groupId}/join`, {
      method: "POST",
      body: JSON.stringify({ userId: currentUser.id })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-groups"] });
      toast({ title: "Success", description: "Joined group successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to join group", variant: "destructive" });
    }
  });

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Error", description: "Group name is required", variant: "destructive" });
      return;
    }

    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription,
      type: newGroupType,
      collegeId: currentUser.collegeId,
      creatorId: currentUser.id,
      isActive: true,
      memberCount: 1,
      maxMembers: newGroupType === "private" ? 50 : 1000
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    sendMessageMutation.mutate({
      content: newMessage,
      senderId: currentUser.id,
      groupId: selectedGroup,
      collegeId: currentUser.collegeId,
      messageType: "text",
      enableGrammarCheck
    });
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }

    createPostMutation.mutate({
      title: newPostTitle,
      content: newPostContent,
      authorId: currentUser.id,
      collegeId: currentUser.collegeId,
      categoryId: selectedCategory,
      enableGrammarCheck,
      repliesCount: 0,
      likesCount: 0,
      isSticky: false,
      isLocked: false
    });
  };

  const handleSubmitRssFeed = () => {
    if (!newRssFeedUrl.trim() || !newRssFeedTitle.trim()) {
      toast({ title: "Error", description: "URL and title are required", variant: "destructive" });
      return;
    }

    submitRssFeedMutation.mutate({
      title: newRssFeedTitle,
      url: newRssFeedUrl,
      submitterId: currentUser.id,
      collegeId: currentUser.collegeId,
      type: "blog",
      isActive: true,
      isApproved: false
    });
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Community Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Connect, collaborate, and learn together with your college community
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="forums" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forums
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Chat Groups
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              File Sharing
            </TabsTrigger>
            <TabsTrigger value="rss" className="flex items-center gap-2">
              <Rss className="h-4 w-4" />
              RSS Feeds
            </TabsTrigger>
            <TabsTrigger value="grammar" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Grammar Helper
            </TabsTrigger>
          </TabsList>

          {/* Forums Tab */}
          <TabsContent value="forums" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Forum Categories */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Forum Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "ghost"}
                      onClick={() => setSelectedCategory(null)}
                      className="w-full justify-start"
                    >
                      All Posts
                    </Button>
                    {forumCategories.map((category: any) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        onClick={() => setSelectedCategory(category.id)}
                        className="w-full justify-start"
                      >
                        {category.name}
                        <Badge variant="secondary" className="ml-auto">
                          {category.postsCount || 0}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Forum Posts */}
              <div className="lg:col-span-2 space-y-4">
                {/* Create New Post */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create New Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Post title..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="grammar-check"
                          checked={enableGrammarCheck}
                          onCheckedChange={setEnableGrammarCheck}
                        />
                        <Label htmlFor="grammar-check" className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Grammar Check
                        </Label>
                      </div>
                      <Button
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {createPostMutation.isPending ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Forum Posts List */}
                <div className="space-y-4">
                  {postsLoading ? (
                    <div className="text-center py-8">Loading posts...</div>
                  ) : forumPosts.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No posts yet. Be the first to start a discussion!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    forumPosts.map((post: any) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{post.title}</h3>
                                {post.isSticky && (
                                  <Badge variant="secondary">Pinned</Badge>
                                )}
                                {post.isLocked && (
                                  <Badge variant="outline">Locked</Badge>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {post.content}
                              </p>
                              {post.correctedContent && post.correctedContent !== post.content && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                      Grammar Corrected
                                    </span>
                                  </div>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    {post.correctedContent}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>by {post.author?.firstName} {post.author?.lastName}</span>
                                <span>{formatTimeAgo(post.createdAt)}</span>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {post.likesCount}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Reply className="h-4 w-4" />
                                  {post.repliesCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chat Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Groups List */}
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Chat Groups
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                        <DialogDescription>
                          Create a new chat group for your community
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Group name"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <Textarea
                          placeholder="Group description"
                          value={newGroupDescription}
                          onChange={(e) => setNewGroupDescription(e.target.value)}
                        />
                        <Select value={newGroupType} onValueChange={setNewGroupType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Public
                              </div>
                            </SelectItem>
                            <SelectItem value="private">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Private
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleCreateGroup}
                          disabled={createGroupMutation.isPending}
                          className="w-full"
                        >
                          {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {groupsLoading ? (
                        <div className="text-center py-4">Loading groups...</div>
                      ) : chatGroups.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No groups yet. Create the first one!
                        </div>
                      ) : (
                        chatGroups.map((group: any) => (
                          <Card
                            key={group.id}
                            className={`cursor-pointer transition-colors ${
                              selectedGroup === group.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                            }`}
                            onClick={() => setSelectedGroup(group.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{group.name}</h4>
                                  <p className="text-sm text-gray-500 truncate">
                                    {group.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {group.type === "private" ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Globe className="h-4 w-4 text-gray-400" />
                                  )}
                                  <Badge variant="secondary">
                                    {group.memberCount}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                {selectedGroup ? (
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        {chatGroups.find((g: any) => g.id === selectedGroup)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Messages */}
                      <ScrollArea className="flex-1 mb-4">
                        <div className="space-y-4">
                          {messagesLoading ? (
                            <div className="text-center py-4">Loading messages...</div>
                          ) : messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              No messages yet. Start the conversation!
                            </div>
                          ) : (
                            messages.map((message: any) => (
                              <div key={message.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                      {message.sender?.firstName} {message.sender?.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(message.sentAt)}
                                    </span>
                                    {message.isEdited && (
                                      <Badge variant="outline" className="text-xs">
                                        edited
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300">
                                    {message.content}
                                  </p>
                                  {message.correctedContent && message.correctedContent !== message.content && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded mt-2">
                                      <div className="flex items-center gap-1 mb-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-800 dark:text-green-200">
                                          Corrected
                                        </span>
                                      </div>
                                      <p className="text-sm text-green-700 dark:text-green-300">
                                        {message.correctedContent}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="message-grammar-check"
                            checked={enableGrammarCheck}
                            onCheckedChange={setEnableGrammarCheck}
                          />
                          <Label htmlFor="message-grammar-check" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Grammar Check
                          </Label>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={sendMessageMutation.isPending || !newMessage.trim()}
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Select a group to start chatting
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* File Sharing Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Share Files
                  </CardTitle>
                  <CardDescription>
                    Upload and share files with your community. Files expire after 24 hours unless saved to "My Video Resume".
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* My Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    My Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {filesLoading ? (
                        <div className="text-center py-4">Loading files...</div>
                      ) : userFiles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No files uploaded yet
                        </div>
                      ) : (
                        userFiles.map((file: any) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.fileType)}
                              <div>
                                <p className="font-medium">{file.fileName}</p>
                                <p className="text-sm text-gray-500">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.isTemporary && (
                                <Badge variant="outline" className="text-xs">
                                  Expires {formatTimeAgo(file.expiresAt)}
                                </Badge>
                              )}
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RSS Feeds Tab */}
          <TabsContent value="rss" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submit RSS Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Submit RSS Feed
                  </CardTitle>
                  <CardDescription>
                    Submit blog, Instagram, or news RSS feeds for community approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Feed title"
                    value={newRssFeedTitle}
                    onChange={(e) => setNewRssFeedTitle(e.target.value)}
                  />
                  <Input
                    placeholder="RSS feed URL"
                    value={newRssFeedUrl}
                    onChange={(e) => setNewRssFeedUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleSubmitRssFeed}
                    disabled={submitRssFeedMutation.isPending}
                    className="w-full"
                  >
                    {submitRssFeedMutation.isPending ? "Submitting..." : "Submit for Approval"}
                  </Button>
                </CardContent>
              </Card>

              {/* Approved RSS Feeds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rss className="h-5 w-5" />
                    Community Feeds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {feedsLoading ? (
                        <div className="text-center py-4">Loading feeds...</div>
                      ) : rssFeeds.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No RSS feeds approved yet
                        </div>
                      ) : (
                        rssFeeds.map((feed: any) => (
                          <Card key={feed.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{feed.title}</h4>
                                <Badge
                                  variant={feed.isApproved ? "default" : "secondary"}
                                  className="flex items-center gap-1"
                                >
                                  {feed.isApproved ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3" />
                                  )}
                                  {feed.isApproved ? "Approved" : "Pending"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {feed.url}
                              </p>
                              <p className="text-xs text-gray-500">
                                Submitted by {feed.submitter?.firstName} {feed.submitter?.lastName}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grammar Helper Tab */}
          <TabsContent value="grammar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Grammar Learning Assistant
                </CardTitle>
                <CardDescription>
                  Real-time grammar correction and learning powered by LanguageTool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                      How Grammar Check Works
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Enable "Grammar Check" when posting or messaging</li>
                    <li>• AI analyzes your text and suggests improvements</li>
                    <li>• See highlighted differences between original and corrected text</li>
                    <li>• Learn from explanations of grammar rules</li>
                    <li>• Track your progress over time</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Grammar Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Corrections Made</span>
                          <Badge variant="secondary">156</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Most Common Error</span>
                          <Badge variant="outline">Subject-Verb Agreement</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Improvement Score</span>
                          <Badge variant="default">78%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Corrections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="text-sm mb-1">
                              <span className="line-through text-red-600">I are going</span>{" "}
                              <span className="text-green-600">I am going</span>
                            </p>
                            <p className="text-xs text-gray-500">Subject-verb agreement</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="text-sm mb-1">
                              <span className="line-through text-red-600">alot</span>{" "}
                              <span className="text-green-600">a lot</span>
                            </p>
                            <p className="text-xs text-gray-500">Spelling</p>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}