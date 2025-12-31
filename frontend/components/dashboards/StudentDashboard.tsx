"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar,
  BookOpen,
  Target,
  MessageSquare,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import type { ApiUser } from "@/lib/api"

interface StudentDashboardProps {
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
  variant?: 'default' | 'success' | 'warning'
}) {
  const variantClasses = {
    default: '',
    success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
    warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20'
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

export function StudentDashboard({ user }: StudentDashboardProps) {
  const student = user.student
  const studentName = student?.name || user.email

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {studentName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {student?.program && (
            <Badge variant="secondary">{student.program}</Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            Student
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Academic Progress" 
          value="-" 
          icon={BookOpen} 
          description="Current GPA"
        />
        <StatsCard 
          title="Goals Completed" 
          value="0/0" 
          icon={Target} 
          description="Career milestones"
          variant="success"
        />
        <StatsCard 
          title="Next Meeting" 
          value="-" 
          icon={Calendar} 
          description="With mentor"
        />
        <StatsCard 
          title="Messages" 
          value={0} 
          icon={MessageSquare} 
          description="Unread messages"
          variant="warning"
        />
      </div>

      {/* Profile and Mentor Info */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Student Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>Your student information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture} alt={studentName} />
                <AvatarFallback className="text-lg">
                  {getInitials(studentName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{studentName}</p>
                <p className="text-sm text-muted-foreground">
                  {student?.registrationNumber || student?.rollNumber || 'ID not set'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">Program</p>
                <p className="font-medium">{student?.program || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{student?.branch || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{student?.rollNumber || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={student?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {student?.status || 'ACTIVE'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm pt-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student?.collegeEmail || user.email}</span>
              </div>
              {student?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.phoneNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mentor Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              My Mentor
            </CardTitle>
            <CardDescription>Your assigned faculty mentor</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder - will show mentor info when available */}
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No mentor assigned yet</p>
              <p className="text-sm">A mentor will be assigned by your HOD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Progress and Goals */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Academic Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Progress
            </CardTitle>
            <CardDescription>Your semester-wise performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No academic data available</p>
              <p className="text-sm">Your progress will appear here</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/mentee/academics">
                  View Academics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                My Goals
              </CardTitle>
              <CardDescription>Career and academic goals</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/mentee/goals">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No goals set yet</p>
              <p className="text-sm">Set your career goals to track progress</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/mentee/goals">
                  Add Goals
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>Scheduled meetings with your mentor</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/mentee/meetings">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming meetings</p>
            <p className="text-sm">Meetings will appear here when scheduled</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/mentee/academics">
                <BookOpen className="h-4 w-4 mr-2" />
                View Academics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/mentee/goals">
                <Target className="h-4 w-4 mr-2" />
                Set Goals
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/mentee/meetings">
                <Calendar className="h-4 w-4 mr-2" />
                View Meetings
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/mentee/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
