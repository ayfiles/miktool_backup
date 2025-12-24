"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import {
  Command,
  Settings2,
  SquareTerminal,
  Users,
  LogOut,
  Package,
  Layers,
  ClipboardList,
  Box,
  Bot,
  PenTool,      // Icon für Tools/Konfigurator
  Wrench        // Alternatives Icon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// ✅ NEUE STRUKTUR MIT 'TOOLS'
const data = {
  user: {
    name: "Miktool User",
    email: "admin@miktool.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Miktool Inc",
      logo: Command,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Operations",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: SquareTerminal,
        },
        {
          title: "Orders",
          url: "/orders",
          icon: ClipboardList,
        },
        {
          title: "Production",
          url: "/production",
          icon: Layers,
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Products",
          url: "/products",
          icon: Package,
        },
        {
          title: "Inventory", 
          url: "/inventory",
          icon: Box,
        },
        {
          title: "Clients",
          url: "/clients",
          icon: Users,
        },
      ],
    },
    {
      title: "Tools", // 🌟 NEUE GRUPPE
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "Live Configurator",
          url: "/tools/configurator",
          icon: PenTool,
        },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Automation",
          url: "/automation",
          icon: Bot,
        },
        {
          title: "Settings", 
          url: "/settings",
          icon: Settings2,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Miktool</span>
                  <span className="truncate text-xs">Automation</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  suppressHydrationWarning 
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">MK</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{data.user.name}</span>
                    <span className="truncate text-xs">{data.user.email}</span>
                  </div>
                  <Settings2 className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}