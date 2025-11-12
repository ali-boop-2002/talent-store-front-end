"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { FileSpreadsheet, Send } from "lucide-react";

// Extended Application type to include talent information
interface TalentInfo {
  id: string;
  name: string;
  email: string;
  skills: string[];
  location: string;
  Bio: string;
  avatar: string | null;
  portfolio: string[];
  phone: string;
  availabilty: string;
  description: string;
}

interface ApplicationWithTalent {
  id: string;
  jobId: string;
  talentId: string;
  coverLetter: string;
  proposedRate: number;
  timeline: string;
  status: string;
  keysUsed: number;
  createdAt: string;
  updatedAt: string;
  talent: TalentInfo;
}

const ViewApplicants = () => {
  const { id } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [accept, setAccept] = useState(false);
  const [reject, setReject] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/get-application-by-job-id/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const data = await response.json();

        console.log(data);
        setApplications(data.applications || []);
        // Get job title from first application if available
        if (data.job) {
          setJobTitle(data.job.title);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [id]);

  const updateApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/update-application-status/${applicationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok && response.status === 400) {
        toast.error("Talent has withdrawn their application");
        return;
      }
      if (response.ok) {
        toast.success("Application status updated successfully");

        // Refetch applications to get updated data
        const applicationsResponse = await fetch(
          `${API_URL}/api/get-application-by-job-id/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (applicationsResponse.ok) {
          const data = await applicationsResponse.json();
          setApplications(data.applications || []);

          // Reset the accept/reject buttons
          setAccept(false);
          setReject(false);
        }
      } else {
        toast.error("Failed to update application status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Error updating application status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Manage Jobs
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">
                {applications.length}
              </div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter((app) => app.status === "PENDING").length}
              </div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter((app) => app.status === "ACCEPTED").length}
              </div>
              <p className="text-sm text-gray-600">Accepted</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600">
                This job hasn&apos;t received any applications yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Applications List */
          <div className="space-y-6">
            {applications.map((application) => (
              <Card
                key={application.id}
                className="  border-2 hover:border-purple-300 transition-all "
              >
                <CardHeader>
                  <div className="flex justify-between items-start  bg-blue-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Applied on{" "}
                        {new Date(application.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold hover:cursor-pointer ${
                        application.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : application.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Cover Letter */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Cover Letter
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {application.coverLetter}
                    </p>
                  </div>

                  {/* Application Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pb-6 border-b">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Proposed Rate
                      </p>
                      <p className="font-semibold text-gray-900 text-lg">
                        ${application.proposedRate}/hr
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Timeline</p>
                      <p className="font-semibold text-gray-900">
                        {application.timeline}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Keys Used</p>
                      <p className="font-semibold text-gray-900">
                        {application.keysUsed} keys
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {application.status.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Applicant Information Section */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3 justify-between flex-row">
                      <div className=" flex flex-row">
                        {application.talent.avatar ? (
                          <Image
                            src={application.talent.avatar}
                            alt={application.talent.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {application.talent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {application.talent.name}
                          </p>
                          <button
                            onClick={() =>
                              router.push(`/profile/${application.talent.id}`)
                            }
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:cursor-pointer"
                          >
                            View Full Profile →
                          </button>
                        </div>
                      </div>
                      <div className=" rounded-lg p-2 flex flex-row space-x-2">
                        <div>
                          <Link href={`/chat/${application.talent.id}`}>
                            <Button className="cursor-pointer rounded-full bg-gradient-to-br from-purple-400 to-blue-500 hover:border-none">
                              <Send className="text-white" />
                            </Button>
                          </Link>
                        </div>
                        {application.status === "ACCEPTED" && (
                          <Link
                            href={`/contracts/create/${id}?talentId=${application.talent.id}`}
                          >
                            <Button className="rounded-full bg-gradient-to-r from-pink-300 to-purple-600 hover:cursor-pointer">
                              <FileSpreadsheet />{" "}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {/* Email */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="text-gray-900">
                            {application.talent.email}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      {application.talent.location && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="text-gray-900">
                              {application.talent.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Phone */}
                      {application.talent.phone && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-600">Phone</p>
                            <p className="text-gray-900">
                              {application.talent.phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {application.talent.skills &&
                      application.talent.skills.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-100">
                          <p className="text-xs text-gray-600 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {application.talent.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-white text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Portfolio */}
                  <div className="flex flex-row  overflow-x-auto ">
                    {application.talent.portfolio.length > 0 &&
                      application.talent.portfolio.map((portfolio, index) => (
                        <div
                          key={index}
                          className="hover:cursor-pointer mx-4 overflow-x-auto"
                        >
                          <Dialog>
                            <DialogTrigger>
                              <Image
                                src={application.talent.portfolio[index]}
                                alt="Portfolio"
                                width={200}
                                height={200}
                                className="w-40 h-40 hover:border-2 hover:border-purple-300 rounded-lg object-cover hover:cursor-pointer"
                              />{" "}
                            </DialogTrigger>

                            <DialogContent className="!max-w-[60vw]  overflow-auto p-2 pt-0">
                              <DialogHeader>
                                <DialogTitle></DialogTitle>
                                <Image
                                  src={application.talent.portfolio[index]}
                                  alt="Portfolio"
                                  width={2000}
                                  height={800}
                                  className="w-full h-auto max-w-4xl rounded hover:cursor-pointer  hover:border-purple-700"
                                />
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                  </div>
                  {application.status === "PENDING" && (
                    <div className=" flex flex-row justify-end items-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 text-white hover:cursor-pointer hover:text-white"
                          >
                            Accept or Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Please select an action
                            </AlertDialogTitle>
                            <AlertDialogDescription className=" flex flex-row justify-center items-center space-x-4">
                              <Button
                                variant="default"
                                className={`hover:cursor-pointer bg-black text-white ${
                                  accept
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                }`}
                                onClick={() => {
                                  setAccept(true);
                                  setReject(false);
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="default"
                                className={`hover:cursor-pointer bg-black text-white ${
                                  reject ? "bg-red-600 hover:bg-red-700" : ""
                                }`}
                                onClick={() => {
                                  setReject(true);
                                  setAccept(false);
                                }}
                              >
                                Reject
                              </Button>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  accept ? "ACCEPTED" : "REJECTED"
                                )
                              }
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;
