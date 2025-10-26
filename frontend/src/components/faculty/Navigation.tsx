"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || 
           (path === "/faculty/dashboard" && pathname.startsWith("/faculty") && 
            !["/faculty/notification", "/faculty/requeststohod"].includes(pathname)) ? 
      "bg-institute-blue text-white" : 
      "bg-white text-black hover:bg-gray-100";
  };

  return (
    <div className="flex border-b border-gray-200 overflow-x-auto">
      <Link 
        href="/faculty/dashboard" 
        className={`px-6 py-4 font-medium whitespace-nowrap ${isActive("/faculty/dashboard")}`}
      >
        HOME
      </Link>
      <Link 
        href="/faculty/notification" 
        className={`px-6 py-4 font-medium whitespace-nowrap ${isActive("/faculty/notification")}`}
      >
        Student Requests
      </Link>
    </div>
  );
};

export default Navigation;
