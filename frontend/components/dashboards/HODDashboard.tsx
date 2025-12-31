"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  Calendar,
  Building2,
  ClipboardList,
  GraduationCap,
  Briefcase,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import type { ApiUser } from "@/lib/api"

interface HODDashboardProps {
  user: ApiUser
}

function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  variant = 'default'
}: { 
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  variant?: 'default' | 'warning' | 'success'
}) {
  const variantClasses = {
    default: '',
    warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
    success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function HODDashboard({ user }: HODDashboardProps) {
  const hodName = user.faculty?.name || user.email
  const department = user.hod?.department || user.faculty?.department || 'Not Assigned'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HOD Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {hodName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {department}
          </Badge>
          <Badge variant="outline">Head of Department</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Department Faculty" 
          value={0} 
          icon={Briefcase} 
          description="Faculty members"
        />
        <StatsCard 
          title="Total Students" 
          value={0} 
          icon={GraduationCap} 
          description="In your department"
        />
        <StatsCard 
          title="Unassigned Students" 
          value={0} 
          icon={Users} 
          description="Need mentor assignment"
          variant="warning"
        />
        <StatsCard 
          title="Active Mentorships" 
          value={0} 
          icon={UserCheck} 
          description="Ongoing mentoring"
          variant="success"
        />
      </div>

      {/* HOD Info and Department Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              HOD Profile
            </CardTitle>
            <CardDescription>Your department head details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.faculty?.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{user.faculty?.employeeId || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {user.hod?.startDate 
                    ? new Date(user.hod.startDate).toLocaleDateString() 
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Office</p>
                <p className="font-medium">{user.faculty?.office || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant={user.accountStatus === 'ACTIVE' ? 'default' : 'destructive'}>
                {user.accountStatus || 'ACTIVE'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Pending Actions
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Students without mentors</p>
                <p className="text-xs text-muted-foreground">Assign faculty mentors</p>
              </div>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Pending meeting approvals</p>
                <p className="text-xs text-muted-foreground">Review scheduled meetings</p>
              </div>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Faculty reports due</p>
                <p className="text-xs text-muted-foreground">Monthly mentoring reports</p>
              </div>
              <Badge variant="secondary">0</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common department management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/hod/assign-mentor">
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Mentor
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/hod/faculty">
                <Briefcase className="h-4 w-4 mr-2" />
                View Faculty
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/hod/students">
                <GraduationCap className="h-4 w-4 mr-2" />
                View Students
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/hod/meetings">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meetings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
