"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api, type StudentDetails, type UpdateStudentRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Phone, Mail, MapPin, Users, Calendar, Edit, Save, X } from "lucide-react"

export default function StudentProfilePage() {
  const { user } = useAuth()
  const params = useParams()
  const { toast } = useToast()
  const rollno = parseInt(params.rollno as string)

  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateStudentRequest>({})

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await api.getStudentByRollNumber(rollno)
        setStudent(data)
        setFormData({
          name: data.name,
          phoneNumber: data.phoneNumber,
          emergencyContact: data.emergencyContact,
          address: data.address,
          year: data.year,
          dayScholar: data.dayScholar,
          status: data.status,
          accountStatus: data.accountStatus,
          fatherName: data.father.name,
          fatherOccupation: data.father.occupation || "",
          fatherNumber: data.father.phone || "",
          motherName: data.mother.name,
          motherOccupation: data.mother.occupation || "",
          motherNumber: data.mother.phone || "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch student")
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [rollno])

  const handleSave = async () => {
    if (!student) return
    setSaving(true)
    try {
      await api.updateStudentByRollNumber(rollno, formData)
      const updatedStudent = await api.getStudentByRollNumber(rollno)
      setStudent(updatedStudent)
      setIsEditing(false)
      toast({ title: "Success", description: "Student updated successfully" })
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (student) {
      setFormData({
        name: student.name,
        phoneNumber: student.phoneNumber,
        emergencyContact: student.emergencyContact,
        address: student.address,
        year: student.year,
        dayScholar: student.dayScholar,
        status: student.status,
        accountStatus: student.accountStatus,
        fatherName: student.father.name,
        fatherOccupation: student.father.occupation || "",
        fatherNumber: student.father.phone || "",
        motherName: student.mother.name,
        motherOccupation: student.mother.occupation || "",
        motherNumber: student.mother.phone || "",
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !student) {
    return <div className="text-center text-red-500 py-8">{error || "Student not found"}</div>
  }

  const isAdmin = user?.role === "ADMIN"

  return (
    <div className="space-y-6">
      {/* Admin Edit Controls */}
      {isAdmin && (
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Details
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && isAdmin ? (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={formData.phoneNumber || ""} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input value={formData.emergencyContact || ""} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Day Scholar</Label>
                  <Switch checked={formData.dayScholar} onCheckedChange={(checked) => setFormData({ ...formData, dayScholar: checked })} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Gender</Label><p className="font-medium">{student.gender}</p></div>
                  <div><Label className="text-muted-foreground">Date of Birth</Label><p className="font-medium">{student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Blood Group</Label><p className="font-medium">{student.bloodGroup}</p></div>
                  <div><Label className="text-muted-foreground">Community</Label><p className="font-medium">{student.community}</p></div>
                </div>
                <Separator />
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{student.phoneNumber}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Emergency:</span><span>{student.emergencyContact}</span></div>
                <Separator />
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-1" /><span>{student.address}</span></div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Aadhar</Label><p className="font-medium">{student.aadhar}</p></div>
                  <div><Label className="text-muted-foreground">Passport</Label><p className="font-medium">{student.passPort || "N/A"}</p></div>
                </div>
                <div><Label className="text-muted-foreground">Day Scholar</Label><p className="font-medium">{student.dayScholar ? "Yes" : "No (Hosteler)"}</p></div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-muted-foreground">College Email</Label><p className="font-medium">{student.collegeEmail}</p></div>
            <div><Label className="text-muted-foreground">Personal Email</Label><p className="font-medium">{student.personalEmail}</p></div>
            <div><Label className="text-muted-foreground">Login Email</Label><p className="font-medium">{student.email}</p></div>
          </CardContent>
        </Card>

        {/* Academic Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Academic Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && isAdmin ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={formData.year?.toString()} onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PURSUING">Pursuing</SelectItem>
                        <SelectItem value="PASSEDOUT">Passed Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Select value={formData.accountStatus} onValueChange={(value) => setFormData({ ...formData, accountStatus: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Programme</Label><p className="font-medium">{student.program}</p></div>
                  <div><Label className="text-muted-foreground">Branch</Label><p className="font-medium">{student.branch}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Year</Label><p className="font-medium">{student.year}</p></div>
                  <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{student.status}</p></div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Pre-Admission Scores</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-sm text-muted-foreground">Class X:</span><span className="ml-2 font-medium">{student.academicBackground.xMarks}%</span></div>
                    <div><span className="text-sm text-muted-foreground">Class XII:</span><span className="ml-2 font-medium">{student.academicBackground.xiiMarks}%</span></div>
                    <div><span className="text-sm text-muted-foreground">JEE Mains:</span><span className="ml-2 font-medium">{student.academicBackground.jeeMains}</span></div>
                    {student.academicBackground.jeeAdvanced && <div><span className="text-sm text-muted-foreground">JEE Advanced:</span><span className="ml-2 font-medium">{student.academicBackground.jeeAdvanced}</span></div>}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && isAdmin ? (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Father&apos;s Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={formData.fatherName || ""} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={formData.fatherNumber || ""} onChange={(e) => setFormData({ ...formData, fatherNumber: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Occupation</Label><Input value={formData.fatherOccupation || ""} onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })} /></div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Mother&apos;s Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={formData.motherName || ""} onChange={(e) => setFormData({ ...formData, motherName: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={formData.motherNumber || ""} onChange={(e) => setFormData({ ...formData, motherNumber: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Occupation</Label><Input value={formData.motherOccupation || ""} onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })} /></div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium">Father</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Name:</span><span className="ml-2">{student.father.name}</span></div>
                    <div><span className="text-muted-foreground">Phone:</span><span className="ml-2">{student.father.phone || "N/A"}</span></div>
                    <div><span className="text-muted-foreground">Occupation:</span><span className="ml-2">{student.father.occupation || "N/A"}</span></div>
                    <div><span className="text-muted-foreground">Aadhar:</span><span className="ml-2">{student.father.aadhar || "N/A"}</span></div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Mother</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Name:</span><span className="ml-2">{student.mother.name}</span></div>
                    <div><span className="text-muted-foreground">Phone:</span><span className="ml-2">{student.mother.phone || "N/A"}</span></div>
                    <div><span className="text-muted-foreground">Occupation:</span><span className="ml-2">{student.mother.occupation || "N/A"}</span></div>
                    <div><span className="text-muted-foreground">Aadhar:</span><span className="ml-2">{student.mother.aadhar || "N/A"}</span></div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
