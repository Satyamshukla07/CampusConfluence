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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Settings,
  Upload,
  BarChart3,
  Users,
  Shield,
  AlertTriangle,
  FileSpreadsheet,
  Palette,
  Cog,
  TrendingUp,
  Eye,
  Calendar,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  UserCheck,
  Activity,
  Globe,
  School,
  Award,
  Mail,
  Bell,
  PieChart,
  BarChart2,
  LineChart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock current admin user
const currentAdmin = {
  id: "admin-123",
  firstName: "Admin",
  lastName: "User",
  role: "super_admin", // super_admin, college_admin, master_trainer
  collegeId: null // null for super_admin
};

// System configuration categories
const CONFIG_CATEGORIES = {
  "theme": "Theme & Design",
  "features": "Feature Settings",
  "content": "Content Management",
  "notifications": "Notifications",
  "security": "Security Settings"
};

// Analytics chart types
const CHART_TYPES = [
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "bar", label: "Bar Chart", icon: BarChart2 },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "heatmap", label: "Heatmap", icon: Activity }
];

// Moderation priorities
const MODERATION_PRIORITIES = {
  "low": { color: "bg-green-100 text-green-800", label: "Low" },
  "medium": { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
  "high": { color: "bg-orange-100 text-orange-800", label: "High" },
  "critical": { color: "bg-red-100 text-red-800", label: "Critical" }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // Configuration state
  const [configKey, setConfigKey] = useState("");
  const [configValue, setConfigValue] = useState("");
  const [configCategory, setConfigCategory] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  
  // Bulk upload state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Report generation state
  const [reportName, setReportName] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportChartType, setReportChartType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system configurations
  const { data: systemConfigs = [] } = useQuery({
    queryKey: ["/api/admin/system-configs"],
    queryFn: () => apiRequest("/api/admin/system-configs")
  });

  // Fetch analytics overview
  const { data: analyticsOverview = {} } = useQuery({
    queryKey: ["/api/admin/analytics/overview"],
    queryFn: () => apiRequest("/api/admin/analytics/overview")
  });

  // Fetch content moderation queue
  const { data: moderationQueue = [] } = useQuery({
    queryKey: ["/api/admin/moderation/queue"],
    queryFn: () => apiRequest("/api/admin/moderation/queue")
  });

  // Fetch CEFR bulk upload sessions
  const { data: bulkSessions = [] } = useQuery({
    queryKey: ["/api/admin/cefr-bulk-sessions"],
    queryFn: () => apiRequest("/api/admin/cefr-bulk-sessions")
  });

  // Fetch usage analytics for dashboard
  const { data: usageStats = {} } = useQuery({
    queryKey: ["/api/admin/analytics/usage"],
    queryFn: () => apiRequest("/api/admin/analytics/usage")
  });

  // Create system configuration mutation
  const createConfigMutation = useMutation({
    mutationFn: (config: any) => apiRequest("/api/admin/system-configs", {
      method: "POST",
      body: JSON.stringify(config)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-configs"] });
      setShowConfigDialog(false);
      resetConfigForm();
      toast({ title: "Success", description: "Configuration saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    }
  });

  // CEFR bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/cefr-bulk-upload", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cefr-bulk-sessions"] });
      setShowBulkUploadDialog(false);
      setBulkFile(null);
      setUploadProgress(0);
      toast({ title: "Success", description: "CEFR bulk upload initiated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process bulk upload", variant: "destructive" });
    }
  });

  // Moderation action mutation
  const moderationActionMutation = useMutation({
    mutationFn: ({ moderationId, action, notes }: any) => 
      apiRequest(`/api/admin/moderation/${moderationId}/action`, {
        method: "POST",
        body: JSON.stringify({ action, notes })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/queue"] });
      toast({ title: "Success", description: "Moderation action completed!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process moderation action", variant: "destructive" });
    }
  });

  const resetConfigForm = () => {
    setConfigKey("");
    setConfigValue("");
    setConfigCategory("");
    setConfigDescription("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast({ 
          title: "Error", 
          description: "Please select a CSV or Excel file", 
          variant: "destructive" 
        });
        return;
      }
      setBulkFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast({ 
        title: "Error", 
        description: "Please select a file to upload", 
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
      await bulkUploadMutation.mutateAsync({
        fileName: bulkFile.name,
        fileType: bulkFile.name.endsWith('.csv') ? 'csv' : 'xlsx',
        uploadedBy: currentAdmin.id,
        collegeId: currentAdmin.collegeId
      });

      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleModerationAction = (moderationId: string, action: string, notes?: string) => {
    moderationActionMutation.mutate({ moderationId, action, notes });
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

  const getPriorityColor = (priority: string) => {
    return MODERATION_PRIORITIES[priority as keyof typeof MODERATION_PRIORITIES]?.color || 
           "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Settings className="h-10 w-10 text-indigo-600" />
            Admin Control Panel
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage system configuration, analytics, and content moderation
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold">{usageStats.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-xl font-bold">{usageStats.activeSessions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flag className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Moderation</p>
                  <p className="text-xl font-bold">{moderationQueue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Colleges</p>
                  <p className="text-xl font-bold">{usageStats.totalColleges || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="cefr" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              CEFR Management
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Content Moderation
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Performance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage Usage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Video resume uploaded</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Content flagged for review</p>
                        <p className="text-xs text-gray-500">12 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage Trends</CardTitle>
                <CardDescription>
                  Overview of platform activity over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">Usage trend chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">System Configuration</h3>
              <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Cog className="h-4 w-4" />
                    Add Configuration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add System Configuration</DialogTitle>
                    <DialogDescription>
                      Configure system settings, themes, and feature flags
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="configKey">Configuration Key</Label>
                      <Input
                        id="configKey"
                        placeholder="e.g., theme.primary_color"
                        value={configKey}
                        onChange={(e) => setConfigKey(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="configValue">Value</Label>
                      <Input
                        id="configValue"
                        placeholder="e.g., #6366f1"
                        value={configValue}
                        onChange={(e) => setConfigValue(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="configCategory">Category</Label>
                      <Select value={configCategory} onValueChange={setConfigCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONFIG_CATEGORIES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="configDescription">Description</Label>
                      <Textarea
                        id="configDescription"
                        placeholder="Describe this configuration setting..."
                        value={configDescription}
                        onChange={(e) => setConfigDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => createConfigMutation.mutate({
                          configKey,
                          configValue: JSON.stringify(configValue),
                          category: configCategory,
                          description: configDescription,
                          updatedBy: currentAdmin.id
                        })}
                        disabled={createConfigMutation.isPending}
                      >
                        {createConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemConfigs.map((config: any) => (
                <Card key={config.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{config.configKey}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {CONFIG_CATEGORIES[config.category as keyof typeof CONFIG_CATEGORIES]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                      {JSON.stringify(config.configValue)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Updated {formatTimeAgo(config.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CEFR Management Tab */}
          <TabsContent value="cefr" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">CEFR Level Management</h3>
              <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Upload CEFR Levels
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Upload CEFR Levels</DialogTitle>
                    <DialogDescription>
                      Upload a CSV or Excel file to assign CEFR levels to multiple students
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>File Upload (CSV or Excel)</Label>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="mt-2"
                      />
                      {bulkFile && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {bulkFile.name}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">File Format Requirements:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Column 1: Student Email or ID</li>
                        <li>• Column 2: CEFR Level (A1, A2, B1, B2, C1, C2)</li>
                        <li>• Column 3: Assignment Notes (optional)</li>
                      </ul>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleBulkUpload}
                        disabled={!bulkFile || isUploading}
                      >
                        {isUploading ? "Processing..." : "Upload & Process"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowBulkUploadDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Bulk Upload Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bulk Upload Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {bulkSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No bulk upload sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulkSessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {session.successfulRecords}/{session.totalRecords} successful
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(session.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={session.status === 'completed' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {session.status}
                          </Badge>
                          {session.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Content Moderation Queue
                </CardTitle>
                <CardDescription>
                  Review and manage flagged content using automated and manual moderation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {moderationQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-gray-600">No content pending moderation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderationQueue.map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getPriorityColor(item.priority)}>
                                {MODERATION_PRIORITIES[item.priority as keyof typeof MODERATION_PRIORITIES]?.label}
                              </Badge>
                              <Badge variant="outline">{item.contentType}</Badge>
                              <Badge variant="outline">{item.moderationType}</Badge>
                            </div>
                            <p className="font-medium">{item.flaggedReason}</p>
                            <p className="text-sm text-gray-600">{item.reportDescription}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleModerationAction(item.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleModerationAction(item.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        {item.autoModerationScore && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <p className="text-sm font-medium mb-1">AI Moderation Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-500 h-2 rounded-full" 
                                  style={{ width: `${item.autoModerationScore * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{Math.round(item.autoModerationScore * 100)}%</span>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Reported {formatTimeAgo(item.createdAt)}
                        </p>
                      </div>
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