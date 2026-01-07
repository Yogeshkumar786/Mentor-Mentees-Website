"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentAcademicByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, GraduationCap, BookOpen, TrendingUp } from "lucide-react"

export default function StudentAcademicPage() {
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [data, setData] = useState<StudentAcademicByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentAcademicByRollNumber(rollno)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch academic data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [rollno])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-center text-red-500 py-8">{error || "No academic data found"}</div>
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'O' || grade === 'A+') return "bg-green-500"
    if (grade === 'A' || grade === 'B+') return "bg-blue-500"
    if (grade === 'B' || grade === 'C') return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Programme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.program}</p>
            <p className="text-sm text-muted-foreground">{data.branch}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Year</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.currentYear}</p>
            <p className="text-sm text-muted-foreground">of study</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Latest CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.latestCGPA?.toFixed(2) || "N/A"}</p>
            <p className="text-sm text-muted-foreground">out of 10.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Semesters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalSemesters}</p>
            <p className="text-sm text-muted-foreground">completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pre-Admission Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Pre-Admission Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold">{data.preAdmission.xMarks}%</p>
              <p className="text-sm text-muted-foreground">Class X</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold">{data.preAdmission.xiiMarks}%</p>
              <p className="text-sm text-muted-foreground">Class XII</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold">{data.preAdmission.jeeMains}</p>
              <p className="text-sm text-muted-foreground">JEE Mains</p>
            </div>
            {data.preAdmission.jeeAdvanced && (
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">{data.preAdmission.jeeAdvanced}</p>
                <p className="text-sm text-muted-foreground">JEE Advanced</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Semester Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Semester Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.semesters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No semester results available</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {data.semesters.map((semester) => (
                <AccordionItem key={semester.semester} value={`sem-${semester.semester}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">Semester {semester.semester}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">SGPA: {semester.sgpa?.toFixed(2) ?? 'N/A'}</Badge>
                        <Badge variant="default">CGPA: {semester.cgpa?.toFixed(2) ?? 'N/A'}</Badge>
                        <span className="text-sm text-muted-foreground">{semester.totalCredits} credits</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject Code</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead className="text-center">Credits</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semester.subjects.map((subject, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono">{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell className="text-center">{subject.credits}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={getGradeColor(subject.grade)}>{subject.grade}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* CGPA Trend */}
      {data.semesters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> CGPA Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {data.semesters.map((sem) => {
                const cgpaValue = sem.cgpa ?? 0
                const heightPercent = (cgpaValue / 10) * 100
                return (
                  <div key={sem.semester} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full bg-primary rounded-t h-[${Math.round(heightPercent)}%]`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs mt-1">S{sem.semester}</span>
                    <span className="text-xs font-medium">{cgpaValue.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
