
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  GraduationCap, 
  FileText, 
  Heart, 
  Briefcase, 
  Lightbulb, 
  Award, 
  TrendingUp, 
  User
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-institute-blue text-white" : "hover:bg-gray-100";
  };

  const navItems = [
    { icon: <Home className="w-5 h-5" />, text: "HOME", path: "/student" },
    { icon: <GraduationCap className="w-5 h-5" />, text: "Education Details", path: "/student/education-details" },
    { icon: <FileText className="w-5 h-5" />, text: "Academic Record", path: "/student/academic-record" },
    { icon: <Heart className="w-5 h-5" />, text: "Personal Problems", path: "/student/personal-problems" },
    { icon: <Briefcase className="w-5 h-5" />, text: "Internship Record", path: "/student/internship-record" },
    { icon: <Lightbulb className="w-5 h-5" />, text: "Projects", path: "/student/projects" },
    { icon: <Award className="w-5 h-5" />, text: "Career Details", path: "/student/career-details" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "Performance Co-curricular", path: "/student/performance-cocurricular" },
    { icon: <User className="w-5 h-5" />, text: "Mentors", path: "/student/mentors" },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 flex flex-wrap">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={`flex items-center px-2 py-3 text-sm ${isActive(item.path)} transition-colors duration-200 border-r border-gray-200`}
        >
          <span className="mr-1">{item.icon}</span>
          <span className="hidden md:inline">{item.text}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
