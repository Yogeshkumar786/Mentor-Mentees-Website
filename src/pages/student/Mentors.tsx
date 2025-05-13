
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced mock faculty messages with more content for testing
const mockFacultyMessages = [
  {
    id: 1,
    facultyName: "Dr. Ramesh Kumar",
    message: "Your academic performance has been excellent this semester. Keep up the good work!",
    date: "2025-03-25"
  },
  {
    id: 2,
    facultyName: "Dr. Ramesh Kumar",
    message: "I've reviewed your project proposal. Let's discuss some improvements next week. You might want to consider adding a literature review section to demonstrate your understanding of existing research.",
    date: "2025-04-02"
  },
  {
    id: 3,
    facultyName: "Dr. Ramesh Kumar",
    message: "Your attendance has been below the required threshold this month. Please ensure you attend all classes.",
    date: "2025-04-10"
  },
  {
    id: 4,
    facultyName: "Dr. Ramesh Kumar",
    message: "Congratulations on your internship selection! This will be a valuable experience. Make sure to keep me updated on your progress and any challenges you face during your internship period.",
    date: "2025-04-15"
  },
  {
    id: 5,
    facultyName: "Dr. Ramesh Kumar",
    message: "I noticed your performance in the mid-semester examination was below your potential. Please come to my office hours this week so we can discuss strategies for improvement in the final examination.",
    date: "2025-04-20"
  },
  {
    id: 6,
    facultyName: "Dr. Ramesh Kumar",
    message: "Your presentation in the class seminar last week was outstanding. You demonstrated excellent communication skills and deep understanding of the subject matter.",
    date: "2025-04-25"
  }
];

// Mock mentor details
const mockMentorDetails = {
  name: "Dr. Ramesh Kumar",
  email: "ramesh@nitap.ac.in",
  phone: "9876543210",
  department: "Computer Science and Engineering",
  office: "CS Building, Room 305",
  officeHours: "Monday-Friday, 2:00 PM - 4:00 PM"
};

const Mentors = () => {
  const { basicInfo } = useStudent();
  const [activeTab, setActiveTab] = useState("mentor");
  const [messages, setMessages] = useState(mockFacultyMessages);
  
  // Simulate receiving a new message after component loads
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMessage = {
        id: messages.length + 1,
        facultyName: "Dr. Ramesh Kumar",
        message: "Just following up on our discussion about your career goals. I've attached some resources about graduate programs that might interest you.",
        date: new Date().toISOString().split('T')[0]
      };
      setMessages(prev => [...prev, newMessage]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Faculty Mentor</h2>
          <p className="text-gray-600">Communication with your faculty mentor</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="mentor">Mentor Details</TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {messages.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {messages.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mentor">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Mentor</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Name</div>
                        <div>{mockMentorDetails.name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Department</div>
                        <div>{mockMentorDetails.department}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div>{mockMentorDetails.email}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Phone</div>
                        <div>{mockMentorDetails.phone}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Office Location</div>
                        <div>{mockMentorDetails.office}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Office Hours</div>
                        <div>{mockMentorDetails.officeHours}</div>
                      </div>
                      <div className="pt-2 text-sm text-gray-600">
                        <p>Please visit during office hours for in-person discussions or email to schedule an appointment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Messages from Faculty Mentor</h3>
                
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="border rounded-md p-4 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{message.facultyName}</div>
                          <div className="text-sm text-gray-500">{message.date}</div>
                        </div>
                        <div className="text-gray-700">{message.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages from your faculty mentor yet.</p>
                  </div>
                )}
                
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Contact Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>To discuss any concerns with your mentor, please visit during office hours or send an email to schedule a meeting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: {basicInfo.rollNo.toLowerCase()}@student.nitandhra.ac.in
      </div>
    </div>
  );
};

export default Mentors;
