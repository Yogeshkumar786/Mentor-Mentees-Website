"use client"

import { useEffect, useState } from "react"
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
  AlertCircle,
  UserCheck,
  XCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { api, type ApiUser, type StudentDashboardStats, type MentorData, type StudentAcademic, type StudentCareerDetails, type MeetingData } from "@/lib/api"

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
  const [stats, setStats] = useState<StudentDashboardStats['stats'] | null>(null)
  const [mentor, setMentor] = useState<MentorData | null>(null)
  const [academic, setAcademic] = useState<StudentAcademic | null>(null)
  const [careerDetails, setCareerDetails] = useState<StudentCareerDetails | null>(null)
  const [meetings, setMeetings] = useState<MeetingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, mentorData, academicData, careerData] = await Promise.all([
          api.getStudentDashboardStats(),
          api.getStudentMentors(),
          api.getStudentAcademic().catch(() => null),
          api.getStudentCareerDetails().catch(() => null)
        ])
        setStats(statsData.stats)
        setMentor(mentorData.currentMentor)
        if (academicData) setAcademic(academicData)
        if (careerData) setCareerDetails(careerData)
        
        // Fetch meetings if mentor exists
        if (mentorData.currentMentor) {
          try {
            const meetingsData = await api.getMentorshipMeetings(mentorData.currentMentor.mentorshipId)
            setMeetings(meetingsData.meetings.filter(m => m.status === 'UPCOMING').slice(0, 3))
          } catch (e) {
            console.error('Failed to fetch meetings:', e)
          }
        }
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
              title="Pending Requests" 
              value={stats?.pendingRequests ?? 0} 
              icon={Clock} 
              description="Awaiting approval"
              variant="warning"
            />
            <StatsCard 
              title="Approved Requests" 
              value={stats?.approvedRequests ?? 0} 
              icon={CheckCircle} 
              description="Successfully approved"
              variant="success"
            />
            <StatsCard 
              title="Upcoming Meetings" 
              value={stats?.upcomingMeetings ?? 0} 
              icon={Calendar} 
              description="Scheduled with mentor"
            />
            <StatsCard 
              title="Mentor Status" 
              value={stats?.hasMentor ? "Assigned" : "Not Assigned"} 
              icon={UserCheck} 
              description={stats?.hasMentor ? "You have an active mentor" : "Contact HOD"}
              variant={stats?.hasMentor ? "success" : "default"}
            />
          </>
        )}
      </div>

      {/* Next Meeting Card */}
      {stats?.nextMeeting && (
        <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Meeting</p>
                <p className="text-xl font-semibold">{stats.nextMeeting.date} at {stats.nextMeeting.time}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            {mentor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10">
                      {mentor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{mentor.name}</p>
                    <p className="text-sm text-muted-foreground">{mentor.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{mentor.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="font-medium">{mentor.semester}</p>
                  </div>
                </div>
                {mentor.email && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{mentor.email}</span>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href="/mentor">
                    View Mentorship Details
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No mentor assigned yet</p>
                <p className="text-sm">A mentor will be assigned by your HOD</p>
              </div>
            )}
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
            {academic && academic.semesters.length > 0 ? (
              <div className="space-y-4">
                {/* Current CGPA */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current CGPA</p>
                    <p className="text-2xl font-bold">{academic.latestCGPA?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Semesters</p>
                    <p className="text-lg font-semibold">{academic.totalSemesters}</p>
                  </div>
                </div>
                
                {/* Recent Semesters */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent Performance</p>
                  {academic.semesters.slice(-3).reverse().map((sem) => (
                    <div key={sem.semester} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="text-sm">Semester {sem.semester}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">SGPA: {sem.sgpa.toFixed(2)}</Badge>
                        <Badge variant="secondary">CGPA: {sem.cgpa.toFixed(2)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/academic">View Full Academic Record</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No academic data available</p>
                <p className="text-sm">Your progress will appear here</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/academic">
                    View Academics
                  </Link>
                </Button>
              </div>
            )}
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
              <Link href="/career-details">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {careerDetails && (careerDetails.strengths.length > 0 || careerDetails.careerInterests.core.length > 0 || careerDetails.careerInterests.it.length > 0) ? (
              <div className="space-y-4">
                {/* Career Interests */}
                {(careerDetails.careerInterests.core.length > 0 || careerDetails.careerInterests.it.length > 0) && (
                  <div>
                    <p className="text-sm font-medium mb-2">Career Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {careerDetails.careerInterests.core.slice(0, 3).map((interest, i) => (
                        <Badge key={`core-${i}`} variant="default" className="text-xs">{interest}</Badge>
                      ))}
                      {careerDetails.careerInterests.it.slice(0, 3).map((interest, i) => (
                        <Badge key={`it-${i}`} variant="secondary" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Strengths */}
                {careerDetails.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {careerDetails.strengths.slice(0, 4).map((strength, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-green-50 dark:bg-green-950">{strength}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Areas to Improve */}
                {careerDetails.areasToImprove.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Areas to Improve</p>
                    <div className="flex flex-wrap gap-1">
                      {careerDetails.areasToImprove.slice(0, 3).map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-950">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/career-details">View All Goals</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No goals set yet</p>
                <p className="text-sm">Set your career goals to track progress</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/career-details">
                    Add Goals
                  </Link>
                </Button>
              </div>
            )}
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
            <Link href="/mentor">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{new Date(meeting.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p className="text-sm text-muted-foreground">{meeting.time || 'Time TBD'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {meeting.description && (
                      <p className="text-sm text-muted-foreground max-w-[200px] truncate">{meeting.description}</p>
                    )}
                    <Badge variant="secondary" className="mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Upcoming
                    </Badge>
                  </div>
                </div>
              ))}
              {stats && stats.upcomingMeetings > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{stats.upcomingMeetings - 3} more meetings
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming meetings</p>
              <p className="text-sm">Meetings will appear here when scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
