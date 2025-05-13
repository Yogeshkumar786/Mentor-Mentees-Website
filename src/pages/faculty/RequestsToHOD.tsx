
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import Navigation from "@/components/faculty/Navigation";
import { useFaculty } from "@/contexts/FacultyContext";
import { useNavigate } from "react-router-dom";

const RequestsToHOD = () => {
  const navigate = useNavigate();
  
  // This feature has been removed as per request
  // Redirecting to the faculty dashboard
  useState(() => {
    toast.info("This feature has been removed");
    navigate("/faculty");
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Faculty Dashboard" />
      <Navigation />
      
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Feature Removed</h2>
          <p className="mb-4">The HOD Support Request feature has been removed.</p>
          <Button
            onClick={() => navigate("/faculty")}
            className="bg-institute-blue hover:bg-blue-800"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="bg-institute-blue text-white p-3 text-center text-sm">
        For assistance, contact: support@nitap.ac.in
      </div>
    </div>
  );
};

export default RequestsToHOD;
