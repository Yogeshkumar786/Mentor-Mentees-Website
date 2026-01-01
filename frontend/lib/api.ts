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

// Faculty/HOD Pending Request types
export interface PendingRequestStudent {
  id: string
  name: string
  rollNumber: string
  branch: string
  year: number
}

export interface PendingRequest {
  id: string
  type: RequestType
  status: RequestStatus
  remarks: string | null
  requestData: InternshipRequestData | ProjectRequestData
  createdAt: string
  student: PendingRequestStudent
  assignedTo: {
    id: string
    name: string
  } | null
}

export interface PendingRequestsResponse {
  requests: PendingRequest[]
  total: number
}

export interface ApproveRejectResponse {
  message: string
  requestId: string
  status: RequestStatus
  createdRecord?: {
    type: string
    id: string
  }
}

// Meeting completion types
export interface CompleteMeetingResponse {
  message: string
  meeting: {
    id: string
    date: string
    time: string
    description: string | null
    facultyReview: string
    status: string
    student: {
      name: string
      rollNumber: number
    }
  }
}

export interface CompleteGroupMeetingsRequest {
  date: string
  time: string
  review: string
  description?: string
  year: number
  semester: number
}

export interface CompleteGroupMeetingsResponse {
  message: string
  completedCount: number
  date: string
  time: string
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

// Department Students Types
export interface DepartmentStudent {
  id: string
  name: string
  rollNumber: number
  registrationNumber: number
  email: string
  collegeEmail: string | null
  program: string
  branch: string
  year: number
  phoneNumber: string | null
  gender: string | null
  status: string
}

export interface DepartmentStudentsResponse {
  message: string
  department: string
  filters: {
    year: number | 'all'
    programme: string | 'all'
  }
  count: number
  students: DepartmentStudent[]
}

// Faculty List Types
export interface FacultyMember {
  id: string
  employeeId: string
  name: string
  email: string
  collegeEmail: string | null
  personalEmail: string | null
  phone1: string | null
  phone2: string | null
  department: string
  isActive: boolean
  startDate: string | null
  endDate: string | null
  office: string | null
  officeHours: string | null
  btech: boolean
  mtech: boolean
  phd: boolean
  currentMenteeCount: number
}

export interface FacultyListResponse {
  message: string
  department?: string
  count: number
  faculty: FacultyMember[]
}

// HOD Management Types
export interface HODMember {
  id: string
  userId: string
  facultyId: string
  department: string
  name: string
  email: string
  collegeEmail: string | null
  phone: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

export interface HODListResponse {
  message: string
  count: number
  hods: HODMember[]
}

export interface AssignHODRequest {
  facultyId: string
  department: string
}

export interface AssignHODResponse {
  message: string
  hod: {
    id: string
    facultyId: string
    name: string
    email: string
    department: string
    startDate: string
  }
  previousHod?: string
}

export interface RemoveHODResponse {
  message: string
  hod: {
    id: string
    name: string
    department: string
    endDate: string
  }
}

// HOD Mentorship Management Types
export interface MenteeData {
  mentorshipId: string
  studentId: string
  name: string
  rollNumber: number
  registrationNumber: number
  email: string | null
  program: string
  branch: string
  year: number
  semester: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

export interface FacultyMentorshipData {
  facultyId: string
  facultyName: string
  facultyEmail: string
  employeeId: string
  activeMenteeCount: number
  totalMenteeCount: number
  currentMentees: MenteeData[]
  pastMentees: MenteeData[]
}

export interface UnassignedStudent {
  id: string
  name: string
  rollNumber: number
  registrationNumber: number
  email: string | null
  program: string
  branch: string
  year: number
}

export interface HODMentorshipsStats {
  totalStudents: number
  assignedStudents: number
  unassignedStudents: number
  totalFaculty: number
  activeMentors: number
}

export interface HODMentorshipsResponse {
  department: string
  stats: HODMentorshipsStats
  mentorshipsByFaculty: FacultyMentorshipData[]
  unassignedStudents: UnassignedStudent[]
}

export interface CreateMeetingRequest {
  mentorshipId: string
  date: string
  time: string
  description?: string
}

export interface CreateMeetingResponse {
  message: string
  meeting: {
    id: string
    date: string
    time: string
    description: string | null
    status: string
  }
  mentorship: {
    id: string
    faculty: {
      name: string
      employeeId: string
    }
    student: {
      name: string
      rollNumber: number
    }
  }
}

export interface MentorshipDetailsResponse {
  mentorshipId: string
  isActive: boolean
  year: number
  semester: number
  startDate: string | null
  endDate: string | null
  comments: string[]
  faculty: {
    id: string
    name: string
    employeeId: string
    email: string | null
    phone: string | null
    department: string
  }
  student: {
    id: string
    name: string
    rollNumber: number
    registrationNumber: number
    email: string | null
    program: string
    branch: string
    year: number
  }
  meetings: MeetingData[]
  meetingStats: {
    total: number
    completed: number
    upcoming: number
    yetToDone: number
  }
}

export interface AssignMentorRequest {
  studentRollNumbers: number[]
  facultyEmployeeId: string
  year: number
  semester: number
  comments?: string[]
}

export interface AssignMentorResponse {
  message: string
  mentor: {
    id: string
    name: string
    employeeId: string
    department: string
  }
  year: number
  semester: number
  assignedBy: string
  results: {
    successful: Array<{
      student: {
        name: string
        rollNumber: number
        branch: string
      }
      mentorshipId: string
      previousMentor?: {
        id: string
        name: string
        employeeId: string
        mentorshipId: string
      } | null
      reactivated: boolean
    }>
    failed: Array<{
      rollNumber: number
      reason: string
    }>
    totalProcessed: number
    successCount: number
    failedCount: number
  }
}

export interface EndMentorshipResponse {
  message: string
  mentorship: {
    id: string
    faculty: string
    student: string
    endDate: string
  }
}

// Mentorship Group API types
export interface MentorshipGroupMentee {
  mentorshipId: string
  studentId: string
  name: string
  rollNumber: number
  registrationNumber: number
  email: string | null
  program: string
  branch: string
  studentYear: number
  startDate: string | null
  endDate: string | null
  comments: string[]
}

export interface MentorshipGroupMeeting {
  id: string
  mentorshipId: string
  studentName: string
  studentRollNumber: number
  date: string
  time: string | null
  description: string
  facultyReview: string
  status: 'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE' | 'CANCELLED'
  createdAt: string
}

export interface MentorshipGroupResponse {
  faculty: {
    id: string
    name: string
    employeeId: string
    email: string | null
    phone: string | null
    department: string
  }
  year: number
  semester: number
  isActive: boolean
  menteesCount: number
  mentees: MentorshipGroupMentee[]
  meetings: MentorshipGroupMeeting[]
  meetingStats: {
    total: number
    completed: number
    upcoming: number
    yetToDone: number
  }
}

// Faculty Mentees API types
export interface FacultyMenteeGroup {
  key: string
  year: number
  semester: number
  isActive: boolean
  mentees: Array<{
    mentorshipId: string
    studentId: string
    name: string
    rollNumber: number
    registrationNumber: number
    email: string | null
    program: string
    branch: string
    studentYear: number
    phoneNumber: string | null
    startDate: string | null
    endDate: string | null
  }>
}

export interface FacultyMenteesResponse {
  faculty: {
    id: string
    name: string
    employeeId: string
    email: string | null
    department: string
  }
  stats: {
    totalMentees: number
    activeMentees: number
    pastMentees: number
    totalMeetings: number
    completedMeetings: number
  }
  menteeGroups: FacultyMenteeGroup[]
}

// Faculty Mentorship Group API types (for faculty-group page)
export interface FacultyMentorshipGroupMentee {
  id: string
  mentorshipId: string
  studentId: string
  name: string
  rollNumber: number
  registrationNumber: number
  email: string | null
  program: string
  branch: string
  studentYear: number
  phoneNumber: string | null
  startDate: string | null
  endDate: string | null
  meetingCount: number
  completedMeetings: number
  meetings: Array<{
    id: string
    date: string
    time: string
    description: string | null
    status: string
    notes: string | null
    createdAt: string
  }>
}

export interface FacultyMentorshipGroupResponse {
  faculty: {
    id: string
    name: string
    employeeId: string
    email: string | null
    department: string
  }
  year: number
  semester: number
  isActive: boolean
  menteesCount: number
  mentees: FacultyMentorshipGroupMentee[]
}

// Schedule Meetings API types
export interface ScheduleMeetingItem {
  date: string
  time: string
  description?: string
}

export interface ScheduleMeetingsRequest {
  mentorshipId: string
  meetings: ScheduleMeetingItem[]
}

// Group Schedule Meetings - schedules meetings for ALL students in a group
export interface GroupScheduleMeetingsRequest {
  facultyId: string
  year: number
  semester: number
  meetings: ScheduleMeetingItem[]
}

export interface GroupScheduleMeetingsResponse {
  message: string
  group: {
    facultyId: string
    facultyName: string
    year: number
    semester: number
    studentCount: number
  }
  results: {
    totalStudents: number
    totalMeetingsCreated: number
    studentsWithMeetings: Array<{
      studentId: string
      studentName: string
      meetingsCreated: number
    }>
    failed: Array<{
      studentName: string
      reason: string
    }>
  }
}

export interface ScheduleMeetingsResponse {
  message: string
  mentorship: {
    id: string
    student: {
      name: string
      rollNumber: number
    }
  }
  results: {
    created: Array<{
      id: string
      date: string
      time: string
      status: string
    }>
    failed: Array<{
      index: number
      reason: string
    }>
    totalRequested: number
    successCount: number
    failedCount: number
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

  // Department Students endpoint (for HOD, ADMIN, FACULTY)
  async getDepartmentStudents(
    department: string,
    year?: number,
    programme?: string
  ): Promise<DepartmentStudentsResponse> {
    const params = new URLSearchParams({ department })
    if (year !== undefined && year !== 0) params.append('year', year.toString())
    if (programme) params.append('programme', programme)
    return this.request<DepartmentStudentsResponse>(`/api/department/students?${params.toString()}`)
  }

  // Faculty list endpoint (for HOD, ADMIN)
  async getFacultyList(
    department?: string,
    active?: boolean
  ): Promise<FacultyListResponse> {
    const params = new URLSearchParams()
    if (department) params.append('department', department)
    if (active !== undefined) params.append('active', active.toString())
    const query = params.toString()
    return this.request<FacultyListResponse>(`/api/faculty${query ? `?${query}` : ''}`)
  }

  // HOD Management endpoints (ADMIN only)
  async getHodList(): Promise<HODListResponse> {
    return this.request<HODListResponse>('/api/hods')
  }

  async assignHod(facultyId: string, department: string): Promise<AssignHODResponse> {
    return this.request<AssignHODResponse>('/api/hod/assign', {
      method: 'POST',
      body: JSON.stringify({ facultyId, department }),
    })
  }

  async removeHod(hodId: string): Promise<RemoveHODResponse> {
    return this.request<RemoveHODResponse>(`/api/hod/${hodId}/remove`, {
      method: 'DELETE',
    })
  }

  // HOD Mentorship Management endpoints
  async getHODMentorships(): Promise<HODMentorshipsResponse> {
    return this.request<HODMentorshipsResponse>('/api/hod/mentorships')
  }

  async getMentorshipDetails(mentorshipId: string): Promise<MentorshipDetailsResponse> {
    return this.request<MentorshipDetailsResponse>(`/api/hod/mentorship/${mentorshipId}`)
  }

  async getMentorshipGroup(facultyId: string, year: number, semester: number, isActive: boolean): Promise<MentorshipGroupResponse> {
    const params = new URLSearchParams({
      faculty: facultyId,
      year: year.toString(),
      semester: semester.toString(),
      active: isActive.toString()
    })
    return this.request<MentorshipGroupResponse>(`/api/hod/mentorship/group?${params.toString()}`)
  }

  async createMeeting(data: CreateMeetingRequest): Promise<CreateMeetingResponse> {
    return this.request<CreateMeetingResponse>('/api/hod/meeting/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async assignMentor(data: AssignMentorRequest): Promise<AssignMentorResponse> {
    return this.request<AssignMentorResponse>('/api/hod/assign-mentor', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async endMentorship(mentorshipId: string): Promise<EndMentorshipResponse> {
    return this.request<EndMentorshipResponse>(`/api/hod/mentorship/${mentorshipId}/end`, {
      method: 'PUT',
    })
  }

  async scheduleMeetings(data: ScheduleMeetingsRequest): Promise<ScheduleMeetingsResponse> {
    return this.request<ScheduleMeetingsResponse>('/api/hod/schedule-meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Faculty Mentorship endpoints
  async getFacultyMentees(): Promise<FacultyMenteesResponse> {
    return this.request<FacultyMenteesResponse>('/api/faculty/mentees')
  }

  async getFacultyMentorshipGroup(year: number, semester: number, isActive: boolean): Promise<FacultyMentorshipGroupResponse> {
    const params = new URLSearchParams({
      year: year.toString(),
      semester: semester.toString(),
      active: isActive.toString()
    })
    return this.request<FacultyMentorshipGroupResponse>(`/api/faculty/mentorship/group?${params.toString()}`)
  }

  async facultyScheduleMeetings(data: ScheduleMeetingsRequest): Promise<ScheduleMeetingsResponse> {
    return this.request<ScheduleMeetingsResponse>('/api/faculty/schedule-meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Group scheduling - schedules meetings for ALL students in a group at once
  async scheduleGroupMeetings(data: GroupScheduleMeetingsRequest): Promise<GroupScheduleMeetingsResponse> {
    return this.request<GroupScheduleMeetingsResponse>('/api/hod/schedule-group-meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async facultyScheduleGroupMeetings(year: number, semester: number, meetings: ScheduleMeetingItem[]): Promise<GroupScheduleMeetingsResponse> {
    return this.request<GroupScheduleMeetingsResponse>('/api/faculty/schedule-group-meetings', {
      method: 'POST',
      body: JSON.stringify({ year, semester, meetings }),
    })
  }

  // Faculty/HOD Request Management endpoints
  async getPendingRequests(): Promise<PendingRequestsResponse> {
    return this.request<PendingRequestsResponse>('/api/faculty/requests/pending')
  }

  async approveRequest(requestId: string, feedback?: string): Promise<ApproveRejectResponse> {
    return this.request<ApproveRejectResponse>(`/api/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    })
  }

  async rejectRequest(requestId: string, feedback: string): Promise<ApproveRejectResponse> {
    return this.request<ApproveRejectResponse>(`/api/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    })
  }

  // Meeting completion APIs
  async completeMeeting(meetingId: string, review: string, description?: string): Promise<CompleteMeetingResponse> {
    return this.request<CompleteMeetingResponse>(`/api/meeting/${meetingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ review, description }),
    })
  }

  async completeGroupMeetings(data: CompleteGroupMeetingsRequest): Promise<CompleteGroupMeetingsResponse> {
    return this.request<CompleteGroupMeetingsResponse>('/api/meetings/complete-group', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiService()
