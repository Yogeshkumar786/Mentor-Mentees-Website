"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Calendar, FileCheck, Settings, LayoutDashboard, FileText, Clock, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"

const navigation = [
  { label: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Users", href: "/dashboard/admin/users", icon: <Users className="w-4 h-4" /> },
  { label: "Requests", href: "/dashboard/admin/requests", icon: <FileCheck className="w-4 h-4" /> },
  { label: "Meetings", href: "/dashboard/admin/meetings", icon: <Calendar className="w-4 h-4" /> },
  { label: "Reports", href: "/dashboard/admin/reports", icon: <FileText className="w-4 h-4" /> },
  { label: "Settings", href: "/dashboard/admin/settings", icon: <Settings className="w-4 h-4" /> },
]

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allMeetings = storage.getMeetings()
    const users = storage.getUsers()

    const meetingsList = allMeetings.map((m) => {
      const mentor = users.find((u) => u.id === m.mentorId)
      const mentee = users.find((u) => u.id === m.menteeId)

      return {
        ...m,
        mentorName: mentor?.name || "Unknown",
        menteeName: mentee?.name || "Unknown",
      }
    })

    setMeetings(meetingsList.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()))
  }

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.menteeName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" ? true : m.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout navigation={navigation} requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Meetings</h1>
          <p className="text-muted-foreground mt-1">Overview of all mentoring sessions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
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
        </div>

        <div className="space-y-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{meeting.title}</CardTitle>
                      <CardDescription>
                        {meeting.mentorName} (Mentor) with {meeting.menteeName} (Mentee)
                      </CardDescription>
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
