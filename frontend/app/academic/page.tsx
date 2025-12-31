"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, StudentAcademic } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap, 
  BookOpen,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

export default function AcademicPage() {
  const [academicData, setAcademicData] = useState<StudentAcademic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSemesters, setOpenSemesters] = useState<number[]>([])

  useEffect(() => {
    const fetchAcademic = async () => {
      try {
        setLoading(true)
        const data = await api.getStudentAcademic()
        setAcademicData(data)
        if (data.semesters.length > 0) {
          setOpenSemesters([data.semesters[data.semesters.length - 1].semester])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch academic data')
      } finally {
        setLoading(false)
      }
    }

    fetchAcademic()
  }, [])

  const toggleSemester = (semester: number) => {
    setOpenSemesters(prev => 
      prev.includes(semester) 
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    )
  }

  const getGradeColor = (grade: string) => {
    const gradeMap: Record<string, string> = {
      'O': 'bg-green-500',
      'A+': 'bg-green-400',
      'A': 'bg-blue-500',
      'B+': 'bg-blue-400',
      'B': 'bg-yellow-500',
      'C': 'bg-orange-500',
      'D': 'bg-red-400',
      'F': 'bg-red-600',
    }
    return gradeMap[grade] || 'bg-gray-500'
  }

  const getCGPAProgress = (cgpa: number | null) => {
    if (!cgpa) return 0
    return (cgpa / 10) * 100
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

  if (!academicData) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">No academic data found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Record</h1>
          <p className="text-muted-foreground">
            {academicData.studentName} • {academicData.program} - {academicData.branch}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current CGPA</CardDescription>
              <CardTitle className="text-3xl">
                {academicData.latestCGPA?.toFixed(2) || 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress 
                value={getCGPAProgress(academicData.latestCGPA)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">out of 10.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Year</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Year {academicData.currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{academicData.program}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Semesters Completed</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {academicData.totalSemesters}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">semesters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>JEE Mains Rank</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Award className="h-6 w-6" />
                {academicData.preAdmission.jeeMains}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                XII: {academicData.preAdmission.xiiMarks}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Semester-wise Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Semester-wise Results
            </CardTitle>
            <CardDescription>Click on a semester to view subject details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {academicData.semesters.length > 0 ? (
              academicData.semesters.map((sem) => (
                <Collapsible 
                  key={sem.semester}
                  open={openSemesters.includes(sem.semester)}
                  onOpenChange={() => toggleSemester(sem.semester)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          Sem {sem.semester}
                        </Badge>
                        <div className="text-left">
                          <p className="font-medium">
                            SGPA: <span className="text-primary">{sem.sgpa.toFixed(2)}</span>
                            <span className="text-muted-foreground mx-2">•</span>
                            CGPA: <span className="text-primary">{sem.cgpa.toFixed(2)}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sem.subjects.length} subjects • {sem.totalCredits} credits
                          </p>
                        </div>
                      </div>
                      {openSemesters.includes(sem.semester) 
                        ? <ChevronUp className="h-5 w-5" />
                        : <ChevronDown className="h-5 w-5" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Subject Name</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Credits</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.subjects.map((subject, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-3 text-sm font-mono">
                                {subject.subjectCode}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {subject.subjectName}
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                {subject.credits}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={`${getGradeColor(subject.grade)} text-white`}>
                                  {subject.grade}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No semester results available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pre-Admission Academics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Pre-Admission Academics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Class X</p>
                <p className="text-2xl font-bold">{academicData.preAdmission.xMarks}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Class XII</p>
                <p className="text-2xl font-bold">{academicData.preAdmission.xiiMarks}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">JEE Mains</p>
                <p className="text-2xl font-bold">{academicData.preAdmission.jeeMains}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">JEE Advanced</p>
                <p className="text-2xl font-bold">
                  {academicData.preAdmission.jeeAdvanced || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
