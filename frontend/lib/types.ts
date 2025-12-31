// Core data types for the mentor-mentee management system

export type UserRole = "admin" | "hod" | "faculty" | "student"

export type User = {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  department?: string
  year?: string // For students
  expertise?: string[] // For faculty
  bio?: string
  createdAt: string
  updatedAt: string
}

export type MentorStudentRelationship = {
  id: string
  mentorId: string
  studentId: string
  status: "pending" | "active" | "completed" | "rejected"
  requestedBy: string
  requestedAt: string
  approvedAt?: string
  notes?: string
}

export type Meeting = {
  id: string
  mentorId: string
  studentId: string
  title: string
  description?: string
  scheduledAt: string
  duration: number // in minutes
  location?: string
  meetingType: "in-person" | "online" | "phone"
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Request = {
  id: string
  type: "mentor-assignment" | "meeting-request" | "role-change" | "other"
  requesterId: string
  targetUserId?: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

export type AcademicRecord = {
  id: string
  studentId: string
  semester: string
  year: number
  gpa: number
  courses: Course[]
  achievements: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Course = {
  code: string
  name: string
  grade: string
  credits: number
}

export type CareerGoal = {
  id: string
  studentId: string
  title: string
  description: string
  targetDate?: string
  category: "short-term" | "long-term"
  status: "not-started" | "in-progress" | "completed"
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
}

export type Milestone = {
  id: string
  title: string
  completed: boolean
  completedAt?: string
}

export type AuthUser = Omit<User, "password">
