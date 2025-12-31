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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  UserCheck,
  Calendar,
  Target,
  BookOpen,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Mail,
  Search,
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

export default function MenteeMentorPage() {
  const { user } = useAuth()
  const [mentor, setMentor] = useState<any>(null)
  const [availableMentors, setAvailableMentors] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [requestMessage, setRequestMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const relationships = storage.getRelationships()
    const users = storage.getUsers()

    const myRelationship = relationships.find((r) => r.menteeId === user.id && r.status === "active")
    const mentorData = myRelationship ? users.find((u) => u.id === myRelationship.mentorId) : null

    if (mentorData) {
      setMentor({
        id: mentorData.id,
        name: mentorData.name,
        email: mentorData.email,
        department: mentorData.department,
        expertise: mentorData.expertise,
        bio: mentorData.bio,
      })
    }

    const mentors = users.filter((u) => u.role === "mentor")
    setAvailableMentors(
      mentors.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        department: m.department,
        expertise: m.expertise,
        bio: m.bio,
      })),
    )
  }

  const handleRequestMentor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedMentor) return

    const newRequest: Request = {
      id: Date.now().toString(),
      type: "mentor-assignment",
      requesterId: user.id,
      targetUserId: selectedMentor.id,
      title: `Mentor Assignment Request: ${selectedMentor.name}`,
      description: requestMessage,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allRequests = storage.getRequests()
    storage.setRequests([...allRequests, newRequest])

    setIsDialogOpen(false)
    setSelectedMentor(null)
    setRequestMessage("")
  }

  const filteredMentors = availableMentors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.expertise?.some((e: string) => e.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <DashboardLayout navigation={navigation} requiredRole="mentee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentor</h1>
          <p className="text-muted-foreground mt-1">Your assigned mentor and available mentors</p>
        </div>

        {mentor ? (
          <Card>
            <CardHeader>
              <CardTitle>Current Mentor</CardTitle>
              <CardDescription>Your assigned mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-xl">{mentor.name}</p>
                <p className="text-sm text-muted-foreground">{mentor.department}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {mentor.email}
              </div>

              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((exp: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {mentor.bio && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">About:</p>
                  <p className="text-sm text-muted-foreground">{mentor.bio}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button asChild>
                  <a href="/dashboard/mentee/meetings">Schedule Meeting</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/dashboard/mentee/messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">You don't have an assigned mentor yet</p>
              <p className="text-sm text-muted-foreground mb-4">Browse available mentors below and send a request</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Available Mentors</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentorItem) => (
              <Card key={mentorItem.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{mentorItem.name}</CardTitle>
                  <CardDescription>{mentorItem.department}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mentorItem.expertise && mentorItem.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mentorItem.expertise.slice(0, 3).map((exp: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {mentorItem.bio && <p className="text-sm text-muted-foreground line-clamp-2">{mentorItem.bio}</p>}

                  <Dialog
                    open={isDialogOpen && selectedMentor?.id === mentorItem.id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setSelectedMentor(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={mentor !== null}
                        onClick={() => setSelectedMentor(mentorItem)}
                      >
                        {mentor ? "Already Assigned" : "Request Mentor"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Mentor</DialogTitle>
                        <DialogDescription>Send a request to {mentorItem.name}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleRequestMentor} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            placeholder="Tell the mentor why you'd like them to be your mentor..."
                            rows={4}
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false)
                              setSelectedMentor(null)
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1">
                            Send Request
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
