"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, PendingRequest, PendingRequestsResponse } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase, FolderKanban, Clock, CheckCircle, XCircle, User, CalendarDays, Loader2, AlertCircle, ClipboardList, Plus } from "lucide-react"

export default function FacultyRequests() {
  const [requestsData, setRequestsData] = useState<PendingRequestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPendingRequests()
      setRequestsData(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load pending requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const getTypeIcon = (type: string) => type === 'INTERNSHIP' ? <Briefcase className="h-5 w-5 text-blue-500" /> : <FolderKanban className="h-5 w-5 text-purple-500" />
  const getTypeBadge = (type: string) => type === 'INTERNSHIP' ? <Badge className="bg-blue-100 text-blue-700">Internship</Badge> : <Badge className="bg-purple-100 text-purple-700">Project</Badge>

  const handleAction = (request: PendingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setFeedback('')
    setActionError(null)
  }

  const closeDialog = () => { setSelectedRequest(null); setActionType(null); setFeedback(''); setActionError(null) }

  const handleSubmitAction = async () => {
    if (!selectedRequest || !actionType) return
    if (actionType === 'reject' && !feedback.trim()) { setActionError('Feedback required for rejection'); return }
    try {
      setActionLoading(true)
      if (actionType === 'approve') await api.approveRequest(selectedRequest.id, feedback || undefined)
      else await api.rejectRequest(selectedRequest.id, feedback)
      closeDialog()
      fetchRequests()
    } catch (err) {
      console.error(err)
      setActionError('Action failed')
    } finally { setActionLoading(false) }
  }

  const internshipRequests = requestsData?.requests.filter(r => r.type === 'INTERNSHIP') || []
  const projectRequests = requestsData?.requests.filter(r => r.type === 'PROJECT') || []

  if (loading) return (
    <DashboardLayout requiredRoles={["HOD","FACULTY"]}>
      <div className="space-y-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout requiredRoles={["HOD","FACULTY"]}>
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout requiredRoles={["HOD","FACULTY"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Requests</h1>
          <p className="text-muted-foreground">Review and approve student internship and project requests</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
                <div><p className="text-2xl font-bold">{requestsData?.total || 0}</p><p className="text-sm text-muted-foreground">Total Pending</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Briefcase className="h-5 w-5 text-blue-600" /></div>
                <div><p className="text-2xl font-bold">{internshipRequests.length}</p><p className="text-sm text-muted-foreground">Internship Requests</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><FolderKanban className="h-5 w-5 text-purple-600" /></div>
                <div><p className="text-2xl font-bold">{projectRequests.length}</p><p className="text-sm text-muted-foreground">Project Requests</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({requestsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="internships">Internships ({internshipRequests.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projectRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {requestsData?.requests && requestsData.requests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {requestsData.requests.map((r) => (
                  <div key={r.id}>{/* small card */}
                    <Card className="hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(r.type)}
                            <div>
                              <CardTitle className="text-lg">{r.type === 'INTERNSHIP' ? (r.requestData as any)?.organisation || 'Internship' : (r.requestData as any)?.title || 'Project'}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1"><CalendarDays className="h-3 w-3" />{new Date(r.createdAt).toLocaleDateString()}</CardDescription>
                            </div>
                          </div>
                          {getTypeBadge(r.type)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                          <div>
                            <p className="font-medium">{r.student.name}</p>
                            <p className="text-sm text-muted-foreground">{r.student.rollNumber} • {r.student.branch} • Year {r.student.year}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-4 border-t">
                        <Button className="flex-1" onClick={() => handleAction(r, 'approve')}><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
                        <Button variant="destructive" className="flex-1" onClick={() => handleAction(r, 'reject')}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Pending Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{actionType === 'approve' ? 'Approve Request' : 'Reject Request'}</DialogTitle>
              <DialogDescription>{actionType === 'approve' ? 'Approving will create the record.' : 'Provide reason for rejection.'}</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">{getTypeIcon(selectedRequest.type)}<span className="font-medium">{selectedRequest.type === 'INTERNSHIP' ? (selectedRequest.requestData as any)?.organisation : (selectedRequest.requestData as any)?.title}</span></div>
                  <p className="text-sm text-muted-foreground">Student: {selectedRequest.student.name} ({selectedRequest.student.rollNumber})</p>
                </div>
                <div className="space-y-2">
                  <Label>Feedback {actionType === 'reject' && <span className="text-red-500">*</span>}</Label>
                  <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} />
                </div>
                {actionError && <div className="text-sm text-red-500">{actionError}</div>}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>Cancel</Button>
              <Button variant={actionType === 'approve' ? 'default' : 'destructive'} onClick={handleSubmitAction} disabled={actionLoading}>{actionType === 'approve' ? 'Approve' : 'Reject'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
