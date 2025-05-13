
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import CircularProgress from "@/components/CircularProgress";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AcademicRecord = () => {
  const { basicInfo, semesters } = useStudent();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-6">Academic Record</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card className="shadow h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4">CGPA:</h3>
                <div className="flex-1 flex items-center justify-center">
                  <CircularProgress percentage={semesters[semesters.length - 1].cgpa * 10}>
                    <span className="text-3xl text-institute-blue font-bold">{semesters[semesters.length - 1].cgpa}</span>
                  </CircularProgress>
                </div>
                <div className="mt-4">
                  <p className="font-bold">Total Backlogs:</p>
                  <p className="text-2xl">{semesters.reduce((total, sem) => total + sem.backlogs, 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="shadow">
              <CardContent className="p-4">
                <h3 className="text-xl font-bold mb-4">Semester:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Semester</TableHead>
                      <TableHead className="text-center">Cumulative Credits</TableHead>
                      <TableHead className="text-center">No of Credits Passed</TableHead>
                      <TableHead className="text-center">No of Backlog Credits</TableHead>
                      <TableHead className="text-center">CGPA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesters.map((semester) => (
                      <TableRow key={semester.semester}>
                        <TableCell className="text-center font-medium bg-institute-blue text-white">
                          <Link to={`/student/academic-record/${semester.semester}`} className="hover:underline">
                            Semester {semester.semester}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">{semester.cumulativeCredits}</TableCell>
                        <TableCell className="text-center">{semester.creditsPassed}</TableCell>
                        <TableCell className="text-center">{semester.backlogCredits}</TableCell>
                        <TableCell className="text-center">{semester.cgpa}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: {basicInfo.rollNo.toLowerCase()}@student.nitandhra.ac.in
      </div>
    </div>
  );
};

export default AcademicRecord;
