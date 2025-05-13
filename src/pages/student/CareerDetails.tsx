
import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/student/Navigation";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CareerDetails = () => {
  const { basicInfo, careerDetails, updateCareerDetail } = useStudent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentDetail, setCurrentDetail] = useState("");

  const handleEdit = (category: string, detail: string) => {
    setSelectedCategory(category);
    setCurrentDetail(detail);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    updateCareerDetail(selectedCategory, currentDetail);
    toast.success("Career detail updated successfully");
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Student Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-6">Career Details</h2>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careerDetails.map((item, index) => (
            <Card key={index} className="shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{item.category}:</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-institute-blue border-institute-blue hover:bg-institute-blue hover:text-white"
                    onClick={() => handleEdit(item.category, item.detail)}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{item.detail || "Not specified"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {selectedCategory}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="detail">Details</Label>
            <Textarea
              id="detail"
              value={currentDetail}
              onChange={(e) => setCurrentDetail(e.target.value)}
              placeholder={`Enter ${selectedCategory.toLowerCase()} details`}
              className="mt-2"
              rows={5}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-institute-blue hover:bg-blue-800">
              Save Changes
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

export default CareerDetails;
