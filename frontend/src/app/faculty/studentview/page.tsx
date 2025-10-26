"use client"


import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/faculty/Navigation";
import { useFaculty } from "@/contexts/FacultyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock student data - in a real app, this would come from an API
const mockStudentData = {
  basicInfo: {
    name: "John Doe",
    rollNo: "BT20CSE001",
    regNo: "R2021001",
    branch: "Computer Science and Engineering",
    email: "student@nitap.ac.in",
    program: "B.Tech",
    gender: "Male",
    yearOfAdmission: "2020",
    dob: "15/08/2002",
  },
  academicRecord: {
    cgpa: 9.2,
    sgpa: 9.4,
    backlogs: 0,
    semesters: [
      { semester: 1, sgpa: 9.2, cgpa: 9.2 },
      { semester: 2, sgpa: 9.6, cgpa: 9.4 },
      { semester: 3, sgpa: 9.1, cgpa: 9.3 },
      { semester: 4, sgpa: 9.5, cgpa: 9.35 },
      { semester: 5, sgpa: 9.0, cgpa: 9.28 },
    ],
  },
  internships: [
    { semester: 4, type: "Summer Internship", status: "Completed", organization: "Tech Solutions Inc." },
    { semester: 6, type: "Industry Internship", status: "Ongoing", organization: "Cloud Services Ltd." },
  ],
  projects: [
    { semester: 5, title: "Student Management System", description: "A web-based application to manage student records" },
    { semester: 7, title: "Smart Traffic Management", description: "IoT-based traffic management system" },
  ],
  coCurricular: [
    { date: "15/03/2023", event: "National Tech Symposium", participation: "Paper Presentation", award: "First Prize" },
    { date: "21/09/2023", event: "Hackathon 2023", participation: "Team Lead", award: "Runner-up" },
  ],
  personalProblems: [
    { problem: "Examination Anxiety", checked: true },
    { problem: "Exam phobia", checked: true },
    { problem: "Time management problem", checked: true },
    { problem: "Procrastination", checked: true },
    { problem: "Stage phobia", checked: true },
    { problem: "Worries about future", checked: true },
    { problem: "Fear of public speaking", checked: true },
  ]
};

export default function StudentView() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();
  const { students, sendMessageToStudent, facultyMessages } = useFaculty();
  const [newMessage, setNewMessage] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  // In a real app, you would fetch student data based on the ID
  const student = students.find(s => s.id === Number(studentId));
  
  // Filter messages for this student
  const studentMessages = facultyMessages.filter(m => m.studentId === Number(studentId));
  
  if (!student) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header subtitle="Faculty Dashboard" />
        <Navigation />
        <div className="flex-1 p-4 flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Student Not Found</h2>
              <p className="mb-4">The requested student could not be found.</p>
              <Button
                onClick={() => router.push("/faculty")}
                className="bg-institute-blue hover:bg-blue-800"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    sendMessageToStudent(Number(studentId), newMessage);
    setNewMessage("");
    setIsMessageDialogOpen(false);
    toast.success("Message sent to student");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Faculty Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Student Dashboard: {student.name}</h2>
          <div className="space-x-2">
            <Button
              onClick={() => router.push("/faculty")}
              variant="outline"
            >
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => setIsMessageDialogOpen(true)}
              className="bg-institute-blue hover:bg-blue-800"
            >
              Send Message to Student
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-sm">
                <div className="font-semibold">Name:</div>
                <div>{student.name}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Branch:</div>
                <div>{student.branch}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Roll No:</div>
                <div>{student.rollNo}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Year:</div>
                <div>{student.year}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="academic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="academic">Academic Details</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="cocurricular">Co-curricular</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="academic">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">Academic Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm font-semibold">Current CGPA</div>
                    <div className="text-2xl">{mockStudentData.academicRecord.cgpa}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm font-semibold">Latest SGPA</div>
                    <div className="text-2xl">{mockStudentData.academicRecord.sgpa}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm font-semibold">Backlogs</div>
                    <div className="text-2xl">{mockStudentData.academicRecord.backlogs}</div>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-2">Semester-wise Performance</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2 text-left">Semester</th>
                      <th className="border px-4 py-2 text-left">SGPA</th>
                      <th className="border px-4 py-2 text-left">CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudentData.academicRecord.semesters.map((sem) => (
                      <tr key={sem.semester}>
                        <td className="border px-4 py-2">{sem.semester}</td>
                        <td className="border px-4 py-2">{sem.sgpa}</td>
                        <td className="border px-4 py-2">{sem.cgpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="internships">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">Internship Records</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2 text-left">Semester</th>
                      <th className="border px-4 py-2 text-left">Type</th>
                      <th className="border px-4 py-2 text-left">Organization</th>
                      <th className="border px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudentData.internships.map((internship, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{internship.semester}</td>
                        <td className="border px-4 py-2">{internship.type}</td>
                        <td className="border px-4 py-2">{internship.organization}</td>
                        <td className="border px-4 py-2">{internship.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">Project Records</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2 text-left">Semester</th>
                      <th className="border px-4 py-2 text-left">Title</th>
                      <th className="border px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudentData.projects.map((project, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{project.semester}</td>
                        <td className="border px-4 py-2">{project.title}</td>
                        <td className="border px-4 py-2">{project.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cocurricular">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">Co-curricular Activities</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2 text-left">Date</th>
                      <th className="border px-4 py-2 text-left">Event</th>
                      <th className="border px-4 py-2 text-left">Participation</th>
                      <th className="border px-4 py-2 text-left">Award</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudentData.coCurricular.map((activity, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{activity.date}</td>
                        <td className="border px-4 py-2">{activity.event}</td>
                        <td className="border px-4 py-2">{activity.participation}</td>
                        <td className="border px-4 py-2">{activity.award}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personal">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">Personal Problems</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {mockStudentData.personalProblems.map((item, index) => (
                    <div key={index} className="flex items-center p-2 border rounded">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                      <span>{item.problem}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4">Messages Sent to Student</h3>
                {studentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {studentMessages.map((msg) => (
                      <div key={msg.id} className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 mb-1">Sent on: {msg.date}</div>
                        <div>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No messages have been sent to this student yet.</p>
                )}
                <div className="mt-4">
                  <Button 
                    onClick={() => setIsMessageDialogOpen(true)}
                    className="bg-institute-blue hover:bg-blue-800"
                  >
                    Send New Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Message to {student.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full"
              rows={5}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleSendMessage}
              className="bg-institute-blue hover:bg-blue-800"
            >
              Send Message
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


