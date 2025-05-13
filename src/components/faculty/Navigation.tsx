
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === "/faculty" && location.pathname.startsWith("/faculty") && 
            !["/faculty/notification", "/faculty/requests"].includes(location.pathname)) ? 
      "bg-institute-blue text-white" : 
      "bg-white text-black hover:bg-gray-100";
  };

  return (
    <div className="flex border-b border-gray-200 overflow-x-auto">
      <Link 
        to="/faculty" 
        className={`px-6 py-4 font-medium whitespace-nowrap ${isActive("/faculty")}`}
      >
        HOME
      </Link>
      <Link 
        to="/faculty/notification" 
        className={`px-6 py-4 font-medium whitespace-nowrap ${isActive("/faculty/notification")}`}
      >
        Student Requests
      </Link>
    </div>
  );
};

export default Navigation;
