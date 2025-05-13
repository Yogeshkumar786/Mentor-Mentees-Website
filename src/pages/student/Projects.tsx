
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Projects = () => {
  const { basicInfo, projects, addProject } = useStudent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    semester: 1,
    title: "",
    description: "",
    technologies: "",
    mentor: "",
    status: "Pending", // Added the status field with a default value
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewProject({ ...newProject, [name]: name === "semester" ? parseInt(value) : value });
  };

  const handleSubmit = () => {
    if (!newProject.title || !newProject.description || !newProject.technologies || !newProject.mentor) {
      toast.error("Please fill all required fields");
      return;
    }
    
    addProject(newProject);
    toast.success("Project request submitted for approval");
    setIsDialogOpen(false);
    setNewProject({
      semester: 1,
      title: "",
      description: "",
      technologies: "",
      mentor: "",
      status: "Pending", // Reset with the default status value
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-institute-blue hover:bg-blue-800"
          >
            Add New Project
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
                    <TableHead>Project Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Technologies</TableHead>
                    <TableHead>Mentor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <TableRow key={index}>
                        <TableCell>{project.semester}</TableCell>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={project.description}>
                            {project.description}
                          </div>
                        </TableCell>
                        <TableCell>{project.technologies}</TableCell>
                        <TableCell>{project.mentor}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No project records found
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
            <DialogTitle>Add New Project</DialogTitle>
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
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                name="title"
                value={newProject.title}
                onChange={handleInputChange}
                placeholder="Enter project title"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newProject.description}
                onChange={handleInputChange}
                placeholder="Brief description of the project"
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="technologies">Technologies</Label>
              <Input
                id="technologies"
                name="technologies"
                value={newProject.technologies}
                onChange={handleInputChange}
                placeholder="Python, TensorFlow, React, etc."
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mentor">Mentor</Label>
              <Input
                id="mentor"
                name="mentor"
                value={newProject.mentor}
                onChange={handleInputChange}
                placeholder="Prof. Name"
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

export default Projects;
