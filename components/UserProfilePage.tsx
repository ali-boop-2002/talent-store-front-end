"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { useState } from "react";
import { CircleUser, Loader } from "lucide-react";
import { Data } from "@/types/types";
import Image from "next/image";
import { Rating } from "@smastrom/react-rating";

const UserProfilePage = ({ data }: Data) => {
  const [currentGig, setCurrentGig] = useState(0);

  if (!data?.talent) {
    return (
      <div className="justify-center items-center flex min-h-screen">
        <Loader className="animate-spin " />
      </div>
    );
  }

  console.log(data);

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="flex flex-row gap-6 items-start bg-white rounded-2xl p-4">
        {/* Profile Info - Takes remaining space */}
        <div className="flex-1 min-w-0">
          {" "}
          {/* min-w-0 allows flex shrinking */}
          <div className="font-bold text-2xl flex flex-row gap-x-4">
            {data.talent.name}{" "}
            <div className="flex flex-row">
              <Rating
                style={{ maxWidth: 100, color: "yellow" }}
                value={data?.averageRating ?? 0}
                readOnly={true}
              />
              <span className="font-normal text-sm flex justify-center items-center ">
                ({data?.averageRating ?? "new user"})
              </span>
            </div>
          </div>
          <div className="mb-4">{data.talent.description}</div>
          <div className="flex flex-row overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {data.talent.skills.map((skill, index: number) => (
              <div
                key={index}
                className="bg-purple-200 rounded-full whitespace-nowrap flex px-2 mr-2 mb-2 items-center text-center flex-shrink-0"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Gigs Card - Fixed width */}
        <div className="flex-shrink-0">
          {" "}
          {/* Prevents shrinking */}
          {data.talent.gigs && data.talent.gigs.length > 0 && (
            <Card className="flex flex-col w-80 h-60 bg-purple-100  shadow-none border-none">
              <CardHeader>
                <div className="flex flex-row overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {data.talent.gigs.map((gig, index: number) => (
                    <Button
                      key={gig.id}
                      className="bg-purple-700 min-w-fit px-3 mx-1 flex-shrink-0"
                      onClick={() => setCurrentGig(index)}
                    >
                      {gig.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <div className="flex flex-col justify-around  h-full  p-2">
                    <div className="overflow-y-scroll">
                      {data.talent.gigs[currentGig].gigDescription}
                    </div>
                    <div className="flex flex-row space-x-2 font-bold text-center justify-center bg-purple-700 text-white px-2 py-1 rounded-md">
                      <label>
                        {data.talent.gigs[currentGig].fixedPrice
                          ? "fixed price"
                          : "hourly"}
                      </label>
                      <span className="font-bold w-10">
                        ${data.talent.gigs[currentGig].price}
                      </span>
                    </div>
                  </div>
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div>
        <div>
          <Card className="border-2 border-purple-800 my-4">
            <CardHeader className="text-2xl font-bold">
              Past work experinces and portfolio
            </CardHeader>
            <CardContent>
              <div className="flex flex-row space-x-4 h-30">
                {data.talent.portfolio && data.talent.portfolio.length > 0 ? (
                  data.talent.portfolio?.map((pic: string, index: number) => (
                    <div key={index}>
                      <Dialog>
                        <DialogTrigger>
                          {" "}
                          <Image
                            key={index}
                            src={pic}
                            width={200}
                            height={100}
                            alt="exp"
                            className="rounded hover:cursor-pointer hover:border-2 hover:border-purple-700"
                          />
                        </DialogTrigger>
                        <DialogContent className="!max-w-[60vw]  overflow-auto p-2 pt-0">
                          {" "}
                          <DialogHeader>
                            <DialogTitle></DialogTitle>
                            <Image
                              key={index}
                              src={pic}
                              width={2000}
                              height={800}
                              alt="exp"
                              className="w-full h-auto max-w-4xl rounded hover:cursor-pointer  hover:border-purple-700"
                            />
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))
                ) : (
                  <div>
                    <p>No portfolio to show</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="border-2 border-purple-800 my-4">
            <CardHeader className="text-2xl font-bold">
              Contact and Availability
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="flex flex-row gap-2">
                <label className="font-bold">Phone</label>
                <span>{data.talent.phone || "No phone number"}</span>
              </div>
              <div className="flex flex-row gap-2">
                <label className="font-bold">Email</label>
                <span>{data.talent.email || "No email"}</span>
              </div>
              <div className="flex flex-row gap-2">
                <label className="font-bold">Location</label>
                <span>{data.talent.location || "No location"}</span>
              </div>
              <div className="flex flex-row gap-2">
                <label className="font-bold">Availability</label>
                <span>{data.talent.availabilty || "No availability"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="border-2 border-purple-800 my-4">
            <CardHeader className="text-2xl font-bold">About Me</CardHeader>
            <CardContent className="flex flex-col">
              <div className="flex flex-row gap-2">
                <p>{data.talent.Bio || "No bio"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold">
            <h1>Reviews</h1>
          </div>
          {data.talent?.talentReviews &&
          data.talent?.talentReviews.length > 0 ? (
            data.talent?.talentReviews.map((review) => (
              <div
                key={review.id}
                className="border-b-2 border-gray-200 pb-4 mt-5"
              >
                <div className="flex flex-row text-2xl gap-2 ">
                  <CircleUser />
                  <h1>{data.user?.name ?? "Anonymous"}</h1>
                </div>
                <div className="mt-2 flex flex-col">
                  <Rating
                    style={{ maxWidth: 100, color: "yellow" }}
                    value={review.rating}
                    readOnly={true}
                  />

                  <h2 className="mt-1">{review.review}</h2>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-2">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
