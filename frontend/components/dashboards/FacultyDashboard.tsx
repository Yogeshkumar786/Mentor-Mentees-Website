"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Building,
  BookOpen,
  Loader2,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { api, type ApiUser, type FacultyDashboardStats, type FacultyMenteesResponse } from "@/lib/api"

interface FacultyDashboardProps {
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
  variant?: 'default' | 'primary' | 'warning'
}) {
  const variantClasses = {
    default: '',
    primary: 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20',
    warning: 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20'
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

export function FacultyDashboard({ user }: FacultyDashboardProps) {
  const faculty = user.faculty
  const facultyName = faculty?.name || user.email
  const [stats, setStats] = useState<FacultyDashboardStats['stats'] | null>(null)
  const [mentees, setMentees] = useState<FacultyMenteesResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, menteesData] = await Promise.all([
          api.getFacultyDashboardStats(),
          api.getFacultyMentees().catch(() => null)
        ])
        setStats(statsData.stats)
        if (menteesData) setMentees(menteesData)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get programs taught
  const getProgramsBadges = () => {
    const programs = []
    if (faculty?.btech) programs.push('B.Tech')
    if (faculty?.mtech) programs.push('M.Tech')
    if (faculty?.phd) programs.push('PhD')
    return programs
  }

  // Get active mentees from all groups
  const getActiveMentees = () => {
    if (!mentees) return []
    return mentees.menteeGroups
      .filter(g => g.isActive)
      .flatMap(g => g.mentees)
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {facultyName}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3" />
          Faculty
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
              title="My Mentees" 
              value={stats?.activeMentees ?? 0} 
              icon={Users} 
              description="Students under guidance"
              variant="primary"
            />
            <StatsCard 
              title="Upcoming Meetings" 
              value={stats?.upcomingMeetings ?? 0} 
              icon={Calendar} 
              description="Scheduled sessions"
            />
            <StatsCard 
              title="Pending Requests" 
              value={stats?.pendingRequests ?? 0} 
              icon={MessageSquare} 
              description="Student requests"
              variant="warning"
            />
            <StatsCard 
              title="Completed Meetings" 
              value={stats?.completedMeetings ?? 0} 
              icon={CheckCircle} 
              description="This semester"
            />
          </>
        )}
      </div>

      {/* Profile and Schedule */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Faculty Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your faculty details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture} alt={facultyName} />
                <AvatarFallback className="text-lg">
                  {getInitials(facultyName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{facultyName}</p>
                <p className="text-sm text-muted-foreground">{faculty?.employeeId || 'ID not set'}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{faculty?.department || 'Department not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{faculty?.collegeEmail || user.email}</span>
              </div>
              {faculty?.phone1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{faculty.phone1}</span>
                </div>
              )}
              {faculty?.office && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Office: {faculty.office}</span>
                </div>
              )}
              {faculty?.officeHours && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Hours: {faculty.officeHours}</span>
                </div>
              )}
            </div>

            {/* Programs */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Programs</p>
              <div className="flex flex-wrap gap-1">
                {getProgramsBadges().length > 0 ? (
                  getProgramsBadges().map(program => (
                    <Badge key={program} variant="outline">{program}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meetings Overview
              </CardTitle>
              <CardDescription>Your mentoring session statistics</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/mentor">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mentees && mentees.stats.totalMeetings > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats?.upcomingMeetings ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{mentees.stats.completedMeetings}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Meetings</span>
                    <span className="font-medium">{mentees.stats.totalMeetings}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/mentor">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Meetings
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No meetings scheduled yet</p>
                <p className="text-sm">Schedule meetings with your mentees</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/mentor">Schedule Meeting</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Mentees Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Mentees
            </CardTitle>
            <CardDescription>Students under your mentorship</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/mentor">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {getActiveMentees().length > 0 ? (
            <div className="space-y-3">
              {getActiveMentees().map((mentee) => (
                <div key={mentee.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-sm">
                        {mentee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mentee.name}</p>
                      <p className="text-sm text-muted-foreground">{mentee.program} - {mentee.branch}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Year {mentee.studentYear}</p>
                    <Badge variant="outline" className="text-xs">
                      Roll: {mentee.rollNumber}
                    </Badge>
                  </div>
                </div>
              ))}
              {mentees && mentees.stats.activeMentees > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{mentees.stats.activeMentees - 5} more mentees
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No mentees assigned yet</p>
              <p className="text-sm">Students will appear here once assigned by HOD</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
