
import { useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import CircularProgress from "@/components/CircularProgress";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SemesterDetail = () => {
  const { semester } = useParams<{ semester: string }>();
  const { basicInfo, semesters, currentSemesterDetails } = useStudent();
  
  const semesterNumber = parseInt(semester || "1");
  const semesterData = semesters.find(s => s.semester === semesterNumber);
  
  if (!semesterData) {
    return <Navigate to="/student/academic-record" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-6">Semester {semesterNumber} - Academic Record</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card className="shadow h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4">CGPA:</h3>
                <div className="flex-1 flex items-center justify-center">
                  <CircularProgress percentage={semesterData.cgpa * 10}>
                    <span className="text-3xl text-institute-blue font-bold">{semesterData.cgpa}</span>
                  </CircularProgress>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="font-bold">Total Backlogs:</p>
                    <p className="text-2xl">{semesterData.backlogs}</p>
                  </div>
                  <div>
                    <p className="font-bold">SGPA: {semesterData.sgpa}</p>
                  </div>
                  <div>
                    <p className="font-bold">No. of Backlogs in Current Semester: {semesterData.backlogs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="shadow">
              <CardContent className="p-4">
                <h3 className="text-xl font-bold mb-4">Semester {semesterNumber}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">SI. No.</TableHead>
                      <TableHead className="text-center">Subject</TableHead>
                      <TableHead className="text-center">Minor - 1</TableHead>
                      <TableHead className="text-center">Mid Exam</TableHead>
                      <TableHead className="text-center">Minor - 2</TableHead>
                      <TableHead className="text-center">End Exam</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSemesterDetails.subjects.map((subject) => (
                      <TableRow key={subject.slNo}>
                        <TableCell className="text-center">{subject.slNo}</TableCell>
                        <TableCell className="text-center">{subject.subject}</TableCell>
                        <TableCell className="text-center">{subject.minor1}</TableCell>
                        <TableCell className="text-center">{subject.midExam}</TableCell>
                        <TableCell className="text-center">{subject.minor2}</TableCell>
                        <TableCell className="text-center">{subject.endExam}</TableCell>
                        <TableCell className="text-center">{subject.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Card className="shadow mb-8">
          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-4">Attendance Details:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">SI. No.</TableHead>
                  <TableHead className="text-center">Course Details</TableHead>
                  <TableHead className="text-center">Conducted hours (Cumulative)</TableHead>
                  <TableHead className="text-center">Attended hours (Cumulative)</TableHead>
                  <TableHead className="text-center">Attendance (%)</TableHead>
                  <TableHead className="text-center">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSemesterDetails.attendance.map((record) => (
                  <TableRow key={record.slNo}>
                    <TableCell className="text-center">{record.slNo}</TableCell>
                    <TableCell className="text-center">{record.courseDetails}</TableCell>
                    <TableCell className="text-center">{record.conductedHours}</TableCell>
                    <TableCell className="text-center">{record.attendedHours}</TableCell>
                    <TableCell className="text-center">{record.attendancePercentage}</TableCell>
                    <TableCell className="text-center">{record.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: {basicInfo.rollNo.toLowerCase()}@student.nitandhra.ac.in
      </div>
    </div>
  );
};

export default SemesterDetail;
