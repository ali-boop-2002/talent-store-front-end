"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { GigFormData } from "@/types/types";
import { gigFormSchema } from "@/types";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

// Zod schema for form validation

const AddGig = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<GigFormData>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      gigDescription: "",
      hourlyPrice: false,
      fixedPrice: true,
    },
  });

  const hourlyPrice = watch("hourlyPrice");
  const fixedPrice = watch("fixedPrice");

  const onSubmit = async (data: GigFormData) => {
    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your API

      const addGig = await fetch(`http://localhost:3000/api/create-gig`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data), // Use FormData instead of JSON
      });
      if (addGig.ok) {
        const response = await addGig.json();
      }

      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error("Error submitting gig:", error);
      alert("Error adding gig. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceTypeChange = (type: "hourly" | "fixed") => {
    if (type === "hourly") {
      setValue("hourlyPrice", true);
      setValue("fixedPrice", false);
    } else {
      setValue("hourlyPrice", false);
      setValue("fixedPrice", true);
    }
  };

  return (
    <div className="justify-center items-center flex  min-h-screen min-w-screen">
      <div className=" w-70">
        <Card className="">
          <CardHeader>
            <CardTitle>Add New Gig</CardTitle>
            <CardDescription>
              Create a new gig to offer your services to clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Gig Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Gig Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Install door handles and locks"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Price Type Selection */}
              <div className="space-y-3 ">
                <Label>Price Type *</Label>
                <div className="flex justify-between  ">
                  <Button
                    type="button"
                    variant={fixedPrice ? "default" : "outline"}
                    onClick={() => handlePriceTypeChange("fixed")}
                    className="w-25"
                  >
                    Fixed Price
                  </Button>
                  <Button
                    type="button"
                    variant={hourlyPrice ? "default" : "outline"}
                    onClick={() => handlePriceTypeChange("hourly")}
                    className="w-25"
                  >
                    Hourly Rate
                  </Button>
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  {fixedPrice ? "Fixed Price ($)" : "Hourly Rate ($/hour)"} *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  placeholder={fixedPrice ? "85.00" : "25.00"}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              {/* Gig Description */}
              <div className="space-y-2">
                <Label htmlFor="gigDescription">Gig Description *</Label>
                <Textarea
                  id="gigDescription"
                  {...register("gigDescription")}
                  placeholder="Describe what services you will provide, what's included, and any important details..."
                  rows={4}
                  className={errors.gigDescription ? "border-red-500" : ""}
                />
                {errors.gigDescription && (
                  <p className="text-sm text-red-500">
                    {errors.gigDescription.message}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Adding Gig..." : "Add Gig"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddGig;
