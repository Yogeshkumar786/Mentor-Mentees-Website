"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, FileCheck, MessageSquare, LayoutDashboard, Settings, Target, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import { Input } from "@/components/ui/input"

const navigation = [
  { label: "Overview", href: "/dashboard/mentor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "My Mentees", href: "/dashboard/mentor/mentees", icon: <Users className="w-4 h-4" /> },
  { label: "Meetings", href: "/dashboard/mentor/meetings", icon: <Calendar className="w-4 h-4" /> },
  { label: "Requests", href: "/dashboard/mentor/requests", icon: <FileCheck className="w-4 h-4" /> },
  { label: "Messages", href: "/dashboard/mentor/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Profile", href: "/dashboard/mentor/profile", icon: <Settings className="w-4 h-4" /> },
]

export default function MentorMenteesPage() {
  const { user } = useAuth()
  const [mentees, setMentees] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return

    const relationships = storage.getRelationships()
    const users = storage.getUsers()
    const meetings = storage.getMeetings()

    const myRelationships = relationships.filter((r) => r.mentorId === user.id && r.status === "active")

    const menteesList = myRelationships.map((r) => {
      const mentee = users.find((u) => u.id === r.menteeId)
      const menteeMeetings = meetings.filter((m) => m.menteeId === r.menteeId && m.mentorId === user.id)
      const lastMeeting = menteeMeetings
        .filter((m) => m.status === "completed")
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0]
      const nextMeeting = menteeMeetings
        .filter((m) => m.status === "scheduled" && new Date(m.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

      return {
        id: r.menteeId,
        relationshipId: r.id,
        name: mentee?.name || "Unknown",
        email: mentee?.email,
        department: mentee?.department,
        year: mentee?.year,
        bio: mentee?.bio,
        totalMeetings: menteeMeetings.length,
        lastMeeting: lastMeeting ? new Date(lastMeeting.scheduledAt).toLocaleDateString() : "No meetings yet",
        nextMeeting: nextMeeting ? new Date(nextMeeting.scheduledAt).toLocaleDateString() : "None scheduled",
      }
    })

    setMentees(menteesList)
  }, [user])

  const filteredMentees = mentees.filter((mentee) => mentee.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <DashboardLayout navigation={navigation} requiredRole="mentor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Mentees</h1>
            <p className="text-muted-foreground mt-1">Students under your guidance</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search mentees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentees.length > 0 ? (
            filteredMentees.map((mentee) => (
              <Card key={mentee.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{mentee.name}</CardTitle>
                  <CardDescription>
                    {mentee.year} • {mentee.department}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mentee.bio && <p className="text-sm text-muted-foreground line-clamp-2">{mentee.bio}</p>}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{mentee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last meeting: {mentee.lastMeeting}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{mentee.totalMeetings} total meetings</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`/dashboard/mentor/meetings?schedule=${mentee.id}`}>Schedule</a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/dashboard/mentor/messages?to=${mentee.id}`} aria-label="Send message">
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No mentees found matching your search" : "No mentees assigned yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
