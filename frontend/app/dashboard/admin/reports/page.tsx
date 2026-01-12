"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"

export default function AdminReportsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalMentees: 0,
    activeRelationships: 0,
    totalMeetings: 0,
    completedMeetings: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  })

  useEffect(() => {
    const users = storage.getUsers()
    const relationships = storage.getRelationships()
    const meetings = storage.getMeetings()
    const requests = storage.getRequests()

    setStats({
      totalUsers: users.length,
      totalMentors: users.filter((u) => u.role === "faculty").length,
      totalMentees: users.filter((u) => u.role === "student").length,
      activeRelationships: relationships.filter((r) => r.status === "active").length,
      totalMeetings: meetings.length,
      completedMeetings: meetings.filter((m) => m.status === "completed").length,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      approvedRequests: requests.filter((r) => r.status === "approved").length,
      rejectedRequests: requests.filter((r) => r.status === "rejected").length,
    })
  }, [])

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      statistics: stats,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `system-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout requiredRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">System statistics and insights</p>
          </div>
          <Button onClick={generateReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Overview of system users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mentors</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMentors}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mentees</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalMentees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relationship & Meeting Statistics</CardTitle>
              <CardDescription>Mentorship activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Relationships</p>
                  <p className="text-3xl font-bold">{stats.activeRelationships}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Meetings</p>
                  <p className="text-3xl font-bold">{stats.totalMeetings}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completed Meetings</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedMeetings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Statistics</CardTitle>
              <CardDescription>System request overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingRequests}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approvedRequests}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejectedRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mentor-Mentee Matching Rate</span>
                <span className="font-semibold">
                  {stats.totalMentees > 0 ? Math.round((stats.activeRelationships / stats.totalMentees) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{
                    width: `${stats.totalMentees > 0 ? (stats.activeRelationships / stats.totalMentees) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm">Meeting Completion Rate</span>
                <span className="font-semibold">
                  {stats.totalMeetings > 0 ? Math.round((stats.completedMeetings / stats.totalMeetings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-600 rounded-full h-2"
                  style={{
                    width: `${stats.totalMeetings > 0 ? (stats.completedMeetings / stats.totalMeetings) * 100 : 0}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
