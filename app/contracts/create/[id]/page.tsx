"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { createContractSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useEffect, useState } from "react";
// import { Talent } from "@/types/types";
import { CreateContractFormData } from "@/types/types";
import PaymentForm from "@/components/PaymentForm";

import { Elements } from "@stripe/react-stripe-js";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  rate: number;
}

interface JobsResponse {
  job: Job;
}

interface Talent {
  id: string;
  name: string;
}

const CreateContractPage = () => {
  const { loading: authLoading, user } = useAuth();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const talentId = searchParams.get("talentId");
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  if (user?.role === "TALENT") {
    redirect("/");
  }
  const [job, setJob] = useState<Job | null>(null);
  const router = useRouter();

  const [talent, setTalent] = useState<Talent>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  console.log(talent);
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

      const res = await fetch(`http://localhost:3000/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data: JobsResponse = await res.json();

      // If your API returns { jobs: [...] }, extract the jobs array
      if (data.job) {
        setJob(data.job);
      }
    };
    fetchJobs();
  }, [id, user?.id]);

  useEffect(() => {
    const fetchTalents = async () => {
      const res = await fetch(
        `http://localhost:3000/api/find-talent/${talentId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();

      setTalent(data.talent);
    };
    fetchTalents();
  }, [talentId]);

  const onSubmit = async (data: CreateContractFormData) => {
    try {
      if (talent?.onboardingComplete as boolean) {
        const res = await fetch(
          "http://localhost:3000/api/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              clientId: user?.id,
              talentId: talent?.id,
              amount: data.rate,
              jobId: job?.id,
              description: data.description,
              status: data.status,
              rate: data.rate,
              paymentType: data.paymentType,
              timeline: data.timeline,
            }),
          }
        );
        const { clientSecret } = await res.json();

        if (res.ok) {
          toast.success("Payment intent created successfully");
          setClientSecret(clientSecret);
          console.log(clientSecret);
          console.log(res);
        }
      }
      if (!talent?.onboardingComplete as boolean) {
        toast.error("talent has not set up their stripe account");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error creating payment intent");
      }
      console.error(error);
    } finally {
      setLoading(false);
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
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Create New Contract
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col bg-white p-6  space-y-6">
            {/* Job ID Field */}
            <div className="flex flex-col gap-2  justify-center items-center p-4 text-2xl">
              <label>Job title: {job?.title}</label>
            </div>

            {/* Talent ID Field */}
            <div className="flex justify-center items-center text-2xl p-4">
              Applicant Name: {talent?.name}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="font-bold text-lg">
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                disabled={clientSecret ? true : false}
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
                disabled={clientSecret ? true : false}
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
                disabled={clientSecret ? true : false}
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
                disabled={clientSecret ? true : false}
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
                disabled={clientSecret ? true : false}
                className={`w-full bg-white border-2 rounded p-3 mt-2 ${
                  errors.status
                    ? "border-red-500"
                    : "focus:outline-2 focus:outline-purple-700"
                }`}
              >
                <option value="ACTIVE">ACTIVE</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Payment Form */}
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm />
              </Elements>
            )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/contracts")}
              >
                Cancel
              </Button>
              {!clientSecret && (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin h-5 w-5" />
                  ) : loading ? (
                    "Creating Contract..."
                  ) : (
                    "Create Contract"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContractPage;
