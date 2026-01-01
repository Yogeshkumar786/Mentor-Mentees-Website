"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileCheck, ClipboardList } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export function FacultyDashboard() {
  const { user } = useAuth()

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Assigned Students" value={0} icon={Users} description="Mentees under your guidance" />
        <StatsCard title="Scheduled Meetings" value={0} icon={Calendar} description="Upcoming this week" />
        <StatsCard title="Pending Requests" value={0} icon={FileCheck} description="Awaiting your review" />
        <StatsCard title="Reports Due" value={0} icon={ClipboardList} description="This semester" />
      </div>

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
