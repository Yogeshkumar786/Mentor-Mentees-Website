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
import { Briefcase, FolderKanban, Clock, CheckCircle, XCircle, User, CalendarDays, Loader2, AlertCircle, ClipboardList, Plus, CalendarPlus, Trash2 } from "lucide-react"

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INTERNSHIP': return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'PROJECT': return <FolderKanban className="h-5 w-5 text-purple-500" />
      case 'DELETE_INTERNSHIP': return <Trash2 className="h-5 w-5 text-orange-500" />
      case 'DELETE_PROJECT': return <Trash2 className="h-5 w-5 text-orange-500" />
      case 'MEETING_REQUEST': return <CalendarPlus className="h-5 w-5 text-green-500" />
      default: return <FolderKanban className="h-5 w-5 text-gray-500" />
    }
  }
  
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'INTERNSHIP': return <Badge className="bg-blue-100 text-blue-700">Internship</Badge>
      case 'PROJECT': return <Badge className="bg-purple-100 text-purple-700">Project</Badge>
      case 'DELETE_INTERNSHIP': return <Badge className="bg-orange-100 text-orange-700">Delete Internship</Badge>
      case 'DELETE_PROJECT': return <Badge className="bg-orange-100 text-orange-700">Delete Project</Badge>
      case 'MEETING_REQUEST': return <Badge className="bg-green-100 text-green-700">Meeting</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  const getRequestTitle = (r: PendingRequest) => {
    const data = r.requestData as Record<string, unknown>
    switch (r.type) {
      case 'INTERNSHIP': return data?.organisation as string || 'Internship'
      case 'PROJECT': return data?.title as string || 'Project'
      case 'DELETE_INTERNSHIP': return `Delete: ${data?.organisation as string || 'Internship'}`
      case 'DELETE_PROJECT': return `Delete: ${data?.title as string || 'Project'}`
      case 'MEETING_REQUEST': return `Meeting Request`
      default: return 'Request'
    }
  }

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
  const deleteRequests = requestsData?.requests.filter(r => r.type === 'DELETE_INTERNSHIP' || r.type === 'DELETE_PROJECT') || []
  const meetingRequests = requestsData?.requests.filter(r => r.type === 'MEETING_REQUEST') || []

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                <div><p className="text-2xl font-bold">{internshipRequests.length}</p><p className="text-sm text-muted-foreground">Internships</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><FolderKanban className="h-5 w-5 text-purple-600" /></div>
                <div><p className="text-2xl font-bold">{projectRequests.length}</p><p className="text-sm text-muted-foreground">Projects</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><Trash2 className="h-5 w-5 text-orange-600" /></div>
                <div><p className="text-2xl font-bold">{deleteRequests.length}</p><p className="text-sm text-muted-foreground">Delete Requests</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><CalendarPlus className="h-5 w-5 text-green-600" /></div>
                <div><p className="text-2xl font-bold">{meetingRequests.length}</p><p className="text-sm text-muted-foreground">Meetings</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({requestsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="internships">Internships ({internshipRequests.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projectRequests.length})</TabsTrigger>
            <TabsTrigger value="meetings">Meetings ({meetingRequests.length})</TabsTrigger>
            <TabsTrigger value="deletes">Delete ({deleteRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {requestsData?.requests && requestsData.requests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {requestsData.requests.map((r) => (
                  <div key={r.id}>
                    <Card className={`hover:shadow-md ${r.type === 'MEETING_REQUEST' ? 'border-green-200' : ''} ${r.type.startsWith('DELETE_') ? 'border-orange-200' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(r.type)}
                            <div>
                              <CardTitle className="text-lg">{getRequestTitle(r)}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1"><CalendarDays className="h-3 w-3" />{new Date(r.createdAt).toLocaleDateString()}</CardDescription>
                            </div>
                          </div>
                          {getTypeBadge(r.type)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                          <div>
                            <p className="font-medium">{r.student.name}</p>
                            <p className="text-sm text-muted-foreground">{r.student.rollNumber} • {r.student.branch} • Year {r.student.year}</p>
                          </div>
                        </div>
                        {r.type === 'MEETING_REQUEST' && (
                          <div className="p-3 bg-green-50 dark:bg-green-950 rounded space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date:</span>
                              <span className="font-medium">{(r.requestData as Record<string, unknown>)?.date as string}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{(r.requestData as Record<string, unknown>)?.time as string || '10:00'}</span>
                            </div>
                            {(r.requestData as Record<string, unknown>)?.description && (
                              <div>
                                <span className="text-muted-foreground">Description:</span>
                                <p className="mt-1">{(r.requestData as Record<string, unknown>)?.description as string}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {r.type.startsWith('DELETE_') && (r.requestData as Record<string, unknown>)?.reason && (
                          <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded text-sm">
                            <span className="text-muted-foreground">Reason:</span>
                            <p className="mt-1">{(r.requestData as Record<string, unknown>)?.reason as string}</p>
                          </div>
                        )}
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

          <TabsContent value="meetings" className="space-y-4">
            {meetingRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {meetingRequests.map((r) => (
                  <div key={r.id}>
                    <Card className="hover:shadow-md border-green-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(r.type)}
                            <div>
                              <CardTitle className="text-lg">{getRequestTitle(r)}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1"><CalendarDays className="h-3 w-3" />{new Date(r.createdAt).toLocaleDateString()}</CardDescription>
                            </div>
                          </div>
                          {getTypeBadge(r.type)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                          <div>
                            <p className="font-medium">{r.student.name}</p>
                            <p className="text-sm text-muted-foreground">{r.student.rollNumber} • {r.student.branch} • Year {r.student.year}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{(r.requestData as Record<string, unknown>)?.date as string}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium">{(r.requestData as Record<string, unknown>)?.time as string || '10:00'}</span>
                          </div>
                          {(r.requestData as Record<string, unknown>)?.description && (
                            <div>
                              <span className="text-muted-foreground">Description:</span>
                              <p className="mt-1">{(r.requestData as Record<string, unknown>)?.description as string}</p>
                            </div>
                          )}
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
                  <CalendarPlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Meeting Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deletes" className="space-y-4">
            {deleteRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {deleteRequests.map((r) => (
                  <div key={r.id}>
                    <Card className="hover:shadow-md border-orange-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(r.type)}
                            <div>
                              <CardTitle className="text-lg">{getRequestTitle(r)}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1"><CalendarDays className="h-3 w-3" />{new Date(r.createdAt).toLocaleDateString()}</CardDescription>
                            </div>
                          </div>
                          {getTypeBadge(r.type)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                          <div>
                            <p className="font-medium">{r.student.name}</p>
                            <p className="text-sm text-muted-foreground">{r.student.rollNumber} • {r.student.branch} • Year {r.student.year}</p>
                          </div>
                        </div>
                        {(r.requestData as Record<string, unknown>)?.reason && (
                          <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded text-sm">
                            <span className="text-muted-foreground">Reason:</span>
                            <p className="mt-1">{(r.requestData as Record<string, unknown>)?.reason as string}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-4 border-t">
                        <Button className="flex-1" onClick={() => handleAction(r, 'approve')}><CheckCircle className="h-4 w-4 mr-2" />Approve Delete</Button>
                        <Button variant="destructive" className="flex-1" onClick={() => handleAction(r, 'reject')}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Trash2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Delete Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{actionType === 'approve' ? 'Approve Request' : 'Reject Request'}</DialogTitle>
              <DialogDescription>
                {actionType === 'approve' 
                  ? (selectedRequest?.type === 'MEETING_REQUEST' ? 'Approving will schedule the meeting.' : selectedRequest?.type.startsWith('DELETE_') ? 'Approving will delete the record.' : 'Approving will create the record.')
                  : 'Provide reason for rejection.'
                }
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">{getTypeIcon(selectedRequest.type)}<span className="font-medium">{getRequestTitle(selectedRequest)}</span></div>
                  <p className="text-sm text-muted-foreground">Student: {selectedRequest.student.name} ({selectedRequest.student.rollNumber})</p>
                </div>
                {selectedRequest.type === 'MEETING_REQUEST' && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{(selectedRequest.requestData as Record<string, unknown>)?.date as string}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{(selectedRequest.requestData as Record<string, unknown>)?.time as string || '10:00'}</span>
                    </div>
                    {(selectedRequest.requestData as Record<string, unknown>)?.description && (
                      <div>
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1">{(selectedRequest.requestData as Record<string, unknown>)?.description as string}</p>
                      </div>
                    )}
                  </div>
                )}
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
