"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileCheck, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { api, FacultyDashboardStats } from "@/lib/api"
import Link from "next/link"

export function FacultyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<FacultyDashboardStats['stats'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getFacultyDashboardStats()
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.faculty?.name || "Professor"}
          {user?.faculty?.department && (
            <span className="ml-1">
              • <span className="font-semibold text-primary">{user.faculty.department}</span> Department
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned Mentees" value={stats?.activeMentees || 0} icon={Users} description="Students under your guidance" />
          <StatsCard title="Upcoming Meetings" value={stats?.upcomingMeetings || 0} icon={Calendar} description="Scheduled this week" />
          <StatsCard title="Pending Requests" value={stats?.pendingRequests || 0} icon={FileCheck} description="Awaiting your review" />
          <StatsCard title="Meetings Completed" value={stats?.completedMeetings || 0} icon={CheckCircle} description="Total completed" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Students
            </CardTitle>
            <CardDescription>View students in your department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all students in your department, filter by year and programme, and search for specific students.
            </p>
            <Button className="w-full" asChild>
              <Link href="/students">View Students</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Review student requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and approve pending internship, project, and other requests from your mentees.
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
