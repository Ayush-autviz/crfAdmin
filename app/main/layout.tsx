
'use client';

import type React from "react"
import "@/app/globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Header } from "@/components/Header"
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      // No user, redirect to login
      router.push('/auth/Login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0F1D]">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F6BE00] border-t-transparent"></div>
          </div>
          <h2 className="text-xl font-semibold text-white">Checking authentication...</h2>
          <p className="mt-2 text-[#A4A4A4]">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the main layout
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
