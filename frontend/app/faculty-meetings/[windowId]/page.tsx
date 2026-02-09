"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"
import { api, MeetingReport, MeetingReportStudent, MeetingWindowStatus } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimeSelect } from "@/components/ui/time-select"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Send,
  Plus,
  FileText
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

interface WindowData {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  status: MeetingWindowStatus
}

export default function FacultyMeetingReportPage({ params }: { params: Promise<{ windowId: string }> }) {
  const { windowId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [windowData, setWindowData] = useState<WindowData | null>(null)
  const [reports, setReports] = useState<MeetingReport[]>([])
  const [availableGroups, setAvailableGroups] = useState<{ year: number; semester: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Selected report for editing
  const [selectedReport, setSelectedReport] = useState<MeetingReport | null>(null)
  const [editedReport, setEditedReport] = useState<{
    meetingDate: string
    meetingTime: string
    description: string
    students: MeetingReportStudent[]
  } | null>(null)
  
  // Actions
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [creatingReport, setCreatingReport] = useState(false)
  
  // Create report dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<{ year: number; semester: number } | null>(null)
  
  // Submit confirmation dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.getOrCreateMeetingReport(windowId)
      
      if (response.window) {
        setWindowData(response.window)
      }
      if (response.reports) {
        setReports(response.reports)
        // Select first report by default if exists and not submitted
        if (response.reports.length > 0) {
          const firstReport = response.reports[0]
          setSelectedReport(firstReport)
          setEditedReport({
            meetingDate: firstReport.meetingDate || '',
            meetingTime: firstReport.meetingTime || '',
            description: firstReport.description || '',
            students: firstReport.students
          })
        }
      }
      if (response.availableGroups) {
        setAvailableGroups(response.availableGroups)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [windowId])

  const selectReport = (report: MeetingReport) => {
    setSelectedReport(report)
    setEditedReport({
      meetingDate: report.meetingDate || '',
      meetingTime: report.meetingTime || '',
      description: report.description || '',
      students: report.students
    })
  }

  const updateStudentReview = (studentId: string, field: 'attended' | 'review', value: boolean | string) => {
    if (!editedReport) return
    
    setEditedReport({
      ...editedReport,
      students: editedReport.students.map(s => 
        s.id === studentId ? { ...s, [field]: value } : s
      )
    })
  }

  const handleSaveReport = async () => {
    if (!selectedReport || !editedReport) return
    
    try {
      setSaving(true)
      const result = await api.saveMeetingReport(selectedReport.id, {
        meetingDate: editedReport.meetingDate || undefined,
        meetingTime: editedReport.meetingTime || undefined,
        description: editedReport.description || undefined,
        students: editedReport.students.map(s => ({
          id: s.id,
          attended: s.attended,
          review: s.review || undefined
        }))
      })
      
      toast({
        title: "Saved",
        description: "Report saved as draft"
      })
      
      // Update local state
      setReports(reports.map(r => r.id === result.report.id ? result.report : r))
      setSelectedReport(result.report)
      setEditedReport({
        meetingDate: result.report.meetingDate || '',
        meetingTime: result.report.meetingTime || '',
        description: result.report.description || '',
        students: result.report.students
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save report',
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!selectedReport) return
    
    // First save
    await handleSaveReport()
    
    try {
      setSubmitting(true)
      const result = await api.submitMeetingReport(selectedReport.id)
      
      toast({
        title: "Submitted",
        description: "Report submitted successfully"
      })
      
      setSubmitDialogOpen(false)
      fetchData() // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit report',
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateReport = async () => {
    if (!selectedGroup) return
    
    try {
      setCreatingReport(true)
      const result = await api.getOrCreateMeetingReport(windowId, selectedGroup)
      
      toast({
        title: "Created",
        description: "Report created successfully"
      })
      
      setCreateDialogOpen(false)
      setSelectedGroup(null)
      fetchData() // Refresh data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create report',
        variant: "destructive"
      })
    } finally {
      setCreatingReport(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout requiredRoles={["FACULTY", "HOD"]}>
        <div className="container py-6 flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !windowData) {
    return (
      <DashboardLayout requiredRoles={["FACULTY", "HOD"]}>
        <div className="container py-6">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">{error || 'Failed to load data'}</p>
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const isWindowActive = windowData.status === 'ACTIVE'
  const canEdit = isWindowActive && selectedReport && !selectedReport.isSubmitted

  return (
    <DashboardLayout requiredRoles={["FACULTY", "HOD"]}>
      <div className="container py-6 space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.push('/faculty-meetings')}>
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(windowData.startDate)} - {formatDate(windowData.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Deadline: {formatDateTime(windowData.endDate)}
              </span>
            </div>
            {windowData.description && (
              <p className="text-muted-foreground mt-2">{windowData.description}</p>
            )}
          </div>
          
          {isWindowActive && availableGroups.length > 0 && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Report
            </Button>
          )}
        </div>

        {/* No reports state */}
        {reports.length === 0 && availableGroups.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a report for one of your mentee groups
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No mentee groups */}
        {reports.length === 0 && availableGroups.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No mentee groups</h3>
              <p className="text-muted-foreground">
                You don't have any active mentee groups to report on
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reports */}
        {reports.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Report selector */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Your Reports</CardTitle>
                <CardDescription>
                  Select a report to view or edit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.map(report => (
                    <div
                      key={report.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => selectReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Year {report.year}, Sem {report.semester}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.students.length} students
                          </p>
                        </div>
                        {report.isSubmitted ? (
                          <Badge className="bg-green-500">Submitted</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report editor */}
            {selectedReport && editedReport && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        Year {selectedReport.year}, Semester {selectedReport.semester}
                      </CardTitle>
                      <CardDescription>
                        {selectedReport.students.length} students in this group
                      </CardDescription>
                    </div>
                    {selectedReport.isSubmitted ? (
                      <Badge className="bg-green-500">Submitted</Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={handleSaveReport}
                          disabled={saving || !canEdit}
                        >
                          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button 
                          onClick={() => setSubmitDialogOpen(true)}
                          disabled={!canEdit || !editedReport.meetingDate}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Meeting details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Meeting Date *</Label>
                      <Input
                        type="date"
                        value={editedReport.meetingDate}
                        onChange={(e) => setEditedReport({ ...editedReport, meetingDate: e.target.value })}
                        disabled={!canEdit}
                        min={windowData.startDate.split('T')[0]}
                        max={windowData.endDate.split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meeting Time</Label>
                      <TimeSelect
                        value={editedReport.meetingTime}
                        onChange={(value) => setEditedReport({ ...editedReport, meetingTime: value })}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting Notes / Agenda</Label>
                    <Textarea
                      placeholder="Describe what was discussed in the meeting..."
                      value={editedReport.description}
                      onChange={(e) => setEditedReport({ ...editedReport, description: e.target.value })}
                      disabled={!canEdit}
                      rows={3}
                    />
                  </div>

                  {/* Student attendance and reviews */}
                  <div>
                    <h3 className="font-medium mb-3">Student Attendance & Reviews</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Roll No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-[100px]">Attended</TableHead>
                            <TableHead>Review</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editedReport.students.map(student => (
                            <TableRow key={student.id}>
                              <TableCell>{student.rollNumber}</TableCell>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={student.attended}
                                  onCheckedChange={(checked) => 
                                    updateStudentReview(student.id, 'attended', checked as boolean)
                                  }
                                  disabled={!canEdit}
                                />
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  placeholder="Individual feedback..."
                                  value={student.review || ''}
                                  onChange={(e) => 
                                    updateStudentReview(student.id, 'review', e.target.value)
                                  }
                                  disabled={!canEdit}
                                  rows={2}
                                  className="min-w-[200px]"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {selectedReport.submittedAt && (
                    <p className="text-sm text-muted-foreground">
                      Submitted on {formatDateTime(selectedReport.submittedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Create Report Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Meeting Report</DialogTitle>
              <DialogDescription>
                Select the mentee group you want to create a report for
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Mentee Group</Label>
              <Select
                value={selectedGroup ? `${selectedGroup.year}-${selectedGroup.semester}` : ''}
                onValueChange={(value) => {
                  const [year, semester] = value.split('-').map(Number)
                  setSelectedGroup({ year, semester })
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map(group => (
                    <SelectItem 
                      key={`${group.year}-${group.semester}`} 
                      value={`${group.year}-${group.semester}`}
                    >
                      Year {group.year}, Semester {group.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={!selectedGroup || creatingReport}>
                {creatingReport && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submit Confirmation Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Report</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this report? Once submitted, you cannot make any changes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReport} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Yes, Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
