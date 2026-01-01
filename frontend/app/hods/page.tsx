"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api, HODMember, FacultyMember } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Plus, Search, UserMinus, UserPlus, Shield, Users } from "lucide-react"

const DEPARTMENTS = [
  { value: "CSE", label: "Computer Science" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "EEE", label: "Electrical & Electronics" },
  { value: "MECH", label: "Mechanical" },
  { value: "CIVIL", label: "Civil" },
  { value: "BIO-TECH", label: "Biotechnology" },
  { value: "MME", label: "Metallurgy & Materials" },
  { value: "CHEM", label: "Chemical" },
]

export default function HodsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [hods, setHods] = useState<HODMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Assign HOD dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState("")
  const [loadingFaculty, setLoadingFaculty] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  
  // Remove HOD state
  const [removing, setRemoving] = useState<string | null>(null)

  // Redirect if not ADMIN
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "ADMIN") {
        router.push("/dashboard")
      }
    }
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch HODs
  const fetchHods = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.getHodList()
      setHods(response.hods)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch HODs")
      setHods([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && user.role === "ADMIN") {
      fetchHods()
    }
  }, [authLoading, user])

  // Fetch faculty for selected department when assigning new HOD
  const fetchFacultyForDepartment = async (department: string) => {
    setLoadingFaculty(true)
    setFacultyList([])
    setSelectedFacultyId("")
    setAssignError(null)
    
    try {
      const response = await api.getFacultyList(department, true) // Only active faculty
      // Filter out faculty who are already HODs
      const hodFacultyIds = hods.filter(h => h.isActive).map(h => h.facultyId)
      const availableFaculty = response.faculty.filter(f => !hodFacultyIds.includes(f.id))
      setFacultyList(availableFaculty)
      
      if (availableFaculty.length === 0) {
        setAssignError("No available faculty in this department to assign as HOD")
      }
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to fetch faculty")
    } finally {
      setLoadingFaculty(false)
    }
  }

  // Handle department change in assign dialog
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept)
    if (dept) {
      fetchFacultyForDepartment(dept)
    }
  }

  // Handle assign HOD
  const handleAssignHod = async () => {
    if (!selectedFacultyId || !selectedDepartment) return
    
    setAssigning(true)
    setAssignError(null)
    
    try {
      const response = await api.assignHod(selectedFacultyId, selectedDepartment)
      setAssignDialogOpen(false)
      setSelectedDepartment("")
      setSelectedFacultyId("")
      setFacultyList([])
      fetchHods() // Refresh the list
      
      // Show success (could use toast)
      alert(response.message)
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to assign HOD")
    } finally {
      setAssigning(false)
    }
  }

  // Handle remove HOD
  const handleRemoveHod = async (hodId: string) => {
    setRemoving(hodId)
    
    try {
      const response = await api.removeHod(hodId)
      fetchHods() // Refresh the list
      alert(response.message)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove HOD")
    } finally {
      setRemoving(null)
    }
  }

  // Filter HODs by search
  const filteredHods = hods.filter(hod => {
    const query = searchQuery.toLowerCase()
    return (
      hod.name.toLowerCase().includes(query) ||
      hod.department.toLowerCase().includes(query) ||
      hod.email.toLowerCase().includes(query)
    )
  })

  // Group HODs by active status
  const activeHods = filteredHods.filter(h => h.isActive)
  const inactiveHods = filteredHods.filter(h => !h.isActive)

  // Get department label
  const getDepartmentLabel = (value: string) => {
    return DEPARTMENTS.find(d => d.value === value)?.label || value
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  // Not authorized
  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HOD Management</h1>
            <p className="text-muted-foreground">
              View and manage Heads of Departments
            </p>
          </div>
          
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Assign New HOD
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assign New HOD</DialogTitle>
                <DialogDescription>
                  Select a department and faculty member to assign as HOD.
                  This will replace the current HOD if one exists.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
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
                
                {selectedDepartment && (
                  <div className="space-y-2">
                    <Label>Faculty Member</Label>
                    {loadingFaculty ? (
                      <div className="flex items-center gap-2 p-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading faculty...
                      </div>
                    ) : (
                      <Select 
                        value={selectedFacultyId} 
                        onValueChange={setSelectedFacultyId}
                        disabled={facultyList.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={facultyList.length === 0 ? "No available faculty" : "Select faculty"} />
                        </SelectTrigger>
                        <SelectContent>
                          {facultyList.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name} ({faculty.employeeId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                
                {assignError && (
                  <p className="text-sm text-red-500">{assignError}</p>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAssignDialogOpen(false)
                    setSelectedDepartment("")
                    setSelectedFacultyId("")
                    setAssignError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignHod}
                  disabled={!selectedFacultyId || !selectedDepartment || assigning}
                >
                  {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign HOD
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total HODs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hods.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active HODs</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeHods.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{DEPARTMENTS.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardContent className="p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Active HODs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current HODs</CardTitle>
            <CardDescription>
              Active Heads of Departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeHods.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No active HODs found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeHods.map((hod) => (
                    <TableRow key={hod.id}>
                      <TableCell className="font-medium">{hod.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getDepartmentLabel(hod.department)}</Badge>
                      </TableCell>
                      <TableCell>{hod.email}</TableCell>
                      <TableCell>{hod.phone || "-"}</TableCell>
                      <TableCell>
                        {hod.startDate ? new Date(hod.startDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={removing === hod.id}
                            >
                              {removing === hod.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove HOD?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {hod.name} as HOD of {getDepartmentLabel(hod.department)}?
                                Their role will be reverted to Faculty.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveHod(hod.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Past HODs Table */}
        {inactiveHods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past HODs</CardTitle>
              <CardDescription>
                Former Heads of Departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveHods.map((hod) => (
                    <TableRow key={hod.id}>
                      <TableCell className="font-medium">{hod.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getDepartmentLabel(hod.department)}</Badge>
                      </TableCell>
                      <TableCell>{hod.email}</TableCell>
                      <TableCell>
                        {hod.startDate ? new Date(hod.startDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        {hod.endDate ? new Date(hod.endDate).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
