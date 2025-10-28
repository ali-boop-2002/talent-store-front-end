"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3001/contracts",
      },
      redirect: "always",
    });
    if (result.error) {
      alert(result.error.message);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <PaymentElement />
      <button
        className="mt-4 px-4 py-2 w-full bg-purple-600 hover:bg-purple-700 hover:cursor-pointer text-white rounded-lg"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay & Create Contract"}
      </button>
    </div>
  );
}
