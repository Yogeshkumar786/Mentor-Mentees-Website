"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"
import { api, MentorshipMeetingsResponse, MeetingData } from "@/lib/api"
import { generateStudentMentorPDF } from "@/lib/pdf-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  UserCheck, 
  Mail, 
  Building2, 
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  CalendarDays,
  FileText,
  Download
} from "lucide-react"

export default function MentorshipMeetingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const mentorshipId = params.mentorshipId as string
  
  const [meetingsData, setMeetingsData] = useState<MentorshipMeetingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const data = await api.getMentorshipMeetings(mentorshipId)
        setMeetingsData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch meetings')
      } finally {
        setLoading(false)
      }
    }

    if (mentorshipId) {
      fetchMeetings()
    }
  }, [mentorshipId])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Completed</Badge>
      case 'UPCOMING':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Upcoming</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Link href="/mentor">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Mentors
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const handleDownloadPDF = () => {
    if (!meetingsData || !user?.student) return

    generateStudentMentorPDF({
      studentName: user.student.name,
      studentRollNumber: parseInt(user.student.rollNumber || '0'),
      mentorName: meetingsData.mentor.name,
      department: meetingsData.mentor.department,
      year: meetingsData.year,
      semester: meetingsData.semester,
      meetings: meetingsData.meetings.map(m => ({
        date: m.date,
        time: m.time,
        description: m.description,
        status: m.status,
        facultyReview: m.facultyReview
      }))
    })
  }

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mentor">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meetings & Reviews</h1>
              <p className="text-muted-foreground">
                View all meetings with {meetingsData?.mentor.name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Mentor Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${meetingsData?.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                  <UserCheck className={`h-6 w-6 ${meetingsData?.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{meetingsData?.mentor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {meetingsData?.mentor.department}
                    </span>
                    {meetingsData?.mentor.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {meetingsData?.mentor.email}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              {meetingsData?.isActive ? (
                <Badge className="bg-green-600">Current Mentor</Badge>
              ) : (
                <Badge variant="secondary">Past Mentor</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Year: </span>
                <span className="font-medium">{meetingsData?.year}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Semester: </span>
                <span className="font-medium">{meetingsData?.semester}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Period: </span>
                <span className="font-medium">
                  {meetingsData?.startDate ? new Date(meetingsData.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                  {' - '}
                  {meetingsData?.endDate ? new Date(meetingsData.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Present'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingsData?.stats.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Meetings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingsData?.stats.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingsData?.stats.upcoming || 0}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meetingsData?.stats.cancelled || 0}</p>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meeting History
          </h2>
          
          {meetingsData?.meetings && meetingsData.meetings.length > 0 ? (
            <div className="space-y-4">
              {meetingsData.meetings.map((meeting) => (
                <Card key={meeting.id} className={meeting.status === 'CANCELLED' ? 'border-red-200 dark:border-red-900 opacity-75' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(meeting.date)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(meeting.time)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(meeting.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {meeting.description && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Meeting Agenda
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{meeting.description}</p>
                      </div>
                    )}
                    
                    {meeting.facultyReview && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Mentor&apos;s Review
                        </div>
                        <p className="text-sm">{meeting.facultyReview}</p>
                      </div>
                    )}
                    
                    {!meeting.description && !meeting.facultyReview && (
                      <p className="text-sm text-muted-foreground italic">
                        No details available for this meeting.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No Meetings Yet</h3>
                <p className="text-muted-foreground mt-2">
                  No meetings have been scheduled with this mentor yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
