"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, MentorshipGroupResponse, MentorshipGroupMeeting, ScheduleMeetingItem } from "@/lib/api"
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
  CalendarPlus
} from "lucide-react"

export default function MentorshipGroupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MentorshipGroupResponse | null>(null)
  
  // Meeting detail dialog state
  const [selectedMeeting, setSelectedMeeting] = useState<MentorshipGroupMeeting | null>(null)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  
  // Create meeting dialog state (group scheduling for ALL students)
  const [createMeetingDialogOpen, setCreateMeetingDialogOpen] = useState(false)
  const [meetingDates, setMeetingDates] = useState<ScheduleMeetingItem[]>([{ date: "", time: "", description: "" }])
  const [creatingMeeting, setCreatingMeeting] = useState(false)
  
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

  const openMeetingDetails = (meeting: MentorshipGroupMeeting) => {
    setSelectedMeeting(meeting)
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
                  <p className="text-2xl font-bold">{data.meetingStats.completed}</p>
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
                  <p className="text-2xl font-bold">{data.meetingStats.upcoming}</p>
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
                  <p className="text-2xl font-bold">{data.meetingStats.yetToDone}</p>
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
                Schedule Meetings for All
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
                      <TableCell className="font-medium">{mentee.name}</TableCell>
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
                Meetings ({data.meetingStats.total})
              </CardTitle>
              <CardDescription>
                All meetings scheduled for this group
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {data.meetings.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-md font-semibold">No Meetings Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No meetings have been scheduled for this group.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.meetings.map((meeting) => (
                  <Card 
                    key={meeting.id} 
                    className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                    onClick={() => openMeetingDetails(meeting)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">{meeting.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            Roll No: {meeting.studentRollNumber}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meeting Details Dialog */}
        <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Meeting Details
              </DialogTitle>
              {selectedMeeting && (
                <DialogDescription>
                  Meeting with {selectedMeeting.studentName}
                </DialogDescription>
              )}
            </DialogHeader>
            {selectedMeeting && (
              <div className="space-y-4 py-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(selectedMeeting.status)}
                </div>
                
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{formatDate(selectedMeeting.date)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-medium">{formatTime(selectedMeeting.time)}</p>
                  </div>
                </div>
                
                {/* Student Info */}
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">
                    {selectedMeeting.studentName} (Roll No: {selectedMeeting.studentRollNumber})
                  </p>
                </div>
                
                {/* Description */}
                <div>
                  <Label className="text-muted-foreground">Description / Agenda</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      {selectedMeeting.description || 'No description provided'}
                    </p>
                  </div>
                </div>
                
                {/* Faculty Review */}
                <div>
                  <Label className="text-muted-foreground">Faculty Review</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      {selectedMeeting.facultyReview || 'No review submitted yet'}
                    </p>
                  </div>
                </div>
                
                {/* Meeting Status Indicator */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {selectedMeeting.status === 'COMPLETED' ? (
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
                    ) : selectedMeeting.status === 'UPCOMING' ? (
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
                    ) : selectedMeeting.status === 'YET_TO_DONE' ? (
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                Close
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
