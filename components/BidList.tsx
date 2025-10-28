"use client";
import { useEffect, useState } from "react";
import { applicationAPI } from "@/lib/api/applicationApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";

interface Bid {
  id: string;
  talent: {
    name: string;
  };
  keysUsed: number;
  proposedRate: number;
  coverLetter: string;
  timeline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BidsList({ jobId }: { jobId: string }) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBids() {
      try {
        const data = await applicationAPI.getByJobId(jobId);
        setBids(data);
      } catch (err) {
        setError("Failed to load bids");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBids();
  }, [jobId]);

  if (loading) {
    return <div className="text-center py-8">Loading bids...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (bids.length === 0) {
    return <div className="text-center py-8 text-gray-500">No bids yet</div>;
  }

  return (
    <div className="space-y-4 my-4 overflow-y-auto max-h-400">
      {bids.map((bid) => (
        <Card
          key={bid.id}
          className="border-2 hover:border-purple-300 transition-colors"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {bid.talent.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg">{bid.talent.name}</CardTitle>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Keys Spent</p>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                  🔑 {bid.keysUsed} Keys
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Proposed Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${bid.proposedRate?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="text-lg font-semibold">{bid.timeline}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cover Letter</p>
                <p className="text-gray-700">{bid.coverLetter}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/profile/${bid.talent.id}`}>
              <Button className="w-full hover:cursor-pointer">
                View Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
