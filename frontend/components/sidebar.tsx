"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Home,
  ShoppingCart,
  ClipboardList,
  LayoutDashboard,
  UtensilsCrossed,
  Building2,
  TruckIcon as TruckDelivery,
  Map,
  Users,
  Store,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react"

interface SidebarProps {
  role: "customer" | "restaurant" | "delivery" | "admin"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { logout, user } = useAuth()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const customerLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/orders", label: "Orders", icon: ClipboardList },
  ]

  const restaurantLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/restaurant", label: "Restaurant Onboarding", icon: Building2 } ,
       { href: "/admin/menu", label: "Menu Management", icon: UtensilsCrossed },
    { href: "/admin/orders", label: "Order Management", icon: ClipboardList },
  ]

  const deliveryLinks = [
    { href: "/delivery", label: "Deliveries", icon: TruckDelivery },
    { href: "/delivery/map", label: "Map", icon: Map },
    { href: "/delivery/profile", label: "Profile", icon: Map },
  ]

  const adminLinks = [
    { href: "/admin-system", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin-system/users", label: "User Management", icon: Users },
    { href: "/admin-system/restaurants", label: "Restaurant Management", icon: Store },
  ]

  const links =
    role === "admin"
      ? adminLinks
      : role === "restaurant"
        ? restaurantLinks
        : role === "delivery"
          ? deliveryLinks
          : customerLinks

  const MobileSidebar = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden absolute top-4 left-4 z-50">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">FoodDash</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="flex flex-col gap-2 p-4">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("sidebar-item", pathname === link.href && "active")}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
            <div className="mt-auto pt-4 border-t">
              <Button variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )

  const DesktopSidebar = () => (
    <div
      className={cn(
        "hidden lg:flex flex-col border-r bg-background h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[240px]",
      )}
    >
      <div className={cn("flex h-16 items-center border-b px-4", isCollapsed && "justify-center")}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">FoodDash</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("absolute right-2", isCollapsed && "right-1/2 translate-x-1/2")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className={cn("flex flex-col gap-2 p-4", isCollapsed && "items-center")}>
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "sidebar-item",
                  isCollapsed && "justify-center w-10 h-10 p-0",
                  pathname === link.href && "active",
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <div className={cn("border-t p-4", isCollapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
          <ThemeToggle />
          {!isCollapsed && (
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          )}
          {!isCollapsed && (
            <Button variant="outline" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}
