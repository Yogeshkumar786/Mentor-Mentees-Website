// API service for connecting to the Django backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export type UserRole = 'ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT'

export interface ApiUser {
  id: string
  email: string
  role: UserRole
  profilePicture?: string
  accountStatus?: string
  createdAt?: string
  updatedAt?: string
  isAdmin?: boolean
  isHOD?: boolean
  isFaculty?: boolean
  isStudent?: boolean
  student?: {
    id: string
    name: string
    registrationNumber?: string
    rollNumber?: string
    personalEmail?: string
    collegeEmail?: string
    phoneNumber?: string
    program?: string
    branch?: string
    status?: string
  }
  faculty?: {
    id: string
    employeeId?: string
    name: string
    phone1?: string
    phone2?: string
    personalEmail?: string
    collegeEmail?: string
    department?: string
    btech?: boolean
    mtech?: boolean
    phd?: boolean
    office?: string
    officeHours?: string
  }
  hod?: {
    id: string
    department?: string
    startDate?: string
    endDate?: string
  }
  admin?: {
    id: string
    name?: string
    employeeId?: string
    department?: string
  }
}

export interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    role: UserRole
    profilePicture?: string
    accountStatus?: string
  }
}

export interface ApiError {
  message: string
}

// Student API Response Types
export interface StudentAbout {
  id: string
  name: string
  aadhar: string
  phoneNumber: string
  phoneCode: number
  registrationNumber: number
  rollNumber: number
  passPort: string
  emergencyContact: string
  personalEmail: string
  collegeEmail: string
  dob: string | null
  address: string
  program: string
  branch: string
  year: number
  bloodGroup: string
  dayScholar: boolean
  gender: string
  community: string
  status: string
  father: {
    name: string
    occupation: string | null
    aadhar: string | null
    phone: string | null
  }
  mother: {
    name: string
    occupation: string | null
    aadhar: string | null
    phone: string | null
  }
  academicBackground: {
    xMarks: number
    xiiMarks: number
    jeeMains: number
    jeeAdvanced: number | null
  }
  profilePicture: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface StudentCareerDetails {
  id: string | null
  studentId: string
  hobbies: string[]
  strengths: string[]
  areasToImprove: string[]
  careerInterests: {
    core: string[]
    it: string[]
    higherEducation: string[]
    startup: string[]
    familyBusiness: string[]
    otherInterests: string[]
  }
  message?: string
}

export interface StudentInternships {
  studentId: string
  internships: Array<{
    id: string
    semester: number
    type: string
    organisation: string
    stipend: number
    duration: string
    location: string
  }>
  total: number
}

export interface StudentPersonalProblems {
  id: string | null
  studentId: string
  stress: boolean | null
  anger: boolean | null
  examinationAnxiety: boolean | null
  timeManagementProblem: boolean | null
  procrastination: boolean | null
  worriesAboutFuture: boolean | null
  fearOfPublicSpeaking: boolean | null
  message?: string
}

export interface StudentProjects {
  studentId: string
  projects: Array<{
    id: string
    semester: number
    title: string
    description: string
    technologies: string[]
    mentor: {
      name: string | null
      employeeId: string | null
      department: string | null
    } | null
  }>
  total: number
}

export interface StudentAcademic {
  studentId: string
  studentName: string
  program: string
  branch: string
  currentYear: number
  latestCGPA: number | null
  semesters: Array<{
    semester: number
    sgpa: number
    cgpa: number
    subjects: Array<{
      subjectCode: string
      subjectName: string
      credits: number
      grade: string
    }>
    totalCredits: number
  }>
  totalSemesters: number
  preAdmission: {
    xMarks: number
    xiiMarks: number
    jeeMains: number
    jeeAdvanced: number | null
  }
}

// Request types
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RequestType = 'INTERNSHIP' | 'PROJECT' | 'PERFORMANCE' | 'CO_CURRICULAR'

export interface InternshipRequestData {
  semester: number
  type: string
  organisation: string
  stipend: number
  duration: string
  location: string
}

export interface ProjectRequestData {
  semester: number
  title: string
  description: string
  technologies: string[]
  mentorId?: string
  mentorName?: string
}

export interface StudentRequest {
  id: string
  type: RequestType
  status: RequestStatus
  remarks: string | null
  feedback: string | null
  requestData: InternshipRequestData | ProjectRequestData
  createdAt: string
  updatedAt: string
  assignedTo: {
    id: string
    name: string
    department: string
  } | null
}

export interface StudentRequestsResponse {
  studentId: string
  requests: StudentRequest[]
  summary: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export interface CreateInternshipRequest {
  semester: number
  type: string
  organisation: string
  stipend?: number
  duration: string
  location: string
  remarks?: string
}

export interface CreateProjectRequest {
  semester: number
  title: string
  description: string
  technologies?: string[]
  mentorId?: string
  remarks?: string
}

export interface CreateRequestResponse {
  message: string
  requestId: string
  status: RequestStatus
  assignedTo: string
}

// Mentor types
export interface MentorData {
  mentorshipId: string
  facultyId: string
  name: string
  email: string | null
  phone: string | null
  department: string
  year: number
  semester: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  comments: string[]
}

export interface StudentMentorsResponse {
  studentId: string
  studentName: string
  currentMentor: MentorData | null
  pastMentors: MentorData[]
  totalMentors: number
}

export interface MeetingData {
  id: string
  date: string
  time: string | null
  description: string | null
  facultyReview: string | null
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export interface MentorshipMeetingsResponse {
  mentorshipId: string
  mentor: {
    id: string
    name: string
    department: string
    email: string | null
  }
  year: number
  semester: number
  isActive: boolean
  startDate: string | null
  endDate: string | null
  meetings: MeetingData[]
  stats: {
    total: number
    completed: number
    upcoming: number
    cancelled: number
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred')
    }

    return data
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    })
  }

  async getMe(): Promise<ApiUser> {
    return this.request<ApiUser>('/api/auth/me')
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  }

  // Student endpoints
  async getStudentAbout(): Promise<StudentAbout> {
    return this.request<StudentAbout>('/api/student/about')
  }

  async getStudentCareerDetails(): Promise<StudentCareerDetails> {
    return this.request<StudentCareerDetails>('/api/student/career-details')
  }

  async getStudentInternships(): Promise<StudentInternships> {
    return this.request<StudentInternships>('/api/student/internships')
  }

  async getStudentPersonalProblems(): Promise<StudentPersonalProblems> {
    return this.request<StudentPersonalProblems>('/api/student/personal-problems')
  }

  async getStudentProjects(): Promise<StudentProjects> {
    return this.request<StudentProjects>('/api/student/projects')
  }

  async getStudentAcademic(): Promise<StudentAcademic> {
    return this.request<StudentAcademic>('/api/student/academic')
  }

  // Student Request endpoints
  async getStudentRequests(): Promise<StudentRequestsResponse> {
    return this.request<StudentRequestsResponse>('/api/student/requests')
  }

  async createInternshipRequest(data: CreateInternshipRequest): Promise<CreateRequestResponse> {
    return this.request<CreateRequestResponse>('/api/student/internships/request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createProjectRequest(data: CreateProjectRequest): Promise<CreateRequestResponse> {
    return this.request<CreateRequestResponse>('/api/student/projects/request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Student Mentor endpoints
  async getStudentMentors(): Promise<StudentMentorsResponse> {
    return this.request<StudentMentorsResponse>('/api/student/mentors')
  }

  async getMentorshipMeetings(mentorshipId: string): Promise<MentorshipMeetingsResponse> {
    return this.request<MentorshipMeetingsResponse>(`/api/student/mentorship/${mentorshipId}/meetings`)
  }
}

export const api = new ApiService()
