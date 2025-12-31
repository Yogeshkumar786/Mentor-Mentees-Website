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
import { Users, Calendar, FileCheck, MessageSquare, LayoutDashboard, Settings, Plus, Clock, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import type { Meeting } from "@/lib/types"

const navigation = [
  { label: "Overview", href: "/dashboard/mentor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "My Mentees", href: "/dashboard/mentor/mentees", icon: <Users className="w-4 h-4" /> },
  { label: "Meetings", href: "/dashboard/mentor/meetings", icon: <Calendar className="w-4 h-4" /> },
  { label: "Requests", href: "/dashboard/mentor/requests", icon: <FileCheck className="w-4 h-4" /> },
  { label: "Messages", href: "/dashboard/mentor/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Profile", href: "/dashboard/mentor/profile", icon: <Settings className="w-4 h-4" /> },
]

export default function MentorMeetingsPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<any[]>([])
  const [mentees, setMentees] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all")

  const [formData, setFormData] = useState({
    menteeId: "",
    title: "",
    description: "",
    scheduledAt: "",
    duration: "60",
    location: "",
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

    const myMeetings = allMeetings.filter((m) => m.mentorId === user.id)

    const meetingsList = myMeetings.map((m) => {
      const mentee = users.find((u) => u.id === m.menteeId)
      return {
        ...m,
        menteeName: mentee?.name || "Unknown",
      }
    })

    setMeetings(meetingsList)

    const myRelationships = relationships.filter((r) => r.mentorId === user.id && r.status === "active")
    const menteesList = myRelationships.map((r) => {
      const mentee = users.find((u) => u.id === r.menteeId)
      return {
        id: mentee?.id || "",
        name: mentee?.name || "Unknown",
      }
    })
    setMentees(menteesList)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      mentorId: user.id,
      menteeId: formData.menteeId,
      title: formData.title,
      description: formData.description,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      duration: Number.parseInt(formData.duration),
      location: formData.location,
      meetingType: formData.meetingType,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allMeetings = storage.getMeetings()
    storage.setMeetings([...allMeetings, newMeeting])

    setIsDialogOpen(false)
    setFormData({
      menteeId: "",
      title: "",
      description: "",
      scheduledAt: "",
      duration: "60",
      location: "",
      meetingType: "in-person",
    })
    loadData()
  }

  const handleCancelMeeting = (meetingId: string) => {
    const allMeetings = storage.getMeetings()
    const updated = allMeetings.map((m) => (m.id === meetingId ? { ...m, status: "cancelled" as const } : m))
    storage.setMeetings(updated)
    loadData()
  }

  const filteredMeetings = meetings.filter((m) => (filter === "all" ? true : m.status === filter))

  return (
    <DashboardLayout navigation={navigation} requiredRole="mentor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground mt-1">Manage your mentoring sessions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
                <DialogDescription>Create a new meeting with one of your mentees</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menteeId">Mentee</Label>
                  <Select
                    value={formData.menteeId}
                    onValueChange={(value) => setFormData({ ...formData, menteeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mentee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentees.map((mentee) => (
                        <SelectItem key={mentee.id} value={mentee.id}>
                          {mentee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Career Planning Discussion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Meeting agenda and topics"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Date & Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>
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

                <div className="space-y-2">
                  <Label htmlFor="location">Location / Meeting Link</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Room number or video call link"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Schedule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
                      <CardDescription>with {meeting.menteeName}</CardDescription>
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
                      {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                      {meeting.duration} min)
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

                  {meeting.status === "scheduled" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleCancelMeeting(meeting.id)}>
                        Cancel Meeting
                      </Button>
                    </div>
                  )}
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
      </div>
    </DashboardLayout>
  )
}
