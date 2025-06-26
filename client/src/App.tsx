import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import Dashboard from "@/pages/dashboard";
import Practice from "@/pages/practice";
import Collaborate from "@/pages/collaborate";
import Jobs from "@/pages/jobs";
import Community from "@/pages/community";
import NotFound from "@/pages/not-found";

function Router() {
  // Mock user data - in real app, get from auth context
  const user = {
    firstName: "Arjun",
    lastName: "Kumar",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/practice" component={Practice} />
        <Route path="/collaborate" component={Collaborate} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/community" component={Community} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
