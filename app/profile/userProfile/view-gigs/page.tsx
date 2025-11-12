"use client";

import { useAuth } from "@/lib/useAuth";
import { useEffect, useState, useCallback } from "react";
import { API_URL } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, DollarSign, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Gig {
  id: string;
  userId: string;
  name: string;
  gigDescription: string;
  price: number;
  fixedPrice: boolean;
  hourlyPrice: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
  description: string;
  portfolio: string[];
  userProfilePic: string[];
}

const ViewGigs = () => {
  const { user, loading } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/find-talent/${user.id}`);
      const data = await response.json();

      if (data.talent.gigs) {
        setGigs(data.talent.gigs);
      }
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, loading, fetchUserData]);

  const handleEditGig = (gigId: string) => {
    // Navigate to edit gig page
  };

  const handleDeleteGig = async (gigId: string) => {
    if (confirm("Are you sure you want to delete this gig?")) {
      try {
        // Add delete API call here

        // Refresh the gigs list
        fetchUserData();
      } catch (error) {
        console.error("Error deleting gig:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div>
        <div className="mb-8 items-center justify-center flex ">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Gigs</h1>
          <p className="text-gray-600">
            Manage and view all your service offerings
          </p>
        </div>
        <div>
          {userProfile && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border items-center justify-center flex border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {userProfile.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userProfile.name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {userProfile.location || "Location not specified"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          {gigs.length === 0 ? (
            <div className="text-center py-12 ">
              <div className="text-gray-400 mb-4">
                <DollarSign className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No gigs yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first service offering
              </p>
              <Button asChild>
                <Link href="/profile/userProfile/add-gig">
                  Create Your First Gig
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <Card
                  key={gig.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {gig.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          {gig.fixedPrice ? "Fixed Price" : "Hourly Rate"}

                          {gig.hourlyPrice && (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGig(gig.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {gig.gigDescription}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
                        <DollarSign className="w-5 h-5" />
                        {gig.price}
                        {gig.hourlyPrice && (
                          <span className="text-sm text-gray-500">/hour</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {gigs.length > 0 && (
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/profile/userProfile/add-gig">Add New Gig</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ViewGigs;
