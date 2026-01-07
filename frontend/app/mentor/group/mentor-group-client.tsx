"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, MentorshipGroupResponse, MentorshipGroupMeeting, ScheduleMeetingItem, CompleteGroupMeetingsRequest, StudentReviewItem } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Users,
  GraduationCap,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle, 
  AlertTriangle,
  PlusCircle,
  Mail,
  Phone,
  Building,
  User,
  Trash2,
  CalendarPlus,
  FileText,
  MessageSquare,
  Edit
} from "lucide-react"

// Interface for meetings from API (now already grouped)
interface GroupMeeting {
  id: string
  date: string
  time: string | null
  description: string
  status: 'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE' | 'CANCELLED'
  studentCount: number
  students: Array<{
    studentId: string
    name: string
    rollNumber: number
    review: string
    attended: boolean
  }>
  createdAt: string
}

export default function MentorGroupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MentorshipGroupResponse | null>(null)
  
  // Meeting detail dialog state
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  
  // Create meeting dialog state (group scheduling for ALL students)
  const [createMeetingDialogOpen, setCreateMeetingDialogOpen] = useState(false)
  const [meetingDates, setMeetingDates] = useState<ScheduleMeetingItem[]>([{ date: "", time: "", description: "" }])
  const [creatingMeeting, setCreatingMeeting] = useState(false)
  
  // Complete meeting dialog state
  const [completeMeetingDialogOpen, setCompleteMeetingDialogOpen] = useState(false)
  const [completingMeeting, setCompletingMeeting] = useState(false)
  const [studentReviews, setStudentReviews] = useState<StudentReviewItem[]>([])
  const [meetingDescription, setMeetingDescription] = useState("")
  
  // Edit meeting dialog state (for any meeting)
  const [editMeetingDialogOpen, setEditMeetingDialogOpen] = useState(false)
  const [savingMeeting, setSavingMeeting] = useState(false)
  const [editMeetingStatus, setEditMeetingStatus] = useState<'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE'>('UPCOMING')
  
  // Get query params
  const facultyId = searchParams.get('faculty')
  const year = searchParams.get('year')
  const semester = searchParams.get('semester')
  const isActive = searchParams.get('active') === 'true'

  const fetchData = async () => {
    if (!facultyId || !year || !semester) {
      setError('Missing required parameters')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const groupData = await api.getMentorshipGroup(
        facultyId,
        parseInt(year),
        parseInt(semester),
        isActive
      )
      setData(groupData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch group data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [facultyId, year, semester, isActive])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'Not set'
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'UPCOMING':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        )
      case 'YET_TO_DONE':
        return (
          <Badge variant="default" className="bg-amber-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Yet to Complete
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Meetings now come pre-grouped from API - just sort them
  const getMeetings = (): GroupMeeting[] => {
    if (!data?.meetings) return []
    
    // Sort by status priority: YET_TO_DONE > COMPLETED > UPCOMING > CANCELLED
    // Within each status, sort by date
    const statusPriority: Record<string, number> = {
      'YET_TO_DONE': 1,
      'COMPLETED': 2,
      'UPCOMING': 3,
      'CANCELLED': 4
    }
    
    // Cast meetings to GroupMeeting type (they already have the right structure from API)
    const meetings = data.meetings as unknown as GroupMeeting[]
    
    return [...meetings].sort((a, b) => {
      // First sort by status priority
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status]
      if (priorityDiff !== 0) return priorityDiff
      
      // Within same status, sort by date (newest first for completed, oldest first for upcoming/yet_to_done)
      if (a.status === 'COMPLETED') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
    })
  }

  // Check if a meeting time has passed
  const isMeetingTimePassed = (meeting: GroupMeeting): boolean => {
    if (!meeting.time) return false
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`)
    return new Date() >= meetingDateTime
  }

  const [selectedGroupMeeting, setSelectedGroupMeeting] = useState<GroupMeeting | null>(null)

  const openMeetingDetails = (meeting: GroupMeeting) => {
    setSelectedGroupMeeting(meeting)
    setMeetingDialogOpen(true)
  }

  const openCreateMeetingDialog = () => {
    setMeetingDates([{ date: "", time: "", description: "" }])
    setCreateMeetingDialogOpen(true)
  }

  const addMeetingDate = () => {
    setMeetingDates([...meetingDates, { date: "", time: "", description: "" }])
  }

  const removeMeetingDate = (index: number) => {
    if (meetingDates.length > 1) {
      setMeetingDates(meetingDates.filter((_, i) => i !== index))
    }
  }

  const updateMeetingDate = (index: number, field: keyof ScheduleMeetingItem, value: string) => {
    const updated = [...meetingDates]
    updated[index] = { ...updated[index], [field]: value }
    setMeetingDates(updated)
  }

  const handleCreateMeeting = async () => {
    const validMeetings = meetingDates.filter(m => m.date && m.time)
    
    if (validMeetings.length === 0) {
      toast({
        title: "No meetings to schedule",
        description: "Please add at least one meeting with date and time",
        variant: "destructive"
      })
      return
    }

    if (!facultyId || !year || !semester) {
      toast({
        title: "Error",
        description: "Missing group information",
        variant: "destructive"
      })
      return
    }
    
    try {
      setCreatingMeeting(true)
      const result = await api.scheduleGroupMeetings({
        facultyId,
        year: parseInt(year),
        semester: parseInt(semester),
        meetings: validMeetings
      })
      
      toast({
        title: "Success",
        description: result.message
      })
      
      setCreateMeetingDialogOpen(false)
      setMeetingDates([{ date: "", time: "", description: "" }])
      fetchData() // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create meeting',
        variant: "destructive"
      })
    } finally {
      setCreatingMeeting(false)
    }
  }

  const openCompleteMeetingDialog = (meeting: GroupMeeting) => {
    setSelectedGroupMeeting(meeting)
    // Initialize student reviews for all students in the meeting
    setStudentReviews(meeting.students.map(student => ({
      rollNumber: student.rollNumber,
      studentName: student.name,
      review: ""
    })))
    setMeetingDescription(meeting.description || "")
    setCompleteMeetingDialogOpen(true)
  }

  const updateStudentReview = (rollNumber: number, review: string) => {
    setStudentReviews(prev => prev.map(sr => 
      sr.rollNumber === rollNumber ? { ...sr, review } : sr
    ))
  }

  const handleCompleteMeeting = async () => {
    if (!selectedGroupMeeting) {
      toast({
        title: "Error",
        description: "Missing meeting information",
        variant: "destructive"
      })
      return
    }

    // Check if at least one review is provided
    const hasAnyReview = studentReviews.some(sr => sr.review.trim().length > 0)
    if (!hasAnyReview) {
      toast({
        title: "Review required",
        description: "Please provide a review for at least one student",
        variant: "destructive"
      })
      return
    }

    // Check if meeting time has passed
    if (!isMeetingTimePassed(selectedGroupMeeting)) {
      toast({
        title: "Cannot complete yet",
        description: "You can only mark a meeting as complete after its scheduled time has passed",
        variant: "destructive"
      })
      return
    }

    try {
      setCompletingMeeting(true)
      
      const result = await api.completeGroupMeetings({
        meetingId: selectedGroupMeeting.id,
        studentReviews: studentReviews.map(sr => ({
          rollNumber: sr.rollNumber,
          review: sr.review.trim()
        })),
        description: meetingDescription.trim() || undefined
      })
      
      toast({
        title: "Success",
        description: result.message
      })
      
      setCompleteMeetingDialogOpen(false)
      setMeetingDialogOpen(false)
      setStudentReviews([])
      setMeetingDescription("")
      fetchData() // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to complete meeting',
        variant: "destructive"
      })
    } finally {
      setCompletingMeeting(false)
    }
  }

  const openEditMeetingDialog = (meeting: GroupMeeting) => {
    setSelectedGroupMeeting(meeting)
    // Initialize student reviews with existing reviews
    setStudentReviews(meeting.students.map(student => ({
      rollNumber: student.rollNumber,
      studentName: student.name,
      review: student.review || ""
    })))
    setMeetingDescription(meeting.description || "")
    setEditMeetingStatus(meeting.status as 'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE')
    setEditMeetingDialogOpen(true)
  }

  const handleSaveMeeting = async () => {
    if (!selectedGroupMeeting) {
      toast({
        title: "Error",
        description: "Missing meeting information",
        variant: "destructive"
      })
      return
    }

    try {
      setSavingMeeting(true)
      
      const result = await api.updateMeeting({
        meetingId: selectedGroupMeeting.id,
        status: editMeetingStatus,
        studentReviews: studentReviews.map(sr => ({
          rollNumber: sr.rollNumber,
          review: sr.review.trim()
        })),
        description: meetingDescription.trim() || undefined
      })
      
      toast({
        title: "Success",
        description: result.message
      })
      
      setEditMeetingDialogOpen(false)
      setMeetingDialogOpen(false)
      setStudentReviews([])
      setMeetingDescription("")
      fetchData() // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save meeting',
        variant: "destructive"
      })
    } finally {
      setSavingMeeting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['HOD']}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout requiredRoles={['HOD']}>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error || 'Failed to load data'}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRoles={['HOD']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Mentorship Group
              </h1>
              <p className="text-muted-foreground">
                Year {data.year}, Semester {data.semester} • {data.faculty.name}
              </p>
            </div>
          </div>
          <Badge variant={data.isActive ? "default" : "secondary"} className="text-sm">
            {data.isActive ? "Active" : "Past"}
          </Badge>
        </div>

        {/* Faculty Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Mentor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{data.faculty.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{data.faculty.employeeId}</p>
                </div>
              </div>
              {data.faculty.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-sm truncate">{data.faculty.email}</p>
                  </div>
                </div>
              )}
              {data.faculty.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{data.faculty.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.menteesCount}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getMeetings().filter(m => m.status === 'COMPLETED').length}</p>
                  <p className="text-xs text-muted-foreground">Completed Meetings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getMeetings().filter(m => m.status === 'UPCOMING').length}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Meetings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getMeetings().filter(m => m.status === 'YET_TO_DONE').length}</p>
                  <p className="text-xs text-muted-foreground">Yet to Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentees List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Students ({data.menteesCount})
              </CardTitle>
              <CardDescription>
                All students in this mentorship group
              </CardDescription>
            </div>
            {data.isActive && data.mentees.length > 0 && (
              <Button onClick={openCreateMeetingDialog}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {data.mentees.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No students in this group</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.mentees.map((mentee) => (
                    <TableRow key={mentee.mentorshipId}>
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => router.push(`/students/${mentee.rollNumber}`)}
                          className="text-primary hover:underline cursor-pointer text-left"
                        >
                          {mentee.name}
                        </button>
                      </TableCell>
                      <TableCell>{mentee.rollNumber}</TableCell>
                      <TableCell>{mentee.registrationNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mentee.program}</Badge>
                      </TableCell>
                      <TableCell>
                        {mentee.startDate ? formatDate(mentee.startDate) : 'N/A'}
                        {mentee.endDate && (
                          <span className="text-muted-foreground">
                            {' '}- {formatDate(mentee.endDate)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Meetings List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Group Meetings ({getMeetings().length})
              </CardTitle>
              <CardDescription>
                Meetings scheduled for the entire group
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {getMeetings().length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-md font-semibold">No Meetings Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No meetings have been scheduled for this group.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getMeetings().map((meeting, index) => (
                  <Card 
                    key={`${meeting.date}_${meeting.time}_${index}`} 
                    className={`cursor-pointer hover:shadow-md hover:border-primary/50 transition-all ${
                      meeting.status === 'YET_TO_DONE' && isMeetingTimePassed(meeting) ? 'border-amber-500' : ''
                    }`}
                    onClick={() => openMeetingDetails(meeting)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">Group Meeting</p>
                          <p className="text-xs text-muted-foreground">
                            {meeting.studentCount} student{meeting.studentCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        {getStatusBadge(meeting.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(meeting.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(meeting.time)}
                        </div>
                      </div>
                      {meeting.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}
                      {/* Show action needed indicator */}
                      {meeting.status === 'YET_TO_DONE' && isMeetingTimePassed(meeting) && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          Action needed - Mark as complete
                        </div>
                      )}
                      {/* Show review indicator if completed */}
                      {meeting.status === 'COMPLETED' && meeting.students.some(s => s.review) && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                          <MessageSquare className="h-3 w-3" />
                          Reviews added
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meeting Details Dialog */}
        <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Group Meeting Details
              </DialogTitle>
              {selectedGroupMeeting && (
                <DialogDescription>
                  Meeting for {selectedGroupMeeting.studentCount} student{selectedGroupMeeting.studentCount > 1 ? 's' : ''}
                </DialogDescription>
              )}
            </DialogHeader>
            {selectedGroupMeeting && (
              <div className="space-y-4 py-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(selectedGroupMeeting.status)}
                </div>
                
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{formatDate(selectedGroupMeeting.date)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-medium">{formatTime(selectedGroupMeeting.time)}</p>
                  </div>
                </div>
                
                {/* Students in this meeting */}
                <div>
                  <Label className="text-muted-foreground">Students ({selectedGroupMeeting.studentCount})</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                    {selectedGroupMeeting.students.map((student, idx) => (
                      <div 
                        key={student.studentId} 
                        className={`flex items-center justify-between p-2 text-sm ${idx !== selectedGroupMeeting.students.length - 1 ? 'border-b' : ''}`}
                      >
                        <button 
                          onClick={() => {
                            setMeetingDialogOpen(false)
                            router.push(`/students/${student.rollNumber}`)
                          }}
                          className="font-medium text-primary hover:underline cursor-pointer text-left"
                        >
                          {student.name}
                        </button>
                        <span className="text-muted-foreground">Roll No: {student.rollNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <Label className="text-muted-foreground">Description / Agenda</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      {selectedGroupMeeting.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* Individual Student Reviews - Show if completed */}
                {selectedGroupMeeting.status === 'COMPLETED' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Student Reviews
                      </Label>
                    </div>
                    {selectedGroupMeeting.students.some(s => s.review) ? (
                      <div className="space-y-2">
                        {selectedGroupMeeting.students.map((student) => (
                          <div 
                            key={student.studentId} 
                            className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{student.name}</span>
                              <Badge variant="outline" className="text-xs">{student.rollNumber}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {student.review || <span className="italic">No review provided</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/50 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">No reviews added yet. Click "Edit Reviews" to add reviews for students.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Meeting Status Indicator */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {selectedGroupMeeting.status === 'COMPLETED' ? (
                      <>
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-600">Meeting Completed</p>
                          <p className="text-sm text-muted-foreground">
                            This meeting has been successfully completed.
                          </p>
                        </div>
                      </>
                    ) : selectedGroupMeeting.status === 'UPCOMING' ? (
                      <>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-600">Upcoming Meeting</p>
                          <p className="text-sm text-muted-foreground">
                            This meeting is scheduled for a future date.
                          </p>
                        </div>
                      </>
                    ) : selectedGroupMeeting.status === 'YET_TO_DONE' ? (
                      <>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-600">Yet to Complete</p>
                          <p className="text-sm text-muted-foreground">
                            This meeting date has passed but it hasn&apos;t been marked as completed.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-red-600">Cancelled</p>
                          <p className="text-sm text-muted-foreground">
                            This meeting has been cancelled.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                Close
              </Button>
              {selectedGroupMeeting && (
                <Button onClick={() => openEditMeetingDialog(selectedGroupMeeting)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Meeting
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Meeting Dialog */}
        <Dialog open={completeMeetingDialogOpen} onOpenChange={setCompleteMeetingDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Complete Meeting
              </DialogTitle>
              <DialogDescription>
                Add individual reviews for each student to mark this meeting as completed
              </DialogDescription>
            </DialogHeader>
            {selectedGroupMeeting && (
              <div className="space-y-4 py-4">
                {/* Meeting Info */}
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(selectedGroupMeeting.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{formatTime(selectedGroupMeeting.time)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="font-medium">{selectedGroupMeeting.studentCount}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="meetingDescription">Description / Agenda (Optional)</Label>
                  <Textarea
                    id="meetingDescription"
                    placeholder="Update the meeting description or agenda..."
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Individual Student Reviews */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Student Reviews <span className="text-destructive">*</span></Label>
                  <p className="text-xs text-muted-foreground">
                    Provide individual feedback for each student. At least one review is required.
                  </p>
                  <div className="space-y-3">
                    {studentReviews.map((sr) => (
                      <div key={sr.rollNumber} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{sr.studentName}</span>
                          <Badge variant="outline" className="text-xs">{sr.rollNumber}</Badge>
                        </div>
                        <Textarea
                          placeholder={`Review for ${sr.studentName}...`}
                          value={sr.review}
                          onChange={(e) => updateStudentReview(sr.rollNumber, e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompleteMeetingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteMeeting} 
                disabled={completingMeeting || !studentReviews.some(sr => sr.review.trim())}
              >
                {completingMeeting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Complete Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Meeting Dialog */}
        <Dialog open={editMeetingDialogOpen} onOpenChange={setEditMeetingDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Edit Meeting
              </DialogTitle>
              <DialogDescription>
                Update the meeting status, description, and individual student reviews
              </DialogDescription>
            </DialogHeader>
            {selectedGroupMeeting && (
              <div className="space-y-4 py-4">
                {/* Meeting Info */}
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(selectedGroupMeeting.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{formatTime(selectedGroupMeeting.time)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="font-medium">{selectedGroupMeeting.studentCount}</span>
                  </div>
                </div>

                {/* Meeting Status */}
                <div className="space-y-2">
                  <Label htmlFor="meetingStatus">Meeting Status</Label>
                  <select 
                    id="meetingStatus"
                    title="Select meeting status"
                    className="w-full p-2 border rounded-md bg-background"
                    value={editMeetingStatus}
                    onChange={(e) => setEditMeetingStatus(e.target.value as 'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE')}
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="YET_TO_DONE">Yet to Complete</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="editMeetingDescription">Description / Agenda (Optional)</Label>
                  <Textarea
                    id="editMeetingDescription"
                    placeholder="Update the meeting description or agenda..."
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Individual Student Reviews */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Student Reviews</Label>
                  <p className="text-xs text-muted-foreground">
                    Add or update feedback for each student.
                  </p>
                  <div className="space-y-3">
                    {studentReviews.map((sr) => (
                      <div key={sr.rollNumber} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{sr.studentName}</span>
                          <Badge variant="outline" className="text-xs">{sr.rollNumber}</Badge>
                        </div>
                        <Textarea
                          placeholder={`Review for ${sr.studentName}...`}
                          value={sr.review}
                          onChange={(e) => updateStudentReview(sr.rollNumber, e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditMeetingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveMeeting} 
                disabled={savingMeeting}
              >
                {savingMeeting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Meeting Dialog (Group Scheduling for ALL students) */}
        <Dialog open={createMeetingDialogOpen} onOpenChange={setCreateMeetingDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-primary" />
                Schedule Meetings for All Students
              </DialogTitle>
              <DialogDescription>
                Schedule meetings for all {data?.menteesCount || 0} students in this group at once
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Meeting Dates</Label>
                <Button variant="outline" size="sm" onClick={addMeetingDate}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Date
                </Button>
              </div>
              
              <div className="space-y-3">
                {meetingDates.map((meeting, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <Input
                          type="date"
                          value={meeting.date}
                          onChange={(e) => updateMeetingDate(index, 'date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Time</Label>
                        <Input
                          type="time"
                          value={meeting.time}
                          onChange={(e) => updateMeetingDate(index, 'time', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Input
                          placeholder="Optional"
                          value={meeting.description}
                          onChange={(e) => updateMeetingDate(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                    {meetingDates.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMeetingDate(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {meetingDates.filter(m => m.date && m.time).length} meeting date(s) × {data?.menteesCount || 0} students = {meetingDates.filter(m => m.date && m.time).length * (data?.menteesCount || 0)} total meetings
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateMeetingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting} disabled={creatingMeeting}>
                {creatingMeeting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Schedule for All Students
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
