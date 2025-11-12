"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import KeyPaymentForm from "@/components/KeyPaymentForm";
import { CheckCircleIcon, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import KeyPaymentFormSubscription from "@/components/KeyPaymentForSubscription";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const GetKeys = () => {
  const [selectedPlan, setSelectedPlan] = useState<{
    priceId: string;
    name: string;
  } | null>(null);
  const [newPlan, setNewPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    status?: string;
    cancelAtPeriodEnd?: boolean;
    planType?: string;
    currentPeriodEnd?: string;
    currentPeriodStart?: string;
    scheduleForDowngrade?: boolean;
    subscriptionScheduledForDowngrade?: string;
  } | null>(null);
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showChangePlan, setShowChangePlan] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean>(false);
  const [savedPayment, setSavedPayment] = useState();
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [newPriceId, setNewPriceId] = useState<string | null>(null);
  const [secondPaymentMethodloading, setSecondPaymentMethodloading] =
    useState<boolean>(false);
  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${API_URL}/api/check-subscription-status`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSubscription(data.subscription);
      console.log(data.subscription, "data.subscription");
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubscription();
  }, []);

  const cancelSubscription = async () => {
    try {
      setSecondPaymentMethodloading(true);
      const response = await fetch(`${API_URL}/api/cancel-subscription`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });
      const data = await response.json();
      console.log(data);
      if (status === true) {
        toast.success("Subscription cancelled successfully!");
      } else {
        toast.success("Subscription reactivated successfully!");
      }
      window.location.reload();
      setSecondPaymentMethodloading(false);
    } catch (error) {
      toast.error("Failed to cancel subscription");
      console.error("Cancel subscription error:", error);
    } finally {
      setSecondPaymentMethodloading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${API_URL}/api/get-payment-methods`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSavedPayment(data);

      console.log(data);
    } catch (error) {
      console.error("Fetch payment methods error:", error);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [newPlan]);

  // const updateSubscription = async (priceId: string) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:3000/api/update-subscription",
  //       {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           priceId,
  //         }),
  //       }
  //     );
  //     const data = await response.json();

  //     if (data.success) {
  //       toast.success("Subscription updated successfully!");
  //     } else {
  //       toast.error("Failed to update subscription");
  //     }
  //     console.log(data, "data");
  //   } catch (error) {
  //     console.error("Update subscription error:", error);
  //   }
  // };

  const updateSubscriptionWithPaymentId = async (priceId: string) => {
    try {
      setSecondPaymentMethodloading(true);
      const response = await fetch(
        `${API_URL}/api/update-subscription-with-payment-method-id`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
            paymentMethodId: paymentMethod,
          }),
        }
      );
      const data = await response.json();

      if (data.message === "Subscription updated successfully") {
        window.location.reload();
        toast.success("Subscription updated successfully!");
        setSecondPaymentMethodloading(false);
      } else {
        toast.error("Failed to update subscription");
      }
    } catch (error) {
      console.error("Update subscription error:", error);
    } finally {
      setSecondPaymentMethodloading(false);
    }
  };

  if (secondPaymentMethodloading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin" />
        <p>Updating subscription...</p>
      </div>
    );
  }

  const fetchSetupIntent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/create-setup-intent`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
      console.log(clientSecret, "clientSecret");
    } catch (error) {
      console.error("Setup intent error:", error);
    }
  };

  // Check for newPlan first, before subscription checks
  if (newPlan !== null && !secondPaymentMethodloading) {
    return (
      <div className="container mx-auto  px-4 py-12 flex flex-col items-center justify-start min-h-screen">
        <div className="mb-4 flex flex-row justify-start w-full ">
          <Button
            onClick={() => {
              setNewPlan(null);
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 "
          >
            Back to Change Plan
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Please select your payment method
          </h1>
        </div>
        <div className="border rounded-lg px-4 py-8 shadow-lg hover:shadow-xl transition-shadow bg-white sm:min-w-2xl flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {newPlan === "basic_plan"
              ? "Basic Plan"
              : newPlan === "premium_tier"
              ? "Premium Tier"
              : "Pro Plan"}
          </h2>
          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              {newPlan === "basic_plan"
                ? "$10"
                : newPlan === "premium_tier"
                ? "$15"
                : "$150"}
            </span>
            <span className="text-gray-600">
              {newPlan === "basic_plan"
                ? "month"
                : newPlan === "premium_tier"
                ? "month"
                : "year"}
            </span>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 text-lg">
              <span className="font-semibold">
                {newPlan === "basic_plan"
                  ? "100 keys"
                  : newPlan === "premium_tier"
                  ? "200 keys"
                  : "200 keys"}
              </span>{" "}
              per{" "}
              {newPlan === "basic_plan"
                ? "month"
                : newPlan === "premium_tier"
                ? "month"
                : "year"}
            </p>
          </div>
          {/* <div className="flex flex-row justify-end w-full">
            <Button className="hover:cursor-pointer" onClick={() => {}}>
              Subscribe
            </Button>
          </div> */}
        </div>
        <div className="mb-4 flex flex-col justify-around mt-4 rounded-lg p-4 border-1 sm:w-2xl ">
          <div className="pb-4 border-b-2 font-bold">
            <h2>Your credit card and debit cards</h2>
          </div>
          <div className="grid grid-cols-12 ">
            <div className="col-span-8"></div>
            <div className="font-normal col-span-4 text-gray-600 text-[15px] flex justify-center ">
              Expires on
            </div>
          </div>
          <div className="grid grid-cols-12 ">
            <label
              htmlFor={`default-payment`}
              className="flex items-center gap-2 cursor-pointer col-span-4 "
            >
              <input
                type="radio"
                id={`default-payment`}
                checked={paymentMethod === savedPayment?.defaultPaymentMethodId}
                onChange={() => {
                  setPaymentMethod(savedPayment?.defaultPaymentMethodId);
                }}
              />
              <h2 className="font-bold">
                {savedPayment?.paymentMethods
                  ?.find(
                    (p: any) => p.id === savedPayment?.defaultPaymentMethodId
                  )
                  ?.brand?.toUpperCase()}
                {
                  <span className="text-gray-500 text-sm font-normal">
                    {" "}
                    (default)
                  </span>
                }
              </h2>
            </label>
            <div className="col-span-4  flex justify-center items-center text-center">
              <h2 className=" flex justify-center items-center text-center  ">
                ending in{" "}
                {
                  savedPayment?.paymentMethods?.find(
                    (p: any) => p.id === savedPayment?.defaultPaymentMethodId
                  )?.last4
                }
              </h2>
            </div>

            <div className="col-span-4  flex justify-center items-center text-center">
              <h2>
                {
                  savedPayment?.paymentMethods?.find(
                    (p: any) => p.id === savedPayment?.defaultPaymentMethodId
                  )?.expMonth
                }
                /
                {
                  savedPayment?.paymentMethods?.find(
                    (p: any) => p.id === savedPayment?.defaultPaymentMethodId
                  )?.expYear
                }
              </h2>
            </div>
          </div>
          {savedPayment?.paymentMethods?.length &&
            savedPayment?.paymentMethods
              ?.filter(
                (card: any) => card.id !== savedPayment?.defaultPaymentMethodId
              )
              .map((card: any, index: number) => (
                <div key={card.id} className="grid grid-cols-12 ">
                  <label
                    htmlFor={`${card.id}`}
                    className="flex items-center gap-2 cursor-pointer col-span-4 "
                  >
                    <input
                      type="radio"
                      id={`${card.id}`}
                      checked={paymentMethod === card.id}
                      onChange={() => {
                        setPaymentMethod(card.id);
                      }}
                    />
                    <h2>{card.brand?.toUpperCase()}</h2>
                  </label>
                  <div className="col-span-4  flex justify-center items-center text-center">
                    <h2>ending in {card.last4}</h2>
                  </div>
                  <div className="col-span-4 flex justify-center items-center text-center">
                    <h2>
                      {card.expMonth}/{card.expYear}
                    </h2>
                  </div>
                </div>
              ))
              .slice(0, 2)}
        </div>
        <div
          className={`flex flex-row ${
            !clientSecret ? "justify-between" : "justify-center"
          }  sm:min-w-2xl  `}
        >
          {!clientSecret && (
            <Button
              onClick={() => {
                setPaymentMethod("new");
                fetchSetupIntent();
              }}
              className="hover:cursor-pointer"
            >
              Choose new payment method
            </Button>
          )}

          {paymentMethod && (
            <Button onClick={() => updateSubscriptionWithPaymentId(newPriceId)}>
              Pay with{" "}
              {savedPayment?.paymentMethods
                ?.find((p: any) => p.id === paymentMethod)
                ?.brand?.toUpperCase()}
            </Button>
          )}
        </div>
        {clientSecret && newPlan !== null && (
          <div className="container mx-auto px-4 py-12 min-h-screen">
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, paymentMethodCreation: "manual" }}
            >
              <KeyPaymentFormSubscription
                priceId={newPriceId || ""}
                planName={
                  newPlan === "basic_plan"
                    ? "Basic Plan"
                    : newPlan === "premium_tier"
                    ? "Premium Tier"
                    : "Pro Plan"
                }
              />
            </Elements>
          </div>
        )}
      </div>
    );
  }

  if (subscription && subscription?.status === "active") {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen ">
        {!showChangePlan && !newPlan && (
          <div className="max-w-2xl mx-auto">
            {/* Success Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-semibold flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                Active Subscription
              </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  You&apos;re subscribed to
                </h1>
                <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-2xl font-bold shadow-lg">
                  {subscription?.planType === "basic_plan"
                    ? "Basic Plan"
                    : subscription?.planType === "premium_tier"
                    ? "Premium Plan"
                    : subscription?.planType === "pro_plan"
                    ? "Pro Plan"
                    : null}
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Billing</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription?.planType === "basic_plan"
                          ? "$10/month"
                          : subscription?.planType === "premium_tier"
                          ? "$15/month"
                          : subscription?.planType === "pro_plan"
                          ? "$150/year"
                          : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">API Keys</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription?.planType === "basic_plan"
                          ? "100 keys/month"
                          : subscription?.planType === "premium_tier"
                          ? "200 keys/month"
                          : subscription?.planType === "pro_plan"
                          ? "200 keys/month"
                          : null}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="text-center mb-8 p-4 bg-blue-50 rounded-lg">
                {subscription?.cancelAtPeriodEnd && (
                  <p className="text-gray-700">
                    Your subscription will be cancelled on{" "}
                    {new Date(
                      subscription?.currentPeriodEnd || ""
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    .
                  </p>
                )}
                {subscription?.cancelAtPeriodEnd === false &&
                  subscription.scheduleForDowngrade === false && (
                    <p className="text-gray-700">
                      Your subscription is active and will renew automatically
                      on{" "}
                      {new Date(
                        subscription?.currentPeriodEnd || ""
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      .
                    </p>
                  )}
                {subscription?.cancelAtPeriodEnd === false &&
                  subscription.scheduleForDowngrade === true && (
                    <p className="text-gray-700">
                      Your current subscription is still active and your new{" "}
                      <span className="font-bold">
                        {subscription.subscriptionScheduledForDowngrade}
                      </span>{" "}
                      starts on{" "}
                      {new Date(
                        subscription?.currentPeriodEnd || ""
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      .
                    </p>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
                {subscription?.cancelAtPeriodEnd !== true && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setStatus(true);
                        }}
                        variant="outline"
                        className="w-full sm:w-auto text-red-600 hover:cursor-pointer border-red-300 hover:bg-red-50 hover:border-red-400"
                      >
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your subscription by the end of the
                          current billing cycle.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={cancelSubscription}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                      Change Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Important Notice</AlertDialogTitle>
                      <AlertDialogDescription>
                        If you downgrade your plan, your current subscription
                        will be cancelled after the current billing cycle and a
                        new downgraded subscription will be created after
                        current billing cycle ends.
                        <span className="font-bold text-black">
                          {" "}
                          Upgrades will be immediate.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setShowChangePlan(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
        {showChangePlan && !newPlan && (
          <>
            <div className="container mx-auto px-4 py-12 min-h-screen">
              <Button
                onClick={() => {
                  setShowChangePlan(false);
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Back to Subscription
              </Button>
              <div className="flex justify-center items-center mb-12">
                <h1 className="text-4xl font-bold text-center">
                  Choose Your Plan
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Base Plan */}
                <div className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Basic Plan
                  </h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">
                      $10
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg">
                      <span className="font-semibold">100 keys</span> per month
                    </p>
                  </div>
                  <Button
                    className="hover:cursor-pointer"
                    onClick={() => {
                      if (
                        subscription?.cancelAtPeriodEnd === true &&
                        subscription?.planType === "basic_plan"
                      ) {
                        cancelSubscription();
                      } else {
                        setNewPlan("basic_plan");
                        setNewPriceId("price_1SJes2PN81X55KQYRRp54JXc");
                      }
                    }}
                    disabled={
                      (subscription?.planType === "basic_plan" &&
                        subscription?.cancelAtPeriodEnd !== true) ||
                      (subscription?.cancelAtPeriodEnd === true &&
                        subscription?.planType !== "basic_plan") ||
                      subscription?.subscriptionScheduledForDowngrade ===
                        "basic_plan"
                    }
                  >
                    {subscription?.cancelAtPeriodEnd === true &&
                      subscription?.planType === "basic_plan" &&
                      "Reactivate Plan"}
                    {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType === "basic_plan" &&
                      "current plan"}
                    {/* {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType !== "basic_plan" &&
                      subscription?.subscriptionScheduledForDowngrade !==
                        "basic_plan" &&
                      "Get basic plan"} */}
                    {subscription.planType !== "basic_plan" &&
                      subscription.subscriptionScheduledForDowngrade !==
                        "basic_plan" &&
                      "Get basic plan"}
                    {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType !== "basic_plan" &&
                      subscription?.subscriptionScheduledForDowngrade ===
                        "basic_plan" &&
                      "scheduled"}
                  </Button>
                </div>

                {/* Premium Tier */}
                <div className="border-2 border-blue-600 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow bg-white relative">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-sm text-sm font-semibold">
                    Popular
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Premium Tier
                  </h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">
                      $15
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg">
                      <span className="font-semibold">200 keys</span> per month
                    </p>
                  </div>
                  <Button
                    className="hover:cursor-pointer"
                    onClick={() => {
                      if (
                        subscription?.cancelAtPeriodEnd !== true &&
                        subscription?.planType === "premium_tier"
                      ) {
                        setNewPlan("premium_tier");
                      } else if (subscription?.cancelAtPeriodEnd === true) {
                        cancelSubscription();
                      } else {
                        setNewPlan("premium_tier");
                        setNewPriceId("price_1SJesUPN81X55KQYIJanw81X");
                      }
                    }}
                    disabled={
                      (subscription?.planType === "premium_tier" &&
                        subscription?.cancelAtPeriodEnd !== true) ||
                      (subscription?.cancelAtPeriodEnd === true &&
                        subscription?.planType !== "premium_tier") ||
                      subscription?.subscriptionScheduledForDowngrade ===
                        "premium_tier"
                    }
                  >
                    {subscription?.cancelAtPeriodEnd === true &&
                      subscription?.planType === "premium_tier" &&
                      "Reactivate Plan"}
                    {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType === "premium_tier" &&
                      "current plan"}
                    {/* {subscription.cancelAtPeriodEnd === true &&
                      subscription.planType !== "premium_tier" &&
                      subscription.subscriptionScheduledForDowngrade !==
                        "premium_tier" &&
                      "Get premium plan"} */}
                    {subscription?.planType !== "premium_tier" &&
                      subscription?.subscriptionScheduledForDowngrade !==
                        "premium_tier" &&
                      "Get premium plan"}
                    {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType !== "premium_tier" &&
                      subscription?.subscriptionScheduledForDowngrade ===
                        "premium_tier" &&
                      "scheduled"}
                  </Button>
                </div>

                {/* Pro Plan */}
                <div className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Pro Plan
                  </h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">
                      $150
                    </span>
                    <span className="text-gray-600">/year</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg">
                      <span className="font-semibold">200 keys</span> per month
                    </p>
                  </div>
                  <Button
                    className="hover:cursor-pointer"
                    onClick={() => {
                      if (
                        subscription?.cancelAtPeriodEnd !== true &&
                        subscription?.planType === "pro_plan"
                      ) {
                        setNewPlan("pro_plan");
                      } else if (subscription?.cancelAtPeriodEnd === true) {
                        cancelSubscription();
                      } else {
                        setNewPlan("pro_plan");
                        setNewPriceId("price_1SJeu9PN81X55KQYNOc38pOm");
                      }
                    }}
                    disabled={
                      (subscription?.planType === "pro_plan" &&
                        subscription?.cancelAtPeriodEnd !== true) ||
                      (subscription?.cancelAtPeriodEnd === true &&
                        subscription?.planType !== "pro_plan") ||
                      subscription?.subscriptionScheduledForDowngrade ===
                        "pro_plan"
                    }
                  >
                    {subscription?.cancelAtPeriodEnd === true &&
                      subscription?.planType === "pro_plan" &&
                      "Reactivate Plan"}
                    {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType === "pro_plan" &&
                      subscription?.subscriptionScheduledForDowngrade !==
                        "pro_plan" &&
                      "current plan"}
                    {subscription?.planType !== "pro_plan" &&
                      subscription?.subscriptionScheduledForDowngrade !==
                        "pro_plan" &&
                      "Get pro plan"}
                    {subscription?.cancelAtPeriodEnd === false &&
                      subscription?.planType !== "pro_plan" &&
                      subscription?.subscriptionScheduledForDowngrade ===
                        "pro_plan" &&
                      "scheduled"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // useEffect(() => {
  //   if (subscription && subscription?.status === "active") {
  //     fetchSetupIntent();
  //   }
  // }, [subscription]);

  // Fetch setup intent when user selects a plan
  //   useEffect(() => {
  //     fetchSetupIntent();
  //   }, []);

  // const fetchSetupIntent = async () => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:3000/api/create-setup-intent",
  //       {
  //         method: "POST",
  //         credentials: "include",
  //       }
  //     );
  //     const data = await response.json();
  //     setClientSecret(data.clientSecret);
  //   } catch (error) {
  //     console.error("Setup intent error:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin" size={40} />
      </div>
    );
  }
  return (
    <>
      {!clientSecret && !subscription && !newPlan && (
        <div className="container mx-auto px-4 py-12 min-h-screen">
          <h1 className="text-4xl font-bold text-center mb-12">
            Choose Your Plan
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Base Plan */}
            <div className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Basic Plan
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$10</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold">100 keys</span> per month
                </p>
              </div>
              <Button
                className="hover:cursor-pointer"
                onClick={() => {
                  fetchSetupIntent();
                  setSelectedPlan({
                    priceId: "price_1SJes2PN81X55KQYRRp54JXc",
                    name: "Basic Plan",
                  });
                }}
              >
                Get Basic Plan
              </Button>
            </div>

            {/* Premium Tier */}
            <div className="border-2 border-blue-600 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow bg-white relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-sm text-sm font-semibold">
                Popular
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Premium Tier
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$15</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold">200 keys</span> per month
                </p>
              </div>
              <Button
                className="hover:cursor-pointer"
                onClick={() => {
                  fetchSetupIntent();
                  setSelectedPlan({
                    priceId: "price_1SJesUPN81X55KQYIJanw81X",
                    name: "Premium Plan",
                  });
                }}
              >
                Get Premium Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Pro Plan
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$150</span>
                <span className="text-gray-600">/year</span>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold">200 keys</span> per month
                </p>
              </div>
              <Button
                className="hover:cursor-pointer"
                onClick={() => {
                  fetchSetupIntent();
                  setSelectedPlan({
                    priceId: "price_1SJeu9PN81X55KQYNOc38pOm",
                    name: "Pro Plan",
                  });
                }}
              >
                Get Pro Plan
              </Button>
            </div>
          </div>
        </div>
      )}
      {clientSecret && !newPlan && (
        <div className="container mx-auto px-4 py-12 min-h-screen">
          <h1 className="text-4xl font-bold text-center mb-12">
            Choose Your Plan
          </h1>
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, paymentMethodCreation: "manual" }}
          >
            <KeyPaymentForm
              priceId={selectedPlan?.priceId || ""}
              planName={selectedPlan?.name}
            />
          </Elements>
        </div>
      )}
    </>
  );
};

export default GetKeys;
