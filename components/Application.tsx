// Application.tsx (Client Component)
"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { applicationSchema } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Application as ApplicationType } from "@/types/types";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

interface ApplicationProps {
  jobId: string;
  jobTitle: string;
}

const Application = ({ jobId, jobTitle }: ApplicationProps) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isSubmitting },
  } = useForm<ApplicationType>({ resolver: zodResolver(applicationSchema) });

  const submit = async (data: ApplicationType) => {
    try {
      const response = await fetch(`${API_URL}/api/apply-for-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, jobId }),
      });
      if (response.ok) {
        toast.success("Application submitted successfully");
        setOpen(false);
        // window.location.href = `/find-gigs/${jobId}`;
      }

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message as string);
      }
    } catch (error) {
      console.error("Error submitting application:", error);

      if (error instanceof Error) {
        toast.error(
          error.message || "An error occurred during application submission"
        );
      } else {
        toast.error("An error occurred during application submission");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white bg-gradient-to-r shadow-lg from-purple-500 to-blue-600 min-w-48 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-300">
          Apply for this Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for Job</DialogTitle>
          <DialogDescription className="text-base">
            {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              placeholder="Explain why you're the best fit for this job..."
              rows={6}
              className="resize-none"
              {...register("coverLetter")}
            />
            {errors.coverLetter && (
              <p className="mt-1 text-sm text-red-600">
                {errors.coverLetter.message}
              </p>
            )}
          </div>

          {/* Proposed Rate */}
          <div className="space-y-2">
            <Label htmlFor="proposedRate">Proposed Rate ($) *</Label>
            <Input
              id="proposedRate"
              type="number"
              placeholder="5000"
              {...register("proposedRate", { valueAsNumber: true })}
            />
            {errors.proposedRate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.proposedRate.message}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline *</Label>
            <Input
              id="timeline"
              type="text"
              placeholder="4 weeks"
              {...register("timeline")}
            />
            {errors.timeline && (
              <p className="mt-1 text-sm text-red-600">
                {errors.timeline.message}
              </p>
            )}
          </div>

          {/* Keys to Spend */}
          <div className="space-y-2">
            <Label htmlFor="keys">Keys to Spend *</Label>
            <Input
              id="keys"
              type="number"
              {...register("keysUsed", { valueAsNumber: true })}
            />
            <p className="text-sm text-gray-500">
              Higher key spending increases your application visibility
            </p>
            {errors.keysUsed && (
              <p className="mt-1 text-sm text-red-600">
                {errors.keysUsed.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" size={20} />
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Application;
