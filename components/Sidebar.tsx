"use client"
import Link from "next/link"
import { BookUser, GraduationCap, BotIcon as Robot } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"



const navigationItems = [
  {
    title: "Manage Courses",
    items:[
          {
            title: "Digital Courses",
            image: '/icons/Digital.svg',
            href: "/main/CourseManagement",
            active: false,
            indent: true,
          },
    ],
    icon: null,
    href: "/education",
    active: false,
  },
  {
    title: "Manage Coach",
    items:[
          {
            title: "Coach",
            image: '/icons/Coach.svg',
            icon: BookUser,
            href: "/main/CoachManagement",
            active: false,
            indent: true,
          },
    ],
    icon: null,
    href: "/community",
    active: false,
  },
]

export function AppSidebar() {
  return (
    <Sidebar style={{ backgroundColor: "#1a2235" }} className=" border-0 border-transparent custom-sidebar-bg">
      <SidebarHeader className="flex bg-[#1a2235]  items-center x  px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Logo.svg" className="w-38 h-30 " alt="logo" width={100} height={100} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* <Link href="/main" className="flex flex-row items-center gap-2 px-4">
        <Image src="/ChatBot.svg" className="w-6 h-6 " alt="logo" width={100} height={100} />
        <div className="text-white text-md font-semibold">
         AI ChatBot
        </div>
        </Link>
        <div className="text-[#A4A4A4] px-4 ">
        Smart Trading Assistant
        </div>  */}
        <SidebarGroup>
          <SidebarMenu>

            {navigationItems.map((item,index) => (
              <div className="mt-2" key={index}>
              <div className="text-[#A4A4A4] px-2 ">{item.title}</div>
              {item.items.map((item,index) => (
                <div key={index} className="bg-[#334155] mx-2 mt-2  rounded-[10px]">
                               <Link className="flex items-center gap-2 px-4 py-2" href={item.href}>
                    <Image src={item.image} className="w-5 h-5 " alt="logo" width={100} height={100} />
                    <span className="text-[#F6BE00] text-sm">{item.title}</span>
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
