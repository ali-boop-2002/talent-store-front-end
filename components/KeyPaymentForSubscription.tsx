"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KeyPaymentFormProps {
  priceId: string;
  planName?: string;
}

export default function KeyPaymentFormSubscription({
  priceId,
  planName,
}: KeyPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if Stripe.js has loaded
    if (!stripe || !elements) {
      setError("Payment system is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // First, submit the payment element to validate the form
      const { error: submitError } = await elements.submit();

      if (submitError) {
        toast.error(submitError.message || "Please check your payment details");
        throw new Error(
          (submitError as unknown as Error).message ||
            "Please check your payment details"
        );
      }

      // Create payment method from the payment element
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          elements,
        });

      if (paymentMethodError) {
        toast.error(
          paymentMethodError.message || "Failed to process payment method"
        );
        throw new Error(
          (paymentMethodError as unknown as Error).message ||
            "No payment method created"
        );
      }

      if (!paymentMethod) {
        toast.error("No payment method created");
        throw new Error(
          (paymentMethodError as Error).message || "No payment method created"
        );
      }

      setMessage("Processing subscription...");

      // Send payment method to your backend to create the subscription
      const response = await fetch(
        "http://localhost:3000/api/update-subscription-with-payment-method-id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            priceId,
            paymentMethodId: paymentMethod.id,
          }),
        }
      );

      const data = await response.json();
      console.log(data, "data");
      if (!response.ok) {
        toast.error(data.error || "Subscription failed");
        return;
      }

      // Handle different subscription statuses

      if (data.message === "Subscription updated successfully") {
        // Success - redirect
        router.push("/find-gigs");
        toast.success("Subscription successful!");
      } else if (data.clientSecret) {
        // Needs extra verification
        await stripe.confirmPayment({
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/find-gigs`,
          },
        });
        toast.success("Subscription successful!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Subscription failed");
      // Stripe PaymentElement will show its own errors
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Reload the page to go back to plan selection
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <PaymentElement />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Subscribe to ${planName || "Plan"}`
            )}
          </Button>

          {/* <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            Choose a different plan
          </button> */}
        </div>
      </form>
    </div>
  );
}
