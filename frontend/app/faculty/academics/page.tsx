"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  BookOpen, 
  History, 
  GraduationCap, 
  ArrowLeft,
  Calendar,
  Award
} from "lucide-react"
import { api, FacultySubjectsResponse, Subject } from "@/lib/api"

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  'BSC': 'Basic Science Core',
  'ESC': 'Engineering Science Core',
  'HSC': 'Humanities & Social Science',
  'PCC': 'Program Core Courses',
  'DEC': 'Departmental Elective',
  'OPC': 'Open Elective',
  'MSC': 'Games & Sports',
  'MOE': 'MOOCs',
  'PRC': 'Major Project/Skill Dev'
}

const SEMESTER_TYPE_LABELS: Record<string, string> = {
  'ODD': 'Odd Semester',
  'EVEN': 'Even Semester'
}

export default function FacultyAcademicsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facultySubjects, setFacultySubjects] = useState<FacultySubjectsResponse | null>(null)

  useEffect(() => {
    const fetchAcademics = async () => {
      if (authLoading) return
      
      if (!user) {
        router.push("/login")
        return
      }

      if (user.role !== "FACULTY" && user.role !== "HOD") {
        router.push("/dashboard")
        return
      }

      setLoading(true)
      try {
        const data = await api.getFacultySubjects()
        setFacultySubjects(data)
      } catch (err: unknown) {
        console.error("Error fetching faculty academics:", err)
        setError("Failed to load academic information")
      } finally {
        setLoading(false)
      }
    }

    fetchAcademics()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              My Academics
            </h1>
            <p className="text-muted-foreground">
              View your current and past teaching assignments
            </p>
          </div>
        </div>
      </div>

      {facultySubjects && (
        <>
          {/* Faculty Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{facultySubjects.faculty.name}</CardTitle>
              <CardDescription>
                Employee ID: {facultySubjects.faculty.employeeId} | Department: {facultySubjects.faculty.department}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {facultySubjects.currentSubjects.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Subjects</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {facultySubjects.pastSubjects.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Past Subjects</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {facultySubjects.currentSubjects.reduce((acc, s) => acc + s.credits, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Credits</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {facultySubjects.subjectHistory?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Teaching Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different views */}
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Current Subjects
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Past Subjects
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Teaching History
              </TabsTrigger>
            </TabsList>

            {/* Current Subjects Tab */}
            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Currently Teaching
                  </CardTitle>
                  <CardDescription>
                    Subjects you are currently assigned to teach
                  </CardDescription>
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
                          <TableHead>Department</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultySubjects.currentSubjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{subject.credits}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {subject.subjectType ? SUBJECT_TYPE_LABELS[subject.subjectType] || subject.subjectType : '-'}
                              </Badge>
                            </TableCell>
                            <TableCell>{subject.department || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground mt-4">No subjects currently assigned</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Contact your HOD for subject assignments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Past Subjects Tab */}
            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    Previously Taught
                  </CardTitle>
                  <CardDescription>
                    Subjects you have taught in the past
                  </CardDescription>
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
                          <TableHead>Department</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultySubjects.pastSubjects.map((subject) => (
                          <TableRow key={subject.id} className="text-muted-foreground">
                            <TableCell className="font-medium">{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{subject.credits}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {subject.subjectType ? SUBJECT_TYPE_LABELS[subject.subjectType] || subject.subjectType : '-'}
                              </Badge>
                            </TableCell>
                            <TableCell>{subject.department || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground mt-4">No past subjects found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teaching History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Teaching History
                  </CardTitle>
                  <CardDescription>
                    Complete record of your teaching assignments by academic year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {facultySubjects.subjectHistory && facultySubjects.subjectHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Academic Year</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Subject Code</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultySubjects.subjectHistory.map((history) => (
                          <TableRow key={history.id}>
                            <TableCell className="font-medium">
                              {history.academicYear}-{(history.academicYear % 100) + 1}
                            </TableCell>
                            <TableCell>
                              {SEMESTER_TYPE_LABELS[history.semesterType] || history.semesterType}
                            </TableCell>
                            <TableCell>{history.subject.subjectCode}</TableCell>
                            <TableCell>{history.subject.subjectName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{history.subject.credits}</Badge>
                            </TableCell>
                            <TableCell>
                              {history.isCurrent ? (
                                <Badge className="bg-green-500">Current</Badge>
                              ) : (
                                <Badge variant="outline">Completed</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-muted-foreground mt-4">No teaching history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
