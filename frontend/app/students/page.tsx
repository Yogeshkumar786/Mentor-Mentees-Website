"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, type DepartmentStudent } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Users, Mail, Phone } from "lucide-react"

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

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [students, setStudents] = useState<DepartmentStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [department, setDepartment] = useState<string>("")
  const [year, setYear] = useState<string>("0")
  const [programme, setProgramme] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
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
      const response = await api.getDepartmentStudents(
        department !== "all" ? department : undefined,
        year !== "0" ? parseInt(year) : undefined,
        programme !== "all" ? programme : undefined
      )
      setStudents(response.students)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (department) {
      fetchStudents()
    }
  }, [department, year, programme])

  // Filter students by search query
  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toString().includes(query) ||
      student.registrationNumber.toString().includes(query) ||
      student.email.toLowerCase().includes(query)
    )
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
              {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>{student.year}</TableCell>
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
                          variant={student.status === "ACTIVE" ? "default" : "secondary"}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
