"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, type StudentCoCurricularByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Trophy, Calendar, Award, Star, FileText } from "lucide-react"

export default function CoCurricularPage() {
  const { user } = useAuth()
  const [data, setData] = useState<StudentCoCurricularByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.student?.rollNumber) {
        setError("Student information not found")
        setLoading(false)
        return
      }

      try {
        const rollNo = typeof user.student.rollNumber === 'string' 
          ? parseInt(user.student.rollNumber) 
          : user.student.rollNumber
        const result = await api.getStudentCoCurricularByRollNumber(rollNo)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch co-curricular activities")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (loading) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout requiredRoles={['STUDENT']}>
        <div className="text-center text-red-500 py-8">{error || "No co-curricular data found"}</div>
      </DashboardLayout>
    )
  }

  // Group activities by semester
  const activitiesBySemester = data.activities.reduce((acc, activity) => {
    const sem = activity.semester
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(activity)
    return acc
  }, {} as Record<number, typeof data.activities>)

  // Count awards
  const totalAwards = data.activities.filter(a => a.awards && a.awards.trim() !== '' && a.awards.toLowerCase() !== 'none').length
  const semestersActive = Object.keys(activitiesBySemester).length

  return (
    <DashboardLayout requiredRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Co-Curricular Activities</h1>
          <p className="text-muted-foreground">Your participation in events and achievements</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Total Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Semesters Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{semestersActive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4" /> Awards Won
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalAwards}</p>
            </CardContent>
          </Card>
        </div>

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> All Activities
            </CardTitle>
            <CardDescription>Your complete co-curricular activity record</CardDescription>
          </CardHeader>
          <CardContent>
            {data.activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No co-curricular activities recorded yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Semester</TableHead>
                    <TableHead className="w-30">Date</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Participation</TableHead>
                    <TableHead>Awards</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant="outline">Sem {activity.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-sm">{activity.eventDetails}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{activity.participationDetails}</span>
                      </TableCell>
                      <TableCell>
                        {activity.awards && activity.awards.trim() !== '' && activity.awards.toLowerCase() !== 'none' ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{activity.awards}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Awards Highlight Section */}
        {totalAwards > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" /> Awards & Achievements
              </CardTitle>
              <CardDescription>Highlights of your accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {data.activities
                  .filter(a => a.awards && a.awards.trim() !== '' && a.awards.toLowerCase() !== 'none')
                  .map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                    >
                      <Trophy className="h-5 w-5 mt-0.5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.awards}</p>
                        <p className="text-sm text-muted-foreground">{activity.eventDetails}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Semester {activity.semester} • {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
