"use client";

import { useAuth } from "@/lib/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, ArrowDownLeft, DollarSign, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Contract, Job } from "@/types/types";
import { API_URL } from "@/lib/config";
interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  platformFee: number;
  stripePaymentIntentId: string;
  contractId: string;
  clientId: string;
  talentId: string;
  stripeAccountId: string;
}

const Transactions = () => {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  //   useEffect(() => {
  //     if (authLoading || !user?.role) return;
  //     if (user?.role !== "TALENT") {
  //       router.push("/");
  //     }
  //   }, [user, router, authLoading]);
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response =
        user?.role === "TALENT"
          ? await fetch(`${API_URL}/api/talent/orders`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            })
          : await fetch(`${API_URL}/api/client/orders`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
      if (!response.ok) {
        toast.error("Failed to fetch transactions");
        throw new Error("Failed to fetch transactions");
      }
      console.log("response", response);
      const data = await response.json();
      setTransactions(data.orders);
      setJobs(data.jobs);
      console.log("transactions", data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log("jobs", jobs);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  //   const formatAmount = (amount: number) => {
  //     return (amount / 100).toFixed(2);
  //   };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === "TALENT"
              ? "Incoming Transactions"
              : "Outgoing Payments"}
          </h1>
          <p className="text-gray-600">
            {user?.role === "TALENT"
              ? "Your incoming transactions"
              : "Your outgoing payments"}
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">
              No transactions yet
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        {user?.role === "TALENT" ? (
                          <ArrowDownLeft className="h-6 w-6 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {user?.role === "TALENT" ? "Incoming" : "Outgoing"}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user?.role === "TALENT"
                            ? `$${transaction.amount.toFixed(2)}`
                            : `-$${transaction.amount.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      {
                        <div className="max-h-20 overflow-y-auto">
                          <p className="text-sm text-gray-500 mb-1">
                            {jobs[0]?.description}
                          </p>
                        </div>
                      }
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : transaction.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
