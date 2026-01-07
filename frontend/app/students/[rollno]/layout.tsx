"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, type StudentDetails } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, User, Briefcase, GraduationCap, FolderKanban, Heart, Brain, BookOpen, Trophy } from "lucide-react"

const NAV_ITEMS = [
  { value: "profile", label: "Profile", icon: User, path: "" },
  { value: "academic", label: "Academic", icon: BookOpen, path: "/academic" },
  { value: "mentoring", label: "Mentoring", icon: GraduationCap, path: "/mentoring" },
  { value: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
  { value: "internships", label: "Internships", icon: Briefcase, path: "/internships" },
  { value: "cocurricular", label: "Co-Curricular", icon: Trophy, path: "/cocurricular" },
  { value: "career", label: "Career Details", icon: Brain, path: "/career-details" },
  { value: "challenges", label: "Personal Challenges", icon: Heart, path: "/personal-challenges" },
]

export default function StudentViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = ["ADMIN", "HOD", "FACULTY"]
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard")
      }
    }
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch student basic info for header
  useEffect(() => {
    const fetchStudent = async () => {
      if (!rollno || isNaN(rollno)) {
        setLoading(false)
        return
      }

      try {
        const data = await api.getStudentByRollNumber(rollno)
        setStudent(data)
      } catch (err) {
        console.error("Failed to fetch student:", err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchStudent()
    }
  }, [rollno, authLoading, user])

  // Determine current tab
  const getCurrentTab = () => {
    const basePath = `/students/${rollno}`
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
      router.push(`/students/${rollno}${item.path}`)
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

  if (!user || !["ADMIN", "HOD", "FACULTY"].includes(user.role)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button and Student Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/students")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
          </div>
          
          {student && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{student.name}</h1>
                <p className="text-muted-foreground">
                  Roll No: {student.rollNumber} | Reg No: {student.registrationNumber} | {student.program} - {student.branch}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={student.status === "PURSUING" ? "default" : "secondary"}>
                  {student.status}
                </Badge>
                <Badge variant={student.accountStatus === "ACTIVE" ? "default" : "destructive"}>
                  {student.accountStatus}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1">
            {NAV_ITEMS.map((item) => (
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

        {/* Page Content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </DashboardLayout>
  )
}
