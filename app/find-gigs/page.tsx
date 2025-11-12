import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Application, Job } from "@/types/types";
import Link from "next/link";
import SearchBySkill from "@/components/SearchBySkill";
import { getServerUser } from "@/lib/auth-server";
import { API_URL } from "@/lib/config";

interface SearchParams {
  page?: string;
  limit?: string;
  skills?: string;
}

const JobsPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const skillsParam = params.skills || ""; // "plumbing,tiles"
  const user = await getServerUser();
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "20");
  let data = { jobs: [], total: 0 };

  if (skillsParam) {
    const skills = skillsParam.split(" "); // ["plumbing", "tiles"]

    const response = await fetch(
      `${API_URL}/api/find-by-skills?page=${page}&limit=${limit}`,
      {
        method: "POST",
        body: JSON.stringify({ skills }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    data = await response.json();
  } else {
    const response = await fetch(`${API_URL}/?page=${page}&limit=${limit}`);
    data = await response.json();
    console.log("data", data);
  }

  // const offset = (page - 1) * limit;

  // const response = await fetch(
  //   `http://localhost:3000/?page=${page}&limit=${limit}`
  // );

  // if (!response.ok) {
  //   throw new Error(`HTTP error! status: ${response.status}`);
  // }

  // const data = await response.json();

  // if (data.jobs.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       No jobs found
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white">
      <div>
        <SearchBySkill />
      </div>
      <h1 className="text-3xl font-bold mb-6 mx-70 text-gray-600">
        Available Jobs
      </h1>
      <div className="text-center text-blue-500 ">
        Showing {data.jobs.length} jobs
      </div>
      {data.jobs.length === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          No jobs found
        </div>
      )}

      {page > 1 && (
        <div className="mt-8 flex justify-center gap-4">
          {/* Previous button */}
          {page > 1 && (
            <Link
              href={`/find-gigs?skills=${skillsParam}&page=${
                page - 1
              }&limit=${limit}`}
            >
              <Button
                variant="outline"
                className="px-6 py-2 hover:cursor-pointer"
              >
                ← Previous
              </Button>
            </Link>
          )}

          {/* Page indicator */}
          <div className="flex items-center px-4 py-2 bg-gray-100 rounded-md">
            <span className="text-sm font-medium">
              Page {page}{" "}
              {data.total ? `of ${Math.ceil(data.total / limit)}` : ""}
            </span>
          </div>

          {/* Next button */}
          {data.jobs.length >= limit && (
            <Link
              href={`/find-gigs?skills=${skillsParam}&page=${
                page + 1
              }&limit=${limit}`}
            >
              <Button className="px-6 py-2 hover:cursor-pointer">Next →</Button>
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 justify-center items-center">
        {data.jobs.map((job: Job) => (
          <Card key={job.id} className="my-4 max-w-2xl relative">
            <CardHeader>
              <CardTitle className="">
                {<h1 className="text-lg font-bold">{job.title}</h1>}
              </CardTitle>
              <div className="absolute top-[-20px] right-4 bg-gray-100 rounded-md px-3 py-2 text-sm">
                <h1 className="text-blue-500">Category: {job?.category}</h1>
              </div>
              {job.applications.find(
                (application: Application) => application.talentId === user?.id
              ) && (
                <div className="absolute top-[-20px] left-4 bg-gray-100 rounded-md px-3 py-2 text-sm">
                  <h1 className="text-green-500">Already Applied</h1>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription>
                <div className="flex flex-col ">
                  <h2 className="  overflow-y-scroll scrollbar-hide ">
                    {job.description}
                  </h2>
                  <div className=" flex flex-row  items-center">
                    {job?.skills?.length > 0 && (
                      <h1 className="text-center ">Skills:</h1>
                    )}
                    {job?.skills?.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className=" rounded px-2 py-1  text-purple-500 text-center"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row items-center gap-2">
                <Link
                  href={`/find-gigs/${job.id}`}
                  className="hover:cursor-pointer"
                >
                  <Button className="hover:cursor-pointer">View Job</Button>
                </Link>
                {job.applications.length > 0 && (
                  <label className="text-sm text-white px-2 py-1 bg-gradient-to-r from-purple-500 rounded-full to-blue-600 hover:from-purple-600 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-300">
                    {job.applications.length} bid
                  </label>
                )}
              </div>
              <div className="bg-gray-100 rounded-md px-3 py-2 text-sm">
                <label>Date Posted:</label>{" "}
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="mt-8 flex justify-center gap-4">
        {/* Previous button */}
        {page > 1 && (
          <Link
            href={`/find-gigs?skills=${skillsParam}&page=${
              page - 1
            }&limit=${limit}`}
          >
            <Button
              variant="outline"
              className="px-6 py-2 hover:cursor-pointer"
            >
              ← Previous
            </Button>
          </Link>
        )}

        {/* Page indicator */}
        <div className="flex items-center px-4 py-2 bg-gray-100 rounded-md">
          <span className="text-sm font-medium">
            Page {page}{" "}
            {data.total ? `of ${Math.ceil(data.total / limit)}` : ""}
          </span>
        </div>

        {/* Next button */}
        {data.jobs.length >= limit && (
          <Link
            href={`/find-gigs?skills=${skillsParam}&page=${
              page + 1
            }&limit=${limit}`}
          >
            <Button className="px-6 py-2 hover:cursor-pointer">Next →</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
