
import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PersonalProblems = () => {
  const { basicInfo, personalProblems, updatePersonalProblems } = useStudent();
  const [problems, setProblems] = useState(personalProblems);

  const handleChange = (id: string, checked: boolean) => {
    const updatedProblems = problems.map((problem) =>
      problem.id === id ? { ...problem, isChecked: checked } : problem
    );
    setProblems(updatedProblems);
  };

  const handleSave = () => {
    updatePersonalProblems(problems);
    toast.success("Personal problems updated successfully");
  };

  // Group problems into 4 columns
  const problemsPerColumn = Math.ceil(problems.length / 4);
  const columns = Array(4)
    .fill(null)
    .map((_, index) => problems.slice(index * problemsPerColumn, (index + 1) * problemsPerColumn));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-6">Personal Problems</h2>
        
        <Card className="shadow">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns.map((columnProblems, colIndex) => (
                <div key={colIndex} className="space-y-4">
                  {columnProblems.map((problem) => (
                    <div key={problem.id} className="flex items-start space-x-2 border p-2">
                      <Checkbox
                        id={problem.id}
                        checked={problem.isChecked}
                        onCheckedChange={(checked) => handleChange(problem.id, checked === true)}
                      />
                      <label
                        htmlFor={problem.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {problem.problem}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="bg-institute-blue hover:bg-blue-800">
                Save Changes
              </Button>
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

export default PersonalProblems;
