"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookUser, Users } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Manage Courses",
    items: [
      {
        title: "Digital Courses",
        image: '/icons/Digital.svg',
        href: "/main/CourseManagement",
        indent: true,
      },
    ],
    icon: null,
    href: "/education",
  },
  {
    title: "Manage Coach",
    items: [
      {
        title: "Coach",
        image: '/icons/Coach.svg',
        icon: BookUser,
        href: "/main/CoachManagement",
        indent: true,
      },
    ],
    icon: null,
    href: "/community",
  },
  {
    title: "Manage Users",
    items: [
      {
        title: "Users",
        image: '/icons/Users.svg',
        icon: Users,
        href: "/main/UserManagement",
        indent: true,
      },
    ],
    icon: null,
    href: "/users",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar style={{ backgroundColor: "#1a2235" }} className="border-0 border-transparent custom-sidebar-bg">
      <SidebarHeader className="flex bg-[#1a2235] items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Logo.svg" className="w-38 h-30" alt="logo" width={100} height={100} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item, index) => (
              <div className="mt-2" key={index}>
                <div className="text-[#A4A4A4] px-2">{item.title}</div>
                {item.items.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    className={`mx-2 mt-2 rounded-[10px] bg-[#334155] ${
                      pathname.startsWith(subItem.href) ? 'border-2 border-[#F6BE00]' : ''
                    }`}
                  >
                    <Link className="flex items-center gap-2 px-4 py-2" href={subItem.href}>
                      <Image src={subItem.image} className="w-5 h-5" alt="logo" width={100} height={100} />
                      <span className="text-[#F6BE00] text-sm">{subItem.title}</span>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}