// localStorage wrapper for data persistence
import type { User, MentorStudentRelationship, Meeting, Request, AcademicRecord, CareerGoal } from "./types"

const STORAGE_KEYS = {
  USERS: "college_mentor_users",
  RELATIONSHIPS: "college_mentor_relationships",
  MEETINGS: "college_mentor_meetings",
  REQUESTS: "college_mentor_requests",
  ACADEMIC_RECORDS: "college_mentor_academic_records",
  CAREER_GOALS: "college_mentor_career_goals",
  CURRENT_USER: "college_mentor_current_user",
} as const

// Initialize with demo data
function initializeDemoData() {
  if (typeof window === "undefined") return

  // Only initialize if no users exist
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS)
  if (existingUsers) return

  const demoUsers: User[] = [
    {
      id: "1",
      email: "admin",
      password: "123",
      name: "Admin User",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "hod",
      password: "123",
      name: "Dr. Robert Smith",
      role: "hod",
      department: "Computer Science",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      email: "faculty",
      password: "123",
      name: "Dr. Sarah Johnson",
      role: "faculty",
      department: "Computer Science",
      expertise: ["Web Development", "AI/ML"],
      bio: "Professor with 15 years of experience.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      email: "student",
      password: "123",
      name: "Alex Martinez",
      role: "student",
      department: "Computer Science",
      year: "Junior",
      bio: "Passionate about technology.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers))
  localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.ACADEMIC_RECORDS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify([]))
}

// Generic storage functions
function getItems<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function setItems<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(items))
}

export const storage = {
  // Initialize
  init: initializeDemoData,

  // Users
  getUsers: () => getItems<User>(STORAGE_KEYS.USERS),
  setUsers: (users: User[]) => setItems(STORAGE_KEYS.USERS, users),
  getUserById: (id: string) => {
    const users = getItems<User>(STORAGE_KEYS.USERS)
    return users.find((u) => u.id === id)
  },
  getUserByEmail: (email: string) => {
    const users = getItems<User>(STORAGE_KEYS.USERS)
    return users.find((u) => u.email === email)
  },

  // Relationships
  getRelationships: () => getItems<MentorStudentRelationship>(STORAGE_KEYS.RELATIONSHIPS),
  setRelationships: (relationships: MentorStudentRelationship[]) => setItems(STORAGE_KEYS.RELATIONSHIPS, relationships),

  // Meetings
  getMeetings: () => getItems<Meeting>(STORAGE_KEYS.MEETINGS),
  setMeetings: (meetings: Meeting[]) => setItems(STORAGE_KEYS.MEETINGS, meetings),

  // Requests
  getRequests: () => getItems<Request>(STORAGE_KEYS.REQUESTS),
  setRequests: (requests: Request[]) => setItems(STORAGE_KEYS.REQUESTS, requests),

  // Academic Records
  getAcademicRecords: () => getItems<AcademicRecord>(STORAGE_KEYS.ACADEMIC_RECORDS),
  setAcademicRecords: (records: AcademicRecord[]) => setItems(STORAGE_KEYS.ACADEMIC_RECORDS, records),

  // Career Goals
  getCareerGoals: () => getItems<CareerGoal>(STORAGE_KEYS.CAREER_GOALS),
  setCareerGoals: (goals: CareerGoal[]) => setItems(STORAGE_KEYS.CAREER_GOALS, goals),

  // Current User
  getCurrentUser: () => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return data ? JSON.parse(data) : null
  },
  setCurrentUser: (user: User | null) => {
    if (typeof window === "undefined") return
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  },

  // Clear all data
  clearAll: () => {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}
