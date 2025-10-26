"use client"


import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Navigation from "@/components/faculty/Navigation";
import { useFaculty } from "@/contexts/FacultyContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function Notification() {
  const { students, updateRequestStatus, studentActivities } = useFaculty();
  const router = useRouter();
  
  // Filter students with pending requests
  const pendingRequests = studentActivities.filter(
    activity => activity.status === "Pending"
  );
  
  // Handle accept request
  const handleAccept = (activityId: number) => {
    updateRequestStatus(activityId, "Accepted");
    toast.success("Request accepted successfully");
  };
  
  // Handle reject request
  const handleReject = (activityId: number) => {
    updateRequestStatus(activityId, "Rejected");
    toast.success("Request rejected");
  };
  
  // Handle view student dashboard
  const handleViewStudentDashboard = (studentId: number) => {
    router.push(`/faculty/student/${studentId}`);
    const student = students.find(s => s.id === studentId);
    toast.info(`Viewing dashboard for student ${student?.name}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Faculty Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <h2 className="text-xl font-bold mb-4">Student Activity Requests:</h2>
        
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-4 py-2 text-left">S.NO.</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Branch</th>
                <th className="border px-4 py-2 text-left">Year</th>
                <th className="border px-4 py-2 text-left">Roll No.</th>
                <th className="border px-4 py-2 text-left">Request Type</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-left">Actions</th>
                <th className="border px-4 py-2 text-left">Student Detail</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((activity, index) => {
                  const student = students.find(s => s.id === activity.studentId);
                  return (
                    <tr key={activity.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{student?.name}</td>
                      <td className="border px-4 py-2">{student?.branch}</td>
                      <td className="border px-4 py-2">{student?.year}</td>
                      <td className="border px-4 py-2">{student?.rollNo}</td>
                      <td className="border px-4 py-2">
                        <Badge variant={
                          activity.type === "internship" ? "default" :
                          activity.type === "project" ? "secondary" :
                          "outline"
                        }>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="border px-4 py-2">{activity.description}</td>
                      <td className="border px-4 py-2">
                        <div className="flex space-x-2">
                          <Button 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(activity.id)}
                            size="sm"
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="default" 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleReject(activity.id)}
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <Button 
                          variant="default" 
                          className="bg-institute-blue hover:bg-blue-800"
                          onClick={() => handleViewStudentDashboard(student?.id || 0)}
                          size="sm"
                        >
                          View Dashboard
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="border px-4 py-4 text-center">
                    No pending requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: support@nitap.ac.in
      </div>
    </div>
  );
};


