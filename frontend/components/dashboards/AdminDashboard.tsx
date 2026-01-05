"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Activity,
  Database,
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap,
  Briefcase,
  UserCheck,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { api, type ApiUser, type AdminDashboardStats } from "@/lib/api"

interface AdminDashboardProps {
  user: ApiUser
}

function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend
}: { 
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: { value: number; positive: boolean }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '+' : ''}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const adminName = user.admin?.name || user.email
  const [stats, setStats] = useState<AdminDashboardStats['stats'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.getAdminDashboardStats()
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {adminName}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Administrator
        </Badge>
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
              title="Total Users" 
              value={stats?.totalUsers ?? 0} 
              icon={Users} 
              description="Registered in system"
            />
            <StatsCard 
              title="Active Faculty" 
              value={stats?.totalFaculty ?? 0} 
              icon={Briefcase} 
              description="Teaching staff"
            />
            <StatsCard 
              title="Total Students" 
              value={stats?.totalStudents ?? 0} 
              icon={GraduationCap} 
              description="Enrolled students"
            />
            <StatsCard 
              title="HODs" 
              value={stats?.totalHODs ?? 0} 
              icon={Shield} 
              description="Department heads"
            />
          </>
        )}
      </div>

      {/* Admin Info Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Profile
            </CardTitle>
            <CardDescription>Your administrator account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.admin?.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{user.admin?.employeeId || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{user.admin?.department || 'All Departments'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant={user.accountStatus === 'ACTIVE' ? 'default' : 'destructive'}>
                {user.accountStatus || 'ACTIVE'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active Mentorships</span>
              </div>
              <Badge variant="default" className="bg-green-600">
                {stats?.activeMentorships ?? 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Pending Requests</span>
              </div>
              <Badge variant={stats?.pendingRequests ? "destructive" : "secondary"}>
                {stats?.pendingRequests ?? 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Unassigned Students</span>
              </div>
              <Badge variant={stats?.unassignedStudents ? "destructive" : "secondary"}>
                {stats?.unassignedStudents ?? 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">System Status</span>
              </div>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/students" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Students
                </Button>
              </Link>
              <Link href="/faculty" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Faculty
                </Button>
              </Link>
              <Link href="/hods" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  HODs
                </Button>
              </Link>
              <Link href="/requests" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
