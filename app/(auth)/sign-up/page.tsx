"use client";
import SignUpForm from "@/components/SignUpForm";
import { useAuth } from "@/lib/useAuth";
import { useEffect } from "react";

const SignUpPage = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin bg-red-400 rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen">
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
