"use client"

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
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  Calendar,
  FileCheck,
  Settings,
  LayoutDashboard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import type { MentorMenteeRelationship, Meeting } from "@/lib/types"

const navigation = [
  { label: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Users", href: "/dashboard/admin/users", icon: <Users className="w-4 h-4" /> },
  { label: "Requests", href: "/dashboard/admin/requests", icon: <FileCheck className="w-4 h-4" /> },
  { label: "Meetings", href: "/dashboard/admin/meetings", icon: <Calendar className="w-4 h-4" /> },
  { label: "Reports", href: "/dashboard/admin/reports", icon: <FileText className="w-4 h-4" /> },
  { label: "Settings", href: "/dashboard/admin/settings", icon: <Settings className="w-4 h-4" /> },
]

export default function AdminRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allRequests = storage.getRequests()
    const users = storage.getUsers()

    const requestsList = allRequests.map((r) => {
      const requester = users.find((u) => u.id === r.requesterId)
      const targetUser = r.targetUserId ? users.find((u) => u.id === r.targetUserId) : null

      return {
        ...r,
        requesterName: requester?.name || "Unknown",
        targetUserName: targetUser?.name || "N/A",
      }
    })

    setRequests(requestsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const handleReview = (request: any, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setReviewAction(action)
    setIsDialogOpen(true)
  }

  const handleSubmitReview = () => {
    if (!user || !selectedRequest) return

    const allRequests = storage.getRequests()
    const updatedRequests = allRequests.map((r) => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status: reviewAction === "approve" ? ("approved" as const) : ("rejected" as const),
          reviewedBy: user.id,
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes,
        }
      }
      return r
    })
    storage.setRequests(updatedRequests)

    // If approved and it's a mentor assignment request, create the relationship
    if (reviewAction === "approve" && selectedRequest.type === "mentor-assignment") {
      const relationships = storage.getRelationships()
      const newRelationship: MentorMenteeRelationship = {
        id: Date.now().toString(),
        mentorId: selectedRequest.targetUserId,
        menteeId: selectedRequest.requesterId,
        status: "active",
        requestedBy: selectedRequest.requesterId,
        requestedAt: selectedRequest.createdAt,
        approvedAt: new Date().toISOString(),
        notes: reviewNotes,
      }
      storage.setRelationships([...relationships, newRelationship])
    }

    // If approved and it's a meeting request, create the meeting
    if (reviewAction === "approve" && selectedRequest.type === "meeting-request") {
      const meetings = storage.getMeetings()

      // Parse the description to extract meeting details
      const lines = selectedRequest.description.split("\n")
      const preferredDate = lines.find((l: string) => l.startsWith("Preferred Date:"))?.split(": ")[1] || ""
      const preferredTime = lines.find((l: string) => l.startsWith("Preferred Time:"))?.split(": ")[1] || ""
      const duration =
        lines
          .find((l: string) => l.startsWith("Duration:"))
          ?.split(": ")[1]
          ?.split(" ")[0] || "60"
      const type = lines.find((l: string) => l.startsWith("Type:"))?.split(": ")[1] || "in-person"

      const scheduledAt = new Date(`${preferredDate}T${preferredTime}`).toISOString()

      const newMeeting: Meeting = {
        id: Date.now().toString(),
        mentorId: selectedRequest.targetUserId,
        menteeId: selectedRequest.requesterId,
        title: selectedRequest.title,
        description: selectedRequest.description,
        scheduledAt: scheduledAt,
        duration: Number.parseInt(duration),
        meetingType: type as "in-person" | "online" | "phone",
        status: "scheduled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      storage.setMeetings([...meetings, newMeeting])
    }

    setIsDialogOpen(false)
    setSelectedRequest(null)
    setReviewNotes("")
    loadData()
  }

  const filteredRequests = requests.filter((r) => (filter === "all" ? true : r.status === filter))

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "mentor-assignment":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "meeting-request":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "role-change":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400"
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
    <DashboardLayout navigation={navigation} requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Management</h1>
          <p className="text-muted-foreground mt-1">Review and approve system requests</p>
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
                      </div>
                      <CardDescription>
                        From: {request.requesterName}
                        {request.targetUserName !== "N/A" && ` → To: ${request.targetUserName}`}
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
                      <p className="text-sm font-medium mb-1">Review Notes:</p>
                      <p className="text-sm text-muted-foreground">{request.reviewNotes}</p>
                    </div>
                  )}

                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleReview(request, "approve")}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReview(request, "reject")}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reviewAction === "approve" ? "Approve Request" : "Reject Request"}</DialogTitle>
              <DialogDescription>
                {reviewAction === "approve"
                  ? "Approve this request and provide optional notes"
                  : "Reject this request and provide a reason"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Notes {reviewAction === "reject" && "(Required)"}</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === "approve"
                      ? "Optional notes about the approval..."
                      : "Explain why this request is being rejected..."
                  }
                  rows={4}
                  required={reviewAction === "reject"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                variant={reviewAction === "approve" ? "default" : "destructive"}
                disabled={reviewAction === "reject" && !reviewNotes.trim()}
              >
                {reviewAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
