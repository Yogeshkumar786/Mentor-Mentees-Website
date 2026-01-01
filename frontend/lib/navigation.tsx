import {
  LayoutDashboard,
  FileCheck,
  BookOpen,
  Target,
  GraduationCap,
  ClipboardList,
  Settings,
  UserCheck,
  User,
  Briefcase,
  FolderKanban,
  HeartPulse,
  Shield,
} from "lucide-react"
import type { UserRole } from "@/lib/api"
import type { ReactNode } from "react"

export type NavItem = {
  id: string
  label: string
  href: string
  icon: ReactNode
}

// Navigation items for each role
export const roleNavigations: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "students", label: "Students", href: "/students", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "faculty", label: "Faculty", href: "/faculty", icon: <UserCheck className="w-4 h-4" /> },
    { id: "hods", label: "HODs", href: "/hods", icon: <Shield className="w-4 h-4" /> },
    { id: "requests", label: "Requests", href: "/requests", icon: <FileCheck className="w-4 h-4" /> },
    { id: "settings", label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  ],
  HOD: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "mentor", label: "Mentorship", href: "/mentor", icon: <UserCheck className="w-4 h-4" /> },
    { id: "students", label: "Students", href: "/students", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "faculty", label: "Faculty", href: "/faculty", icon: <UserCheck className="w-4 h-4" /> },
    { id: "approvals", label: "Requests", href: "/requests", icon: <FileCheck className="w-4 h-4" /> },
    { id: "settings", label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  ],
  FACULTY: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "mentor", label: "My Mentees", href: "/mentor", icon: <UserCheck className="w-4 h-4" /> },
    { id: "students", label: "Students", href: "/students", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "requests", label: "Requests", href: "/requests", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "settings", label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  ],
  STUDENT: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "about", label: "My Profile", href: "/about", icon: <User className="w-4 h-4" /> },
    { id: "mentor", label: "Mentors", href: "/mentor", icon: <UserCheck className="w-4 h-4" /> },
    { id: "academics", label: "Academics", href: "/academic", icon: <BookOpen className="w-4 h-4" /> },
    { id: "career", label: "Career Details", href: "/career-details", icon: <Target className="w-4 h-4" /> },
    { id: "internships", label: "Internships", href: "/internships", icon: <Briefcase className="w-4 h-4" /> },
    { id: "projects", label: "Projects", href: "/projects", icon: <FolderKanban className="w-4 h-4" /> },
    { id: "requests", label: "My Requests", href: "/requests", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "problems", label: "Personal Challenges", href: "/personal-problems", icon: <HeartPulse className="w-4 h-4" /> },
    { id: "settings", label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  ],
}

// Define which roles can access which routes
export const routeAccess: Record<string, UserRole[]> = {
  '/dashboard': ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'],
  '/settings': ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'],
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/hod': ['HOD'],
  '/dashboard/faculty': ['FACULTY'],
  // Shared routes (simple URLs)
  '/students': ['ADMIN', 'HOD', 'FACULTY'],
  '/faculty': ['ADMIN', 'HOD'],
  '/hods': ['ADMIN'],
  '/requests': ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'],
  // Student routes (root level)
  '/about': ['STUDENT'],
  '/mentor': ['HOD', 'FACULTY', 'STUDENT'],
  '/academic': ['STUDENT'],
  '/career-details': ['STUDENT'],
  '/internships': ['STUDENT'],
  '/projects': ['STUDENT'],
  '/personal-problems': ['STUDENT'],
}

export function getNavigationForRole(role: UserRole): NavItem[] {
  return roleNavigations[role] || []
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  // Check exact match first
  if (routeAccess[pathname]) {
    return routeAccess[pathname].includes(role)
  }
  
  // Check prefix matches (for nested routes)
  for (const [route, roles] of Object.entries(routeAccess)) {
    if (pathname.startsWith(route) && roles.includes(role)) {
      return true
    }
  }
  
  return false
}

export function getUserDisplayName(user: { role: UserRole; student?: { name: string }; faculty?: { name: string }; email: string }): string {
  if (user.role === 'STUDENT' && user.student?.name) {
    return user.student.name
  }
  if ((user.role === 'FACULTY' || user.role === 'HOD') && user.faculty?.name) {
    return user.faculty.name
  }
  return user.email
}
