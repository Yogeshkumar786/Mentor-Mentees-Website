"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, FileCheck, ClipboardList, UserPlus, GraduationCap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import Link from "next/link"

export function HodDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    deptFaculty: 0,
    deptStudents: 0,
    pendingApprovals: 0,
    unassignedStudents: 0,
  })

  useEffect(() => {
    const users = storage.getUsers()
    const requests = storage.getRequests()
    const relationships = storage.getRelationships()

    const userDept = user?.hod?.department
    const deptUsers = users.filter((u) => u.department === userDept)
    const faculty = deptUsers.filter((u) => u.role === "faculty")
    const students = deptUsers.filter((u) => u.role === "student")

    // Simple check for unassigned students in department
    const assignedStudentIds = new Set(relationships.filter((r) => r.status === "active").map((r) => r.studentId))
    const unassigned = students.filter((s) => !assignedStudentIds.has(s.id))

    setStats({
      deptFaculty: faculty.length,
      deptStudents: students.length,
      pendingApprovals: requests.filter((r) => r.status === "pending").length,
      unassignedStudents: unassigned.length,
    })
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HOD Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Managing <span className="font-semibold text-primary">{user?.hod?.department || "N/A"}</span> Department
          </p>
        </div>
        <Button variant="outline" className="hidden sm:flex bg-transparent">
          <ClipboardList className="w-4 h-4 mr-2" />
          View Dept Reports
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Faculty" value={stats.deptFaculty} icon={UserCheck} description="Active faculty" />
        <StatsCard title="Students" value={stats.deptStudents} icon={Users} description="Total enrolled" />
        <StatsCard title="Unassigned" value={stats.unassignedStudents} icon={UserPlus} description="Awaiting mentors" />
        <StatsCard title="Approvals" value={stats.pendingApprovals} icon={FileCheck} description="Requests to review" />
      </div>

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
