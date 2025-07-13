"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const error = params.get("error");
    const message = params.get("message");
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    
    if (error) {
      // Redirect to sign-in with error message
      router.replace(`/auth/signin?error=${encodeURIComponent(error)}`);
    } else if (access_token && refresh_token) {
      // Email confirmation successful - tokens are present
      router.replace(`/auth/signin?message=${encodeURIComponent("Email confirmed successfully! You can now sign in.")}`);
    } else if (type === "signup" || type === "recovery" || message?.includes("confirmed")) {
      // Email confirmation or password reset
      router.replace(`/auth/signin?message=${encodeURIComponent("Email confirmed successfully! You can now sign in.")}`);
    } else {
      // Regular sign-in, redirect to dashboard
      router.replace("/dashboard");
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
        <p className="text-lg text-gray-700">Confirming your email...</p>
      </div>
    </div>
  );
} 