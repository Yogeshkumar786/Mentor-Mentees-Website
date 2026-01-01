"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api, FacultyMentorshipGroupResponse, FacultyMentorshipGroupMentee, ScheduleMeetingItem } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
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
  Calendar,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  CalendarCheck,
  PlusCircle,
  Trash2,
  Eye,
  CalendarPlus
} from "lucide-react"

interface MeetingDetails {
  id: string
  date: string
  time: string
  description: string | null
  status: string
  notes: string | null
  createdAt: string
}

// Interface for grouped meetings (deduplicated by date/time)
interface GroupedMeeting {
  date: string
  time: string | null
  description: string | null
  status: string
  studentCount: number
  students: Array<{
    id: string
    name: string
    rollNumber: number
    mentorshipId: string
  }>
  createdAt: string
}

function FacultyGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const year = Number(searchParams.get('year'))
  const semester = Number(searchParams.get('semester'))
  const isActive = searchParams.get('active') === 'true'

  const [data, setData] = useState<FacultyMentorshipGroupResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Meeting details dialog
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [selectedMeetings, setSelectedMeetings] = useState<MeetingDetails[]>([])
  const [selectedStudentName, setSelectedStudentName] = useState("")

  // Group schedule dialog (for ALL students)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [meetingDates, setMeetingDates] = useState<ScheduleMeetingItem[]>([{ date: "", time: "", description: "" }])
  const [scheduling, setScheduling] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.getFacultyMentorshipGroup(year, semester, isActive)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch group details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (year && semester) {
      fetchData()
    }
  }, [year, semester, isActive])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get all meetings from all mentees and deduplicate by date/time
  const getGroupedMeetings = (): GroupedMeeting[] => {
    if (!data?.mentees) return []
    
    const groupMap = new Map<string, GroupedMeeting>()
    
    for (const mentee of data.mentees) {
      if (!mentee.meetings) continue
      
      for (const meeting of mentee.meetings) {
        // Create a unique key based on date, time, and description
        const key = `${meeting.date}_${meeting.time || 'null'}_${meeting.description || ''}`
        
        if (groupMap.has(key)) {
          // Add student to existing group
          const group = groupMap.get(key)!
          group.students.push({
            id: meeting.id,
            name: mentee.name,
            rollNumber: mentee.rollNumber,
            mentorshipId: mentee.mentorshipId
          })
          group.studentCount = group.students.length
        } else {
          // Create new group
          groupMap.set(key, {
            date: meeting.date,
            time: meeting.time,
            description: meeting.description,
            status: meeting.status,
            studentCount: 1,
            students: [{
              id: meeting.id,
              name: mentee.name,
              rollNumber: mentee.rollNumber,
              mentorshipId: mentee.mentorshipId
            }],
            createdAt: meeting.createdAt
          })
        }
      }
    }
    
    // Convert to array and sort by date (newest first)
    return Array.from(groupMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  // State for group meeting dialog
  const [groupMeetingDialogOpen, setGroupMeetingDialogOpen] = useState(false)
  const [selectedGroupMeeting, setSelectedGroupMeeting] = useState<GroupedMeeting | null>(null)

  const openGroupMeetingDialog = (meeting: GroupedMeeting) => {
    setSelectedGroupMeeting(meeting)
    setGroupMeetingDialogOpen(true)
  }

  const openMeetingDialog = (studentName: string, meetings: FacultyMentorshipGroupMentee['meetings']) => {
    setSelectedStudentName(studentName)
    setSelectedMeetings(meetings as MeetingDetails[])
    setMeetingDialogOpen(true)
  }

  const openScheduleDialog = () => {
    setMeetingDates([{ date: "", time: "", description: "" }])
    setScheduleDialogOpen(true)
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

  const handleScheduleMeetings = async () => {
    const validMeetings = meetingDates.filter(m => m.date && m.time)
    
    if (validMeetings.length === 0) {
      toast({
        title: "No meetings to schedule",
        description: "Please add at least one meeting with date and time",
        variant: "destructive"
      })
      return
    }

    try {
      setScheduling(true)
      const result = await api.facultyScheduleGroupMeetings(year, semester, validMeetings)

      toast({
        title: "Success",
        description: result.message
      })

      setScheduleDialogOpen(false)
      fetchData() // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to schedule meetings',
        variant: "destructive"
      })
    } finally {
      setScheduling(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6 flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container py-6">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error || 'Failed to load data'}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    )
  }

  const mentees = data.mentees || []
  
  // Get grouped meetings for stats
  const groupedMeetings = getGroupedMeetings()
  const totalGroupMeetings = groupedMeetings.length
  const completedGroupMeetings = groupedMeetings.filter(m => m.status.toLowerCase() === 'completed').length

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Year {year}, Semester {semester}
            </h1>
            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : ""}>
              {isActive ? 'Active' : 'Past'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            My mentees in this group
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentees.length}</p>
                <p className="text-xs text-muted-foreground">Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGroupMeetings}</p>
                <p className="text-xs text-muted-foreground">Group Meetings</p>
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
                <p className="text-2xl font-bold">{completedGroupMeetings}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGroupMeetings - completedGroupMeetings}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentees Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mentees</CardTitle>
            <CardDescription>Students in this mentorship group</CardDescription>
          </div>
          {isActive && mentees.length > 0 && (
            <Button onClick={openScheduleDialog}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mentees.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No mentees in this group</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Meetings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                              {mentees.map((mentee) => (
                  <TableRow key={mentee.id || mentee.mentorshipId}>
                    <TableCell className="font-medium">{mentee.name}</TableCell>
                    <TableCell>{mentee.rollNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mentee.email && (
                          <a 
                            href={`mailto:${mentee.email}`} 
                            className="text-muted-foreground hover:text-foreground"
                            title={`Email ${mentee.name}`}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {mentee.phoneNumber && (
                          <a 
                            href={`tel:${mentee.phoneNumber}`} 
                            className="text-muted-foreground hover:text-foreground"
                            title={`Call ${mentee.name}`}
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(mentee.startDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CalendarCheck className="h-3 w-3" />
                          {mentee.completedMeetings || 0}/{mentee.meetingCount || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(mentee.meetings && mentee.meetings.length > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMeetingDialog(mentee.name, mentee.meetings)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Group Meetings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Group Meetings ({getGroupedMeetings().length})
          </CardTitle>
          <CardDescription>
            Meetings scheduled for the entire group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getGroupedMeetings().length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="text-md font-semibold">No Meetings Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No meetings have been scheduled for this group.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getGroupedMeetings().map((meeting, index) => (
                <Card 
                  key={`${meeting.date}_${meeting.time}_${index}`} 
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                  onClick={() => openGroupMeetingDialog(meeting)}
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
                      {meeting.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(meeting.time)}
                        </div>
                      )}
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

      {/* Group Meeting Details Dialog */}
      <Dialog open={groupMeetingDialogOpen} onOpenChange={setGroupMeetingDialogOpen}>
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
                  <p className="font-medium">{selectedGroupMeeting.time ? formatTime(selectedGroupMeeting.time) : 'Not set'}</p>
                </div>
              </div>
              
              {/* Students in this meeting */}
              <div>
                <Label className="text-muted-foreground">Students ({selectedGroupMeeting.studentCount})</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                  {selectedGroupMeeting.students.map((student, idx) => (
                    <div 
                      key={student.id} 
                      className={`flex items-center justify-between p-2 text-sm ${idx !== selectedGroupMeeting.students.length - 1 ? 'border-b' : ''}`}
                    >
                      <span className="font-medium">{student.name}</span>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupMeetingDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Details Dialog (per student) */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Meetings with {selectedStudentName}
            </DialogTitle>
            <DialogDescription>
              {selectedMeetings.length} meeting(s) scheduled
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {selectedMeetings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No meetings scheduled</p>
            ) : (
              selectedMeetings.map((meeting, index) => (
                <Card key={meeting.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(meeting.date)}</span>
                          <span className="text-muted-foreground">at {formatTime(meeting.time)}</span>
                        </div>
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground pl-6">{meeting.description}</p>
                        )}
                        {meeting.notes && (
                          <p className="text-sm text-muted-foreground pl-6 italic">&quot;{meeting.notes}&quot;</p>
                        )}
                      </div>
                      {getStatusBadge(meeting.status)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Schedule Meeting Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Schedule Meetings for All Students
            </DialogTitle>
            <DialogDescription>
              Schedule meetings for all {mentees.length} students in this group at once
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
              {meetingDates.filter(m => m.date && m.time).length} meeting date(s) × {mentees.length} students = {meetingDates.filter(m => m.date && m.time).length * mentees.length} total meetings
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMeetings} disabled={scheduling}>
              {scheduling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule for All Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function FacultyGroupPage() {
  return (
    <DashboardLayout requiredRoles={["FACULTY"]}>
      <Suspense fallback={
        <div className="container py-6 flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <FacultyGroupContent />
      </Suspense>
    </DashboardLayout>
  )
}
