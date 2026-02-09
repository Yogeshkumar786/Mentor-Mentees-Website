"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"
import { api, MeetingWindow, MeetingWindowStatus } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TimeSelect } from "@/components/ui/time-select"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  XCircle,
  CalendarPlus
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

export default function MeetingWindowsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState<MeetingWindow[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newWindow, setNewWindow] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    year: '',
    semester: ''
  })

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [windowToCancel, setWindowToCancel] = useState<MeetingWindow | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const fetchWindows = async () => {
    try {
      setLoading(true)
      const response = await api.getMeetingWindows()
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

  const handleCreateWindow = async () => {
    if (!newWindow.title || !newWindow.startDate || !newWindow.startTime || !newWindow.endDate || !newWindow.endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Combine date and time
    const startDateTime = new Date(`${newWindow.startDate}T${newWindow.startTime}`)
    const endDateTime = new Date(`${newWindow.endDate}T${newWindow.endTime}`)

    if (startDateTime >= endDateTime) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive"
      })
      return
    }

    if (endDateTime <= new Date()) {
      toast({
        title: "Invalid dates",
        description: "End date must be in the future",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)
      const result = await api.createMeetingWindow({
        title: newWindow.title,
        description: newWindow.description || undefined,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        year: newWindow.year ? parseInt(newWindow.year) : undefined,
        semester: newWindow.semester ? parseInt(newWindow.semester) : undefined
      })

      toast({
        title: "Success",
        description: result.message
      })

      setCreateDialogOpen(false)
      setNewWindow({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        year: '',
        semester: ''
      })
      fetchWindows()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create meeting window',
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleCancelWindow = async () => {
    if (!windowToCancel) return

    try {
      setCancelling(true)
      await api.cancelMeetingWindow(windowToCancel.id)

      toast({
        title: "Success",
        description: "Meeting window cancelled successfully"
      })

      setCancelDialogOpen(false)
      setWindowToCancel(null)
      fetchWindows()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to cancel meeting window',
        variant: "destructive"
      })
    } finally {
      setCancelling(false)
    }
  }

  const openCancelDialog = (window: MeetingWindow) => {
    setWindowToCancel(window)
    setCancelDialogOpen(true)
  }

  // Separate windows by status
  const activeWindows = windows.filter(w => w.status === 'ACTIVE')
  const upcomingWindows = windows.filter(w => w.status === 'UPCOMING')
  const closedWindows = windows.filter(w => w.status === 'CLOSED' || w.status === 'CANCELLED')

  if (loading) {
    return (
      <DashboardLayout requiredRoles={["HOD"]}>
        <div className="container py-6 flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={["HOD"]}>
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
    <DashboardLayout requiredRoles={["HOD"]}>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meeting Windows</h1>
            <p className="text-muted-foreground">
              Create and manage time frames for mentors to conduct meetings and submit reports
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Create Window
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Windows</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWindows.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingWindows.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedWindows.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Windows */}
        {activeWindows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Active Windows
              </CardTitle>
              <CardDescription>
                Windows currently open for faculty to submit reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeWindows.map(window => (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.title}</TableCell>
                      <TableCell>{formatDateTime(window.endDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{window.submittedReports || 0} / {window.totalReports || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(window.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/meeting-windows/${window.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openCancelDialog(window)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
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
                Upcoming Windows
              </CardTitle>
              <CardDescription>
                Scheduled windows that haven't started yet
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingWindows.map(window => (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.title}</TableCell>
                      <TableCell>{formatDateTime(window.startDate)}</TableCell>
                      <TableCell>{formatDateTime(window.endDate)}</TableCell>
                      <TableCell>{getStatusBadge(window.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openCancelDialog(window)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Closed Windows */}
        {closedWindows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                Past Windows
              </CardTitle>
              <CardDescription>
                Closed and cancelled windows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Status</TableHead>
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
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{window.submittedReports || 0} / {window.totalReports || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(window.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/meeting-windows/${window.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
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
              <h3 className="text-lg font-medium mb-2">No meeting windows yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first meeting window to start the process
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting Window
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Window Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-primary" />
                Create Meeting Window
              </DialogTitle>
              <DialogDescription>
                Set a time frame for mentors to conduct meetings and submit reports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Mid-Semester Meeting, End Semester Review"
                  value={newWindow.title}
                  onChange={(e) => setNewWindow({ ...newWindow, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Instructions (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any specific instructions for faculty..."
                  value={newWindow.description}
                  onChange={(e) => setNewWindow({ ...newWindow, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={newWindow.startDate}
                    onChange={(e) => setNewWindow({ ...newWindow, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <TimeSelect
                    value={newWindow.startTime}
                    onChange={(value) => setNewWindow({ ...newWindow, startTime: value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Date (Deadline) *</Label>
                  <Input
                    type="date"
                    value={newWindow.endDate}
                    onChange={(e) => setNewWindow({ ...newWindow, endDate: e.target.value })}
                    min={newWindow.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <TimeSelect
                    value={newWindow.endTime}
                    onChange={(value) => setNewWindow({ ...newWindow, endTime: value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1, 2, 3, 4"
                    min="1"
                    max="4"
                    value={newWindow.year}
                    onChange={(e) => setNewWindow({ ...newWindow, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semester (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1-8"
                    min="1"
                    max="8"
                    value={newWindow.semester}
                    onChange={(e) => setNewWindow({ ...newWindow, semester: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWindow} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Window
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Window Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Meeting Window</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel "{windowToCancel?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                No, keep it
              </Button>
              <Button variant="destructive" onClick={handleCancelWindow} disabled={cancelling}>
                {cancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Yes, cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
