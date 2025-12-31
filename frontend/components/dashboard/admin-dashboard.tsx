"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, FileCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"

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
        <p className="text-muted-foreground mt-1">System overview for {user?.name}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>System Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" asChild>
            <a href="/dashboard/users">Manage Users</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard/requests">View Requests</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
