import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  RefreshCcw,
  RotateCcw,
  Star,
} from "lucide-react";
import Link from "next/link";
import Application from "@/components/Application";
import { applicationAPI } from "@/lib/api/applicationApi";
import BidsList from "@/components/BidList";
import { Application as ApplicationType } from "@/types/types";

import { getServerUser } from "@/lib/auth-server";
import RefreshButton from "@/components/refreshButton";
import { API_URL } from "@/lib/config";

const JobDetails = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const user = await getServerUser();
  const { id } = params;

  const { cookies } = await import("next/headers");
  const cookieStore = cookies();

  // Convert cookies to a cookie string
  const cookieString = cookieStore.toString();

  const response = await fetch(`${API_URL}/${id}`, {
    cache: "no-store", // Always fetch fresh data
    headers: {
      Cookie: cookieString,
    },
    credentials: "include",
  });
  console.log(response, "job response");
  if (!response.ok && response.status === 401) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Please sign in to view this job
          </h1>
        </div>
      </div>
    );
  }
  const data = await response.json();
  const job = data.job;

  if (!response.ok) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Job Not Found
          </h1>
          <p className="text-gray-600">
            The job you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  console.log(job);
  console.log(job.clientId, "job client id");
  const fetchClientReviews = await fetch(
    `${API_URL}/api/getAllClientReviews/${job.clientId}`
  );
  const clientReviews = await fetchClientReviews.json();
  console.log(clientReviews, "new client reviews");

  if (!clientReviews.reviews) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Error fetching client reviews
          </h1>
        </div>
      </div>
    );
  }

  const client = await fetch(`${API_URL}/api/user/${job.clientId}`, {
    credentials: "include",
    headers: {
      Cookie: cookieString,
    },
  });
  const clientData = await client.json();
  console.log(clientData, "client data");

  if (!clientData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Error fetching client data
          </h1>
        </div>
      </div>
    );
  }
  // Mock bidding data
  // const bids = [
  //   {
  //     id: "1",
  //     talentName: "Sarah Johnson",
  //     keysSpent: 5,
  //     proposedRate: 4500,
  //     coverLetter: "I have 8 years of experience in full-stack development...",
  //     timeline: "4 weeks",
  //     rating: 4.9,
  //     completedJobs: 45,
  //   },
  //   {
  //     id: "2",
  //     talentName: "Michael Chen",
  //     keysSpent: 3,
  //     proposedRate: 5200,
  //     coverLetter: "Expert in React and Node.js with proven track record...",
  //     timeline: "5 weeks",
  //     rating: 4.7,
  //     completedJobs: 32,
  //   },
  //   {
  //     id: "3",
  //     talentName: "Emily Rodriguez",
  //     keysSpent: 4,
  //     proposedRate: 4800,
  //     coverLetter:
  //       "Specialized in e-commerce solutions and payment integrations...",
  //     timeline: "6 weeks",
  //     rating: 4.8,
  //     completedJobs: 38,
  //   },
  // ];

  // Mock client reviews
  // const clientReviews = [
  //   {
  //     id: "1",
  //     reviewerName: "David Miller",
  //     rating: 5,
  //     comment:
  //       "Excellent client! Clear requirements, prompt payments, and great communication throughout the project.",
  //     date: "2024-01-10",
  //     projectTitle: "Mobile App Development",
  //   },
  //   {
  //     id: "2",
  //     reviewerName: "Lisa Anderson",
  //     rating: 4,
  //     comment:
  //       "Good to work with. Professional and responsive. Would work with again.",
  //     date: "2023-12-15",
  //     projectTitle: "Website Redesign",
  //   },
  //   {
  //     id: "3",
  //     reviewerName: "Robert Taylor",
  //     rating: 5,
  //     comment:
  //       "Amazing client! Very detailed requirements and fair pricing. Payment was on time and communication was excellent.",
  //     date: "2023-11-20",
  //     projectTitle: "API Integration",
  //   },
  // ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Main Job Card */}
        <Card className="mb-6 relative">
          {/* Location Badge - Absolute Position */}
          {job.location && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-sm">{job.location}</span>
            </div>
          )}

          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-40">
                <CardTitle className="text-3xl font-bold mb-4">
                  {job.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {job.status}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold">Budget</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${job.budget}{" "}
                  <span className="text-sm text-gray-600">
                    {job.paymentType === "HOURLY" ? "per hour" : "fixed price"}
                  </span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            {job.timeline && (
              <>
                <div className="flex flex-row items-center gap-2">
                  <h3 className="text-xl font-semibold mb-2 flex flex-row items-center">
                    <Clock size={48} strokeWidth={2.25} />
                  </h3>
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                    {job.timeline}
                  </span>
                </div>
                <Separator />
              </>
            )}

            {/* Category */}
            {job.category && (
              <>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Category</h3>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
                    {job.category}
                  </span>
                </div>
                <Separator />
              </>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-center m-6 space-x-4">
          <Application jobId={job.id} jobTitle={job.title} />
          <RefreshButton />
        </div>

        <BidsList jobId={job.id} />
        {/* Bidding Area */}

        {/* Client Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Talent Reviews ({clientReviews.reviews.length})
            </CardTitle>
            <CardDescription>
              Reviews from talents who have worked with this client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {clientData.user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{clientData.user.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      {clientReviews.reviews.length > 0 && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                      <span className="font-semibold">
                        {clientReviews.averageRating}
                      </span>
                    </div>
                    <span>•</span>
                    <span>12 jobs posted</span>
                    <span>•</span>
                    <span>$45,000 total spent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            {clientReviews.reviews.map((review: Review) => (
              <Card key={review.id} className="bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.talent.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {review.talent.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{review.review}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {/* <p className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </p> */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* <p className="text-gray-700">{review.comment}</p> */}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;
