"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api, HODMentorshipsResponse, FacultyMentorshipData, UnassignedStudent, FacultyMember, MenteeData } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  GraduationCap,
  Loader2,
  AlertCircle,
  Search,
  UserCheck,
  UserX,
  Link as LinkIcon,
  BarChart3,
  PlusCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Filter,
  X
} from "lucide-react"
import type { ApiUser } from "@/lib/api"

interface HODMentorViewProps {
  user: ApiUser
}

// Group interface for organizing mentees
interface MenteeGroup {
  key: string
  year: number
  semester: number
  mentees: MenteeData[]
  isActive: boolean
}

export function HODMentorView({ user }: HODMentorViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HODMentorshipsResponse | null>(null)
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([])
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null)
  
  // Faculty search filter
  const [facultySearch, setFacultySearch] = useState("")
  
  // Unassigned students filters
  const [studentSearch, setStudentSearch] = useState("")
  const [studentYearFilter, setStudentYearFilter] = useState<string>("all")
  
  // Assign mentor dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [assignYear, setAssignYear] = useState("")
  const [assignSemester, setAssignSemester] = useState("")
  const [assigning, setAssigning] = useState(false)
  
  // Create meeting dialog state
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [selectedMentorship, setSelectedMentorship] = useState<string>("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingDescription, setMeetingDescription] = useState("")
  const [creatingMeeting, setCreatingMeeting] = useState(false)

  const department = user.hod?.department || user.faculty?.department || 'Not Assigned'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [mentorshipsData, facultyData] = await Promise.all([
        api.getHODMentorships(),
        api.getFacultyList(department, true)
      ])
      setData(mentorshipsData)
      setFacultyList(facultyData.faculty)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mentorship data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [department])

  const handleAssignMentor = async () => {
    if (selectedStudents.length === 0 || !selectedFaculty || !assignYear || !assignSemester) {
      toast({
        title: "Missing fields",
        description: "Please select students, faculty, year and semester",
        variant: "destructive"
      })
      return
    }
    
    try {
      setAssigning(true)
      const rollNumbers = data?.unassignedStudents
        .filter(s => selectedStudents.includes(s.id))
        .map(s => s.rollNumber) || []
      
      const result = await api.assignMentor({
        studentRollNumbers: rollNumbers,
        facultyEmployeeId: selectedFaculty,
        year: parseInt(assignYear),
        semester: parseInt(assignSemester)
      })
      
      toast({
        title: "Success",
        description: result.message
      })
      
      setAssignDialogOpen(false)
      setSelectedStudents([])
      setSelectedFaculty("")
      setAssignYear("")
      setAssignSemester("")
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to assign mentor',
        variant: "destructive"
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleCreateMeeting = async () => {
    if (!selectedMentorship || !meetingDate || !meetingTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    try {
      setCreatingMeeting(true)
      const result = await api.createMeeting({
        mentorshipId: selectedMentorship,
        date: meetingDate,
        time: meetingTime,
        description: meetingDescription
      })
      
      toast({
        title: "Success",
        description: result.message
      })
      
      setMeetingDialogOpen(false)
      setSelectedMentorship("")
      setMeetingDate("")
      setMeetingTime("")
      setMeetingDescription("")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create meeting',
        variant: "destructive"
      })
    } finally {
      setCreatingMeeting(false)
    }
  }

  const openMeetingDialog = (mentorshipId: string) => {
    setSelectedMentorship(mentorshipId)
    setMeetingDialogOpen(true)
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleFacultyExpansion = (facultyId: string) => {
    setExpandedFaculty(prev => prev === facultyId ? null : facultyId)
  }

  const selectAllFilteredStudents = () => {
    setSelectedStudents(filteredUnassigned.map(s => s.id))
  }

  const clearStudentSelection = () => {
    setSelectedStudents([])
  }

  const navigateToGroup = (facultyId: string, year: number, semester: number, isActive: boolean) => {
    router.push(`/mentor/group?faculty=${facultyId}&year=${year}&semester=${semester}&active=${isActive}`)
  }

  // Group mentees by year/semester for a faculty
  const groupMenteesByYearSemester = (mentees: MenteeData[], isActive: boolean): MenteeGroup[] => {
    const groups: Record<string, MenteeGroup> = {}
    
    mentees.forEach(mentee => {
      const key = `${mentee.year}-${mentee.semester}`
      if (!groups[key]) {
        groups[key] = {
          key,
          year: mentee.year,
          semester: mentee.semester,
          mentees: [],
          isActive
        }
      }
      groups[key].mentees.push(mentee)
    })
    
    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.semester - a.semester
    })
  }

  // Filter faculty based on search
  const filteredFaculty = useMemo(() => {
    if (!data?.mentorshipsByFaculty) return []
    
    const search = facultySearch.toLowerCase().trim()
    if (!search) return data.mentorshipsByFaculty
    
    return data.mentorshipsByFaculty.filter(f => 
      f.facultyName.toLowerCase().includes(search) ||
      f.facultyEmail.toLowerCase().includes(search) ||
      f.employeeId.toLowerCase().includes(search)
    )
  }, [data?.mentorshipsByFaculty, facultySearch])

  // Filter unassigned students based on search and year
  const filteredUnassigned = useMemo(() => {
    if (!data?.unassignedStudents) return []
    
    let filtered = data.unassignedStudents
    
    // Apply search filter
    const search = studentSearch.toLowerCase().trim()
    if (search) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.rollNumber.toString().includes(search)
      )
    }
    
    // Apply year filter
    if (studentYearFilter !== "all") {
      filtered = filtered.filter(s => s.year === parseInt(studentYearFilter))
    }
    
    return filtered
  }, [data?.unassignedStudents, studentSearch, studentYearFilter])

  // Get unique years from unassigned students
  const availableYears = useMemo(() => {
    if (!data?.unassignedStudents) return []
    const years = [...new Set(data.unassignedStudents.map(s => s.year))]
    return years.sort((a, b) => a - b)
  }, [data?.unassignedStudents])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  const stats = data?.stats || {
    totalStudents: 0,
    assignedStudents: 0,
    unassignedStudents: 0,
    totalFaculty: 0,
    activeMentors: 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Mentorship</h1>
          <p className="text-muted-foreground">
            Overview and management of mentor-mentee assignments
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          {department}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.assignedStudents}</p>
                <p className="text-xs text-muted-foreground">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <UserX className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unassignedStudents}</p>
                <p className="text-xs text-muted-foreground">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalFaculty}</p>
                <p className="text-xs text-muted-foreground">Total Faculty</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <LinkIcon className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeMentors}</p>
                <p className="text-xs text-muted-foreground">Active Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Mentorship Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Faculty Mentorship Overview
            </CardTitle>
            <CardDescription>Current mentor-mentee distribution among faculty</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Faculty Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee ID..."
                className="pl-9"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
              {facultySearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setFacultySearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {filteredFaculty.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">
                {facultySearch ? "No Faculty Found" : "No Mentorship Data"}
              </h3>
              <p className="text-muted-foreground mt-2">
                {facultySearch 
                  ? "Try adjusting your search criteria"
                  : "No faculty members have been assigned mentees yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaculty.map((faculty) => {
                const currentGroups = groupMenteesByYearSemester(faculty.currentMentees, true)
                const pastGroups = groupMenteesByYearSemester(faculty.pastMentees, false)
                
                return (
                <Card key={faculty.facultyId} className="border">
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleFacultyExpansion(faculty.facultyId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{faculty.facultyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {faculty.employeeId} • {faculty.facultyEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="default" className="mr-2">
                            {faculty.activeMenteeCount} Active
                          </Badge>
                          <Badge variant="secondary">
                            {faculty.totalMenteeCount} Total
                          </Badge>
                        </div>
                        {expandedFaculty === faculty.facultyId ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedFaculty === faculty.facultyId && (
                    <div className="border-t p-4 space-y-4">
                      {/* Current Mentee Groups */}
                      {currentGroups.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            Current Mentee Groups
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {currentGroups.map((group) => (
                              <Card 
                                key={group.key} 
                                className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigateToGroup(faculty.facultyId, group.year, group.semester, true)
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold">
                                        Year {group.year}, Sem {group.semester}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {group.mentees.length} student{group.mentees.length !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="default" className="bg-green-600">Active</Badge>
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Past Mentee Groups */}
                      {pastGroups.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Past Mentee Groups ({faculty.pastMentees.length} students)
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {pastGroups.map((group) => (
                              <Card 
                                key={group.key} 
                                className="cursor-pointer hover:shadow-md transition-all opacity-75 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigateToGroup(faculty.facultyId, group.year, group.semester, false)
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold">
                                        Year {group.year}, Sem {group.semester}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {group.mentees.length} student{group.mentees.length !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">Past</Badge>
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentGroups.length === 0 && pastGroups.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No mentees assigned to this faculty
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-amber-600" />
              Unassigned Students
              {data?.unassignedStudents && data.unassignedStudents.length > 0 && (
                <Badge variant="secondary">{data.unassignedStudents.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Students who don&apos;t have a mentor assigned yet</CardDescription>
          </div>
          {data?.unassignedStudents && data.unassignedStudents.length > 0 && (
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Assign Mentor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Assign Mentor to Students</DialogTitle>
                  <DialogDescription>
                    Select students and assign them to a faculty mentor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Students</Label>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={selectAllFilteredStudents}
                        >
                          Select All ({filteredUnassigned.length})
                        </Button>
                        {selectedStudents.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={clearStudentSelection}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-2">
                      {filteredUnassigned.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <label htmlFor={student.id} className="text-sm flex-1 cursor-pointer">
                            {student.name} - {student.rollNumber} ({student.program}, Year {student.year})
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudents.length} student(s) selected
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Faculty</Label>
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a faculty member" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyList.map((faculty) => (
                          <SelectItem key={faculty.employeeId} value={faculty.employeeId}>
                            {faculty.name} ({faculty.currentMenteeCount} mentees)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select value={assignYear} onValueChange={setAssignYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                          <SelectItem value="3">Year 3</SelectItem>
                          <SelectItem value="4">Year 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select value={assignSemester} onValueChange={setAssignSemester}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignMentor} disabled={assigning}>
                    {assigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Assign Mentor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {/* Filters for unassigned students */}
          {data?.unassignedStudents && data.unassignedStudents.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  className="pl-9"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                {studentSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setStudentSearch("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={studentYearFilter} onValueChange={setStudentYearFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(studentSearch || studentYearFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStudentSearch("")
                      setStudentYearFilter("all")
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {data?.unassignedStudents?.length === 0 ? (
            <div className="py-8 text-center">
              <UserCheck className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
              <h3 className="text-md font-semibold">All Students Assigned</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All students in your department have been assigned mentors.
              </p>
            </div>
          ) : filteredUnassigned.length === 0 ? (
            <div className="py-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="text-md font-semibold">No Students Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
            <p className="text-sm text-muted-foreground mb-3">
              Showing {filteredUnassigned.length} of {data?.unassignedStudents?.length} unassigned students
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Reg. No.</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassigned.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.registrationNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.program}</Badge>
                    </TableCell>
                    <TableCell>Year {student.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Create a new meeting for this mentorship
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input 
                type="time" 
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea 
                placeholder="Meeting agenda or notes..."
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMeeting} disabled={creatingMeeting}>
              {creatingMeeting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
