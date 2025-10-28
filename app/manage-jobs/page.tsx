"use client";
import { useAuth } from "@/lib/useAuth";
import { Job } from "@/types/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

const ManageJobs = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "CLIENT") {
      router.push("/");
      return;
    }

    if (!user?.id) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/find-by-client-id/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, router]);


  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/update-job-status/${jobId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",

          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        // Re-fetch all jobs
        const jobsResponse = await fetch(
          `http://localhost:3000/api/find-by-client-id/${user?.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await jobsResponse.json();
        setJobs(data.jobs || []);

        toast.success("Job status updated successfully");
      } else {
        toast.error("Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 justify-center items-center">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render content if user is not a CLIENT (will redirect via useEffect)
  if (user.role !== "CLIENT") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 justify-center items-center">
        <div className="text-lg text-gray-600">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
          <p className="text-gray-600">View and manage all your posted jobs</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">
                {jobs.length}
              </div>
              <p className="text-sm text-gray-600">Total Jobs Posted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {jobs.filter((job) => job.status === "OPEN").length}
              </div>
              <p className="text-sm text-gray-600">Active Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {jobs.reduce(
                  (total, job) => total + (job.applications?.length || 0),
                  0
                )}
              </div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by posting your first job
              </p>
              <button
                onClick={() => router.push("/postjob")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post a Job
              </button>
            </CardContent>
          </Card>
        ) : (
          /* Jobs List */
          <div className="space-y-4 ">
            {jobs.map((job) => (
              <div key={job.id}>
                <ContextMenu>
                  <ContextMenuTrigger>
                    <Card
                      className="hover:border-purple-300  transition-colors border-2 hover:cursor-pointer"
                      onClick={() =>
                        job.applications?.length > 0
                          ? router.push(
                              `/manage-jobs/view-applicants/${job.id}`
                            )
                          : null
                      }
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              {job.title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {job.description}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                job.status === "OPEN"
                                  ? "bg-green-100 text-green-800"
                                  : job.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : job.status === "COMPLETED"
                                  ? "bg-purple-100 text-purple-800"
                                  : job.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {/* Budget */}
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Budget</p>
                            <p className="font-semibold text-gray-900">
                              ${job.budget}
                              {job.paymentType === "HOURLY" ? "/hr" : " fixed"}
                            </p>
                          </div>

                          {/* Timeline */}
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Timeline
                            </p>
                            <p className="font-semibold text-gray-900">
                              {job.timeline}
                            </p>
                          </div>

                          {/* Applications */}
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Applications
                            </p>
                            <p className="font-semibold text-blue-600">
                              {job.applications?.length || 0} applicants
                            </p>
                          </div>

                          {/* Category */}
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Category
                            </p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {job.category || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Required Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Posted Date */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <p className="text-sm text-gray-500">
                            Posted on{" "}
                            {new Date(job.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <button
                            onClick={() => router.push(`/find-gigs/${job.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:cursor-pointer"
                          >
                            View Details →
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => updateJobStatus(job.id, "OPEN")}
                    >
                      OPEN
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => updateJobStatus(job.id, "IN_PROGRESS")}
                    >
                      IN_PROGRESS
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => updateJobStatus(job.id, "COMPLETED")}
                    >
                      COMPLETED
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => updateJobStatus(job.id, "CANCELLED")}
                    >
                      CANCELLED
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
