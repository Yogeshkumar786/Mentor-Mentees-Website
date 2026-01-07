"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentMentoringByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, GraduationCap, User, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react"

interface Meeting {
  id: string
  date: string | null
  time: string | null
  description: string
  status: string
  feedback: string | null
  remarks: string | null
}

interface Mentorship {
  id: string
  faculty: {
    id: string
    name: string
    employeeId: string
    department: string
    email: string
    phone: string
  }
  startDate: string | null
  endDate: string | null
  isActive: boolean
  meetings: Meeting[]
  totalMeetings: number
}

export default function StudentMentoringPage() {
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [data, setData] = useState<StudentMentoringByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentMentoringByRollNumber(rollno)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch mentoring data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [rollno])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-8">No mentoring data found</div>
  }

  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'UPCOMING':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>
      case 'YET_TO_DONE':
        return <Badge className="bg-yellow-500"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Calculate stats from data
  const totalMeetings = data.mentorships.reduce((sum, m) => sum + m.totalMeetings, 0)
  const allMeetings = data.mentorships.flatMap(m => m.meetings)
  const completedMeetings = allMeetings.filter(m => m.status === 'COMPLETED').length
  const upcomingMeetings = allMeetings.filter(m => m.status === 'UPCOMING' || m.status === 'YET_TO_DONE').length
  const activeMentorships = data.mentorships.filter(m => m.isActive)
  const pastMentorships = data.mentorships.filter(m => !m.isActive)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.activeMentorship ? 1 : 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMeetings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedMeetings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcomingMeetings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Mentorship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Current Mentorship
          </CardTitle>
          <CardDescription>Active mentor-mentee relationship</CardDescription>
        </CardHeader>
        <CardContent>
          {!data.activeMentorship ? (
            <p className="text-center text-muted-foreground py-8">No active mentorship</p>
          ) : (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{data.activeMentorship.faculty.name}</h4>
                      <p className="text-sm text-muted-foreground">{data.activeMentorship.faculty.employeeId}</p>
                      <p className="text-sm text-muted-foreground">{data.activeMentorship.faculty.department}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{data.activeMentorship.startDate ? new Date(data.activeMentorship.startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{data.activeMentorship.totalMeetings} meetings</span>
                  </div>
                  <Badge variant="outline">{data.activeMentorship.faculty.email}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Meeting History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Meeting History
          </CardTitle>
          <CardDescription>Recent and upcoming meetings</CardDescription>
        </CardHeader>
        <CardContent>
          {allMeetings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No meetings found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell>{meeting.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{meeting.time || 'N/A'}</TableCell>
                    <TableCell>{getMeetingStatusBadge(meeting.status)}</TableCell>
                    <TableCell className="max-w-50 truncate">{meeting.description || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Past Mentorships */}
      {pastMentorships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Past Mentorships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Meetings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastMentorships.map((mentorship: Mentorship) => (
                  <TableRow key={mentorship.id}>
                    <TableCell className="font-medium">{mentorship.faculty.name}</TableCell>
                    <TableCell>{mentorship.faculty.department}</TableCell>
                    <TableCell>
                      {mentorship.startDate ? new Date(mentorship.startDate).toLocaleDateString() : 'N/A'} - {mentorship.endDate ? new Date(mentorship.endDate).toLocaleDateString() : 'Present'}
                    </TableCell>
                    <TableCell>{mentorship.totalMeetings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
