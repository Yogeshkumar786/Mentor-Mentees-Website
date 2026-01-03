"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "./auth-provider"
import { Button } from "./ui/button"
import { LogOut, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { getNavigationForRole, canAccessRoute, getUserDisplayName, type NavItem } from "@/lib/navigation"

type DashboardLayoutProps = {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = user ? getNavigationForRole(user.role) : []
  const displayName = user ? getUserDisplayName(user) : ''

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }
      
      // Check role access if requiredRoles is specified
      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        router.push("/dashboard")
        return
      }
      
      // Check route access
      if (!canAccessRoute(user.role, pathname)) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router, requiredRoles, pathname])

  const handleLogout = async () => {
    await logout()
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        {/* <GraduationCap className="w-5 h-5 text-primary-foreground" /> */}
                        <img src="/clglogo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                      </div>
                      <span className="font-semibold text-lg">MentorHub</span>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                      {navigation.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActiveLink(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            }`}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                {/* <GraduationCap className="w-5 h-5 text-primary-foreground" /> */}
                 <img src="/clglogo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-semibold text-lg hidden sm:inline">MentorHub</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r bg-background shrink-0 overflow-y-auto">
          <nav className="p-4 sticky top-0">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActiveLink(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
