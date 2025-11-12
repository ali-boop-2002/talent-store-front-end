"use client";
import { useEffect, useState } from "react";
import { Application } from "@/types/types";
import { useAuth } from "@/lib/useAuth";
import { Job } from "@/types/types";
import { API_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader,
  Key,
  Clock,
  FileText,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ApplicationWithJob extends Application {
  id: string;
  jobId: string;
  talentId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  createdAt: string;
  updatedAt: string;
}

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState<ApplicationWithJob[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/get-applications-for-talent`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch applied jobs");
      }
      const data = await response.json();
      setAppliedJobs(data.applications);
      setJobs(data.jobs);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/withdraw-application/${applicationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!response.ok) {
        toast.error("Failed to withdraw application");
        return;
      }
      toast.success("Application withdrawn successfully");

      // Update local state instead of reloading
      setAppliedJobs((prevJobs) =>
        prevJobs.map((app) =>
          app.id === applicationId ? { ...app, status: "WITHDRAWN" } : app
        )
      );
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("An error occurred while withdrawing the application");
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppliedJobs();
    }
  }, [user]);

  const getJobForApplication = (jobId: string) => {
    return jobs.find((job) => job.id === jobId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Track all your job applications in one place
          </p>
        </div>

        {appliedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">
              No applications yet
            </h2>
            <p className="text-gray-500 mt-2">
              Start applying to jobs to see them here
            </p>
            <Button onClick={() => router.push("/find-gigs")} className="mt-6">
              Find Jobs
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {appliedJobs.map((application) => {
              const job = getJobForApplication(application.jobId);
              return (
                <Card
                  key={application.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {job?.title || "Job Title Unavailable"}
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              application.status === "ACCEPTED"
                                ? "bg-green-100 text-green-800"
                                : application.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : application.status === "WITHDRAWN"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {application.status}
                          </span>
                          {job && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                job.status === "OPEN"
                                  ? "bg-blue-100 text-blue-800"
                                  : job.status === "IN_PROGRESS"
                                  ? "bg-purple-100 text-purple-800"
                                  : job.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              Job: {job.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Application Details */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Application Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🔑</span>
                          <span className="text-sm text-gray-600">
                            Keys Used:{" "}
                            <span className="font-semibold text-gray-900">
                              {application.keysUsed}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            Timeline:{" "}
                            <span className="font-semibold text-gray-900">
                              {application.timeline}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Proposed Rate:{" "}
                            <span className="font-semibold text-gray-900">
                              ${application.proposedRate}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Cover Letter:
                            </p>
                            <p className="text-sm text-gray-600 italic">
                              &quot;{application.coverLetter}&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Details */}
                    {job && (
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Job Details
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Category:</span>{" "}
                            {job.category}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Budget:</span> $
                            {job.budget} ({job.paymentType})
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Timeline:</span>{" "}
                            {job.timeline}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Description:</span>
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            {job.description}
                          </p>
                          {job.skills && job.skills.length > 0 && (
                            <div className="pt-2">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Required Skills:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-white text-blue-700 rounded text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-between pt-2">
                      <AlertDialog>
                        <AlertDialogTrigger
                          asChild
                          disabled={application.status === "WITHDRAWN"}
                        >
                          <Button
                            variant="destructive"
                            className="hover:cursor-pointer hover:bg-red-800 hover:text-white"
                            disabled={application.status === "WITHDRAWN"}
                          >
                            {application.status === "WITHDRAWN"
                              ? "Application Withdrawn"
                              : "Withdraw Application"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to withdraw this
                              application?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently withdraw your application from the
                              job.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:cursor-pointer hover:bg-gray-100 ">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                withdrawApplication(application.id)
                              }
                              className="hover:cursor-pointer bg-red-500 hover:bg-red-800 hover:text-white"
                            >
                              Withdraw Application
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        onClick={() =>
                          router.push(`/find-gigs/${application.jobId}`)
                        }
                        className="flex items-center gap-2"
                      >
                        View Job
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;
