import { Link, useLocation } from "wouter";
import { Bell, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface NavbarProps {
  user?: {
    firstName: string;
    lastName: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", active: location === "/" },
    { href: "/practice", label: "Practice", active: location === "/practice" },
    { href: "/collaborate", label: "Collaborate", active: location === "/collaborate" },
    { href: "/jobs", label: "Jobs", active: location === "/jobs" },
    { href: "/community", label: "Community", active: location === "/community" },
    { href: "/video-resume", label: "Video Resume", active: location === "/video-resume" },
    { href: "/recruiter-dashboard", label: "Recruiters", active: location === "/recruiter-dashboard" },
  ];

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-foreground">Campus Yuva</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`pb-4 transition-colors ${
                      item.active
                        ? "text-primary font-medium border-b-2 border-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}
