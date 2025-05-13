
import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const InternshipRecord = () => {
  const { basicInfo, internships, addInternship } = useStudent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInternship, setNewInternship] = useState({
    semester: 1,
    type: "",
    organization: "",
    stipend: "",
    duration: "",
    location: "",
    status: "Pending", // Added the status field with a default value
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInternship({ ...newInternship, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewInternship({ ...newInternship, [name]: name === "semester" ? parseInt(value) : value });
  };

  const handleSubmit = () => {
    if (!newInternship.type || !newInternship.organization || !newInternship.location) {
      toast.error("Please fill all required fields");
      return;
    }
    
    addInternship(newInternship);
    toast.success("Internship request submitted for approval");
    setIsDialogOpen(false);
    setNewInternship({
      semester: 1,
      type: "",
      organization: "",
      stipend: "",
      duration: "",
      location: "",
      status: "Pending", // Reset with the default status value
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Internship Record</h2>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-institute-blue hover:bg-blue-800"
          >
            Add New Internship
          </Button>
        </div>
        
        <div className="mb-6">
          <Card className="shadow">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semester</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Stipend/Pay</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.length > 0 ? (
                    internships.map((internship, index) => (
                      <TableRow key={index}>
                        <TableCell>{internship.semester}</TableCell>
                        <TableCell>{internship.type}</TableCell>
                        <TableCell>{internship.organization}</TableCell>
                        <TableCell>{internship.stipend}</TableCell>
                        <TableCell>{internship.duration}</TableCell>
                        <TableCell>{internship.location}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No internship records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Internship</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                onValueChange={(value) => handleSelectChange("semester", value)}
                defaultValue="1"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                name="type"
                value={newInternship.type}
                onChange={handleInputChange}
                placeholder="Summer Internship, Industrial Training, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                value={newInternship.organization}
                onChange={handleInputChange}
                placeholder="Company/Organization name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stipend">Stipend/Pay</Label>
              <Input
                id="stipend"
                name="stipend"
                value={newInternship.stipend}
                onChange={handleInputChange}
                placeholder="₹15,000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={newInternship.duration}
                onChange={handleInputChange}
                placeholder="2 months"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={newInternship.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-institute-blue hover:bg-blue-800">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: {basicInfo.rollNo.toLowerCase()}@student.nitandhra.ac.in
      </div>
    </div>
  );
};

export default InternshipRecord;
