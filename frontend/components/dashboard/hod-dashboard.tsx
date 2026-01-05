"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, FileCheck, ClipboardList, UserPlus, GraduationCap, Download, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { api, HodDashboardStats } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function HodDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<HodDashboardStats['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getHodDashboardStats()
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleExport = async () => {
    try {
      setExporting(true)
      await api.exportStudentsCSV()
      toast({
        title: "Export Successful",
        description: "Students data has been downloaded as CSV",
      })
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export students data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HOD Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Managing <span className="font-semibold text-primary">{user?.hod?.department || "N/A"}</span> Department
          </p>
        </div>
        <Button variant="outline" className="hidden sm:flex bg-transparent" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export Students
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Faculty" value={stats?.totalFaculty || 0} icon={UserCheck} description="Active faculty" />
          <StatsCard title="Students" value={stats?.totalStudents || 0} icon={Users} description="Total enrolled" />
          <StatsCard title="Mentorships" value={stats?.activeMentorships || 0} icon={GraduationCap} description="Active assignments" />
          <StatsCard title="Unassigned" value={stats?.unassignedStudents || 0} icon={UserPlus} description="Awaiting mentors" />
          <StatsCard title="Approvals" value={stats?.pendingRequests || 0} icon={FileCheck} description="Requests to review" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Students
            </CardTitle>
            <CardDescription>View and manage students in your department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all students in your department, filter by year, programme, and search for specific students.
            </p>
            <Button className="w-full" asChild>
              <Link href="/students">View Students</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Department Faculty
            </CardTitle>
            <CardDescription>Manage your department's faculty members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review faculty mentoring loads, expertise areas, and overall department engagement.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/faculty">View Faculty</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentor Assignment</CardTitle>
            <CardDescription>Assign faculty mentors to department students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              As HOD, you can manually assign mentors or approve student-requested assignments to ensure every student
              has guidance.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a href="/dashboard/mentor-assignments">Assign Mentors</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and approve pending requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review pending internship, project, and other requests from students that require your approval.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/requests">View Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
