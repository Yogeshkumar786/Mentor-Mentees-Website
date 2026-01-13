"use client"

import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, FileCheck, ClipboardList, UserPlus, GraduationCap, Download, Loader2, Trophy, Medal, Award, BookOpen } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { api, HodDashboardStats, YearToppersResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function HodDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [stats, setStats] = useState<HodDashboardStats['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [toppers, setToppers] = useState<YearToppersResponse['toppers'] | null>(null)
  const [toppersLoading, setToppersLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getHodDashboardStats()
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchToppers = async () => {
      try {
        const data = await api.getYearToppers()
        setToppers(data.toppers)
      } catch (err) {
        console.error('Failed to fetch year toppers:', err)
      } finally {
        setToppersLoading(false)
      }
    }
    fetchToppers()
  }, [])

  const handleExport = async () => {
    try {
      setExporting(true)
      await api.exportStudentsCSV()
      toast({
        title: "Export Successful",
        description: "Students data has been downloaded as CSV",
      })
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export students data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return null
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case 2:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case 3:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HOD Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Managing <span className="font-semibold text-primary">{user?.hod?.department || "N/A"}</span> Department
          </p>
        </div>
        <Button variant="outline" className="hidden sm:flex bg-transparent" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export Students
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard title="Faculty" value={stats?.totalFaculty || 0} icon={UserCheck} description="Active faculty" />
          <StatsCard title="Students" value={stats?.totalStudents || 0} icon={Users} description="Total enrolled" />
          <StatsCard title="Mentorships" value={stats?.activeMentorships || 0} icon={GraduationCap} description="Active assignments" />
          <StatsCard title="Unassigned" value={stats?.unassignedStudents || 0} icon={UserPlus} description="Awaiting mentors" />
          <StatsCard title="Approvals" value={stats?.pendingRequests || 0} icon={FileCheck} description="Requests to review" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Students
            </CardTitle>
            <CardDescription>View and manage students in your department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all students in your department, filter by year, programme, and search for specific students.
            </p>
            <Button className="w-full" asChild>
              <Link href="/students">View Students</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Department Faculty
            </CardTitle>
            <CardDescription>Manage your department's faculty members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review faculty mentoring loads, expertise areas, and overall department engagement.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/faculty">View Faculty</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentor Assignment</CardTitle>
            <CardDescription>Assign faculty mentors to department students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              As HOD, you can manually assign mentors or approve student-requested assignments to ensure every student
              has guidance.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a href="/dashboard/mentor-assignments">Assign Mentors</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and approve pending requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review pending internship, project, and other requests from students that require your approval.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/requests">View Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Year Toppers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Year Toppers
          </CardTitle>
          <CardDescription>Top 3 students by CGPA in each year</CardDescription>
        </CardHeader>
        <CardContent>
          {toppersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : toppers && Object.keys(toppers).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((year) => {
                const yearKey = `year_${year}`
                const yearToppers = toppers[yearKey] || []
                return (
                  <div key={year} className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Year {year}
                    </h3>
                    {yearToppers.length > 0 ? (
                      <div className="space-y-2">
                        {yearToppers.map((topper) => {
                          const studentId = topper.studentId || topper.student?.id
                          const studentName = topper.studentName || topper.student?.name
                          const rollNumber = topper.rollNumber || topper.student?.rollNumber
                          return (
                            <div
                              key={studentId}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => router.push(`/students/${rollNumber}`)}
                            >
                              <div className="flex items-center gap-3">
                                {getRankIcon(topper.rank)}
                                <div>
                                  <p className="font-medium text-sm">{studentName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Roll: {rollNumber}
                                  </p>
                                </div>
                              </div>
                              <Badge className={getRankBadgeColor(topper.rank)}>
                                {topper.cgpa.toFixed(2)}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No toppers data
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No toppers data available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Toppers will be calculated once grades are recorded
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faculty Academics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Academics
          </CardTitle>
          <CardDescription>View your teaching assignments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            View your current and past teaching subjects, course load, and academic history.
          </p>
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href="/faculty/academics">View Academics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
