"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Upload, User, Clock, TrashIcon, Trash2 } from "lucide-react";
import { userProfileSchema } from "@/types";
import { useForm } from "react-hook-form";
import { Profile } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";

const UserProfileForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  // if (user?.role !== "TALENT") {
  //   router.push("/");
  // }

  // State for pre-filling form data
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userProfileData, setUserProfileData] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    Bio?: string;
    description?: string;
    availability?: string;
    skills?: string[];
    portfolio?: string[];
  } | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/find-talent/${user.id}`,
            { credentials: "include" }
          );
          const data = await response.json();
          console.log("data", data);
          if (data.talent) {
            setUserProfileData(data.talent);

            // Set skills
            if (data.talent.skills && Array.isArray(data.talent.skills)) {
              setSelectedSkills(data.talent.skills);
              setSkills(data.talent.skills);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<Profile>({
    resolver: zodResolver(userProfileSchema),
    mode: "onChange",
  });

  // Update form values when user profile data is loaded
  useEffect(() => {
    if (userProfileData) {
      reset({
        fullname: userProfileData.name || "",
        email: userProfileData.email || "",
        phone: userProfileData.phone || "",
        location: userProfileData.location || "",
        Bio: userProfileData.Bio || "",
        description: userProfileData.description || "",
        availabilty: userProfileData.availabilty || "",
        skills: selectedSkills,
      });
    }
  }, [userProfileData, selectedSkills, reset]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);

    // Create previews for images
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result) {
            setFilePreviews((prev) => [...prev, result as string]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, add empty string to maintain array alignment
        setFilePreviews((prev) => [...prev, ""]);
      }
    });
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: Profile) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // // Add files
      // uploadedFiles.forEach((file, index) => {
      //   formData.append(`portfolio_${index}`, file);
      // });

      const updateResponse = await fetch(
        `http://localhost:3000/api/update-profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data), // Use FormData instead of JSON
        }
      );
      if (updateResponse.ok) {
        const response = await updateResponse.json();
      }

      if (uploadedFiles.length > 0) {
        const portfolioFormData = new FormData();
        uploadedFiles.forEach((file, index) => {
          portfolioFormData.append(`portfolio_${index}`, file);
        });

        const portfolioResponse = await fetch(
          `http://localhost:3000/api/upload-portfolio`,
          {
            method: "POST",
            credentials: "include",
            body: portfolioFormData,
          }
        );
        console.log("portfolioResponse", portfolioResponse);

        if (portfolioResponse.ok) {
          const portfolioResponseData = await portfolioResponse.json();
        } else {
          const errorText = await portfolioResponse.text();
          console.error("Portfolio update failed:", errorText);
        }
      }
    } catch (error) {
      console.error("Error updating talent:", error);
    }
  };
  const handleRemoveFile = async (index: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/delete-portfolio`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            portfolioUrls: userProfileData?.portfolio?.[index],
          }),
        }
      );
      if (response.ok) {
        const responseData = await response.json();
      } else {
        const errorText = await response.text();
        console.error("Portfolio deletion failed:", errorText);
      }
    } catch (error) {
      console.error("Error deleting portfolio:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Loading your profile...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 "></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 ">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-2">
          Complete your profile to get started
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...register("fullname")}
                />
                {errors.fullname && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.fullname.message)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.phone.message)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter your location"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.location.message)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="Bio">Bio</Label>
              <Textarea
                id="Bio"
                placeholder="Tell us about yourself, your skills, and experience..."
                rows={4}
                {...register("Bio")}
              />
              {errors.Bio && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.Bio.message)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your professional background..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.description.message)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="skills">Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <label
                    key={skill}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={skill}
                      checked={selectedSkills?.includes(skill) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSkills = [...(selectedSkills || []), skill];
                          setSelectedSkills(newSkills);
                          setValue("skills", newSkills);
                        } else {
                          const newSkills = (selectedSkills || []).filter(
                            (s) => s !== skill
                          );
                          setSelectedSkills(newSkills);
                          setValue("skills", newSkills);
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
              {errors.skills && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.skills.message)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="availability">When are you available?</Label>
              {/* <Calendar dateRange={dateRange} setDateRange={setDateRange} /> */}
              <Textarea
                id="availability"
                placeholder="e.g., Monday-Friday 9AM-5PM, Weekends available, Flexible schedule..."
                rows={3}
                {...register("availabilty")}
              />
              {errors.availabilty && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.availabilty.message)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="portfolio">Upload your work samples</Label>
              <Input
                id="portfolio"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="mt-2"
                onChange={handleFileUpload}
              />
              {errors.portfolio && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.portfolio.message)}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Upload images, PDFs, or documents showcasing your work
              </p>
            </div>

            {/* File Previews */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-4 bg-amber-300">
                <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      {file.type.startsWith("image/") && filePreviews[index] ? (
                        <div>
                          <Image
                            src={filePreviews[index]}
                            alt={file.name}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded"
                          />
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className=" grid grid-cols-2 md:grid-cols-3 gap-4  ">
              {userProfileData?.portfolio &&
              userProfileData.portfolio.length > 0 ? (
                userProfileData.portfolio?.map((pic: string, index: number) => (
                  <div key={index} className="w-full h-full relative ">
                    <Dialog>
                      <DialogTrigger>
                        {" "}
                        <Image
                          key={index}
                          src={pic}
                          width={200}
                          height={100}
                          alt="exp"
                          className="rounded max-h-30 hover:cursor-pointer hover:border-2 hover:border-purple-700"
                        />
                        <Trash2
                          className="h-5 w-5 hover:cursor-pointer bg-white rounded absolute font-bold text-red-500 top-2 right-15 "
                          size={16}
                          strokeWidth={1.75}
                          onClick={(e) => {
                            e.stopPropagation(); // This prevents the dialog from opening
                            handleRemoveFile(index);
                          }}
                        />
                      </DialogTrigger>
                      <DialogContent className="!max-w-[60vw]  overflow-auto p-2 pt-0">
                        {" "}
                        <DialogHeader>
                          <DialogTitle></DialogTitle>
                          <Image
                            key={index}
                            src={pic}
                            width={2000}
                            height={800}
                            alt="exp"
                            className="w-full h-auto max-w-4xl rounded hover:cursor-pointer  hover:border-purple-700"
                          />
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              ) : (
                <div>
                  <p>No portfolio to show</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-2"
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
