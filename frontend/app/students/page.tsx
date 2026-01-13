"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, type DepartmentStudent, type StudentsListResponse } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Users, Mail, Phone, Eye, Download, Plus, ArrowUpDown, ArrowUp, ArrowDown, Trophy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'

const DEPARTMENTS = [
  { value: "all", label: "All Departments" },
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
  { value: "EEE", label: "Electrical & Electronics Engineering" },
  { value: "MECH", label: "Mechanical Engineering" },
  { value: "CIVIL", label: "Civil Engineering" },
  { value: "BIO-TECH", label: "Biotechnology" },
  { value: "MME", label: "Metallurgical & Materials Engineering" },
  { value: "CHEM", label: "Chemical Engineering" },
]

const PROGRAMMES = [
  { value: "all", label: "All Programmes" },
  { value: "B.Tech", label: "Bachelor of Technology" },
  { value: "M.Tech", label: "Master of Technology" },
  { value: "PhD", label: "Doctor of Philosophy" },
]

const YEARS = [
  { value: "0", label: "All Years" },
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
]

const SORT_OPTIONS = [
  { value: "rollNumber", label: "Roll Number" },
  { value: "name", label: "Name" },
  { value: "cgpa", label: "CGPA" },
]

// Extended student type with CGPA
interface ExtendedStudent extends DepartmentStudent {
  cgpa?: number
}

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [students, setStudents] = useState<ExtendedStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [department, setDepartment] = useState<string>("")
  const [year, setYear] = useState<string>("0")
  const [programme, setProgramme] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [exporting, setExporting] = useState(false)
  
  // Sorting
  const [sortBy, setSortBy] = useState<'rollNumber' | 'cgpa' | 'name'>('rollNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 50
  
  const { toast } = useToast()
  // Create student dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    registrationNumber: "",
    program: "",
    branch: "",
    year: "",
    phoneNumber: "",
    status: "ACTIVE",
  })
  
  // Check authorization
  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = ["ADMIN", "HOD", "FACULTY"]
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard")
      }
    }
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Set default department based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "FACULTY" && user.faculty?.department) {
        setDepartment(user.faculty.department)
      } else if (user.role === "HOD" && user.hod?.department) {
        setDepartment(user.hod.department)
      } else if (user.role === "ADMIN") {
        // Admin can see all departments, default to "all"
        setDepartment("all")
      }
    }
  }, [user])

  // Fetch students when filters change
  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use the new API with sorting and pagination
      const response = await api.getStudentsList({
        department: department !== "all" && department !== "" ? department : undefined,
        year: year !== "0" ? parseInt(year) : undefined,
        program: programme !== "all" ? programme : undefined,
        sortBy,
        sortOrder,
        page,
        limit,
        search: searchQuery || undefined
      })
      
      // Map response to match existing interface
      const mappedStudents: ExtendedStudent[] = response.students.map(s => ({
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        registrationNumber: s.registrationNumber,
        email: s.collegeEmail || '',
        collegeEmail: s.collegeEmail,
        program: s.program,
        branch: s.branch,
        year: s.year,
        status: s.status,
        phoneNumber: '',
        gender: null,
        cgpa: s.cgpa
      }))
      
      setStudents(mappedStudents)
      setTotalPages(response.pagination.totalPages)
      setTotalCount(response.pagination.totalCount)
    } catch (err) {
      // Fallback to old API if new one fails
      try {
        const response = await api.getDepartmentStudents(
          department !== "all" ? department : undefined,
          year !== "0" ? parseInt(year) : undefined,
          programme !== "all" ? programme : undefined
        )
        setStudents(response.students)
        setTotalCount(response.students.length)
        setTotalPages(1)
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : "Failed to fetch students")
        setStudents([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Toggle sort order
  const toggleSort = (field: 'rollNumber' | 'cgpa' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  // Initial load: fetch only the user's department students
  // For ADMIN: show empty table until they apply filters
  // For HOD/FACULTY: auto-fetch their department students on first load
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  
  useEffect(() => {
    if (!user || initialFetchDone) return
    
    // HOD and FACULTY: auto-fetch their department on initial load
    if ((user.role === 'HOD' || user.role === 'FACULTY') && department && department !== 'all') {
      fetchStudents()
      setInitialFetchDone(true)
    }
    // ADMIN: don't auto-fetch, wait for apply filters button
    else if (user.role === 'ADMIN' && department) {
      // Just set the flag, don't fetch - let them click Apply Filters
      setInitialFetchDone(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, department])

  // Filter students by search query (client-side for fallback)
  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toString().includes(query) ||
      student.registrationNumber.toString().includes(query) ||
      student.email.toLowerCase().includes(query)
    )
  }).sort((a, b) => {
    // Client-side sorting as fallback
    let comparison = 0
    if (sortBy === 'rollNumber') {
      comparison = a.rollNumber - b.rollNumber
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'cgpa') {
      comparison = (a.cgpa || 0) - (b.cgpa || 0)
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !["ADMIN", "HOD", "FACULTY"].includes(user.role)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">View and manage department students</p>
        </div>
        {/* Actions (Export, Add Student) — visible to ADMIN and HOD users */}
        {(user?.role === 'ADMIN' || user?.role === 'HOD') && (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              onClick={async () => {
                setExporting(true)
                try {
                  // Use current filters when exporting
                  await api.exportStudentsCSV(
                    department !== 'all' && department !== '' ? department : undefined,
                    year !== '0' ? parseInt(year) : undefined,
                    programme !== 'all' ? programme : undefined
                  )
                  toast({ title: 'Export started', description: 'CSV download should begin shortly.' })
                } catch (err: any) {
                  console.error('Export failed', err)
                  toast({ title: 'Export failed', description: err?.message || 'Server error' })
                } finally {
                  setExporting(false)
                }
              }}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Students (CSV)'}
            </Button>

            {/* Add Student (ADMIN only) */}
            {user?.role === 'ADMIN' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Student</DialogTitle>
                    <DialogDescription>Add a new student to the system</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setCreating(true)
                      try {
                        const payload = {
                          name: studentForm.name,
                          email: studentForm.email,
                          rollNumber: Number(studentForm.rollNumber),
                          registrationNumber: studentForm.registrationNumber ? Number(studentForm.registrationNumber) : undefined,
                          program: studentForm.program || undefined,
                          branch: studentForm.branch || undefined,
                          year: studentForm.year ? Number(studentForm.year) : undefined,
                          phoneNumber: studentForm.phoneNumber || undefined,
                          status: studentForm.status || undefined,
                        }
                        await api.createStudent(payload)
                        toast({ title: 'Student created', description: `${studentForm.name} has been added.` })
                        setIsCreateDialogOpen(false)
                        setStudentForm({ name: '', email: '', rollNumber: '', registrationNumber: '', program: '', branch: '', year: '', phoneNumber: '', status: 'ACTIVE' })
                        fetchStudents()
                      } catch (err: any) {
                        console.error('Create student failed', err)
                        toast({ title: 'Create failed', description: err?.message || 'Server error' })
                      } finally {
                        setCreating(false)
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-name">Full name</Label>
                        <Input id="student-name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-email">Email</Label>
                        <Input id="student-email" type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-roll">Roll Number</Label>
                          <Input id="student-roll" value={studentForm.rollNumber} onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-reg">Registration No.</Label>
                          <Input id="student-reg" value={studentForm.registrationNumber} onChange={(e) => setStudentForm({ ...studentForm, registrationNumber: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-program">Programme</Label>
                          <Input id="student-program" value={studentForm.program} onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-branch">Branch</Label>
                          <Input id="student-branch" value={studentForm.branch} onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-year">Year</Label>
                          <Input id="student-year" value={studentForm.year} onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-phone">Phone</Label>
                          <Input id="student-phone" value={studentForm.phoneNumber} onChange={(e) => setStudentForm({ ...studentForm, phoneNumber: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); setStudentForm({ name: '', email: '', rollNumber: '', registrationNumber: '', program: '', branch: '', year: '', phoneNumber: '', status: 'ACTIVE' }) }}>Cancel</Button>
                      <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Student'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter students by department, year, and programme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Department (hidden for FACULTY) */}
            {user.role !== "FACULTY" && (
              <div className="space-y-2 md:mr-6">
                <Label>Department</Label>
                <Select 
                  value={department} 
                  onValueChange={setDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter(dept => 
                      // Only show "All Departments" option for ADMIN
                      dept.value !== "all" || user.role === "ADMIN"
                    ).map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Year */}
            <div className="space-y-2 md:mr-6">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Programme */}
            <div className="space-y-2">
              <Label>Programme</Label>
              <Select value={programme} onValueChange={setProgramme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select programme" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, Roll No, Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          {/* Sorting Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'rollNumber' | 'cgpa' | 'name')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Filters Button */}
            <div className="space-y-2 flex items-end">
              <Button 
                onClick={fetchStudents}
                // Allow ADMIN to fetch when department === 'all'; other roles must pick a department
                disabled={loading || (user?.role !== 'ADMIN' && (!department || department === 'all'))}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Students List</CardTitle>
            </div>
            <Badge variant="secondary">
              {totalCount > 0 ? `${totalCount} total` : filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {department ? "No students found" : "Select a department to view students"}
            </div>
          ) : (
            <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button 
                        className="flex items-center font-medium hover:text-primary"
                        onClick={() => toggleSort('name')}
                      >
                        Name {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center font-medium hover:text-primary"
                        onClick={() => toggleSort('rollNumber')}
                      >
                        Roll No {getSortIcon('rollNumber')}
                      </button>
                    </TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center font-medium hover:text-primary"
                        onClick={() => toggleSort('cgpa')}
                      >
                        CGPA {getSortIcon('cgpa')}
                      </button>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => router.push(`/students/${student.rollNumber}`)}
                          className="text-primary hover:underline cursor-pointer text-left"
                        >
                          {student.name}
                        </button>
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        {student.cgpa !== undefined && student.cgpa > 0 ? (
                          <Badge variant={student.cgpa >= 8 ? "default" : student.cgpa >= 6 ? "secondary" : "outline"}>
                            {student.cgpa.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[180px]">{student.email}</span>
                          </div>
                          {student.phoneNumber && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{student.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={student.status === "ACTIVE" || student.status === "PURSUING" ? "default" : "secondary"}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/students/${student.rollNumber}`)}
                          title="View Student Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage(p => Math.max(1, p - 1)); fetchStudents() }}
                    disabled={page <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); fetchStudents() }}
                    disabled={page >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
