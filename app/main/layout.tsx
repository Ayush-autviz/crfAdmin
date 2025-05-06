
'use client';
import type React from "react"
import "@/app/globals.css"

import { SidebarProvider } from "@/components/ui/sidebar"

import { Header } from "@/components/Header"
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore"
import { useEffect } from "react"
import { AppSidebar } from "@/components/Sidebar";



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter();
  const { user } = useAuthStore();

//   useEffect(() => {
//     if (!user) {
//       router.push('/auth/login');
//     }
//   }, [user, router]);
  return (
          <SidebarProvider>
            <div className="flex h-screen w-full ">
              <AppSidebar />
              <div className="flex flex-1  flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-10">{children}</main>
              </div>
            </div>
          </SidebarProvider>
  )
}
