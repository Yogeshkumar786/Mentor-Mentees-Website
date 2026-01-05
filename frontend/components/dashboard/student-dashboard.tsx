"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { api, StudentDashboardStats } from "@/lib/api"
import { ClipboardList, CheckCircle, Calendar, UserCheck, Clock, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"

export function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentDashboardStats['stats'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStudentDashboardStats()
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your academic progress, {user?.name}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your academic progress, {user?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Pending Requests" 
          value={stats?.pendingRequests || 0} 
          icon={Clock} 
          description="Awaiting approval" 
        />
        <StatsCard 
          title="Approved Requests" 
          value={stats?.approvedRequests || 0} 
          icon={CheckCircle} 
          description="Successfully approved" 
        />
        <StatsCard 
          title="Upcoming Meetings" 
          value={stats?.upcomingMeetings || 0} 
          icon={Calendar} 
          description="Scheduled with mentor" 
        />
        <StatsCard 
          title="Mentor Status" 
          value={stats?.hasMentor ? "Assigned" : "Not Assigned"} 
          icon={UserCheck} 
          description={stats?.hasMentor ? "You have an active mentor" : "Contact HOD for assignment"} 
        />
      </div>

      {stats?.nextMeeting && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Meeting</p>
                <p className="text-xl font-semibold">{stats.nextMeeting.date} at {stats.nextMeeting.time}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
