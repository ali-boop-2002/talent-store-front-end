"use client";
import { Rating } from "@smastrom/react-rating";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Contract } from "@/types/types";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import { API_URL } from "@/lib/config";
const SimpleRating = ({ contract }: { contract: Contract }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const jobId = contract.jobId;
  const contractId = contract.id;
  const talentId = contract.talentId;

  const uploadReview = async (rating: number, review: string) => {
    try {
      if (!jobId || !contractId || !talentId || rating === 0 || review === "") {
        return toast.error(
          "Please fill all the fields and rating must be greater than 0"
        );
      }
      const response = await fetch(`${API_URL}/api/createReview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          review,
          jobId: jobId,
          contractId: contractId,
          talentId: talentId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Review uploaded successfully");
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.error("Error uploading review:", error);
      toast.error("Error uploading review");
    }
  };
  return (
    <div className="pt-1">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={contract?.reviews?.length > 0}
          >
            {contract?.reviews?.length > 0 ? "Already rated" : "Leave feedback"}
            {contract?.reviews?.length > 0 && (
              <span className="text-sm text-gray-500">
                <Rating
                  style={{ maxWidth: 120 }}
                  value={contract.reviews[0].rating}
                  readOnly={true}
                />
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Please give rating and feedback for the job
            </DialogTitle>
            <DialogDescription></DialogDescription>
            <Rating
              className="inline-flex items-center"
              style={{
                maxWidth: 120,
                display: "inline-flex",
                flexDirection: "row",
              }}
              value={rating}
              readOnly={false}
              onChange={(value: number) => setRating(value)}
            />
            <Textarea
              placeholder="Please give feedback for the job"
              onChange={(e) => setReview(e.target.value)}
            />
            <Button onClick={() => uploadReview(rating, review)}>Submit</Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleRating;
