"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title = "National Institute of Technology Andhra Pradesh", subtitle }: HeaderProps) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="w-full bg-institute-blue text-white py-4 px-4">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm md:text-base">{subtitle}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          className="text-institute-blue border-institute-blue bg-white hover:bg-institute-blue hover:text-white"
          onClick={handleLogout}
        >
          LOG OUT
        </Button>
      </div>
    </div>
  );
};

export default Header;
