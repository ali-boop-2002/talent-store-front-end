"use client";

import { useAuth } from "@/lib/useAuth";

import { useEffect, useState } from "react";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import ClientRatings from "@/components/clientRatings";

import SimpleRating from "@/components/rating";
import { Contract } from "@/types/types";

interface Contracts {
  contracts: contract[];
}

interface contract {
  id: string;
  jobId: string;
  job: job;
  clientId: string;
  client: client;
  status: string;
  createdAt: string;
  description: string;
  talentId: string;
  talent: talent;
  accepted: boolean;
  rating: number | 0;
}

interface job {
  id: string;
  title: string;
}
interface client {
  id: string;
  name: string;
}
interface talent {
  id: string;
  name: string;
}

const ContractsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [contracts, setContracts] = useState<contract[]>([]);
  const [selectedContractJobId, setSelectedContractJobId] = useState<
    string | null
  >(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      fetchContracts();
    }
  }, [user, authLoading]);

  const fetchContracts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const endpoint =
        user.role === "CLIENT"
          ? "http://localhost:3000/api/client"
          : "http://localhost:3000/api/talent";

      const response = await fetch(endpoint, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }

      const data: Contracts = await response.json();

      setContracts(data.contracts || []);
      console.log("contracts", data.contracts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join_contract", user.id);

    const listener = (data: contract) => {
      setContracts((prevContracts) => [data, ...prevContracts]);
    };

    socket.on("contract created", listener); // <-- match server event name

    return () => {
      socket.emit("leave_contract", user.id);
      socket.off("contract created", listener);
    };
  }, [user?.id, contracts]);

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join_client", user.id);

    const listener = (data: contract) => {
      setContracts((prevContracts) =>
        prevContracts.map((c) =>
          c.id === data.id
            ? { ...c, accepted: data.accepted, status: data.status }
            : c
        )
      );
    };
    socket.on("contract_updated", listener);

    return () => {
      socket.emit("leave_client", user.id);
      socket.off("contract_updated", listener);
    };
  }, [user?.id, contracts]);
  const handleAccept = async (id: string) => {
    if (user?.role === "TALENT") {
      try {
        const response = await fetch(
          `http://localhost:3000/api/update/accepted/${id}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accepted }),
          }
        );
        if (response.ok) {
          fetchContracts();
          toast.success("Contract status updated successfully");
        } else {
          toast.error("Failed to update contract status");
        }
      } catch (error) {
        toast.error("Failed to update contract status");
        console.error(error);
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (user?.role === "CLIENT") {
      try {
        const response = await fetch(`http://localhost:3000/api/update/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          fetchContracts();
          toast.success("Contract status updated successfully");
        } else {
          toast.error("Failed to update contract status");
        }
      } catch (error) {
        toast.error("Failed to update contract status");
        console.error(error);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-purple-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl">Error: {error}</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          There are no active contracts
        </h2>
        {user?.role === "CLIENT" && (
          <>
            <button
              onClick={() => router.push("/contracts/create")}
              className="group relative bg-green-50 hover:bg-green-100 transition-all duration-300 rounded-2xl p-12 border-2 border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl"
              aria-label="Create new contract"
            >
              <Plus className="h-24 w-24 text-green-600 group-hover:text-green-700 transition-colors" />
            </button>
            <p className="mt-4 text-gray-600">Click to create a new contract</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Contracts</h1>
          {user?.role === "CLIENT" && (
            <Button
              onClick={() => router.push("/contracts/create")}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Contract
            </Button>
          )}
        </div>

        {user?.role === "CLIENT" && (
          <div className="flex flex-col gap-6">
            {contracts.map((contract) => (
              <ContextMenu key={contract.id}>
                <ContextMenuTrigger>
                  <Card
                    key={contract.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          Job: {contract?.job?.title}
                        </CardTitle>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            contract.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : contract.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : contract.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {contract.status}
                        </span>
                      </div>
                      <CardDescription className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-gray-700 mb-4 ${
                          contract.description.length > 200
                            ? "hover:bg-gray-200 hover:cursor-pointer p-2 rounded text-start"
                            : ""
                        }`}
                      >
                        {contract.description.length > 200 ? (
                          <Dialog>
                            <DialogTrigger className="text-start hover:cursor-pointer">
                              {contract.description.slice(0, 200)}...
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle></DialogTitle>
                                <DialogDescription>
                                  {contract.description}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          contract.description
                        )}
                      </p>
                      <div className="space-y-2 text-sm">
                        {/* <p className="text-gray-600">
                    <span className="font-semibold">Job ID:</span>{" "}
                    {contract.jobId.slice(0, 8)}
                  </p> */}
                        <p className="text-gray-600">
                          <span className="font-semibold">Talent: </span>{" "}
                          {contract?.talent?.name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Client: </span>{" "}
                          {contract.client?.name}
                        </p>
                      </div>
                      {user?.role === "CLIENT" && (
                        <div className="flex justify-end  ">
                          {contract.status !== "COMPLETED" && (
                            <label
                              className={`px-2 rounded-3xl ${
                                contract.accepted === true
                                  ? "bg-green-300"
                                  : contract.accepted === false
                                  ? "bg-red-300"
                                  : "bg-yellow-300"
                              }`}
                            >
                              {/* {contract.accepted
                              ? "accepted by talent"
                              : "rejected by talent"} */}
                              {contract.accepted === true &&
                                contract.status !== "COMPLETED" &&
                                "accepted by talent"}

                              {contract.accepted === false &&
                                "rejected by talent"}
                              {contract.accepted === null &&
                                "waiting for talent to accept"}
                            </label>
                          )}
                          {contract.status === "COMPLETED" && (
                            <SimpleRating
                              contract={contract as unknown as Contract}
                            />
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    disabled={
                      contract.status === "ACTIVE" ||
                      contract.status === "COMPLETED" ||
                      contract.status === "CANCELLED"
                    }
                    onClick={() => handleUpdateStatus(contract.id, "ACTIVE")}
                  >
                    ACTIVE
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={
                      contract.status === "COMPLETED" ||
                      contract.status === "CANCELLED"
                    }
                    onClick={() => handleUpdateStatus(contract.id, "COMPLETED")}
                  >
                    COMPLETED
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={
                      contract.status === "CANCELLED" ||
                      contract.status === "COMPLETED"
                    }
                    onClick={() => handleUpdateStatus(contract.id, "CANCELLED")}
                  >
                    CANCELLED
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
        {user?.role === "TALENT" && (
          <div className="flex flex-col gap-6">
            {contracts.map((contract) => (
              <Card
                key={contract.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Job: {contract?.job?.title}
                    </CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        contract.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : contract.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : contract.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {contract.status}
                    </span>
                  </div>
                  <CardDescription className="text-sm text-gray-500">
                    Created: {new Date(contract.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-gray-700 mb-4 ${
                      contract.description.length > 200
                        ? "hover:bg-gray-200 hover:cursor-pointer p-2 rounded text-start"
                        : ""
                    }`}
                  >
                    {contract.description.length > 200 ? (
                      <Dialog>
                        <DialogTrigger className="text-start hover:cursor-pointer">
                          {contract.description.slice(0, 200)}...
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle></DialogTitle>
                            <DialogDescription>
                              {contract.description}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      contract.description
                    )}
                  </p>
                  <div className="space-y-2 text-sm">
                    {/* <p className="text-gray-600">
                    <span className="font-semibold">Job ID:</span>{" "}
                    {contract.jobId.slice(0, 8)}
                  </p> */}
                    <p className="text-gray-600">
                      <span className="font-semibold">Talent: </span>{" "}
                      {contract?.talent?.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Client: </span>{" "}
                      {contract.client?.name}
                    </p>
                  </div>
                  {/* {user?.role === "CLIENT" && (
                    <div className="flex justify-end  ">
                      <label
                        className={`px-2 rounded-3xl ${
                          contract.accepted ? "bg-green-300" : "bg-yellow-200"
                        }`}
                      >
                        {contract.accepted
                          ? "accepted by talent"
                          : "waiting for talent to accept"}
                      </label>
                    </div>
                  )} */}
                  {user?.role === "TALENT" &&
                    contract.accepted === true &&
                    contract.status !== "COMPLETED" && (
                      <div className="flex justify-end">
                        <div className="flex gap-2">
                          <label className="px-2 rounded-3xl bg-green-300">
                            contract accepted
                          </label>
                        </div>
                      </div>
                    )}{" "}
                  {user?.role === "TALENT" && contract.accepted === false && (
                    <div className="flex justify-end">
                      <div className="flex gap-2">
                        <label className="px-2 rounded-3xl bg-red-300">
                          contract rejected
                        </label>
                      </div>
                    </div>
                  )}
                  {user?.role === "TALENT" &&
                    contract.accepted === true &&
                    contract.status === "COMPLETED" && (
                      <div className="flex justify-end">
                        <ClientRatings
                          contract={contract as unknown as Contract}
                        />
                      </div>
                    )}
                  {user?.role === "TALENT" && contract.accepted === null && (
                    <div className="flex justify-end">
                      <div className="flex gap-2">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger
                            asChild
                            className="text-start hover:cursor-pointer"
                          >
                            <div>
                              <Button
                                variant="outline"
                                onClick={() => setAccepted(true)}
                                className="bg-green-300 hover:cursor-pointer hover:bg-green-400"
                              >
                                Accept
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => setAccepted(false)}
                                className="bg-red-300 hover:cursor-pointer hover:bg-red-400"
                              >
                                Reject
                              </Button>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle></DialogTitle>
                              <DialogDescription>
                                Are you sure this action can not be undone?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAccepted(null);
                                    setDialogOpen(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleAccept(contract.id);
                                    setDialogOpen(false);
                                  }}
                                >
                                  Confirm
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
