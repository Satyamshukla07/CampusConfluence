import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, MapPin, Clock, IndianRupee, Search, Filter, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculateMatchPercentage } from "@/lib/utils";

export default function Jobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = { id: 1 }; // Mock user

  const { data: jobPostings } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: myApplications } = useQuery({
    queryKey: [`/api/users/${currentUser.id}/applications`],
  });

  const applyToJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/apply`, {
        userId: currentUser.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}/applications`] });
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the recruiter.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const hasApplied = (jobId: number) => {
    return myApplications?.some((app: any) => app.jobId === jobId);
  };

  const getDurationColor = (duration: string) => {
    switch (duration) {
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Mock user skills for match calculation
  const userSkills = ["English communication", "Writing", "Customer service", "Problem-solving"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Job Opportunities</h1>
        <p className="text-muted-foreground">
          Find the perfect job that matches your English skills and career goals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or location..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="bangalore">Bangalore</SelectItem>
            <SelectItem value="mumbai">Mumbai</SelectItem>
            <SelectItem value="delhi">Delhi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobPostings?.map((job: any) => {
          const applied = hasApplied(job.id);
          const matchPercentage = calculateMatchPercentage(userSkills, job.requirements || []);
          
          return (
            <Card key={job.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                      <Building className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  {matchPercentage > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {matchPercentage}% match
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <Badge className={`${getDurationColor(job.duration)} text-xs`}>
                        {job.duration}
                      </Badge>
                    </span>
                    {job.salary && (
                      <span className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {job.salary}
                      </span>
                    )}
                  </div>

                  {job.requirements && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 3).map((req: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      disabled={applied || applyToJobMutation.isPending}
                      onClick={() => applyToJobMutation.mutate(job.id)}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      {applied ? "Applied" : applyToJobMutation.isPending ? "Applying..." : "Apply Now"}
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {jobPostings && jobPostings.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
