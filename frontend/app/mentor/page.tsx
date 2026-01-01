"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentMentorView } from "@/components/mentor/StudentMentorView"
import { FacultyMentorView } from "@/components/mentor/FacultyMentorView"
import { HODMentorView } from "@/components/mentor/HODMentorView"
import { Loader2, ShieldX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function MentorPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if admin tries to access
  useEffect(() => {
    if (!loading && user?.role === 'ADMIN') {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['HOD', 'FACULTY', 'STUDENT']}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  // Show access denied for admin (shouldn't happen due to redirect, but just in case)
  if (user?.role === 'ADMIN') {
    return (
      <DashboardLayout requiredRoles={['HOD', 'FACULTY', 'STUDENT']}>
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldX className="h-16 w-16 mx-auto mb-4 text-destructive/50" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
            <p className="text-muted-foreground mt-2">
              This page is not available for administrators.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Render role-specific view
  const renderView = () => {
    if (!user) return null

    switch (user.role) {
      case 'HOD':
        return <HODMentorView user={user} />
      case 'FACULTY':
        return <FacultyMentorView user={user} />
      case 'STUDENT':
        return <StudentMentorView />
      default:
        return null
    }
  }

  return (
    <DashboardLayout requiredRoles={['HOD', 'FACULTY', 'STUDENT']}>
      {renderView()}
    </DashboardLayout>
  )
}
