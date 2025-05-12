"use client"
import { useState, useEffect } from "react"
import { LogOut, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import useAuthStore from "@/stores/authStore"
import { toast } from "sonner"
import { Input } from "./ui/input"


export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=32&width=32")
  const [userName, setUserName] = useState("User Name");
  const [pageTitle, setPageTitle] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Update page title based on current route
  useEffect(() => {
    if (pathname.includes('/main/CourseManagement')) {
      setPageTitle("Manage Courses");
    } else if (pathname.includes('/main/CoachManagement')) {
      setPageTitle("Manage Coach");
    } else if (pathname.includes('/main/UserManagement')) {
      setPageTitle("Manage Users");
    } else {
      setPageTitle("Dashboard");
    }
  }, [pathname]);

  const handleLogout = () => {
    // Get the clearAuth function from the store
    const clearAuth = useAuthStore.getState().clearAuth;
    // Clear the authentication state
    clearAuth();
    // Show success toast
    toast.success("Logged out successfully", {
      description: "You have been logged out of your account",
      duration: 3000,
    });
    // Redirect to login page
    router.push('/auth/Login');
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#3C4A60] bg-[#0A0F1D] px-4">
        <div className="flex items-center gap-2 md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex w-full max-w-md font-semibold items-center text-white">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* <Button
            variant="default"
            size="sm"
            className="hidden bg-[#F6BE00] text-black rounded-[10px] gap-2 hover:bg-[#F6BE00] md:flex"
          >
            <Image src="/phone.svg" alt="phone" width={16} height={16} />
            Contact Us
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-transparent border rounded-full border-[#5C5C5C]"
          >
            <Image src="/bell.svg" alt="phone" width={16} height={16} />
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog  open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1a2235] border-[#3C4A60]">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button className="bg-[#F6BE00] hover:bg-yellow-600 text-black"  size="sm">
                Change Image
              </Button>
            </div>
            <div className="grid gap-2 text-white">
              <Label htmlFor="name">Name</Label>
              <Input   id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-[#F6BE00] hover:bg-yellow-600 text-black" type="submit" onClick={() => setIsProfileOpen(false)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
