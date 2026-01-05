"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, StudentMentorsResponse, MentorData, StudentMeetingRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  UserCheck, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
  History,
  CalendarPlus
} from "lucide-react"

export function StudentMentorView() {
  const router = useRouter()
  const [mentorsData, setMentorsData] = useState<StudentMentorsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [meetingForm, setMeetingForm] = useState<StudentMeetingRequest>({
    mentorshipId: '',
    date: '',
    time: '10:00',
    description: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const data = await api.getStudentMentors()
        setMentorsData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mentors')
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  const handleMentorClick = (mentorshipId: string) => {
    router.push(`/mentor/${mentorshipId}`)
  }

  const openMeetingDialog = (mentorshipId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMeetingForm({
      mentorshipId,
      date: '',
      time: '10:00',
      description: ''
    })
    setMeetingDialogOpen(true)
  }

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!meetingForm.date) {
      toast({
        title: "Validation Error",
        description: "Please select a date for the meeting",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      await api.createMeetingRequest(meetingForm)
      toast({
        title: "Meeting Request Submitted",
        description: "Your meeting request has been sent to your mentor for approval.",
      })
      setMeetingDialogOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit meeting request',
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Not available'
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2')
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
      </div>
    )
  }

  const MentorCard = ({ mentor, isCurrent = false }: { mentor: MentorData, isCurrent?: boolean }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${isCurrent ? 'border-green-500 dark:border-green-700' : ''}`}
      onClick={() => handleMentorClick(mentor.mentorshipId)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isCurrent ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
              <UserCheck className={`h-6 w-6 ${isCurrent ? 'text-green-600' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{mentor.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Building2 className="h-3 w-3" />
                {mentor.department}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCurrent && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={(e) => openMeetingDialog(mentor.mentorshipId, e)}
              >
                <CalendarPlus className="h-4 w-4" />
                Request Meeting
              </Button>
            )}
            {isCurrent ? (
              <Badge className="bg-green-600">Current Mentor</Badge>
            ) : (
              <Badge variant="secondary">Past Mentor</Badge>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {mentor.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="truncate">{mentor.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span>{formatPhone(mentor.phone)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Year/Sem:</span>
            <span>Year {mentor.year}, Semester {mentor.semester}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Period:</span>
            <span>{formatDate(mentor.startDate)} - {mentor.endDate ? formatDate(mentor.endDate) : 'Present'}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" className="w-full gap-2">
            View Meetings & Reviews
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Mentors</h1>
        <p className="text-muted-foreground">View your current and past mentors, meetings, and reviews</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentorsData?.currentMentor ? 1 : 0}</p>
                <p className="text-sm text-muted-foreground">Current Mentor</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentorsData?.pastMentors.length || 0}</p>
                <p className="text-sm text-muted-foreground">Past Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Mentor Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          Current Mentor
        </h2>
        
        {mentorsData?.currentMentor ? (
          <MentorCard mentor={mentorsData.currentMentor} isCurrent={true} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No Current Mentor Assigned</h3>
              <p className="text-muted-foreground mt-2">
                You don&apos;t have an active mentor at the moment. Please contact your department HOD.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Mentors Section */}
      {mentorsData?.pastMentors && mentorsData.pastMentors.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Past Mentors
          </h2>
          
          <div className="grid gap-4">
            {mentorsData.pastMentors.map((mentor) => (
              <MentorCard key={mentor.mentorshipId} mentor={mentor} isCurrent={false} />
            ))}
          </div>
        </div>
      )}

      {/* No mentors at all */}
      {!mentorsData?.currentMentor && (!mentorsData?.pastMentors || mentorsData.pastMentors.length === 0) && (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No Mentor History</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              You haven&apos;t been assigned to any mentor yet. Please contact your department HOD for mentor assignment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Meeting Request Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request a Meeting</DialogTitle>
            <DialogDescription>
              Submit a meeting request to your mentor. They will review and approve it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMeetingSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What do you want to discuss in this meeting?"
                  rows={3}
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
