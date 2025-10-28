"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { createContractSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Talent } from "@/types/types";
import { CreateContractFormData } from "@/types/types";
import StripeProvider from "@/components/StripeProvider";
import PaymentForm from "@/components/PaymentForm";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  rate: number;
}

interface JobsResponse {
  jobs: Job[];
}

const CreateContractPage = () => {
  const { loading: authLoading, user } = useAuth();
  if (user?.role === "TALENT") {
    redirect("/");
  }
  const [jobs, setJobs] = useState<Job[]>([]);
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateContractFormData>({
    resolver: zodResolver(createContractSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) return;

      const res = await fetch(
        `http://localhost:3000/api/find-by-client-id/${user?.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data: JobsResponse = await res.json();

      // If your API returns { jobs: [...] }, extract the jobs array
      if (data.jobs) {
        setJobs(data.jobs);
      }
    };
    fetchJobs();
  }, [user?.id]);

  // Log jobs whenever they change

  useEffect(() => {
    const fetchTalents = async () => {
      // Only fetch if a job is selected
      if (!selectedJob?.id) {
        return;
      }

      const res = await fetch(
        `http://localhost:3000/api/talent-by-job-id/${selectedJob.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();

      setTalents(data.talents);
    };
    fetchTalents();
  }, [selectedJob?.id]);

  const onSubmit = async (data: CreateContractFormData) => {
    try {
      const response = await fetch("http://localhost:3000/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          talentId: selectedTalent?.id,
          jobId: selectedJob?.id,
          clientId: user?.id,
        }),
      });

      if (response.ok) {
        toast.success("Contract created successfully");
        reset();
        router.push("/contracts");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create contract");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error creating contract");
      }
      console.error(error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 justify-center items-center p-4">
      <StripeProvider>
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-6">
            Create New Contract
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col bg-white p-6  space-y-6">
              {/* Job ID Field */}
              <div className="flex flex-col gap-2">
                <label>Please select a job associated with this contract</label>
                <Dialog>
                  <DialogTrigger asChild>
                    {selectedJob ? (
                      <Button>Change Job</Button>
                    ) : (
                      <Button>Select a job</Button>
                    )}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select a job</DialogTitle>
                      <DialogDescription>
                        Select a job from the list below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className=" flex-col gap-2 flex justify-center items-center">
                      {jobs?.map((job) => (
                        <Button
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className="max-w-md overflow-x-scroll whitespace-nowrap w-full scrollbar-hide rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4"
                        >
                          {job.title}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                {selectedJob && (
                  <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
                    <p>{selectedJob.title}</p>
                  </div>
                )}
              </div>

              {/* Talent ID Field */}
              <div>
                <label htmlFor="talentId" className="font-bold text-lg">
                  Please select a talent associated with this contract
                </label>
                <div className="flex flex-col gap-2">
                  <label>
                    {selectedJob && selectedJob !== null
                      ? "Please select a talent associated with this contract"
                      : "Please select a job first"}
                  </label>
                  <Dialog>
                    <DialogTrigger asChild>
                      {selectedTalent ? (
                        <Button>Change Talent</Button>
                      ) : (
                        <Button>Select a talent</Button>
                      )}
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {selectedJob && selectedJob !== null
                            ? "Select a talent"
                            : "Please select a job first"}
                        </DialogTitle>
                        <DialogDescription>
                          {selectedJob && selectedJob !== null
                            ? "Select a talent from the list below."
                            : "Please select a job first"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className=" flex-col gap-2 flex justify-center items-center">
                        {talents?.map((talent) => (
                          <Button
                            key={talent.id}
                            onClick={() => setSelectedTalent(talent)}
                            className="max-w-md overflow-x-scroll whitespace-nowrap w-full scrollbar-hide rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4"
                          >
                            {talent.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {selectedTalent && (
                    <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
                      <p>{selectedTalent.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client ID Field */}
              {/* <div>
              <label htmlFor="clientId" className="font-bold text-lg">
                Client ID
              </label>
              <input
                id="clientId"
                type="text"
                {...register("clientId")}
                className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                  errors.clientId
                    ? "border-red-500"
                    : "focus:outline-2 focus:outline-purple-700"
                }`}
                placeholder="Enter client ID"
              />
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.clientId.message}
                </p>
              )}
            </div> */}

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="font-bold text-lg">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={5}
                  className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                    errors.description
                      ? "border-red-500"
                      : "focus:outline-2 focus:outline-purple-700"
                  }`}
                  placeholder="Enter contract description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="timeline" className="font-bold text-lg">
                  Timeline
                </label>
                <input
                  id="timeline"
                  {...register("timeline")}
                  type="text"
                  className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                    errors.timeline
                      ? "border-red-500"
                      : "focus:outline-2 focus:outline-purple-700"
                  }`}
                  placeholder="Enter contract timeline eg 1 week, 2 weeks, 1 month, 2 months, etc."
                />
                {errors.timeline && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.timeline.message}
                  </p>
                )}
              </div>

              {/* Payment Type Field */}
              <div>
                <label htmlFor="paymentType" className="font-bold text-lg">
                  Payment Type
                </label>

                <select
                  id="paymentType"
                  {...register("paymentType")}
                  className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                    errors.paymentType
                      ? "border-red-500"
                      : "focus:outline-2 focus:outline-purple-700"
                  }`}
                >
                  <option value="HOURLY">HOURLY</option>
                  <option value="FIXED">FIXED</option>
                </select>
                {errors.paymentType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.paymentType.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="rate" className="font-bold text-lg">
                  Rate
                </label>
                <input
                  id="rate"
                  {...register("rate", { valueAsNumber: true })}
                  type="number"
                  className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                    errors.rate
                      ? "border-red-500"
                      : "focus:outline-2 focus:outline-purple-700"
                  }`}
                  placeholder="Enter contract rate (in USD)"
                />
                {errors.rate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rate.message}
                  </p>
                )}
              </div>

              {/* Status Field */}
              <div>
                <label htmlFor="status" className="font-bold text-lg">
                  Status
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                    errors.status
                      ? "border-red-500"
                      : "focus:outline-2 focus:outline-purple-700"
                  }`}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
              {selectedJob && selectedJob?.id && selectedJob?.rate && (
                <PaymentForm
                  clientId={user?.id || ""}
                  talentId={selectedTalent?.id || ""}
                  amount={selectedJob?.rate || ""}
                />
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/contracts")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin h-5 w-5" />
                  ) : (
                    "Create Contract"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </StripeProvider>
    </div>
  );
};

export default CreateContractPage;
