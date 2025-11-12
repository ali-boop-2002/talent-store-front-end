"use client";

import { LoginForm } from "@/components/login-form";
import img from "@/public/images/const.jpg";
import { useAuth } from "@/lib/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const { user, loading, initialCheck } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete and user is logged in, redirect to home
    if (initialCheck && !loading && user) {
      router.replace("/");
    }
  }, [user, loading, initialCheck, router]);

  // Show loading state while checking auth
  if (loading || (initialCheck && !loading && user)) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm img={img} />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
