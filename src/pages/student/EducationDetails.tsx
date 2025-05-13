
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import CircularProgress from "@/components/CircularProgress";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";

const EducationDetails = () => {
  const { basicInfo, educationMarks } = useStudent();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-6">Education Details</h2>
        
        <div className="mb-6">
          <Card className="shadow mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-sm">
                  <div className="font-semibold">Name:</div>
                  <div>{basicInfo.name}</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Branch:</div>
                  <div>{basicInfo.branch}</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Roll No:</div>
                  <div>{basicInfo.rollNo}</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Reg. No:</div>
                  <div>{basicInfo.regNo}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">X Class:</h3>
              <CircularProgress percentage={educationMarks.tenthPercentage}>
                <span className="text-2xl text-institute-blue font-bold">{educationMarks.tenthPercentage}%</span>
              </CircularProgress>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">XII Class:</h3>
              <CircularProgress percentage={educationMarks.twelfthPercentage}>
                <span className="text-2xl text-institute-blue font-bold">{educationMarks.twelfthPercentage}%</span>
              </CircularProgress>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">JEE MAIN:</h3>
              <CircularProgress percentage={educationMarks.jeeMain}>
                <span className="text-2xl text-institute-blue font-bold">{educationMarks.jeeMain}%</span>
              </CircularProgress>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">JEE ADVANCE:</h3>
              <CircularProgress percentage={educationMarks.jeeAdvance}>
                <span className="text-2xl text-institute-blue font-bold">{educationMarks.jeeAdvance}%</span>
              </CircularProgress>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: {basicInfo.rollNo.toLowerCase()}@student.nitandhra.ac.in
      </div>
    </div>
  );
};

export default EducationDetails;
