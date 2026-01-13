"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, type FacultyByIdResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, User, GraduationCap, BookOpen } from "lucide-react"

interface NavItem {
  value: string
  label: string
  icon: typeof User
  path: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { value: "profile", label: "Profile", icon: User, path: "", roles: ["HOD", "ADMIN"] },
  { value: "academic", label: "Academics", icon: BookOpen, path: "/academic", roles: ["HOD", "ADMIN"] },
  { value: "mentor", label: "Mentorship", icon: GraduationCap, path: "/mentor", roles: ["HOD"] },
]

export default function FacultyViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const facultyId = params.facultyId as string

  const [faculty, setFaculty] = useState<FacultyByIdResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = ["ADMIN", "HOD"]
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard")
      }
    }
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch faculty basic info for header
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!facultyId) {
        setLoading(false)
        return
      }

      try {
        const data = await api.getFacultyById(facultyId)
        setFaculty(data)
      } catch (err) {
        console.error("Failed to fetch faculty:", err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchFaculty()
    }
  }, [facultyId, authLoading, user])

  // Get nav items based on user role
  const getVisibleNavItems = () => {
    if (!user) return []
    return NAV_ITEMS.filter(item => item.roles.includes(user.role))
  }

  // Determine current tab
  const getCurrentTab = () => {
    const basePath = `/faculty/${facultyId}`
    if (pathname === basePath) return "profile"
    
    for (const item of NAV_ITEMS) {
      if (item.path && pathname === `${basePath}${item.path}`) {
        return item.value
      }
    }
    return "profile"
  }

  const handleTabChange = (value: string) => {
    const item = NAV_ITEMS.find(i => i.value === value)
    if (item) {
      router.push(`/faculty/${facultyId}${item.path}`)
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !["ADMIN", "HOD"].includes(user.role)) {
    return null
  }

  const visibleNavItems = getVisibleNavItems()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button and Faculty Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/faculty")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Faculty
            </Button>
          </div>
          
          {faculty && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{faculty.name}</h1>
                <p className="text-muted-foreground">
                  Employee ID: {faculty.employeeId} | {faculty.department}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={faculty.isActive ? "default" : "secondary"}>
                  {faculty.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {faculty.currentMenteeCount} Mentees
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs - only show if more than one item */}
        {visibleNavItems.length > 1 && (
          <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1">
              {visibleNavItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Page Content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </DashboardLayout>
  )
}
