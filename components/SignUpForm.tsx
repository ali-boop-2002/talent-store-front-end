"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/types";
import { SignUp } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
// import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

const SignUpForm = () => {
  const router = useRouter();
  const [loading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("CLIENT");
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignUp) => {
    setIsLoading(true);

    try {
      await registerUser(
        data.emailAddress,
        data.password,
        data.role,
        data.name,
        data.description,
        data.skills
      );

      toast.success("Account created successfully!");
      router.push("/sign-in");
    } catch (error: unknown) {
      console.error("Registration error:", error);

      // Handle errors
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred during registration");
      } else {
        toast.error("An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our talent marketplace today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                {...register("emailAddress")}
                className={`mt-1 ${
                  errors.emailAddress ? "border-red-500" : ""
                }`}
                placeholder="Enter your email address"
              />
              {errors.emailAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.emailAddress.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={`mt-1 ${errors.password ? "border-red-500" : ""}`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className={`mt-1 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role Selection Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Account Type
              </label>
              <select
                id="role"
                {...register("role")}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                  errors.role ? "border-red-500" : ""
                }`}
              >
                <option value="CLIENT">Client - I want to hire talent</option>
                <option value="TALENT">
                  Talent - I want to offer my services
                </option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Conditional fields for TALENT role */}
            {selectedRole === "TALENT" && (
              <>
                {/* Description Field */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                    placeholder="Tell us about your skills and experience"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Skills Field */}
                <div>
                  <label
                    htmlFor="skills"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Skills
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Web Development",
                        "Mobile Development",
                        "UI/UX Design",
                        "Data Science",
                        "Machine Learning",
                        "DevOps",
                        "Cloud Computing",
                        "Cybersecurity",
                        "Digital Marketing",
                        "Content Writing",
                        "Graphic Design",
                        "Video Editing",
                      ].map((skill) => (
                        <label key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            value={skill}
                            {...register("skills")}
                            className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.skills.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sign Up Button */}
          <div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {loading ? (
                <LoaderCircle className="animate-spin" size={88} />
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                className="text-purple-800 hover:text-purple-500"
                href="/sign-in"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
