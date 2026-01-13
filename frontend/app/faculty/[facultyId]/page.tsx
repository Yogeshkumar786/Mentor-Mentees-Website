"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api, type FacultyByIdResponse, type StudentMentorProfileResponse, type FacultySubjectsResponse, type Subject } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Phone, Mail, Building, Clock, GraduationCap, Users, ArrowLeft, BookOpen, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Subject type labels
const SUBJECT_TYPE_LABELS: Record<string, string> = {
  BSC: 'Basic Science Core',
  ESC: 'Engineering Science Core',
  HSC: 'Humanities & Social Science',
  PCC: 'Program Core',
  DEC: 'Departmental Elective',
  OPC: 'Open Elective',
  MSC: 'Games & Sports',
  MOE: 'MOOCs',
  PRC: 'Project/Skill Dev.',
}

export default function FacultyProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string

  const [faculty, setFaculty] = useState<FacultyByIdResponse | null>(null)
  const [studentMentorProfile, setStudentMentorProfile] = useState<StudentMentorProfileResponse | null>(null)
  const [facultySubjects, setFacultySubjects] = useState<FacultySubjectsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isStudent = user?.role === 'STUDENT'

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user) return
      
      try {
        if (isStudent) {
          // Students use the mentor profile API
          const data = await api.getStudentMentorProfile(facultyId)
          setStudentMentorProfile(data)
          
          // Also fetch mentor's subjects
          try {
            const subjectsData = await api.getMentorSubjects()
            setFacultySubjects(subjectsData)
          } catch {
            // Subjects API may not be available yet
            console.log('Could not fetch mentor subjects')
          }
        } else {
          // HOD/Admin use the regular faculty API
          const data = await api.getFacultyById(facultyId)
          setFaculty(data)
          
          // Also fetch faculty subjects
          try {
            const subjectsData = await api.getFacultySubjects(facultyId)
            setFacultySubjects(subjectsData)
          } catch {
            // Subjects API may not be available yet
            console.log('Could not fetch faculty subjects')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch faculty")
      } finally {
        setLoading(false)
      }
    }
    
    if (!authLoading && user) {
      fetchFaculty()
    }
  }, [facultyId, user, authLoading, isStudent])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  // Student view of mentor profile
  if (isStudent && studentMentorProfile) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Mentor Profile</h1>
          {studentMentorProfile.isCurrentMentor && (
            <Badge className="bg-green-600">Current Mentor</Badge>
          )}
        </div>

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
                  <p className="font-medium">{studentMentorProfile.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <p className="font-medium">{studentMentorProfile.employeeId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{studentMentorProfile.department}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={studentMentorProfile.isActive ? "default" : "secondary"}>
                    {studentMentorProfile.isActive ? "Active" : "Inactive"}
                  </Badge>
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
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{studentMentorProfile.collegeEmail || studentMentorProfile.email || "N/A"}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Phone 1</Label>
                    <p className="font-medium">{studentMentorProfile.phone1 || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Phone 2</Label>
                    <p className="font-medium">{studentMentorProfile.phone2 || "N/A"}</p>
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
                  <p className="font-medium">{studentMentorProfile.office || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground">Office Hours</Label>
                  <p className="font-medium">{studentMentorProfile.officeHours || "N/A"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Programs</Label>
                <div className="flex gap-2 mt-2">
                  {studentMentorProfile.btech && <Badge variant="outline">B.Tech</Badge>}
                  {studentMentorProfile.mtech && <Badge variant="outline">M.Tech</Badge>}
                  {studentMentorProfile.phd && <Badge variant="outline">Ph.D</Badge>}
                  {!studentMentorProfile.btech && !studentMentorProfile.mtech && !studentMentorProfile.phd && (
                    <span className="text-muted-foreground">No programs assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentorship History with this mentor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> Your Mentorship History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentMentorProfile.mentorshipHistory.length > 0 ? (
                <div className="space-y-3">
                  {studentMentorProfile.mentorshipHistory.map((m) => (
                    <div key={m.mentorshipId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Year {m.year}, Semester {m.semester}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'N/A'} - 
                          {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'Present'}
                        </p>
                      </div>
                      <Badge variant={m.isActive ? "default" : "secondary"}>
                        {m.isActive ? "Active" : "Past"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No mentorship history found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Faculty Subjects - Full Width */}
        {facultySubjects && (facultySubjects.currentSubjects.length > 0 || facultySubjects.pastSubjects.length > 0) && (
          <div className="mt-6 space-y-6">
            {/* Current Subjects */}
            {facultySubjects.currentSubjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" /> Current Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject Code</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultySubjects.currentSubjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell>{subject.credits}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {subject.subjectType ? SUBJECT_TYPE_LABELS[subject.subjectType] || subject.subjectType : 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Past Subjects */}
            {facultySubjects.pastSubjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <History className="h-5 w-5" /> Past Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject Code</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultySubjects.pastSubjects.map((subject) => (
                          <TableRow key={subject.id} className="opacity-75">
                            <TableCell className="font-medium">{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell>{subject.credits}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {subject.subjectType ? SUBJECT_TYPE_LABELS[subject.subjectType] || subject.subjectType : 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    )
  }

  // HOD/Admin view (original view)
  if (!faculty) {
    return <div className="text-center text-red-500 py-8">Faculty not found</div>
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

      {/* Faculty Subjects Section */}
      {facultySubjects && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" /> Current Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {facultySubjects.currentSubjects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facultySubjects.currentSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.credits}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{SUBJECT_TYPE_LABELS[subject.subjectType] || subject.subjectType}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No current subjects assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Past Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" /> Past Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {facultySubjects.pastSubjects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facultySubjects.pastSubjects.map((subject) => (
                      <TableRow key={subject.id} className="text-muted-foreground">
                        <TableCell className="font-medium">{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.credits}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{SUBJECT_TYPE_LABELS[subject.subjectType] || subject.subjectType}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No past subjects</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
