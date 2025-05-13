
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      switch(userRole) {
        case 'student':
          navigate("/student");
          break;
        case 'faculty':
          navigate("/faculty");
          break;
        case 'hod':
          navigate("/hod");
          break;
        default:
          navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate, isAuthenticated, userRole]);

  return null;
};

export default Index;
