"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserCheck,
  Calendar,
  Target,
  BookOpen,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Plus,
  Clock,
  MapPin,
} from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import type { Request } from "@/lib/types"

const navigation = [
  { label: "Overview", href: "/dashboard/mentee", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "My Mentor", href: "/dashboard/mentee/mentor", icon: <UserCheck className="w-4 h-4" /> },
  { label: "Meetings", href: "/dashboard/mentee/meetings", icon: <Calendar className="w-4 h-4" /> },
  { label: "Goals", href: "/dashboard/mentee/goals", icon: <Target className="w-4 h-4" /> },
  { label: "Academic Records", href: "/dashboard/mentee/academics", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Messages", href: "/dashboard/mentee/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Profile", href: "/dashboard/mentee/profile", icon: <Settings className="w-4 h-4" /> },
]

export default function MenteeMeetingsPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<any[]>([])
  const [mentor, setMentor] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    duration: "60",
    meetingType: "in-person" as "in-person" | "online" | "phone",
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const allMeetings = storage.getMeetings()
    const users = storage.getUsers()
    const relationships = storage.getRelationships()

    const myRelationship = relationships.find((r) => r.menteeId === user.id && r.status === "active")
    const mentorData = myRelationship ? users.find((u) => u.id === myRelationship.mentorId) : null

    if (mentorData) {
      setMentor({
        id: mentorData.id,
        name: mentorData.name,
      })
    }

    const myMeetings = allMeetings.filter((m) => m.menteeId === user.id)

    const meetingsList = myMeetings.map((m) => {
      const mentorData = users.find((u) => u.id === m.mentorId)
      return {
        ...m,
        mentorName: mentorData?.name || "Unknown",
      }
    })

    setMeetings(meetingsList)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !mentor) return

    // Create a meeting request
    const newRequest: Request = {
      id: Date.now().toString(),
      type: "meeting-request",
      requesterId: user.id,
      targetUserId: mentor.id,
      title: formData.title,
      description: `Preferred Date: ${formData.preferredDate}\nPreferred Time: ${formData.preferredTime}\nDuration: ${formData.duration} minutes\nType: ${formData.meetingType}\n\n${formData.description}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allRequests = storage.getRequests()
    storage.setRequests([...allRequests, newRequest])

    setIsDialogOpen(false)
    setFormData({
      title: "",
      description: "",
      preferredDate: "",
      preferredTime: "",
      duration: "60",
      meetingType: "in-person",
    })
  }

  const filteredMeetings = meetings.filter((m) => (filter === "all" ? true : m.status === filter))

  return (
    <DashboardLayout navigation={navigation} requiredRole="mentee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground mt-1">Your mentoring sessions</p>
          </div>
          {mentor && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Meeting</DialogTitle>
                  <DialogDescription>Send a meeting request to your mentor</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Career Guidance Session"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Purpose</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What would you like to discuss?"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Preferred Date</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Input
                        id="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingType">Meeting Type</Label>
                    <Select
                      value={formData.meetingType}
                      onValueChange={(value: any) => setFormData({ ...formData, meetingType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Send Request
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!mentor && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You need a mentor to schedule meetings</p>
              <Button asChild>
                <a href="/dashboard/mentee/mentor">Find a Mentor</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {mentor && (
          <>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              <Button
                variant={filter === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("scheduled")}
              >
                Scheduled
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("cancelled")}
              >
                Cancelled
              </Button>
            </div>

            <div className="space-y-4">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{meeting.title}</CardTitle>
                          <CardDescription>with {meeting.mentorName}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            meeting.status === "scheduled"
                              ? "default"
                              : meeting.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {meeting.description && <p className="text-sm text-muted-foreground">{meeting.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(meeting.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                          ({meeting.duration} min)
                        </div>
                        {meeting.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {meeting.location}
                          </div>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {meeting.meetingType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No meetings found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
