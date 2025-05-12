"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in
    if (user) {
      // User exists, navigate to main screen
      router.push("/main/CourseManagement");
    } else {
      // No user, navigate to login screen
      router.push("/auth/Login");
    }
  }, [user, router]);

  // Render a loading state while checking
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0A0F1D]">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F6BE00] border-t-transparent"></div>
        </div>
        <h2 className="text-xl font-semibold text-white">Redirecting...</h2>
        <p className="mt-2 text-[#A4A4A4]">Please wait while we direct you to the appropriate page</p>
      </div>
    </div>
  );
}