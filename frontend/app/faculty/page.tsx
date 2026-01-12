"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, type FacultyMember, type CreateFacultyRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Search, GraduationCap, Mail, Phone, Building, Users, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const ACTIVE_STATUS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export default function FacultyPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [department, setDepartment] = useState<string>("all")
  const [activeStatus, setActiveStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
  // Add Faculty Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newFaculty, setNewFaculty] = useState<CreateFacultyRequest>({
    employeeId: "",
    name: "",
    phone1: "",
    phone2: "",
    personalEmail: "",
    collegeEmail: "",
    department: "CSE",
    office: "",
    officeHours: "",
    password: "",
    btech: "",
    mtech: "",
    phd: ""
  })
  
  // Check authorization - only HOD and ADMIN
  useEffect(() => {
    if (!authLoading && user) {
      const allowedRoles = ["ADMIN", "HOD"]
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard")
      }
    }
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Set default department for HOD (but allow changing)
  useEffect(() => {
    if (user?.role === "HOD" && user.hod?.department && department === "all") {
      setDepartment(user.hod.department)
    }
  }, [user])

  // Fetch faculty
  const fetchFaculty = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.getFacultyList(
        department !== "all" ? department : undefined,
        activeStatus !== "all" ? activeStatus === "true" : undefined
      )
      setFaculty(response.faculty)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch faculty")
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && ["ADMIN", "HOD"].includes(user.role)) {
      fetchFaculty()
    }
  }, [department, activeStatus, authLoading, user])

  // Filter faculty by search query
  const filteredFaculty = faculty.filter(member => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(query) ||
      member.employeeId.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query)
    )
  })

  // Reset add faculty form
  const resetAddForm = () => {
    setNewFaculty({
      employeeId: "",
      name: "",
      phone1: "",
      phone2: "",
      personalEmail: "",
      collegeEmail: "",
      department: "CSE",
      office: "",
      officeHours: "",
      password: "",
      btech: "",
      mtech: "",
      phd: ""
    })
  }

  // Handle add faculty
  const handleAddFaculty = async () => {
    // Validate required fields
    if (!newFaculty.employeeId || !newFaculty.name || !newFaculty.phone1 || 
        !newFaculty.personalEmail || !newFaculty.collegeEmail || !newFaculty.department ||
        !newFaculty.office || !newFaculty.officeHours || !newFaculty.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setAddLoading(true)
    try {
      await api.createFaculty(newFaculty)
      toast({
        title: "Success",
        description: "Faculty member added successfully"
      })
      setAddDialogOpen(false)
      resetAddForm()
      fetchFaculty()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add faculty",
        variant: "destructive"
      })
    } finally {
      setAddLoading(false)
    }
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !["ADMIN", "HOD"].includes(user.role)) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Faculty</h1>
            <p className="text-muted-foreground">View and manage faculty members</p>
          </div>
          {user.role === "ADMIN" && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Faculty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Faculty</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new faculty member account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        value={newFaculty.employeeId}
                        onChange={(e) => setNewFaculty({...newFaculty, employeeId: e.target.value})}
                        placeholder="e.g., FAC001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newFaculty.name}
                        onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone1">Phone 1 *</Label>
                      <Input
                        id="phone1"
                        value={newFaculty.phone1}
                        onChange={(e) => setNewFaculty({...newFaculty, phone1: e.target.value})}
                        placeholder="9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone2">Phone 2</Label>
                      <Input
                        id="phone2"
                        value={newFaculty.phone2}
                        onChange={(e) => setNewFaculty({...newFaculty, phone2: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personalEmail">Personal Email *</Label>
                      <Input
                        id="personalEmail"
                        type="email"
                        value={newFaculty.personalEmail}
                        onChange={(e) => setNewFaculty({...newFaculty, personalEmail: e.target.value})}
                        placeholder="john@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collegeEmail">College Email *</Label>
                      <Input
                        id="collegeEmail"
                        type="email"
                        value={newFaculty.collegeEmail}
                        onChange={(e) => setNewFaculty({...newFaculty, collegeEmail: e.target.value})}
                        placeholder="john@college.edu"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select 
                        value={newFaculty.department} 
                        onValueChange={(value) => setNewFaculty({...newFaculty, department: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.filter(d => d.value !== "all").map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newFaculty.password}
                        onChange={(e) => setNewFaculty({...newFaculty, password: e.target.value})}
                        placeholder="Initial password"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="office">Office *</Label>
                      <Input
                        id="office"
                        value={newFaculty.office}
                        onChange={(e) => setNewFaculty({...newFaculty, office: e.target.value})}
                        placeholder="Room 101, Block A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="officeHours">Office Hours *</Label>
                      <Input
                        id="officeHours"
                        value={newFaculty.officeHours}
                        onChange={(e) => setNewFaculty({...newFaculty, officeHours: e.target.value})}
                        placeholder="Mon-Fri 10AM-5PM"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="btech">B.Tech Programs</Label>
                      <Input
                        id="btech"
                        value={newFaculty.btech}
                        onChange={(e) => setNewFaculty({...newFaculty, btech: e.target.value})}
                        placeholder="CSE, IT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mtech">M.Tech Programs</Label>
                      <Input
                        id="mtech"
                        value={newFaculty.mtech}
                        onChange={(e) => setNewFaculty({...newFaculty, mtech: e.target.value})}
                        placeholder="CSE, Data Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phd">PhD Programs</Label>
                      <Input
                        id="phd"
                        value={newFaculty.phd}
                        onChange={(e) => setNewFaculty({...newFaculty, phd: e.target.value})}
                        placeholder="AI/ML, Networks"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetAddForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFaculty} disabled={addLoading}>
                    {addLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Faculty
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter faculty by department and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department */}
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
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={activeStatus} onValueChange={setActiveStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
                  placeholder="Name, Employee ID, Email..."
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
              <GraduationCap className="h-5 w-5" />
              <CardTitle>Faculty List</CardTitle>
            </div>
            <Badge variant="secondary">
              {filteredFaculty.length} member{filteredFaculty.length !== 1 ? "s" : ""}
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
          ) : filteredFaculty.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No faculty members found
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Programmes</TableHead>
                    <TableHead>Mentees</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => router.push(`/faculty/${member.id}`)}
                          className="text-left hover:text-primary hover:underline transition-colors"
                        >
                          {member.name}
                        </button>
                      </TableCell>
                      <TableCell>{member.employeeId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span>{member.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[180px]">{member.email}</span>
                          </div>
                          {member.phone1 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{member.phone1}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {member.btech && <Badge variant="outline" className="text-xs">B.Tech</Badge>}
                          {member.mtech && <Badge variant="outline" className="text-xs">M.Tech</Badge>}
                          {member.phd && <Badge variant="outline" className="text-xs">PhD</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{member.currentMenteeCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.isActive ? "default" : "secondary"}
                        >
                          {member.isActive ? "Active" : "Inactive"}
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
