"use client";

import {
  Calendar,
  CirclePlus,
  CircleUser,
  Home,
  Inbox,
  LayoutList,
  Search,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/useAuth";

// Menu items.

export function AppSidebar() {
  const { user } = useAuth();
  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Add Gig",
      url: "/profile/userProfile/add-gig",
      icon: CirclePlus,
    },
    {
      title: "View Gig",
      url: "/profile/userProfile/view-gigs",
      icon: LayoutList,
    },
    {
      title: "view profile",
      url: `/profile/${user?.id}`,
      icon: CircleUser,
    },
    {
      title: "Settings",
      url: "/profile/userProfile/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-20">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-purple-700 hover:text-purple-300"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
