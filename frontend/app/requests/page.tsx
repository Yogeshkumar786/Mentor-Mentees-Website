"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import FacultyRequests from "@/components/faculty-requests"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentRequestsResponse, StudentRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle,
  Briefcase,
  FolderKanban,
  Loader2,
  AlertCircle,
  CalendarDays,
  User,
  Plus,
  Trash2,
  Search
} from "lucide-react"

export default function RequestsPage() {
  const { user } = useAuth()
  const [requestsData, setRequestsData] = useState<StudentRequestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; requestId: string | null }>({ open: false, requestId: null })
  const [cancelling, setCancelling] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { toast } = useToast()

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await api.getStudentRequests()
      setRequestsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    // If student, fetch student requests. Faculty/HOD will use FacultyRequests component.
    if (user.role === 'STUDENT') {
      fetchRequests()
    }
  }, [user])

  const handleCancelRequest = async () => {
    if (!cancelDialog.requestId) return
    
    try {
      setCancelling(true)
      await api.cancelRequest(cancelDialog.requestId)
      toast({
        title: "Request Cancelled",
        description: "Your request has been cancelled successfully",
      })
      fetchRequests()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to cancel request',
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
      setCancelDialog({ open: false, requestId: null })
    }
  }

  if (!user) {
    return null
  }

  // If faculty or hod, render faculty requests UI
  if (user.role === 'FACULTY' || user.role === 'HOD') {
    return <FacultyRequests />
  }

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INTERNSHIP':
      case 'DELETE_INTERNSHIP':
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'PROJECT':
      case 'DELETE_PROJECT':
        return <FolderKanban className="h-5 w-5 text-purple-500" />
      case 'MEETING_REQUEST':
        return <CalendarDays className="h-5 w-5 text-green-500" />
      default:
        return <ClipboardList className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INTERNSHIP':
        return 'Add Internship'
      case 'PROJECT':
        return 'Add Project'
      case 'DELETE_INTERNSHIP':
        return 'Delete Internship'
      case 'DELETE_PROJECT':
        return 'Delete Project'
      case 'MEETING_REQUEST':
        return 'Meeting Request'
      default:
        return type
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

  const renderRequestCard = (request: StudentRequest) => {
    const isInternship = request.type === 'INTERNSHIP' || request.type === 'DELETE_INTERNSHIP'
    const isDelete = request.type.startsWith('DELETE_')
    const data = request.requestData
    
    // Handle null requestData
    if (!data) {
      return (
        <Card key={request.id} className={`${request.status === 'REJECTED' ? 'border-red-200 dark:border-red-900' : ''} ${isDelete ? 'border-orange-300 dark:border-orange-800' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(request.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {getTypeLabel(request.type)}
                    </CardTitle>
                    {isDelete && <Badge variant="outline" className="text-orange-600 border-orange-600">Delete</Badge>}
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(request.createdAt)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(request.status)}
                {request.status === 'PENDING' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setCancelDialog({ open: true, requestId: request.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Request details not available</p>
          </CardContent>
        </Card>
      )
    }
    
    // Get display title based on request type
    const getDisplayTitle = () => {
      if (request.type === 'DELETE_INTERNSHIP') {
        return (data as { organisation?: string }).organisation || 'Delete Internship'
      } else if (request.type === 'DELETE_PROJECT') {
        return (data as { title?: string }).title || 'Delete Project'
      } else if (request.type === 'INTERNSHIP') {
        return (data as { organisation?: string }).organisation || 'Internship Request'
      } else if (request.type === 'MEETING_REQUEST') {
        return `Meeting with ${(data as { facultyName?: string }).facultyName || 'Mentor'}`
      } else {
        return (data as { title?: string }).title || 'Project Request'
      }
    }

    const isMeetingRequest = request.type === 'MEETING_REQUEST'
    
    return (
      <Card key={request.id} className={`${request.status === 'REJECTED' ? 'border-red-200 dark:border-red-900' : ''} ${isDelete ? 'border-orange-300 dark:border-orange-800' : ''} ${isMeetingRequest ? 'border-green-300 dark:border-green-800' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon(request.type)}
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{getDisplayTitle()}</CardTitle>
                  {isDelete && <Badge variant="outline" className="text-orange-600 border-orange-600">Delete Request</Badge>}
                  {isMeetingRequest && <Badge variant="outline" className="text-green-600 border-green-600">Meeting</Badge>}
                </div>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(request.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(request.status)}
              {request.status === 'PENDING' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setCancelDialog({ open: true, requestId: request.id })}
                  title="Cancel request"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isDelete && (data as { reason?: string }).reason && (
            <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded text-sm">
              <span className="text-muted-foreground">Reason for deletion:</span>
              <p className="mt-1">{(data as { reason?: string }).reason}</p>
            </div>
          )}
          {isMeetingRequest && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{(data as { date?: string }).date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{(data as { time?: string }).time || '10:00'}</span>
              </div>
              {(data as { description?: string }).description && (
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{(data as { description?: string }).description}</p>
                </div>
              )}
            </div>
          )}
          <div className="grid gap-2 text-sm">
            {isInternship && !isMeetingRequest ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{(data as { type?: string }).type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{(data as { location?: string }).location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{(data as { duration?: string }).duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stipend:</span>
                  <span>₹{((data as { stipend?: number }).stipend || 0).toLocaleString('en-IN')}/month</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{(data as { description?: string }).description}</p>
                </div>
                {(data as { technologies?: string[] }).technologies && (data as { technologies?: string[] }).technologies!.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(data as { technologies?: string[] }).technologies!.map((tech: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Semester:</span>
              <span>{(data as { semester?: number }).semester}</span>
            </div>
          </div>

          {request.assignedTo && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium">{request.assignedTo.name}</span>
            </div>
          )}

          {request.remarks && (
            <div className="text-sm">
              <span className="text-muted-foreground">Your remarks:</span>
              <p className="mt-1 italic">{request.remarks}</p>
            </div>
          )}

          {request.feedback && (
            <div className={`text-sm p-2 rounded ${request.status === 'APPROVED' ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <span className="text-muted-foreground">Feedback:</span>
              <p className="mt-1">{request.feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Filter requests based on search and type
  const filterRequests = (requests: StudentRequest[]) => {
    return requests.filter(r => {
      // Type filter
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const data = r.requestData as unknown as Record<string, unknown>
        const searchableText = [
          data?.organisation,
          data?.title,
          data?.type,
          data?.location,
          data?.description,
          r.remarks,
          r.feedback
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchableText.includes(query)) return false
      }
      
      return true
    })
  }

  const allFilteredRequests = filterRequests(requestsData?.requests || [])
  const pendingRequests = filterRequests(requestsData?.requests.filter(r => r.status === 'PENDING') || [])
  const approvedRequests = filterRequests(requestsData?.requests.filter(r => r.status === 'APPROVED') || [])
  const rejectedRequests = filterRequests(requestsData?.requests.filter(r => r.status === 'REJECTED') || [])

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
            <p className="text-muted-foreground">Track the status of your internship and project requests</p>
          </div>
          <div className="flex gap-2">
            <Link href="/internships">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <Briefcase className="h-4 w-4" />
                New Internship
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <FolderKanban className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requestsData?.summary.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requestsData?.summary.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requestsData?.summary.approved || 0}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requestsData?.summary.rejected || 0}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="DELETE_INTERNSHIP">Delete Internship</SelectItem>
                  <SelectItem value="DELETE_PROJECT">Delete Project</SelectItem>
                  <SelectItem value="MEETING_REQUEST">Meeting Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({allFilteredRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allFilteredRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {allFilteredRequests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  {requestsData?.requests && requestsData.requests.length > 0 ? (
                    <>
                      <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold">No Matching Requests</h3>
                      <p className="text-muted-foreground mt-2">
                        Try adjusting your search or filter criteria
                      </p>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold">No Requests Yet</h3>
                      <p className="text-muted-foreground mt-2 mb-6">
                        You haven&apos;t submitted any requests yet. Add a new internship or project to get started!
                      </p>
                      <div className="flex justify-center gap-4">
                        <Link href="/internships">
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            <Briefcase className="h-4 w-4" />
                            Add Internship
                          </Button>
                        </Link>
                        <Link href="/projects">
                          <Button variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            <FolderKanban className="h-4 w-4" />
                            Add Project
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRequests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Pending Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {approvedRequests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Approved Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {rejectedRequests.map(renderRequestCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">No Rejected Requests</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, requestId: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelRequest} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={cancelling}
              >
                {cancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Yes, cancel request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
