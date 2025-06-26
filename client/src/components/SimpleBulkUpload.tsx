import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SimpleBulkUploadProps {
  title: string;
  description: string;
  uploadType: 'cefr' | 'users' | 'content';
  acceptedFormats: string[];
  templateUrl?: string;
  maxFileSize?: number; // in MB
}

export function SimpleBulkUpload({ 
  title, 
  description, 
  uploadType, 
  acceptedFormats, 
  templateUrl,
  maxFileSize = 10 
}: SimpleBulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successStats, setSuccessStats] = useState<{ total: number; success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', uploadType);
      
      return await apiRequest('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (data) => {
      setUploadStatus('success');
      setSuccessStats(data.stats);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cefr-bulk-sessions'] });
      toast({ 
        title: "Upload completed successfully",
        description: `Processed ${data.stats.total} records with ${data.stats.success} successful updates`
      });
    },
    onError: (error: any) => {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed. Please try again.');
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension || '')) {
      setErrorMessage(`Please select a valid file format: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize * 1024 * 1024) {
      setErrorMessage(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          setUploadStatus('processing');
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await uploadMutation.mutateAsync(file);
      setUploadProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setSuccessStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'uploading':
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading': return 'Uploading file...';
      case 'processing': return 'Processing data...';
      case 'success': return 'Upload completed successfully!';
      case 'error': return 'Upload failed';
      default: return 'Ready to upload';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        {templateUrl && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 1:</strong> Download the template file first, fill it with your data, then upload it here.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto"
                onClick={() => window.open(templateUrl, '_blank')}
              >
                Download Template
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* File Selection */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {!file ? (
              <div className="space-y-4">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">Select your file</p>
                  <p className="text-sm text-gray-500">
                    Supports: {acceptedFormats.join(', ')} (max {maxFileSize}MB)
                  </p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats.map(format => `.${format}`).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={resetUpload} variant="outline" size="sm">
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={getStatusColor()}>{getStatusMessage()}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Success Stats */}
          {uploadStatus === 'success' && successStats && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Upload Complete!</strong>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total:</span> {successStats.total}
                  </div>
                  <div>
                    <span className="font-medium text-green-600">Success:</span> {successStats.success}
                  </div>
                  <div>
                    <span className="font-medium text-red-600">Failed:</span> {successStats.failed}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <div className="flex justify-center">
            {uploadStatus === 'success' ? (
              <Button onClick={resetUpload} variant="outline">
                Upload Another File
              </Button>
            ) : (
              <Button 
                onClick={handleUpload}
                disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                className="px-8"
              >
                {uploadStatus === 'uploading' || uploadStatus === 'processing' ? 
                  'Processing...' : 
                  'Start Upload'
                }
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}