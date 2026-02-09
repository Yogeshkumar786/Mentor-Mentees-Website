"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, MeetingWindowDetailsResponse, MeetingReport, MeetingWindowStatus } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  User,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { formatDate } from "@/lib/utils"

function getStatusBadge(status: MeetingWindowStatus) {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-500">Active</Badge>
    case 'UPCOMING':
      return <Badge className="bg-blue-500">Upcoming</Badge>
    case 'CLOSED':
      return <Badge variant="secondary">Closed</Badge>
    case 'CANCELLED':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export default function MeetingWindowDetailsPage({ params }: { params: Promise<{ windowId: string }> }) {
  const { windowId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MeetingWindowDetailsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Report details dialog
  const [selectedReport, setSelectedReport] = useState<MeetingReport | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  
  // Expanded reports
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set())

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const response = await api.getMeetingWindowDetails(windowId)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting window details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [windowId])

  const toggleReportExpand = (reportId: string) => {
    setExpandedReports(prev => {
      const next = new Set(prev)
      if (next.has(reportId)) {
        next.delete(reportId)
      } else {
        next.add(reportId)
      }
      return next
    })
  }

  const openReportDialog = (report: MeetingReport) => {
    setSelectedReport(report)
    setReportDialogOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout requiredRoles={["HOD"]}>
        <div className="container py-6 flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout requiredRoles={["HOD"]}>
        <div className="container py-6">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">{error || 'Failed to load data'}</p>
            <Button onClick={fetchDetails}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { window: windowData, reports, summary } = data

  return (
    <DashboardLayout requiredRoles={["HOD"]}>
      <div className="container py-6 space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.push('/meeting-windows')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meeting Windows
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{windowData.title}</h1>
              {getStatusBadge(windowData.status)}
            </div>
            {windowData.description && (
              <p className="text-muted-foreground">{windowData.description}</p>
            )}
          </div>
        </div>

        {/* Window Info */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Frame</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <span className="font-medium">Start:</span> {formatDateTime(windowData.startDate)}
              </p>
              <p className="text-sm">
                <span className="font-medium">End:</span> {formatDateTime(windowData.endDate)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.submittedReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pendingReports}</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Faculty Reports
            </CardTitle>
            <CardDescription>
              Reports submitted by faculty for this meeting window
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports have been created yet
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="border rounded-lg">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleReportExpand(report.id)}
                    >
                      <div className="flex items-center gap-4">
                        {expandedReports.has(report.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{report.faculty?.name}</span>
                            <span className="text-muted-foreground">({report.faculty?.employeeId})</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Year {report.year}, Semester {report.semester} • {report.studentCount} students
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {report.meetingDate && (
                            <p className="text-sm">
                              Meeting: {formatDate(report.meetingDate)}
                              {report.meetingTime && ` at ${formatTime(report.meetingTime)}`}
                            </p>
                          )}
                        </div>
                        {report.isSubmitted ? (
                          <Badge className="bg-green-500">Submitted</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                    </div>

                    {expandedReports.has(report.id) && (
                      <div className="border-t p-4 bg-muted/30">
                        {report.description && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Meeting Notes</h4>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                          </div>
                        )}
                        
                        <h4 className="text-sm font-medium mb-2">Student Attendance & Reviews</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Roll No</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Attended</TableHead>
                              <TableHead>Review</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.students.map(student => (
                              <TableRow key={student.id}>
                                <TableCell>{student.rollNumber}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>
                                  {student.attended ? (
                                    <Badge className="bg-green-500">Present</Badge>
                                  ) : (
                                    <Badge variant="destructive">Absent</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="max-w-md">
                                  <p className="text-sm truncate">
                                    {student.review || <span className="text-muted-foreground">No review</span>}
                                  </p>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {report.submittedAt && (
                          <p className="text-xs text-muted-foreground mt-4">
                            Submitted on {formatDateTime(report.submittedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
