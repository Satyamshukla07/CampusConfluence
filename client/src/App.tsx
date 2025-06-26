import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import Dashboard from "@/pages/dashboard";
import Practice from "@/pages/practice";
import Collaborate from "@/pages/collaborate";
import Jobs from "@/pages/jobs";
import Community from "@/pages/community";
import VideoResume from "@/pages/video-resume";
import RecruiterDashboard from "@/pages/recruiter-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AuthLogin from "@/pages/auth-login";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Campus Yuva...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthLogin />;
  }

  // Role-based route protection
  const isAuthorized = (requiredRoles: string[]) => {
    return userRole && requiredRoles.includes(userRole);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={{ firstName: user.displayName?.split(' ')[0] || 'User', lastName: user.displayName?.split(' ')[1] || '' }} />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/practice" component={Practice} />
        <Route path="/collaborate" component={Collaborate} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/community" component={Community} />
        <Route path="/video-resume" component={VideoResume} />
        <Route path="/recruiter-dashboard">
          {isAuthorized(['recruiter', 'admin', 'master_trainer']) ? 
            <RecruiterDashboard /> : 
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">Recruiter role required to access this page.</p>
            </div>
          }
        </Route>
        <Route path="/admin-dashboard">
          {isAuthorized(['admin', 'master_trainer', 'college_admin']) ? 
            <AdminDashboard /> : 
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">Admin role required to access this page.</p>
            </div>
          }
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
