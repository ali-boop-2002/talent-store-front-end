"use client";

import { useAuth } from "@/lib/useAuth";
import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

function StripeOnboarding() {
  const { user } = useAuth();
  const router = useRouter();

  const [onboardingStatus, setOnboardingStatus] = useState<{
    complete: boolean;
    hasAccount: boolean;
  }>({ complete: false, hasAccount: false });
  const [loading, setLoading] = useState(false);

  // Check status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const res = await fetch(
            `${API_URL}/api/check-onboarding-status/${user?.id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          const data = await res.json();
          setOnboardingStatus({
            complete: data.complete,
            hasAccount: data.hasAccount,
          });
          console.log(data);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setOnboardingStatus({ complete: false, hasAccount: false });
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [user?.id]);

  // Create Stripe account
  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/create-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
        credentials: "include",
      });
      const data = await res.json();

      alert("Stripe account created!");
      window.location.reload();
      setLoading(false);
    } catch (error) {
      console.error("Error creating Stripe account:", error);
      setLoading(false);
    }
  };

  // Generate onboarding link and redirect
  const handleFinishOnboarding = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/create-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
        credentials: "include",
      });
      const data = await res.json();

      window.location.href = data.url; // Redirect to Stripe-hosted onboarding
    } catch (error) {
      console.error("Error creating Stripe link:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user?.id) {
    return (
      <div className="flex flex-col justify-center min-h-screen min-w-screen items-center">
        <Loader2 className="h-20 w-20 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      {!onboardingStatus.hasAccount && !loading && (
        <div className="flex flex-col items-center min-h-screen min-w-screen justify-center text-center mt-20">
          <AlertTriangle className="text-yellow-500 w-14 h-14 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Stripe Account Not Connected
          </h2>
          <p className="text-gray-600 max-w-md mb-6">
            To receive payments, you must activate your Stripe account. Click
            the button below to start the onboarding process.
          </p>
          <Button
            onClick={handleCreateAccount}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Connect Stripe
          </Button>
        </div>
      )}
      {onboardingStatus.hasAccount && !onboardingStatus.complete && (
        <div className="flex flex-col items-center min-h-screen min-w-screen justify-center text-center mt-20">
          <button
            onClick={handleFinishOnboarding}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md hover:cursor-pointer"
          >
            Finish Stripe Onboarding
          </button>
          <span className="text-gray-600 text-sm">
            (Note: if you have already completed the onboarding, please wait for
            stripe to verify your account it should take a few minutes)
          </span>
        </div>
      )}
      {onboardingStatus.complete && (
        <div className="flex flex-col items-center min-h-screen min-w-screen justify-center text-center mt-20">
          <CheckCircle2 className="text-green-500 w-14 h-14 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Stripe Account Connected
          </h2>
          <p className="text-gray-600 max-w-md">
            Your account is verified and payouts are enabled. You can now
            receive payments for your completed work. If you would like to
            change your account settings, you can do so on the Stripe dashboard.
          </p>
        </div>
      )}
    </div>
  );
}

export default StripeOnboarding;
