"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api, type FacultyByIdResponse } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Phone, Mail, Building, Clock, GraduationCap, Users } from "lucide-react"

export default function FacultyProfilePage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string

  const [faculty, setFaculty] = useState<FacultyByIdResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await api.getFacultyById(facultyId)
        setFaculty(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch faculty")
      } finally {
        setLoading(false)
      }
    }
    fetchFaculty()
  }, [facultyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !faculty) {
    return <div className="text-center text-red-500 py-8">{error || "Faculty not found"}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{faculty.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employee ID</Label>
                <p className="font-medium">{faculty.employeeId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="font-medium">{faculty.department}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant={faculty.isActive ? "default" : "secondary"}>
                  {faculty.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Start Date</Label>
                <p className="font-medium">
                  {faculty.startDate ? new Date(faculty.startDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <p className="font-medium">
                  {faculty.endDate ? new Date(faculty.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
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
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">College Email</Label>
                <p className="font-medium">{faculty.collegeEmail || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Personal Email</Label>
                <p className="font-medium">{faculty.personalEmail || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Login Email</Label>
                <p className="font-medium">{faculty.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground">Phone 1</Label>
                  <p className="font-medium">{faculty.phone1 || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground">Phone 2</Label>
                  <p className="font-medium">{faculty.phone2 || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> Office Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Office</Label>
                <p className="font-medium">{faculty.office || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Office Hours</Label>
                <p className="font-medium">{faculty.officeHours || "N/A"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Programs</Label>
              <div className="flex gap-2 mt-2">
                {faculty.btech && <Badge variant="outline">B.Tech</Badge>}
                {faculty.mtech && <Badge variant="outline">M.Tech</Badge>}
                {faculty.phd && <Badge variant="outline">Ph.D</Badge>}
                {!faculty.btech && !faculty.mtech && !faculty.phd && (
                  <span className="text-muted-foreground">No programs assigned</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentorship Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Mentorship Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{faculty.currentMenteeCount}</p>
                <p className="text-sm text-muted-foreground">Current Mentees</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{faculty.totalMentorships}</p>
                <p className="text-sm text-muted-foreground">Total Mentorships</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Active Mentorship Groups</Label>
              {faculty.mentorshipGroups.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {faculty.mentorshipGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Year {group.year}, Semester {group.semester}</span>
                      </div>
                      <Badge variant="secondary">{group.count} students</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-2">No active mentorship groups</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Details by Group */}
      {faculty.mentorshipGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Mentee Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faculty.mentorshipGroups.map((group, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-lg mb-3">
                    Year {group.year}, Semester {group.semester}
                  </h3>
                  <div className="grid gap-2">
                    {group.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => router.push(`/students/${student.rollNumber}`)}
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Roll No: {student.rollNumber} | {student.program} - {student.branch}
                          </p>
                        </div>
                        <Badge variant="outline">View Details</Badge>
                      </div>
                    ))}
                  </div>
                  {index < faculty.mentorshipGroups.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
