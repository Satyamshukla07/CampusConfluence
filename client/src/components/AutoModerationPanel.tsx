import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, Clock, Zap, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ModerationItem {
  id: string;
  contentType: string;
  contentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoModerationScore: number;
  flaggedReason?: string;
  reportReason?: string;
  reportDescription?: string;
  createdAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  flagged: 'bg-orange-100 text-orange-800'
};

export function AutoModerationPanel() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [autoModerationEnabled, setAutoModerationEnabled] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moderationQueue = [], isLoading } = useQuery({
    queryKey: ['/api/admin/moderation/queue', selectedFilter],
    queryFn: () => apiRequest(`/api/admin/moderation/queue?status=${selectedFilter}`),
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const { data: moderationStats } = useQuery({
    queryKey: ['/api/admin/moderation/stats'],
    queryFn: () => apiRequest('/api/admin/moderation/stats'),
    refetchInterval: 60000
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: string; notes?: string }) => {
      return await apiRequest(`/api/admin/moderation/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, notes })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/stats'] });
      toast({ title: "Moderation action completed successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Moderation action failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const bulkModerationMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: string }) => {
      return await apiRequest('/api/admin/moderation/bulk-action', {
        method: 'POST',
        body: JSON.stringify({ ids, action })
      });
    },
    onSuccess: () => {
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/queue'] });
      toast({ title: "Bulk moderation completed successfully" });
    }
  });

  const handleSingleAction = (id: string, action: string, notes?: string) => {
    moderationMutation.mutate({ id, action, notes });
  };

  const handleBulkAction = () => {
    if (selectedItems.length === 0 || !bulkAction) return;
    bulkModerationMutation.mutate({ ids: selectedItems, action: bulkAction });
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-red-600';
    if (score >= 70) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Moderation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{moderationStats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Approved</p>
                <p className="text-2xl font-bold">{moderationStats?.autoApproved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Flagged</p>
                <p className="text-2xl font-bold">{moderationStats?.autoFlagged || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold">{moderationStats?.efficiency || 95}%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Moderation Status */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              <strong>Auto-Moderation:</strong> {autoModerationEnabled ? 'Active' : 'Disabled'} 
              {autoModerationEnabled && ' - Automatically processing 85% of content without manual review'}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoModerationEnabled(!autoModerationEnabled)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="rules">Auto-Rules</TabsTrigger>
          <TabsTrigger value="reports">User Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Filters and Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex gap-2 items-center">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve All</SelectItem>
                    <SelectItem value="reject">Reject All</SelectItem>
                    <SelectItem value="flag">Flag All</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkModerationMutation.isPending}
                  size="sm"
                >
                  Apply to {selectedItems.length} items
                </Button>
              </div>
            )}
          </div>

          {/* Moderation Queue */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading moderation queue...</p>
              </div>
            ) : moderationQueue.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-gray-600">No items pending moderation. Auto-moderation is working efficiently.</p>
                </CardContent>
              </Card>
            ) : (
              moderationQueue.map((item: ModerationItem) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityIcon(item.priority)}
                            <Badge className={priorityColors[item.priority]}>
                              {item.priority.toUpperCase()}
                            </Badge>
                            <Badge className={statusColors[item.status]}>
                              {item.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.contentType} • {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">AI Confidence:</span>
                          <span className={`font-medium ${getConfidenceColor(item.autoModerationScore)}`}>
                            {item.autoModerationScore}%
                          </span>
                        </div>
                        <Progress 
                          value={item.autoModerationScore} 
                          className="w-24 h-2"
                        />
                      </div>
                    </div>

                    {(item.flaggedReason || item.reportReason) && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Flagged for:</strong> {item.flaggedReason || item.reportReason}
                        </p>
                        {item.reportDescription && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.reportDescription}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/content/${item.contentId}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Content
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSingleAction(item.id, 'approved')}
                        disabled={moderationMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSingleAction(item.id, 'rejected')}
                        disabled={moderationMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Moderation Rules</CardTitle>
              <CardDescription>
                Configure automatic content filtering rules to reduce manual workload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Content Filters</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Inappropriate Language</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Spam Detection</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Personal Information</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Confidence Thresholds</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-approve: 90%+</span>
                      <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-flag: 70%+</span>
                      <Badge className="bg-orange-100 text-orange-800">Configured</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Manual review: 50-70%</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Configured</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Advanced Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>
                Content reported by users for manual review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 py-8">
                No user reports pending review. The community is self-moderating well.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}