"use client"; // Mark this as a client component

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
// Adjust the path to your store file


export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore(); // Get user from Zustand store

  useEffect(() => {
    if (!user) {
      // User exists, navigate to main screen
      router.push("/main");
    } else {
      // No user, navigate to login screen
      router.push("/login");
    }
  }, [user, router]);

  // Optional: Render a loading state while checking
  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}