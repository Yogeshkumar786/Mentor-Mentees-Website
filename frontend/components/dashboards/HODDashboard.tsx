"use client"

import { useEffect, useState } from "react"
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
  ArrowRight,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { api, type ApiUser, type HodDashboardStats } from "@/lib/api"

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
  const [stats, setStats] = useState<HodDashboardStats['stats'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.getHodDashboardStats()
        setStats(statsData.stats)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard 
              title="Department Faculty" 
              value={stats?.totalFaculty ?? 0} 
              icon={Briefcase} 
              description="Faculty members"
            />
            <StatsCard 
              title="Total Students" 
              value={stats?.totalStudents ?? 0} 
              icon={GraduationCap} 
              description="In your department"
            />
            <StatsCard 
              title="Unassigned Students" 
              value={stats?.unassignedStudents ?? 0} 
              icon={Users} 
              description="Need mentor assignment"
              variant="warning"
            />
            <StatsCard 
              title="Active Mentorships" 
              value={stats?.activeMentorships ?? 0} 
              icon={UserCheck} 
              description="Ongoing mentoring"
              variant="success"
            />
          </>
        )}
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
            <Link href="/students" className="block">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium">Students without mentors</p>
                  <p className="text-xs text-muted-foreground">Assign faculty mentors</p>
                </div>
                <Badge variant={stats?.unassignedStudents ? "destructive" : "secondary"}>
                  {stats?.unassignedStudents ?? 0}
                </Badge>
              </div>
            </Link>
            <Link href="/requests" className="block">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium">Pending requests</p>
                  <p className="text-xs text-muted-foreground">Student requests awaiting approval</p>
                </div>
                <Badge variant={stats?.pendingRequests ? "destructive" : "secondary"}>
                  {stats?.pendingRequests ?? 0}
                </Badge>
              </div>
            </Link>
            <Link href="/faculty" className="block">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium">Faculty overview</p>
                  <p className="text-xs text-muted-foreground">View department faculty</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
