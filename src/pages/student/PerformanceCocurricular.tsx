
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

const PerformanceCocurricular = () => {
  const { basicInfo, coCurricularActivities, addCoCurricularActivity } = useStudent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    date: "",
    semester: 1,
    eventDetails: "",
    participationDetails: "",
    awards: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewActivity({ ...newActivity, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewActivity({ ...newActivity, [name]: name === "semester" ? parseInt(value) : value });
  };

  const handleSubmit = () => {
    if (!newActivity.date || !newActivity.eventDetails || !newActivity.participationDetails) {
      toast.error("Please fill all required fields");
      return;
    }
    
    addCoCurricularActivity(newActivity);
    toast.success("Co-curricular activity submitted for approval");
    setIsDialogOpen(false);
    setNewActivity({
      date: "",
      semester: 1,
      eventDetails: "",
      participationDetails: "",
      awards: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Performance Co-curricular</h2>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-institute-blue hover:bg-blue-800"
          >
            Add New Achievement
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
                    <TableHead>Date</TableHead>
                    <TableHead>Sem</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Participation Details</TableHead>
                    <TableHead>Awards (If Any)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coCurricularActivities.length > 0 ? (
                    coCurricularActivities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell>{activity.semester}</TableCell>
                        <TableCell>{activity.eventDetails}</TableCell>
                        <TableCell>{activity.participationDetails}</TableCell>
                        <TableCell>{activity.awards || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No co-curricular activities found
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
            <DialogTitle>Add New Co-curricular Achievement</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="text"
                value={newActivity.date}
                onChange={handleInputChange}
                placeholder="DD/MM/YYYY"
                required
              />
            </div>
            
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
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="eventDetails">Event Details</Label>
              <Input
                id="eventDetails"
                name="eventDetails"
                value={newActivity.eventDetails}
                onChange={handleInputChange}
                placeholder="Name and details of the event"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="participationDetails">Participation Details</Label>
              <Input
                id="participationDetails"
                name="participationDetails"
                value={newActivity.participationDetails}
                onChange={handleInputChange}
                placeholder="How you participated (e.g., Paper Presentation, Team Lead)"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="awards">Awards (If Any)</Label>
              <Input
                id="awards"
                name="awards"
                value={newActivity.awards}
                onChange={handleInputChange}
                placeholder="First Prize, Runner-up, etc."
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

export default PerformanceCocurricular;
