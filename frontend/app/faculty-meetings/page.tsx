"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"
import { api, FacultyMeetingWindow, MeetingWindowStatus } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ArrowRight,
  AlertTriangle
} from "lucide-react"
import { formatDate } from "@/lib/utils"

function getStatusBadge(status: MeetingWindowStatus) {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-500">Active - Submit Now</Badge>
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

function getTimeRemaining(endDate: string) {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Expired'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours}h remaining`
  }
  return `${hours} hours remaining`
}

export default function FacultyMeetingWindowsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState<FacultyMeetingWindow[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchWindows = async () => {
    try {
      setLoading(true)
      const response = await api.getFacultyMeetingWindows()
      setWindows(response.windows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting windows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWindows()
  }, [])

  // Separate windows by action needed
  const activeNotSubmitted = windows.filter(w => w.status === 'ACTIVE' && !w.isSubmitted)
  const activeSubmitted = windows.filter(w => w.status === 'ACTIVE' && w.isSubmitted)
  const upcomingWindows = windows.filter(w => w.status === 'UPCOMING')
  const closedWindows = windows.filter(w => w.status === 'CLOSED' || w.status === 'CANCELLED')

  if (loading) {
    return (
      <DashboardLayout requiredRoles={["FACULTY", "HOD"]}>
        <div className="container py-6 flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={["FACULTY", "HOD"]}>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchWindows}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRoles={["FACULTY", "HOD"]}>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Meeting Reports</h1>
          <p className="text-muted-foreground">
            Submit meeting reports within the designated time windows
          </p>
        </div>

        {/* Action Required - Active windows not submitted */}
        {activeNotSubmitted.length > 0 && (
          <Card className="border-yellow-500 border-2">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Action Required
              </CardTitle>
              <CardDescription>
                These meeting windows are open and require your report submission
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {activeNotSubmitted.map(window => (
                  <div 
                    key={window.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{window.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Deadline: {formatDateTime(window.endDate)}
                        </span>
                        <span className="text-yellow-600 font-medium">
                          {getTimeRemaining(window.endDate)}
                        </span>
                      </div>
                      {window.description && (
                        <p className="text-sm text-muted-foreground mt-2">{window.description}</p>
                      )}
                    </div>
                    <Button onClick={() => router.push(`/faculty-meetings/${window.id}`)}>
                      Submit Report
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submitted Reports */}
        {activeSubmitted.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Submitted
              </CardTitle>
              <CardDescription>
                Reports you've already submitted for active windows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSubmitted.map(window => (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.title}</TableCell>
                      <TableCell>{formatDateTime(window.endDate)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Submitted</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/faculty-meetings/${window.id}`)}
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Windows */}
        {upcomingWindows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming
              </CardTitle>
              <CardDescription>
                Meeting windows scheduled for the future
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Closes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingWindows.map(window => (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.title}</TableCell>
                      <TableCell>{formatDateTime(window.startDate)}</TableCell>
                      <TableCell>{formatDateTime(window.endDate)}</TableCell>
                      <TableCell>{getStatusBadge(window.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Past Windows */}
        {closedWindows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Past Windows
              </CardTitle>
              <CardDescription>
                Closed meeting windows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Your Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedWindows.map(window => (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.title}</TableCell>
                      <TableCell>
                        {formatDate(window.startDate)} - {formatDate(window.endDate)}
                      </TableCell>
                      <TableCell>
                        {window.isSubmitted ? (
                          <Badge className="bg-green-500">Submitted</Badge>
                        ) : (
                          <Badge variant="destructive">Not Submitted</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {window.hasReport && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/faculty-meetings/${window.id}`)}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {windows.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No meeting windows</h3>
              <p className="text-muted-foreground">
                There are no meeting windows available at this time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
