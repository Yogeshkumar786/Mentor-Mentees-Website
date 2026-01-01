"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, FileCheck, GraduationCap, Building } from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaculty: 0,
    totalStudents: 0,
    pendingRequests: 0,
  })

  useEffect(() => {
    const users = storage.getUsers()
    const requests = storage.getRequests()

    setStats({
      totalUsers: users.length,
      totalFaculty: users.filter((u) => u.role === "faculty").length,
      totalStudents: users.filter((u) => u.role === "student").length,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System overview for {user?.admin?.name || user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} description="Registered in system" />
        <StatsCard title="Faculty" value={stats.totalFaculty} icon={UserCheck} description="Active faculty members" />
        <StatsCard title="Students" value={stats.totalStudents} icon={Users} description="Registered students" />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FileCheck}
          description="Awaiting review"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Students
            </CardTitle>
            <CardDescription>View and manage all students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View students across all departments with filtering by department, year, and programme.
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
              All Faculty
            </CardTitle>
            <CardDescription>View and manage all faculty members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View faculty across all departments, their mentee counts, and active status.
            </p>
            <Button className="w-full" asChild>
              <Link href="/faculty">View Faculty</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Pending Requests
            </CardTitle>
            <CardDescription>Review system-wide requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and manage pending requests from all departments.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/requests">View Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <a href="/dashboard/users">Manage Users</a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/students">View Students</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faculty">View Faculty</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/requests">View Requests</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
