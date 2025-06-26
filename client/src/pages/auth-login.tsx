import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, BarChart3, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AuthLogin() {
  const { user, loading, signIn, userRole } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && userRole) {
      // Redirect based on user role
      switch (userRole) {
        case 'admin':
        case 'master_trainer':
          setLocation('/admin-dashboard');
          break;
        case 'college_admin':
          setLocation('/college-admin');
          break;
        case 'recruiter':
          setLocation('/recruiter-dashboard');
          break;
        case 'student':
          setLocation('/dashboard');
          break;
        default:
          setLocation('/dashboard');
      }
    }
  }, [user, userRole, setLocation]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Campus Yuva</h1>
          <p className="text-xl text-gray-600 mb-8">
            English Learning Platform for Indian College Students
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Secure Access</CardTitle>
                <CardDescription className="text-base">
                  Sign in with your Google account to access your personalized learning dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button 
                  onClick={handleSignIn}
                  className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <div className="text-center text-sm text-gray-500">
                  <p>Secure authentication powered by Google</p>
                  <p>Your data is protected and college-specific</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Platform Features</h3>
            </div>
            
            <div className="grid gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Student Learning</h4>
                    <p className="text-sm text-gray-600">Interactive practice modules and progress tracking</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold">Recruiter Dashboard</h4>
                    <p className="text-sm text-gray-600">Advanced filtering and video resume management</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Settings className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold">Admin Control</h4>
                    <p className="text-sm text-gray-600">Comprehensive management and analytics</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <h4 className="font-semibold">Data Security</h4>
                    <p className="text-sm text-gray-600">College-isolated data with role-based access</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}