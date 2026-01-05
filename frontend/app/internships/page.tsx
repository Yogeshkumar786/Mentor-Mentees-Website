"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentInternships, CreateInternshipRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  IndianRupee,
  Building2,
  Loader2,
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react"

export default function InternshipsPage() {
  const [internshipsData, setInternshipsData] = useState<StudentInternships | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; internshipId: string | null; name: string }>({ open: false, internshipId: null, name: '' })
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<CreateInternshipRequest>({
    semester: 1,
    type: '',
    organisation: '',
    stipend: 0,
    duration: '',
    location: '',
    remarks: ''
  })

  const fetchInternships = async () => {
    try {
      setLoading(true)
      const data = await api.getStudentInternships()
      setInternshipsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch internships')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!deleteDialog.internshipId) return
    
    try {
      setDeleting(true)
      await api.createDeleteInternshipRequest(deleteDialog.internshipId, deleteReason)
      toast({
        title: "Delete Request Submitted",
        description: "Your request to delete this internship has been sent for approval.",
      })
      setDeleteDialog({ open: false, internshipId: null, name: '' })
      setDeleteReason('')
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit delete request',
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetchInternships()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.organisation || !formData.type || !formData.duration || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await api.createInternshipRequest(formData)
      toast({
        title: "Request Submitted!",
        description: `Your internship request has been submitted and is pending approval.`,
      })
      setDialogOpen(false)
      setFormData({
        semester: 1,
        type: '',
        organisation: '',
        stipend: 0,
        duration: '',
        location: '',
        remarks: ''
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit request',
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
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

  const formatStipend = (stipend: number) => {
    if (stipend === 0) return 'Unpaid'
    return `₹${stipend.toLocaleString('en-IN')}/month`
  }

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Internships</h1>
            <p className="text-muted-foreground">Your internship experiences</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Total: {internshipsData?.total || 0}
            </Badge>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Internship
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Internship</DialogTitle>
                  <DialogDescription>
                    Submit a request to add a new internship. Your mentor will review and approve it.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="organisation">Organisation *</Label>
                      <Input
                        id="organisation"
                        placeholder="e.g., Google, Microsoft, TCS"
                        value={formData.organisation}
                        onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Internship Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUMMER">Summer</SelectItem>
                            <SelectItem value="WINTER">Winter</SelectItem>
                            <SelectItem value="REMOTE">Remote</SelectItem>
                            <SelectItem value="ON_SITE">On-site</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="semester">Semester *</Label>
                        <Select
                          value={formData.semester.toString()}
                          onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration *</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 2 months"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stipend">Stipend (₹/month)</Label>
                        <Input
                          id="stipend"
                          type="number"
                          placeholder="0"
                          value={formData.stipend || ''}
                          onChange={(e) => setFormData({ ...formData, stipend: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Bengaluru, Remote"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remarks">Remarks (Optional)</Label>
                      <Textarea
                        id="remarks"
                        placeholder="Any additional details about your internship..."
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Request
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Internships List */}
        {internshipsData?.internships && internshipsData.internships.length > 0 ? (
          <div className="grid gap-6">
            {internshipsData.internships.map((internship) => (
              <Card key={internship.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {internship.organisation}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{internship.type}</Badge>
                        <span>•</span>
                        <span>Semester {internship.semester}</span>
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteDialog({ open: true, internshipId: internship.id, name: internship.organisation })}
                      title="Request deletion"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{internship.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{internship.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stipend</p>
                        <p className="font-medium">{formatStipend(internship.stipend)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No Internships Yet</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  You haven&apos;t added any internship experiences yet. 
                  Internships are a great way to gain practical experience!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Request Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => { setDeleteDialog({ open, internshipId: null, name: '' }); setDeleteReason(''); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Request to delete the internship at <strong>{deleteDialog.name}</strong>. Your mentor will review this request.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="deleteReason">Reason for deletion (optional)</Label>
              <Textarea
                id="deleteReason"
                placeholder="Explain why you want to delete this internship..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteRequest}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Submit Delete Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
