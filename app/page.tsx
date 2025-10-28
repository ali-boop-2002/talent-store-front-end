import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Talent } from "@/types/types";
import Link from "next/link";
import SelectBar from "@/components/SelectBar";
import { Separator } from "@/components/ui/separator";

const FindTalent = async () => {
  const response = await fetch(`http://localhost:3000/api/find-talent`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-red-700">
              We couldn&apos;t load the talent list
            </h2>
            <p className="mt-2 text-red-600">
              Error code: {response.status}. Please try again shortly.
            </p>
            <div className="mt-4">
              <Link href="/find-talent">
                <Button>Retry</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data: { talent: Talent[] } = await response.json();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Find exceptional talent for every project
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              From home repairs to digital solutions, match with the right
              expert in minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/postjob">
                <Button className="">Post a Job</Button>
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <SelectBar data={{ talent: data.talent }} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Professionals
          </h2>
          <Separator className="hidden sm:block w-1/2" />
        </div>

        {!data?.talent || data.talent.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
            No talent found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {data.talent.map((talent: Talent) => {
              const initials = talent?.name
                ? talent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?";
              return (
                <Card key={talent.id} className="flex flex-col bg-white">
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="truncate text-base font-semibold text-gray-900">
                            {talent.name}
                          </CardTitle>
                          {talent.isVerified && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {talent.email}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-2">
                    <CardDescription className="text-gray-600 text-sm">
                      {talent.description || "No description provided."}
                    </CardDescription>
                    {talent?.skills && talent.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {talent.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {talent.skills.length > 4 && (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
                            +{talent.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto p-4 bg-gray-50">
                    <Link href={`/profile/${talent.id}`} className="w-full">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Hire faster with confidence
            </h3>
            <p className="mt-2 text-gray-600">
              Post your job today and start receiving proposals from vetted
              professionals.
            </p>
            <div className="mt-4">
              <Link href="/postjob">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindTalent;
