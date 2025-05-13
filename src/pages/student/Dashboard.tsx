
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { basicInfo } = useStudent();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <Card className="shadow">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 text-sm">
              <div className="border p-4">
                <div className="font-semibold">Name:</div>
                <div>{basicInfo.name}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Aadhar No:</div>
                <div>{basicInfo.aadharNo}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Phone No:</div>
                <div>{basicInfo.phoneNo}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Roll No:</div>
                <div>{basicInfo.rollNo}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Passport Detail:</div>
                <div>{basicInfo.passportDetail}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Parent No:</div>
                <div>{basicInfo.parentNo}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Reg. No:</div>
                <div>{basicInfo.regNo}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Country:</div>
                <div>{basicInfo.country}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Emergency No:</div>
                <div>{basicInfo.emergencyNo}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Email:</div>
                <div>{basicInfo.email}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">DOB:</div>
                <div>{basicInfo.dob}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Address:</div>
                <div>{basicInfo.address}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Program:</div>
                <div>{basicInfo.program}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Blood Group:</div>
                <div>{basicInfo.bloodGroup}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Day Scholar:</div>
                <div>{basicInfo.dayScholar}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Branch:</div>
                <div>{basicInfo.branch}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Father Name:</div>
                <div>{basicInfo.fatherName}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Parent Address:</div>
                <div>{basicInfo.parentAddress}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Gender:</div>
                <div>{basicInfo.gender}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Father Occupation:</div>
                <div>{basicInfo.fatherOccupation}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Year Of Admission:</div>
                <div>{basicInfo.yearOfAdmission}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">PWD:</div>
                <div>{basicInfo.pwd}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Mother Name:</div>
                <div>{basicInfo.motherName}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Community:</div>
                <div>{basicInfo.community}</div>
              </div>
              
              <div className="border p-4">
                <div className="font-semibold">Mother Occupation:</div>
                <div>{basicInfo.motherOccupation}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: {basicInfo.rollNo.toLowerCase()}@student.nitandhra.ac.in
      </div>
    </div>
  );
};

export default Dashboard;
