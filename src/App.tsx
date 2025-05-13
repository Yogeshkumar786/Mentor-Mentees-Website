
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { StudentProvider } from "./contexts/StudentContext";
import { FacultyProvider } from "./contexts/FacultyContext";

// Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import EducationDetails from "./pages/student/EducationDetails";
import AcademicRecord from "./pages/student/AcademicRecord";
import SemesterDetail from "./pages/student/SemesterDetail";
import PersonalProblems from "./pages/student/PersonalProblems";
import InternshipRecord from "./pages/student/InternshipRecord";
import Projects from "./pages/student/Projects";
import CareerDetails from "./pages/student/CareerDetails";
import PerformanceCocurricular from "./pages/student/PerformanceCocurricular";
import Mentors from "./pages/student/Mentors";
import FacultyDashboard from "./pages/faculty/Dashboard";
import Notification from "./pages/faculty/Notification";
import RequestsToHOD from "./pages/faculty/RequestsToHOD";
import StudentView from "./pages/faculty/StudentView";
import HodDashboard from "./pages/hod/Dashboard";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
      
      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <StudentDashboard />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/education-details" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <EducationDetails />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/academic-record" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <AcademicRecord />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/academic-record/:semester" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <SemesterDetail />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/personal-problems" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <PersonalProblems />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/internship-record" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <InternshipRecord />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/projects" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <Projects />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/career-details" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <CareerDetails />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/performance-cocurricular" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <PerformanceCocurricular />
          </StudentProvider>
        </ProtectedRoute>
      } />
      <Route path="/student/mentors" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentProvider>
            <Mentors />
          </StudentProvider>
        </ProtectedRoute>
      } />
      
      {/* Faculty routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyProvider>
            <FacultyDashboard />
          </FacultyProvider>
        </ProtectedRoute>
      } />
      <Route path="/faculty/notification" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyProvider>
            <Notification />
          </FacultyProvider>
        </ProtectedRoute>
      } />
      <Route path="/faculty/requests" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyProvider>
            <RequestsToHOD />
          </FacultyProvider>
        </ProtectedRoute>
      } />
      <Route path="/faculty/student/:studentId" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyProvider>
            <StudentView />
          </FacultyProvider>
        </ProtectedRoute>
      } />
      
      {/* HOD routes */}
      <Route path="/hod" element={
        <ProtectedRoute allowedRoles={['hod']}>
          <HodDashboard />
        </ProtectedRoute>
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
