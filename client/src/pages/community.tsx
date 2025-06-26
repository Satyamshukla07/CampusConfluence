import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users, TrendingUp, Calendar, User, Heart, MessageCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, formatDate } from "@/lib/utils";

export default function Community() {
  const currentUser = { id: 1, firstName: "Arjun", lastName: "Kumar" };

  // Mock data for community posts
  const communityPosts = [
    {
      id: 1,
      author: { firstName: "Priya", lastName: "Sharma", college: "Mumbai University" },
      content: "Just completed my first job interview in English! Thanks to all the speaking practice sessions. The pronunciation exercises really helped boost my confidence. 💪",
      type: "achievement",
      likes: 12,
      comments: 5,
      shares: 2,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 2,
      author: { firstName: "Rahul", lastName: "Patel", college: "Delhi University" },
      content: "Looking for study partners for IELTS preparation. I'm focusing on writing tasks and would love to practice with others. Anyone interested in forming a study group?",
      type: "question",
      likes: 8,
      comments: 12,
      shares: 4,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: 3,
      author: { firstName: "Anjali", lastName: "Singh", college: "Bangalore Institute" },
      content: "Pro tip: Record yourself reading news articles daily. It helped me identify my weak pronunciation areas. Also, try shadowing technique with TED talks - game changer! 🎯",
      type: "tip",
      likes: 25,
      comments: 8,
      shares: 15,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "question":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "tip":
        return <MessageCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case "achievement":
        return <Badge variant="outline" className="text-green-600 border-green-200">Achievement</Badge>;
      case "question":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Question</Badge>;
      case "tip":
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Tip</Badge>;
      default:
        return <Badge variant="outline">Post</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">
          Connect with fellow learners, share experiences, and learn together
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Create Post */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Share with the community</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(currentUser.firstName, currentUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your English learning journey, ask questions, or give tips to fellow learners..."
                    className="mb-4"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Achievement
                      </Button>
                      <Button variant="outline" size="sm">
                        Question
                      </Button>
                      <Button variant="outline" size="sm">
                        Tip
                      </Button>
                    </div>
                    <Button>Post</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Posts */}
          <div className="space-y-6">
            {communityPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(post.author.firstName, post.author.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {post.author.firstName} {post.author.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {post.author.college} • {formatDate(post.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPostTypeIcon(post.type)}
                          {getPostTypeBadge(post.type)}
                        </div>
                      </div>
                      
                      <p className="text-foreground mb-4 leading-relaxed">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="px-2">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2">
                          <Share className="w-4 h-4 mr-1" />
                          {post.shares}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Members</span>
                    <span className="font-semibold text-foreground">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Posts Today</span>
                    <span className="font-semibold text-foreground">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Stories</span>
                    <span className="font-semibold text-foreground">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Job Interview Prep",
                    "IELTS Speaking Tips",
                    "Business English",
                    "Pronunciation Help",
                    "Writing Feedback",
                  ].map((topic, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start px-2 py-1 h-auto text-sm"
                    >
                      #{topic.replace(/\s+/g, "")}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Study Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Speaking Club", members: 124, online: true },
                    { name: "Writing Workshop", members: 89, online: false },
                    { name: "Business English", members: 67, online: true },
                  ].map((group, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border">
                      <div>
                        <h5 className="text-sm font-medium text-foreground">{group.name}</h5>
                        <p className="text-xs text-muted-foreground">{group.members} members</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {group.online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        <Button size="sm" variant="outline" className="text-xs">
                          Join
                        </Button>
                      </div>
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
