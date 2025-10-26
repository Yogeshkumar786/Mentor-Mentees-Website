"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, userRole } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Navigate based on user role from backend
        if (userRole === 'student') {
          router.push('/student');
        } else if (userRole === 'faculty') {
          router.push('/faculty');
        } else if (userRole === 'hod') {
          router.push('/hod');
        } else if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-institute-blue text-white p-4 text-center">
        <h1 className="text-2xl font-bold">National Institute of Technology Andhra Pradesh</h1>
        <p className="text-lg">Login Page</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-lg font-medium">Email:</label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-lg font-medium">Password:</label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  className="bg-institute-blue text-white hover:bg-blue-800 border-none"
                  onClick={() => toast.info("Please contact support for password reset")}
                >
                  Forget Password
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-institute-blue text-white hover:bg-blue-800"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="bg-institute-blue text-white p-3 text-center">
        <p className="text-sm">For assistance, contact: support@nitap.ac.in</p>
      </div>
    </div>
  );
}
