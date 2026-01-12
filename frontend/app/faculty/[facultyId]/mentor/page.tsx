"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api, type FacultyMentorDetailsResponse } from "@/lib/api"
import { generateHODFacultyMentorPDF } from "@/lib/pdf-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Users, Calendar, CheckCircle, Clock, AlertCircle, User, Download } from "lucide-react"

export default function FacultyMentorPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string

  const [data, setData] = useState<FacultyMentorDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Only HOD can access this page
  useEffect(() => {
    if (!authLoading && user && user.role !== "HOD") {
      router.push(`/faculty/${facultyId}`)
    }
  }, [user, authLoading, router, facultyId])

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        const response = await api.getFacultyMentorDetails(facultyId)
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch mentor details")
      } finally {
        setLoading(false)
      }
    }
    
    if (!authLoading && user?.role === "HOD") {
      fetchMentorDetails()
    }
  }, [facultyId, authLoading, user])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (user?.role !== "HOD") {
    return null
  }

  if (error || !data) {
    return <div className="text-center text-red-500 py-8">{error || "Failed to load mentor details"}</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case "YET_TO_DONE":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>
      case "CANCELLED":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDownloadPDF = () => {
    if (!data) return

    generateHODFacultyMentorPDF({
      facultyName: data.faculty.name,
      facultyEmployeeId: data.faculty.employeeId,
      department: data.faculty.department,
      mentorshipGroups: data.mentorshipGroups.map(g => ({
        year: g.year,
        semester: g.semester,
        isActive: g.isActive,
        students: g.students.map(s => ({
          name: s.name,
          rollNumber: s.rollNumber,
          program: s.program,
          branch: s.branch
        }))
      })),
      meetings: data.meetings.map(m => ({
        date: m.date,
        time: m.time,
        description: m.description,
        status: m.status,
        year: m.year,
        semester: m.semester,
        studentReviews: m.students.map(s => ({
          studentName: s.name,
          rollNumber: s.rollNumber,
          review: s.review || ''
        }))
      }))
    })
  }

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data.stats.totalMentorships}</p>
              <p className="text-sm text-muted-foreground">Total Mentorships</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{data.stats.activeMentorships}</p>
              <p className="text-sm text-muted-foreground">Active Mentorships</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{data.stats.totalMeetings}</p>
              <p className="text-sm text-muted-foreground">Total Meetings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-500">{data.stats.completedMeetings}</p>
              <p className="text-sm text-muted-foreground">Completed Meetings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentorship Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Mentorship Groups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.mentorshipGroups.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {data.mentorshipGroups.map((group, index) => (
                <AccordionItem key={index} value={`group-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">Year {group.year}, Semester {group.semester}</span>
                      <Badge variant={group.isActive ? "default" : "secondary"}>
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{group.students.length} students</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {group.students.map((student) => (
                        <div
                          key={student.mentorshipId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => router.push(`/students/${student.rollNumber}`)}
                        >
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Roll: {student.rollNumber} | {student.program} - {student.branch}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {student.startDate && (
                              <p>Started: {new Date(student.startDate).toLocaleDateString()}</p>
                            )}
                            {student.endDate && (
                              <p>Ended: {new Date(student.endDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">No mentorship groups found</p>
          )}
        </CardContent>
      </Card>

      {/* Meetings History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Meeting History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.meetings.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {data.meetings.map((meeting) => (
                <AccordionItem key={meeting.id} value={meeting.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 flex-1">
                      <span className="font-semibold">
                        {new Date(meeting.date).toLocaleDateString()}
                        {meeting.time && ` at ${meeting.time}`}
                      </span>
                      {getStatusBadge(meeting.status)}
                      <Badge variant="outline">{meeting.studentCount} students</Badge>
                      <span className="text-sm text-muted-foreground">
                        Year {meeting.year}, Sem {meeting.semester}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {meeting.description && (
                        <div>
                          <Label className="text-muted-foreground">Description</Label>
                          <p className="mt-1">{meeting.description}</p>
                        </div>
                      )}
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Student Attendance & Reviews</Label>
                        <div className="space-y-2">
                          {meeting.students.map((student) => (
                            <div
                              key={student.studentId}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div 
                                  className="flex items-center gap-2 cursor-pointer hover:underline"
                                  onClick={() => router.push(`/students/${student.rollNumber}`)}
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{student.name}</span>
                                  <span className="text-sm text-muted-foreground">(Roll: {student.rollNumber})</span>
                                </div>
                                <Badge variant={student.attended ? "default" : "destructive"}>
                                  {student.attended ? "Present" : "Absent"}
                                </Badge>
                              </div>
                              {student.review && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                  <span className="text-muted-foreground">Review: </span>
                                  {student.review}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">No meetings found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
