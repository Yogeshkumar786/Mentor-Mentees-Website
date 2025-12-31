"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentRequestsResponse, StudentRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Plus
} from "lucide-react"

export default function RequestsPage() {
  const [requestsData, setRequestsData] = useState<StudentRequestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

    fetchRequests()
  }, [])

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
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'PROJECT':
        return <FolderKanban className="h-5 w-5 text-purple-500" />
      default:
        return <ClipboardList className="h-5 w-5" />
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
    const isInternship = request.type === 'INTERNSHIP'
    const data = request.requestData
    
    // Handle null requestData
    if (!data) {
      return (
        <Card key={request.id} className={request.status === 'REJECTED' ? 'border-red-200 dark:border-red-900' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(request.type)}
                <div>
                  <CardTitle className="text-lg">
                    {isInternship ? 'Internship Request' : 'Project Request'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(request.createdAt)}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Request details not available</p>
          </CardContent>
        </Card>
      )
    }
    
    return (
      <Card key={request.id} className={request.status === 'REJECTED' ? 'border-red-200 dark:border-red-900' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon(request.type)}
              <div>
                <CardTitle className="text-lg">
                  {isInternship 
                    ? (data as { organisation?: string }).organisation || 'Internship Request'
                    : (data as { title?: string }).title || 'Project Request'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(request.createdAt)}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(request.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            {isInternship ? (
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

  const pendingRequests = requestsData?.requests.filter(r => r.status === 'PENDING') || []
  const approvedRequests = requestsData?.requests.filter(r => r.status === 'APPROVED') || []
  const rejectedRequests = requestsData?.requests.filter(r => r.status === 'REJECTED') || []

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

        {/* Requests Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({requestsData?.summary.total || 0})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
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
      </div>
    </DashboardLayout>
  )
}
