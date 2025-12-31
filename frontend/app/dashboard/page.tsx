"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"
import { AdminDashboard, HODDashboard, FacultyDashboard, StudentDashboard } from "@/components/dashboards"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
        </div>
      </DashboardLayout>
    )
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard user={user} />
      case 'HOD':
        return <HODDashboard user={user} />
      case 'FACULTY':
        return <FacultyDashboard user={user} />
      case 'STUDENT':
        return <StudentDashboard user={user} />
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Unknown role. Please contact administrator.</p>
          </div>
        )
    }
  }

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  )
}
