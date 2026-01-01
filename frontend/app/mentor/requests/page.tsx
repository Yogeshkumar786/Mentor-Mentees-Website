'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, PendingRequest, PendingRequestsResponse, InternshipRequestData, ProjectRequestData } from '@/lib/api'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Briefcase, 
  FolderKanban, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  CalendarDays,
  MapPin,
  Building2,
  Timer,
  IndianRupee,
  FileText,
  ClipboardList,
  GraduationCap,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function FacultyRequestsPage() {
  const [requestsData, setRequestsData] = useState<PendingRequestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
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
      console.error('Failed to fetch requests:', err)
      setError('Failed to load pending requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INTERNSHIP':
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'PROJECT':
        return <FolderKanban className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'INTERNSHIP':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Internship</Badge>
      case 'PROJECT':
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Project</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAction = (request: PendingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setFeedback('')
    setActionError(null)
  }

  const closeDialog = () => {
    setSelectedRequest(null)
    setActionType(null)
    setFeedback('')
    setActionError(null)
  }

  const handleSubmitAction = async () => {
    if (!selectedRequest || !actionType) return
    
    if (actionType === 'reject' && !feedback.trim()) {
      setActionError('Feedback is required when rejecting a request')
      return
    }

    try {
      setActionLoading(true)
      setActionError(null)
      
      if (actionType === 'approve') {
        await api.approveRequest(selectedRequest.id, feedback || undefined)
      } else {
        await api.rejectRequest(selectedRequest.id, feedback)
      }
      
      closeDialog()
      fetchRequests() // Refresh the list
    } catch (err) {
      console.error(`Failed to ${actionType} request:`, err)
      setActionError(`Failed to ${actionType} the request. Please try again.`)
    } finally {
      setActionLoading(false)
    }
  }

  const renderRequestDetails = (request: PendingRequest) => {
    const data = request.requestData
    const isInternship = request.type === 'INTERNSHIP'

    if (!data) {
      return <p className="text-sm text-muted-foreground">Request details not available</p>
    }

    if (isInternship) {
      const internship = data as InternshipRequestData
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Organisation:</span>
            </div>
            <span className="font-medium">{internship.organisation}</span>
            
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
            </div>
            <span>{internship.type}</span>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
            </div>
            <span>{internship.location}</span>
            
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
            </div>
            <span>{internship.duration}</span>
            
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Stipend:</span>
            </div>
            <span>₹{(internship.stipend || 0).toLocaleString('en-IN')}/month</span>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Semester:</span>
            </div>
            <span>{internship.semester}</span>
          </div>
        </div>
      )
    } else {
      const project = data as ProjectRequestData
      return (
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Title:</span>
            <p className="font-medium">{project.title}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Description:</span>
            <p className="text-sm mt-1">{project.description}</p>
          </div>
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Technologies:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Semester:</span>
            <span>{project.semester}</span>
          </div>
          {project.mentorName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Project Mentor:</span>
              <span>{project.mentorName}</span>
            </div>
          )}
        </div>
      )
    }
  }

  const renderRequestCard = (request: PendingRequest) => {
    const data = request.requestData
    const isInternship = request.type === 'INTERNSHIP'
    
    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon(request.type)}
              <div>
                <CardTitle className="text-lg">
                  {isInternship 
                    ? (data as InternshipRequestData)?.organisation || 'Internship Request'
                    : (data as ProjectRequestData)?.title || 'Project Request'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(request.createdAt)}
                </CardDescription>
              </div>
            </div>
            {getTypeBadge(request.type)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{request.student.name}</p>
              <p className="text-sm text-muted-foreground">
                {request.student.rollNumber} • {request.student.branch} • Year {request.student.year}
              </p>
            </div>
          </div>

          {/* Request Details Preview */}
          {renderRequestDetails(request)}

          {/* Student Remarks */}
          {request.remarks && (
            <div className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
              <span className="text-muted-foreground font-medium">Student&apos;s Remarks:</span>
              <p className="mt-1 italic">{request.remarks}</p>
            </div>
          )}

          {/* Assigned To (for HOD view) */}
          {request.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Assigned to: {request.assignedTo.name}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button 
            className="flex-1 gap-2" 
            onClick={() => handleAction(request, 'approve')}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 gap-2"
            onClick={() => handleAction(request, 'reject')}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const internshipRequests = requestsData?.requests.filter(r => r.type === 'INTERNSHIP') || []
  const projectRequests = requestsData?.requests.filter(r => r.type === 'PROJECT') || []

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['HOD', 'FACULTY']}>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={['HOD', 'FACULTY']}>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Requests</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchRequests}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRoles={['HOD', 'FACULTY']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Requests</h1>
          <p className="text-muted-foreground">Review and approve student internship and project requests</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requestsData?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{internshipRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Internship Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FolderKanban className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Project Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({requestsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="internships">Internships ({internshipRequests.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projectRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {requestsData?.requests && requestsData.requests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {requestsData.requests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Pending Requests</h3>
                  <p className="text-muted-foreground mt-2">
                    All student requests have been processed. Check back later for new submissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="internships" className="space-y-4">
            {internshipRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {internshipRequests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Pending Internship Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {projectRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {projectRequests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Pending Project Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Approve Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Reject Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This will approve the request and create the corresponding record for the student.'
                : 'Please provide a reason for rejecting this request. The student will be notified.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedRequest.type)}
                  <span className="font-medium">
                    {selectedRequest.type === 'INTERNSHIP' 
                      ? (selectedRequest.requestData as InternshipRequestData)?.organisation
                      : (selectedRequest.requestData as ProjectRequestData)?.title}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Student: {selectedRequest.student.name} ({selectedRequest.student.rollNumber})
                </p>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Feedback {actionType === 'reject' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder={actionType === 'approve' 
                    ? 'Optional: Add a note for the student...'
                    : 'Required: Explain why this request is being rejected...'}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>

              {actionError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {actionError}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitAction}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
