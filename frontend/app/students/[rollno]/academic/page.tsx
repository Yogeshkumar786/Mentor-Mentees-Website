"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentAcademicByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> CGPA & SGPA Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Create data for all 8 semesters, with null for missing data
            const chartData = Array.from({ length: 8 }, (_, i) => {
              const semNum = i + 1
              const semData = data.semesters.find(s => s.semester === semNum)
              return {
                semester: `Sem ${semNum}`,
                cgpa: semData?.cgpa ?? null,
                sgpa: semData?.sgpa ?? null,
              }
            })

            const chartConfig: ChartConfig = {
              cgpa: {
                label: "CGPA",
                color: "hsl(217, 91%, 50%)", // Blue color like City A in the image
              },
              sgpa: {
                label: "SGPA",
                color: "hsl(30, 90%, 55%)", // Orange color like City B in the image
              },
            }

            return (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="semester" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ccc' }}
                    tickFormatter={(value) => value.toFixed(1)}
                    ticks={[0, 2, 4, 6, 8, 10]}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cgpa" 
                    stroke="var(--color-cgpa)" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-cgpa)", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    name="CGPA"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sgpa" 
                    stroke="var(--color-sgpa)" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-sgpa)", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    name="SGPA"
                    connectNulls={false}
                  />
                </LineChart>
              </ChartContainer>
            )
          })()}
          
          {/* Summary stats below chart */}
          <div className="flex justify-center gap-8 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {data.semesters.length > 0 
                  ? Math.max(...data.semesters.map(s => s.sgpa ?? 0)).toFixed(2)
                  : "N/A"
                }
              </p>
              <p className="text-sm text-muted-foreground">Highest SGPA</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {data.latestCGPA?.toFixed(2) || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Current CGPA</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {data.semesters.length > 0 
                  ? (data.semesters.reduce((sum, s) => sum + (s.sgpa ?? 0), 0) / data.semesters.length).toFixed(2)
                  : "N/A"
                }
              </p>
              <p className="text-sm text-muted-foreground">Average SGPA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
