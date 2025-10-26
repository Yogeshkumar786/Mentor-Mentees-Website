"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Navigation from "@/components/faculty/Navigation";
import { useRouter } from "next/navigation";

export default function RequestsToHOD() {
  const router = useRouter();

  useEffect(() => {
    toast.info("This feature has been removed");
    router.push("/faculty");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header subtitle="Faculty Dashboard" />
      <Navigation />

      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Feature Removed</h2>
          <p className="mb-4">The HOD Support Request feature has been removed.</p>
          <Button
            onClick={() => router.push("/faculty")}
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
}
