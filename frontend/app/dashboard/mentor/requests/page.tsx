"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  FileCheck,
  MessageSquare,
  LayoutDashboard,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"

const navigation = [
  { label: "Overview", href: "/dashboard/mentor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "My Mentees", href: "/dashboard/mentor/mentees", icon: <Users className="w-4 h-4" /> },
  { label: "Meetings", href: "/dashboard/mentor/meetings", icon: <Calendar className="w-4 h-4" /> },
  { label: "Requests", href: "/dashboard/mentor/requests", icon: <FileCheck className="w-4 h-4" /> },
  { label: "Messages", href: "/dashboard/mentor/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Profile", href: "/dashboard/mentor/profile", icon: <Settings className="w-4 h-4" /> },
]

export default function MentorRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return

    const allRequests = storage.getRequests()
    const users = storage.getUsers()

    const myRequests = allRequests.filter((r) => r.targetUserId === user.id || r.requesterId === user.id)

    const requestsList = myRequests.map((r) => {
      const requester = users.find((u) => u.id === r.requesterId)
      const targetUser = r.targetUserId ? users.find((u) => u.id === r.targetUserId) : null

      return {
        ...r,
        requesterName: requester?.name || "Unknown",
        targetUserName: targetUser?.name || "N/A",
        isIncoming: r.targetUserId === user.id,
      }
    })

    setRequests(requestsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const filteredRequests = requests.filter((r) => (filter === "all" ? true : r.status === filter))

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "mentor-assignment":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "meeting-request":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout navigation={navigation} requiredRole="mentor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
          <p className="text-muted-foreground mt-1">View your incoming and outgoing requests</p>
        </div>

        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
            Pending
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </Button>
        </div>

        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge variant="outline" className={`capitalize ${getRequestTypeColor(request.type)}`}>
                          {request.type.replace("-", " ")}
                        </Badge>
                        {request.isIncoming && (
                          <Badge variant="secondary" className="text-xs">
                            Incoming
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {request.isIncoming ? `From: ${request.requesterName}` : `To: ${request.targetUserName}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Submitted: {new Date(request.createdAt).toLocaleString()}</span>
                    {request.reviewedAt && <span>Reviewed: {new Date(request.reviewedAt).toLocaleString()}</span>}
                  </div>

                  {request.reviewNotes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Admin Notes:</p>
                      <p className="text-sm text-muted-foreground">{request.reviewNotes}</p>
                    </div>
                  )}

                  {request.status === "pending" && request.isIncoming && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        This request is awaiting admin approval
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No requests found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
