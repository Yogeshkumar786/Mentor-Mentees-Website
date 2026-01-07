"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "./auth-provider"
import { Button } from "./ui/button"
import { LogOut, Menu, X } from "lucide-react"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = user ? getNavigationForRole(user.role) : []
  const displayName = user ? getUserDisplayName(user) : ''

  // Check if current page is a student detail page
  const isStudentDetailPage = /^\/students\/\d+/.test(pathname)

  // Auto-close sidebar when navigating to student detail pages
  useEffect(() => {
    if (isStudentDetailPage) {
      setSidebarOpen(false)
    }
  }, [isStudentDetailPage, pathname])

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
            {/* Mobile menu - always for small screens */}
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
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-tight">National Institute of Technology</span>
                        <span className="font-semibold text-sm leading-tight">Andhra Pradesh</span>
                        <span className="text-xs text-muted-foreground">
                          {user?.role === 'STUDENT' && 'Student Portal'}
                          {user?.role === 'FACULTY' && 'Faculty Portal'}
                          {user?.role === 'HOD' && 'HOD Portal'}
                          {user?.role === 'ADMIN' && 'Admin Portal'}
                        </span>
                      </div>
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

            {/* Desktop hamburger for student detail pages only */}
            {isStudentDetailPage && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                {/* <GraduationCap className="w-5 h-5 text-primary-foreground" /> */}
                 <img src="/clglogo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-semibold text-sm leading-tight">National Institute of Technology</span>
                <span className="font-semibold text-sm leading-tight">Andhra Pradesh</span>
                <span className="text-xs text-muted-foreground">
                  {user?.role === 'STUDENT' && 'Student Portal'}
                  {user?.role === 'FACULTY' && 'Faculty Portal'}
                  {user?.role === 'HOD' && 'HOD Portal'}
                  {user?.role === 'ADMIN' && 'Admin Portal'}
                </span>
              </div>
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
        {/* On student detail pages: hidden by default, toggle with hamburger */}
        {/* On other pages: always visible */}
        <aside 
          className={`
            ${isStudentDetailPage 
              ? (sidebarOpen ? 'lg:block' : 'lg:hidden') 
              : 'lg:block'
            } 
            hidden w-64 border-r bg-background shrink-0 overflow-y-auto transition-all duration-200
          `}
        >
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
