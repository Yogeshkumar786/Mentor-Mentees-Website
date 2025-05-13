
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, UserPlus, MessageSquare, Search, Settings } from "lucide-react";
import { toast } from "sonner";

// Mock data for faculty members
interface FacultyMember {
  id: number;
  name: string;
  department: string;
  email: string;
  phone: string;
  assignedStudents: number;
  activity: {
    date: string;
    action: string;
    studentId: number;
  }[];
}

// Mock data for students
interface Student {
  id: number;
  name: string;
  rollNo: string;
  branch: string;
  year: string;
  mentorId: number | null;
}

const mockFaculty: FacultyMember[] = [
  {
    id: 1,
    name: "Dr. Ramesh Kumar",
    department: "CSE",
    email: "ramesh@nitap.ac.in",
    phone: "9876543210",
    assignedStudents: 5,
    activity: [
      { date: "2025-04-28", action: "Sent remark to student", studentId: 1 },
      { date: "2025-04-26", action: "Approved internship request", studentId: 3 },
      { date: "2025-04-22", action: "Reviewed academic progress", studentId: 1 },
    ]
  },
  {
    id: 2,
    name: "Dr. Sunita Mishra",
    department: "CSE",
    email: "sunita@nitap.ac.in",
    phone: "9876543211",
    assignedStudents: 4,
    activity: [
      { date: "2025-04-29", action: "Sent remark to student", studentId: 2 },
      { date: "2025-04-27", action: "Approved project submission", studentId: 2 },
      { date: "2025-04-23", action: "Reviewed co-curricular achievements", studentId: 2 },
    ]
  },
  {
    id: 3,
    name: "Dr. Venkat Rao",
    department: "CSE",
    email: "venkat@nitap.ac.in",
    phone: "9876543212",
    assignedStudents: 3,
    activity: [
      { date: "2025-04-30", action: "Sent remark to student", studentId: 4 },
      { date: "2025-04-28", action: "Approved participation in hackathon", studentId: 4 },
      { date: "2025-04-24", action: "Reviewed academic progress", studentId: 4 },
    ]
  },
  {
    id: 4,
    name: "Dr. Priya Sharma",
    department: "CSE",
    email: "priya@nitap.ac.in",
    phone: "9876543213",
    assignedStudents: 6,
    activity: [
      { date: "2025-05-01", action: "Sent remark to student", studentId: 5 },
      { date: "2025-04-28", action: "Approved internship request", studentId: 6 },
      { date: "2025-04-25", action: "Reviewed academic progress", studentId: 6 },
    ]
  }
];

const mockStudents: Student[] = [
  {
    id: 1,
    name: "Yogesh Kumar",
    rollNo: "BT20CSE001",
    branch: "CSE",
    year: "3rd",
    mentorId: 1
  },
  {
    id: 2,
    name: "Rahul Sharma",
    rollNo: "BT20CSE002",
    branch: "CSE",
    year: "2nd",
    mentorId: 2
  },
  {
    id: 3,
    name: "Priya Patel",
    rollNo: "BT20CSE003",
    branch: "CSE",
    year: "4th",
    mentorId: 1
  },
  {
    id: 4,
    name: "Arjun Singh",
    rollNo: "BT20CSE004",
    branch: "CSE",
    year: "3rd",
    mentorId: 3
  },
  {
    id: 5,
    name: "Sneha Reddy",
    rollNo: "BT20CSE005",
    branch: "CSE",
    year: "2nd",
    mentorId: 4
  },
  {
    id: 6,
    name: "Amit Kumar",
    rollNo: "BT20CSE006",
    branch: "CSE",
    year: "1st",
    mentorId: 4
  },
  {
    id: 7,
    name: "Meera Desai",
    rollNo: "BT21CSE007",
    branch: "CSE",
    year: "2nd",
    mentorId: null
  },
  {
    id: 8,
    name: "Rajat Verma",
    rollNo: "BT21CSE008",
    branch: "CSE",
    year: "2nd",
    mentorId: null
  }
];

const HodDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>(mockFaculty);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const handleViewFacultyActivity = (facultyId: number) => {
    const faculty = facultyMembers.find(f => f.id === facultyId);
    if (faculty) {
      setSelectedFaculty(faculty);
      setShowActivityDialog(true);
    }
  };
  
  const handleViewStudentDashboard = (studentId: number) => {
    toast.info(`Viewing dashboard for student ID: ${studentId}`);
    // In a real app, this would navigate to a student detail page
  };
  
  const handleAssignStudentToFaculty = () => {
    if (!selectedStudent || !selectedFacultyId) {
      toast.error("Please select both student and faculty");
      return;
    }
    
    setStudents(
      students.map(student => 
        student.id === selectedStudent.id
          ? { ...student, mentorId: selectedFacultyId }
          : student
      )
    );
    
    setFacultyMembers(
      facultyMembers.map(faculty =>
        faculty.id === selectedFacultyId
          ? { ...faculty, assignedStudents: faculty.assignedStudents + 1 }
          : faculty
      )
    );
    
    const faculty = facultyMembers.find(f => f.id === selectedFacultyId);
    
    toast.success(`Assigned ${selectedStudent.name} to ${faculty?.name}`);
    setShowAssignDialog(false);
    setSelectedStudent(null);
    setSelectedFacultyId(null);
  };
  
  const handleReassignStudent = () => {
    if (!selectedStudent || !selectedFacultyId) {
      toast.error("Please select both student and faculty");
      return;
    }
    
    // Get the previous mentor ID
    const prevMentorId = selectedStudent.mentorId;
    
    // Update the student's mentor
    setStudents(
      students.map(student => 
        student.id === selectedStudent.id
          ? { ...student, mentorId: selectedFacultyId }
          : student
      )
    );
    
    // Update faculty assigned students count
    setFacultyMembers(
      facultyMembers.map(faculty => {
        if (faculty.id === selectedFacultyId) {
          return { ...faculty, assignedStudents: faculty.assignedStudents + 1 };
        } else if (faculty.id === prevMentorId) {
          return { ...faculty, assignedStudents: Math.max(0, faculty.assignedStudents - 1) };
        }
        return faculty;
      })
    );
    
    const faculty = facultyMembers.find(f => f.id === selectedFacultyId);
    
    toast.success(`Reassigned ${selectedStudent.name} to ${faculty?.name}`);
    setShowReassignDialog(false);
    setSelectedStudent(null);
    setSelectedFacultyId(null);
  };
  
  const handleResetAllAssignments = () => {
    // Reset all student assignments
    setStudents(
      students.map(student => ({ ...student, mentorId: null }))
    );
    
    // Reset faculty assigned student counts
    setFacultyMembers(
      facultyMembers.map(faculty => ({ ...faculty, assignedStudents: 0 }))
    );
    
    toast.success("All student assignments have been reset for the new semester");
    setShowResetDialog(false);
  };
  
  // Filter students by search query
  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get unassigned students
  const unassignedStudents = students.filter(student => student.mentorId === null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="w-full bg-institute-blue text-white py-4 px-4">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-xl md:text-2xl font-semibold">National Institute of Technology Andhra Pradesh</h1>
            <p className="text-sm md:text-base">HOD Dashboard</p>
          </div>
          <Button 
            variant="outline" 
            className="text-institute-blue border-institute-blue bg-white hover:bg-institute-blue hover:text-white"
            onClick={handleLogout}
          >
            LOG OUT
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome, HOD</h2>
            <p className="text-gray-600">Manage faculty members and student assignments</p>
          </div>
          <Button 
            variant="outline"
            className="flex items-center gap-2 border-institute-blue text-institute-blue hover:bg-institute-blue hover:text-white"
            onClick={() => setShowResetDialog(true)}
          >
            <Settings className="h-4 w-4" /> Reset Assignments
          </Button>
        </div>
        
        <Tabs defaultValue="faculty" className="space-y-4">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="faculty" className="flex-1">
              <UserCheck className="h-4 w-4 mr-2" />
              Faculty
            </TabsTrigger>
            <TabsTrigger value="students" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Students
              {unassignedStudents.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unassignedStudents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facultyMembers.map((faculty) => (
                      <TableRow key={faculty.id}>
                        <TableCell>
                          <div className="font-medium">{faculty.name}</div>
                        </TableCell>
                        <TableCell>{faculty.department}</TableCell>
                        <TableCell>{faculty.email}</TableCell>
                        <TableCell>{faculty.phone}</TableCell>
                        <TableCell>{faculty.assignedStudents}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            className="bg-institute-blue hover:bg-blue-800"
                            onClick={() => handleViewFacultyActivity(faculty.id)}
                          >
                            View Activity
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search students..." 
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="bg-institute-blue hover:bg-blue-800"
                    onClick={() => {
                      if (unassignedStudents.length > 0) {
                        setSelectedStudent(unassignedStudents[0]);
                        setShowAssignDialog(true);
                      } else {
                        toast.info("All students have been assigned to faculty members");
                      }
                    }}
                    disabled={unassignedStudents.length === 0}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Student
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="font-medium">{student.name}</div>
                        </TableCell>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>{student.branch}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>
                          {student.mentorId ? (
                            facultyMembers.find(f => f.id === student.mentorId)?.name
                          ) : (
                            <Badge variant="destructive">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="bg-institute-blue hover:bg-blue-800"
                            onClick={() => handleViewStudentDashboard(student.id)}
                          >
                            View Dashboard
                          </Button>
                          {!student.mentorId ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowAssignDialog(true);
                              }}
                            >
                              Assign Mentor
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowReassignDialog(true);
                              }}
                            >
                              Reassign
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Assign Student Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Student to Faculty</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                onValueChange={(value) => {
                  const student = students.find(s => s.id === parseInt(value));
                  if (student) setSelectedStudent(student);
                }}
                value={selectedStudent?.id.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.rollNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select
                onValueChange={(value) => setSelectedFacultyId(parseInt(value))}
                value={selectedFacultyId?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {facultyMembers.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name} ({faculty.assignedStudents} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignStudentToFaculty}
              className="bg-institute-blue hover:bg-blue-800"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reassign Student Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reassign Student to Different Faculty</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <div className="p-2 border rounded-md bg-gray-50">
                {selectedStudent?.name} ({selectedStudent?.rollNo})
              </div>
              <div className="text-sm text-gray-500">
                Currently assigned to: {facultyMembers.find(f => f.id === selectedStudent?.mentorId)?.name}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faculty">New Faculty</Label>
              <Select
                onValueChange={(value) => setSelectedFacultyId(parseInt(value))}
                value={selectedFacultyId?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new faculty" />
                </SelectTrigger>
                <SelectContent>
                  {facultyMembers
                    .filter(faculty => faculty.id !== selectedStudent?.mentorId)
                    .map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        {faculty.name} ({faculty.assignedStudents} students)
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReassignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReassignStudent}
              className="bg-institute-blue hover:bg-blue-800"
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset All Student Assignments</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-2">Are you sure you want to reset all student-faculty assignments?</p>
            <p className="text-red-500">This action cannot be undone and will remove all current mentor assignments.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleResetAllAssignments}
            >
              Reset All Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Faculty Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Faculty Activity Report</DialogTitle>
            <DialogDescription>
              Recent activities of {selectedFaculty?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedFaculty && (
              <div>
                <h3 className="font-medium mb-2">Activity Log:</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Student</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedFaculty.activity.length > 0 ? (
                        selectedFaculty.activity.map((activity, index) => {
                          const student = students.find(s => s.id === activity.studentId);
                          return (
                            <TableRow key={index}>
                              <TableCell>{activity.date}</TableCell>
                              <TableCell>{activity.action}</TableCell>
                              <TableCell>
                                {student ? (
                                  <span>{student.name} ({student.rollNo})</span>
                                ) : (
                                  <span>Unknown Student</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No activity recorded for this faculty
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Assigned Students:</h3>
                  <div className="space-y-2">
                    {students.filter(s => s.mentorId === selectedFaculty.id).map(student => (
                      <div key={student.id} className="p-2 bg-gray-50 border rounded-md flex justify-between items-center">
                        <div>
                          <span className="font-medium">{student.name}</span> ({student.rollNo}) - {student.year} year
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewStudentDashboard(student.id)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {students.filter(s => s.mentorId === selectedFaculty.id).length === 0 && (
                      <div className="text-center text-gray-500 py-2">
                        No students assigned to this faculty
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowActivityDialog(false)}
              className="bg-institute-blue hover:bg-blue-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: support@nitap.ac.in
      </div>
    </div>
  );
};

export default HodDashboard;
