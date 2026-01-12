"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api, FacultyMenteesResponse, FacultyMenteeGroup, ScheduleMeetingItem } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  GraduationCap,
  Loader2,
  AlertCircle,
  Calendar,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Download
} from "lucide-react"
import type { ApiUser } from "@/lib/api"
import { generateFacultyGroupPDF } from "@/lib/pdf-generator"

interface FacultyMentorViewProps {
  user: ApiUser
}

export function FacultyMentorView({ user }: FacultyMentorViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<FacultyMenteesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bulk schedule meeting dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedMentorshipId, setSelectedMentorshipId] = useState<string>("")
  const [selectedStudentName, setSelectedStudentName] = useState<string>("")
  const [meetingDates, setMeetingDates] = useState<ScheduleMeetingItem[]>([{ date: "", time: "", description: "" }])
  const [scheduling, setScheduling] = useState(false)

  const facultyName = user.faculty?.name || user.email
  const department = user.faculty?.department || 'Not Assigned'

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.getFacultyMentees()
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mentees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeGroups = useMemo(() => {
    if (!data) return []
    return data.menteeGroups.filter(g => g.isActive)
  }, [data])

  const pastGroups = useMemo(() => {
    if (!data) return []
    return data.menteeGroups.filter(g => !g.isActive)
  }, [data])

  const navigateToGroup = (year: number, semester: number, isActive: boolean) => {
    router.push(`/mentor/faculty-group?year=${year}&semester=${semester}&active=${isActive}`)
  }

  const openScheduleDialog = (mentorshipId: string, studentName: string) => {
    setSelectedMentorshipId(mentorshipId)
    setSelectedStudentName(studentName)
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
      const result = await api.facultyScheduleMeetings({
        mentorshipId: selectedMentorshipId,
        meetings: validMeetings
      })

      toast({
        title: "Success",
        description: result.message
      })

      if (result.results.failedCount > 0) {
        toast({
          title: "Warning",
          description: `${result.results.failedCount} meeting(s) failed to schedule`,
          variant: "destructive"
        })
      }

      setScheduleDialogOpen(false)
      setSelectedMentorshipId("")
      setSelectedStudentName("")
      setMeetingDates([{ date: "", time: "", description: "" }])
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

  const handleDownloadAllGroups = async () => {
    if (!data || activeGroups.length === 0) {
      toast({
        title: "No data to export",
        description: "You don't have any active mentee groups to export",
        variant: "destructive"
      })
      return
    }

    try {
      // For each active group, fetch detailed data and generate PDF
      for (const group of activeGroups) {
        const groupData = await api.getFacultyMentorshipGroup(group.year, group.semester, true)
        
        generateFacultyGroupPDF({
          facultyName: user.faculty?.name || user.email || 'Faculty',
          department: user.faculty?.department || 'N/A',
          year: group.year,
          semester: group.semester,
          students: groupData.mentees.map(m => ({
            name: m.name,
            rollNumber: m.rollNumber,
            program: m.program,
            branch: m.branch
          })),
          meetings: (groupData.groupMeetings || []).map(gm => ({
            date: gm.date,
            time: gm.time,
            description: gm.description,
            status: gm.status,
            studentReviews: gm.students.map(s => ({
              studentName: s.name,
              rollNumber: s.rollNumber,
              review: s.review || ''
            }))
          }))
        })
      }

      toast({
        title: "Success",
        description: `Downloaded ${activeGroups.length} group report(s)`
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to generate reports',
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  const stats = data?.stats || {
    totalMentees: 0,
    activeMentees: 0,
    pastMentees: 0,
    totalMeetings: 0,
    completedMeetings: 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentees</h1>
          <p className="text-muted-foreground">
            Manage and view your assigned students, {facultyName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleDownloadAllGroups}
            disabled={activeGroups.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export All Groups
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            {department}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMentees}</p>
                <p className="text-xs text-muted-foreground">Total Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeMentees}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pastMentees}</p>
                <p className="text-xs text-muted-foreground">Past</p>
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
                <p className="text-2xl font-bold">{stats.totalMeetings}</p>
                <p className="text-xs text-muted-foreground">Total Meetings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedMeetings}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Mentee Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Active Mentee Groups
          </CardTitle>
          <CardDescription>Your current students grouped by year and semester</CardDescription>
        </CardHeader>
        <CardContent>
          {activeGroups.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No Active Mentees</h3>
              <p className="text-muted-foreground mt-2">
                You don&apos;t have any students assigned to you currently.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGroups.map((group) => (
                <Card 
                  key={group.key} 
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                  onClick={() => navigateToGroup(group.year, group.semester, true)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          Year {group.year}, Sem {group.semester}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {group.mentees.length} student{group.mentees.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {group.mentees.slice(0, 3).map((m, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {m.name.split(' ')[0]}
                        </Badge>
                      ))}
                      {group.mentees.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.mentees.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Mentee Groups */}
      {pastGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Past Mentee Groups
            </CardTitle>
            <CardDescription>Students you have mentored previously</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastGroups.map((group) => (
                <Card 
                  key={group.key} 
                  className="cursor-pointer hover:shadow-md transition-all opacity-75 hover:opacity-100"
                  onClick={() => navigateToGroup(group.year, group.semester, false)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          Year {group.year}, Sem {group.semester}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {group.mentees.length} student{group.mentees.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Past</Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Schedule Meeting Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Meetings
            </DialogTitle>
            <DialogDescription>
              Schedule multiple meetings with {selectedStudentName}
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
              {meetingDates.filter(m => m.date && m.time).length} meeting(s) ready to schedule
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMeetings} disabled={scheduling}>
              {scheduling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule {meetingDates.filter(m => m.date && m.time).length} Meeting(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
