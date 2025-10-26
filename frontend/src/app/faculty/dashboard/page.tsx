"use client"


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Navigation from "@/components/faculty/Navigation";
import { useFaculty } from "@/contexts/FacultyContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Search } from "lucide-react";

export default function FacultyDashboard() {
  const { students, questions, answerQuestion, assignedStudents } = useFaculty();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  // Filter students that are assigned to this faculty
  const myStudents = students.filter(student => 
    assignedStudents.includes(student.id)
  );
  
  // Filter by search query
  const filteredStudents = myStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get questions for the selected student
  const studentQuestions = selectedStudent 
    ? questions.filter(q => q.studentId === selectedStudent && q.status === "Pending") 
    : [];
  
  // Handle dialog open for providing remarks
  const handleOpenRemarkDialog = (studentId: number) => {
    setSelectedStudent(studentId);
    setIsDialogOpen(true);
  };
  
  // Handle submitting the answer/remark
  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      toast.error("Please provide a valid remark");
      return;
    }
    
    if (studentQuestions.length) {
      answerQuestion(studentQuestions[0].id, answer);
    } else {
      // Send a direct message if there are no pending questions
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        toast.success(`Remark sent to ${student.name}`);
      }
    }
    
    setAnswer("");
    setIsDialogOpen(false);
  };
  
  // Handle view student dashboard
  const handleViewStudentDashboard = (studentId: number) => {
    router.push(`/faculty/student/${studentId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Faculty Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">My Students:</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search students..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-4 py-2 text-left">S.NO.</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Branch</th>
                <th className="border px-4 py-2 text-left">Year</th>
                <th className="border px-4 py-2 text-left">Roll No.</th>
                <th className="border px-4 py-2 text-left">Remark</th>
                <th className="border px-4 py-2 text-left">Student Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2">{student.branch}</td>
                    <td className="border px-4 py-2">{student.year}</td>
                    <td className="border px-4 py-2">{student.rollNo}</td>
                    <td className="border px-4 py-2">
                      <Button 
                        variant="default" 
                        className="bg-institute-blue hover:bg-blue-800 flex items-center gap-2"
                        onClick={() => handleOpenRemarkDialog(student.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Remark
                      </Button>
                    </td>
                    <td className="border px-4 py-2">
                      <Button 
                        variant="default" 
                        className="bg-institute-blue hover:bg-blue-800"
                        onClick={() => handleViewStudentDashboard(student.id)}
                      >
                        Student Dashboard
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border px-4 py-4 text-center">
                    {myStudents.length === 0 
                      ? "No students assigned to you yet" 
                      : "No students match your search criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Remark Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Remark to Student</DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <div className="mt-2">
                  <p>Send a message to {students.find(s => s.id === selectedStudent)?.name}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <label className="block text-sm font-medium mb-2">
              Your Remark:
            </label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your remark or feedback here..."
              className="w-full"
              rows={5}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleSubmitAnswer}
              className="bg-institute-blue hover:bg-blue-800"
            >
              Send Remark
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


