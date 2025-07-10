"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const error = params.get("error");
    if (error) {
      // Redirect to sign-in with error message
      router.replace(`/auth/signin?error=${encodeURIComponent(error)}`);
    } else {
      // No error, redirect to dashboard
      router.replace("/dashboard");
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
        <p className="text-lg text-gray-700">Redirecting...</p>
      </div>
    </div>
  );
} 