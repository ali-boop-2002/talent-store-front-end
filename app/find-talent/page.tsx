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
import Link from "next/link";
import { Talent } from "@/types/types";

const FindTalent = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const skillsParam = Array.isArray(searchParams.skills)
    ? (searchParams.skills as string[]).join(",")
    : (searchParams.skills as string) || "";

  if (!skillsParam) {
    return (
      <div className="min-h-screen">
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Search for the skills you need
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600">
                Select skills on the homepage to see tailored professionals
                here.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/">
                  <Button>Browse talent</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const response = await fetch(
    `http://localhost:3000/api/talents/search?skills=${encodeURIComponent(
      skillsParam
    )}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-red-700">
              We couldn&apos;t load search results
            </h2>
            <p className="mt-2 text-red-600">
              Error code: {response.status}. Please try again shortly.
            </p>
            <div className="mt-4">
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data: { talent: Talent[] } = await response.json();
  const selectedSkills = skillsParam.split(",").filter(Boolean);

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Talent results
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Showing experts for your selected skills
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {data.talent?.length ?? 0} results
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Professionals</h2>
          <Separator className="hidden sm:block w-1/2" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {!data?.talent || data.talent.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
            No talent found. Try adjusting your selected skills.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {data.talent.map((person: Talent) => {
              const initials = person?.name
                ? person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?";
              return (
                <Card key={person.id} className="flex flex-col bg-white">
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="truncate text-base font-semibold text-gray-900">
                            {person.name}
                          </CardTitle>
                          {person.isVerified && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {person.email}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-2">
                    <CardDescription className="text-gray-600 text-sm">
                      {person.description || "No description provided."}
                    </CardDescription>
                    {person?.skills && person.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {person.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.skills.length > 4 && (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
                            +{person.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto p-4 bg-gray-50">
                    <Link href={`/profile/${person.id}`} className="w-full">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default FindTalent;
