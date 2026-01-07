"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type StudentCoCurricularByRollno } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Trophy, Calendar, Award, FileText, Star } from "lucide-react"

export default function StudentCoCurricularPage() {
  const params = useParams()
  const rollno = parseInt(params.rollno as string)

  const [data, setData] = useState<StudentCoCurricularByRollno | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getStudentCoCurricularByRollNumber(rollno)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch co-curricular data")
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

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  if (!data) {
    return <div className="text-center text-muted-foreground py-8">No co-curricular data found</div>
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

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Semesters Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Object.keys(activitiesBySemester).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Awards Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{totalAwards}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" /> Co-Curricular Activities
          </CardTitle>
          <CardDescription>
            All extracurricular activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.activities.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No co-curricular activities recorded</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Semester</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
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
                          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            {activity.awards}
                          </span>
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

      {/* Activities by Semester */}
      {Object.keys(activitiesBySemester).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(activitiesBySemester)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([semester, activities]) => (
              <Card key={semester}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Semester {semester}</span>
                    <Badge>{activities.length} activities</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-2 p-2 rounded bg-muted/50"
                      >
                        <Star className="h-4 w-4 mt-0.5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.eventDetails}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'} • {activity.participationDetails}
                          </p>
                          {activity.awards && activity.awards.trim() !== '' && activity.awards.toLowerCase() !== 'none' && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {activity.awards}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
