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
  careerRankings: {
    govt_sector_rank: number
    core_rank: number
    it_rank: number
    higher_education_rank: number
    startup_rank: number
    family_business_rank: number
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
  // Column 1
  stress: boolean | null
  anger: boolean | null
  emotional_problem: boolean | null
  low_self_esteem: boolean | null
  examination_anxiety: boolean | null
  negative_thoughts: boolean | null
  exam_phobia: boolean | null
  stammering: boolean | null
  financial_problems: boolean | null
  disturbed_relationship_with_teachers: boolean | null
  disturbed_relationship_with_parents: boolean | null
  // Column 2
  mood_swings: boolean | null
  stage_phobia: boolean | null
  poor_concentration: boolean | null
  poor_memory_problem: boolean | null
  adjustment_problem: boolean | null
  frustration: boolean | null
  migraine_headache: boolean | null
  relationship_problems: boolean | null
  fear_of_public_speaking: boolean | null
  disciplinary_problems_in_college: boolean | null
  disturbed_peer_relationship_with_friends: boolean | null
  // Column 3
  worries_about_future: boolean | null
  disappointment_with_course: boolean | null
  time_management_problem: boolean | null
  lack_of_expression: boolean | null
  poor_decisive_power: boolean | null
  conflicts: boolean | null
  low_self_motivation: boolean | null
  procrastination: boolean | null
  suicidal_attempt_or_thought: boolean | null
  tobacco_or_alcohol_use: boolean | null
  poor_command_of_english: boolean | null
  // Special Issues
  economic_issues: string | null
  economic_issues_suggestion: string | null
  economic_issues_outcome: string | null
  teenage_issues: string | null
  teenage_issues_suggestion: string | null
  teenage_issues_outcome: string | null
  health_issues: string | null
  health_issues_suggestion: string | null
  health_issues_outcome: string | null
  emotional_issues: string | null
  emotional_issues_suggestion: string | null
  emotional_issues_outcome: string | null
  psychological_issues: string | null
  psychological_issues_suggestion: string | null
  psychological_issues_outcome: string | null
  additional_comments: string | null
  message?: string
}

// Update request types for Student APIs
export interface UpdatePersonalProblemsRequest {
  // Column 1
  stress?: boolean | null
  anger?: boolean | null
  emotional_problem?: boolean | null
  low_self_esteem?: boolean | null
  examination_anxiety?: boolean | null
  negative_thoughts?: boolean | null
  exam_phobia?: boolean | null
  stammering?: boolean | null
  financial_problems?: boolean | null
  disturbed_relationship_with_teachers?: boolean | null
  disturbed_relationship_with_parents?: boolean | null
  // Column 2
  mood_swings?: boolean | null
  stage_phobia?: boolean | null
  poor_concentration?: boolean | null
  poor_memory_problem?: boolean | null
  adjustment_problem?: boolean | null
  frustration?: boolean | null
  migraine_headache?: boolean | null
  relationship_problems?: boolean | null
  fear_of_public_speaking?: boolean | null
  disciplinary_problems_in_college?: boolean | null
  disturbed_peer_relationship_with_friends?: boolean | null
  // Column 3
  worries_about_future?: boolean | null
  disappointment_with_course?: boolean | null
  time_management_problem?: boolean | null
  lack_of_expression?: boolean | null
  poor_decisive_power?: boolean | null
  conflicts?: boolean | null
  low_self_motivation?: boolean | null
  procrastination?: boolean | null
  suicidal_attempt_or_thought?: boolean | null
  tobacco_or_alcohol_use?: boolean | null
  poor_command_of_english?: boolean | null
  // Special Issues (student can only update issue text, not suggestions/outcomes)
  economic_issues?: string | null
  teenage_issues?: string | null
  health_issues?: string | null
  emotional_issues?: string | null
  psychological_issues?: string | null
  additional_comments?: string | null
}

// Update request for mentor/HOD/admin to update suggestions and outcomes
export interface UpdateSpecialIssuesRequest {
  economic_issues_suggestion?: string | null
  economic_issues_outcome?: string | null
  teenage_issues_suggestion?: string | null
  teenage_issues_outcome?: string | null
  health_issues_suggestion?: string | null
  health_issues_outcome?: string | null
  emotional_issues_suggestion?: string | null
  emotional_issues_outcome?: string | null
  psychological_issues_suggestion?: string | null
  psychological_issues_outcome?: string | null
}

export interface UpdateCareerDetailsRequest {
  hobbies?: string[]
  strengths?: string[]
  areasToImprove?: string[]
  core?: string[]
  it?: string[]
  higherEducation?: string[]
  startup?: string[]
  familyBusiness?: string[]
  otherInterests?: string[]
  // Career rankings (1-6)
  govt_sector_rank?: number
  core_rank?: number
  it_rank?: number
  higher_education_rank?: number
  startup_rank?: number
  family_business_rank?: number
}

export interface UpdateCareerRankingsRequest {
  govt_sector_rank?: number
  core_rank?: number
  it_rank?: number
  higher_education_rank?: number
  startup_rank?: number
  family_business_rank?: number
}

// Student Details (for viewing by Faculty/HOD/Admin)
export interface StudentDetails {
  id: string
  userId: string
  name: string
  email: string
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
  profilePicture: string | null
  accountStatus: string
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
  mentor: {
    id: string
    name: string
    employeeId: string
    department: string
    email: string
  } | null
  createdAt: string | null
  updatedAt: string | null
}

// Update Student Request (Admin only)
export interface UpdateStudentRequest {
  name?: string
  phoneNumber?: string
  emergencyContact?: string
  address?: string
  year?: number
  dayScholar?: boolean
  status?: string
  accountStatus?: string
  fatherName?: string
  fatherOccupation?: string
  fatherNumber?: string
  motherName?: string
  motherOccupation?: string
  motherNumber?: string
}

// Student Data by Roll Number (for Faculty/HOD/Admin viewing)
export interface StudentProjectsByRollno {
  studentId: string
  studentName: string
  rollNumber: number
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

export interface StudentInternshipsByRollno {
  studentId: string
  studentName: string
  rollNumber: number
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

export interface StudentCareerByRollno {
  id: string | null
  studentId: string
  studentName: string
  rollNumber: number
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
  careerRankings: {
    govt_sector_rank: number
    core_rank: number
    it_rank: number
    higher_education_rank: number
    startup_rank: number
    family_business_rank: number
  }
  message?: string
}

export interface StudentProblemsByRollno {
  id: string | null
  studentId: string
  studentName: string
  rollNumber: number
  // All 32 personal problem fields
  stress: boolean | null
  anger: boolean | null
  emotional_problem: boolean | null
  low_self_esteem: boolean | null
  examination_anxiety: boolean | null
  negative_thoughts: boolean | null
  exam_phobia: boolean | null
  stammering: boolean | null
  financial_problems: boolean | null
  disturbed_relationship_with_teachers: boolean | null
  disturbed_relationship_with_parents: boolean | null
  mood_swings: boolean | null
  stage_phobia: boolean | null
  poor_concentration: boolean | null
  poor_memory_problem: boolean | null
  adjustment_problem: boolean | null
  frustration: boolean | null
  migraine_headache: boolean | null
  relationship_problems: boolean | null
  fear_of_public_speaking: boolean | null
  disciplinary_problems_in_college: boolean | null
  disturbed_peer_relationship_with_friends: boolean | null
  worries_about_future: boolean | null
  disappointment_with_course: boolean | null
  time_management_problem: boolean | null
  lack_of_expression: boolean | null
  poor_decisive_power: boolean | null
  conflicts: boolean | null
  low_self_motivation: boolean | null
  procrastination: boolean | null
  suicidal_attempt_or_thought: boolean | null
  tobacco_or_alcohol_use: boolean | null
  poor_command_of_english: boolean | null
  // Special Issues
  economic_issues: string | null
  economic_issues_suggestion: string | null
  economic_issues_outcome: string | null
  teenage_issues: string | null
  teenage_issues_suggestion: string | null
  teenage_issues_outcome: string | null
  health_issues: string | null
  health_issues_suggestion: string | null
  health_issues_outcome: string | null
  emotional_issues: string | null
  emotional_issues_suggestion: string | null
  emotional_issues_outcome: string | null
  psychological_issues: string | null
  psychological_issues_suggestion: string | null
  psychological_issues_outcome: string | null
  additional_comments: string | null
  message?: string
}

export interface StudentMentoringByRollno {
  studentId: string
  studentName: string
  rollNumber: number
  activeMentorship: {
    id: string
    faculty: {
      id: string
      name: string
      employeeId: string
      department: string
      email: string
      phone: string
    }
    startDate: string | null
    endDate: string | null
    isActive: boolean
    meetings: Array<{
      id: string
      date: string | null
      time: string | null
      description: string
      status: string
      feedback: string | null
      remarks: string | null
    }>
    totalMeetings: number
  } | null
  mentorships: Array<{
    id: string
    faculty: {
      id: string
      name: string
      employeeId: string
      department: string
      email: string
      phone: string
    }
    startDate: string | null
    endDate: string | null
    isActive: boolean
    meetings: Array<{
      id: string
      date: string | null
      time: string | null
      description: string
      status: string
      feedback: string | null
      remarks: string | null
    }>
    totalMeetings: number
  }>
  totalMentorships: number
}

export interface StudentCoCurricularByRollno {
  studentId: string
  studentName: string
  rollNumber: number
  activities: Array<{
    id: string
    semester: number
    date: string | null
    eventDetails: string
    participationDetails: string
    awards: string
  }>
  total: number
}

export interface StudentAcademicByRollno {
  studentId: string
  studentName: string
  rollNumber: number
  program: string
  branch: string
  currentYear: number
  latestCGPA: number | null
  semesters: Array<{
    semester: number
    sgpa: number | null
    cgpa: number | null
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
export type RequestType = 'INTERNSHIP' | 'PROJECT' | 'PERFORMANCE' | 'CO_CURRICULAR' | 'DELETE_INTERNSHIP' | 'DELETE_PROJECT' | 'MEETING_REQUEST'

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

export interface MeetingRequestData {
  mentorshipId: string
  facultyId: string
  facultyName: string
  studentName: string
  proposedDate: string
  proposedTime: string
  agenda: string
  mode: string
  location?: string
  link?: string
}

export interface StudentMeetingRequest {
  mentorshipId: string
  date: string
  time?: string
  description?: string
}

// Dashboard Stats Interfaces
export interface StudentDashboardStats {
  stats: {
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    upcomingMeetings: number
    nextMeeting: { date: string; time: string } | null
    hasMentor: boolean
  }
}

export interface FacultyDashboardStats {
  stats: {
    activeMentees: number
    pendingRequests: number
    upcomingMeetings: number
    completedMeetings: number
  }
}

export interface HodDashboardStats {
  stats: {
    totalFaculty: number
    totalStudents: number
    activeMentorships: number
    unassignedStudents: number
    pendingRequests: number
  }
}

export interface AdminDashboardStats {
  stats: {
    totalUsers: number
    totalFaculty: number
    totalStudents: number
    totalHODs: number
    activeMentorships: number
    pendingRequests: number
    unassignedStudents: number
  }
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

export interface StudentReviewItem {
  rollNumber: number
  studentName?: string
  review: string
}

export interface CompleteGroupMeetingsRequest {
  meetingId: string
  studentReviews: StudentReviewItem[]
  description?: string
}

export interface CompleteGroupMeetingsResponse {
  message: string
  completedCount: number
  reviewsUpdated?: number
}

export interface UpdateMeetingReviewsRequest {
  meetingId: string
  studentReviews: StudentReviewItem[]
  description?: string
}

export interface UpdateMeetingReviewsResponse {
  message: string
  reviewsUpdated: number
}

export interface UpdateMeetingRequest {
  meetingId: string
  status: 'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE'
  studentReviews: StudentReviewItem[]
  description?: string
}

export interface UpdateMeetingResponse {
  message: string
  reviewsUpdated?: number
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

// Faculty Details Types (for /faculty/[facultyId] page)
export interface FacultyByIdResponse {
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
  totalMentorships: number
  mentorshipGroups: {
    year: number
    semester: number
    count: number
    students: {
      id: string
      name: string
      rollNumber: number
      program: string
      branch: string
    }[]
  }[]
}

export interface FacultyMentorDetailsResponse {
  faculty: {
    id: string
    name: string
    employeeId: string
    department: string
    email: string
  }
  mentorshipGroups: {
    year: number
    semester: number
    isActive: boolean
    students: {
      mentorshipId: string
      studentId: string
      name: string
      rollNumber: number
      program: string
      branch: string
      startDate: string | null
      endDate: string | null
    }[]
  }[]
  meetings: {
    id: string
    year: number
    semester: number
    date: string
    time: string | null
    description: string | null
    status: string
    studentCount: number
    students: {
      studentId: string
      rollNumber: number
      name: string
      attended: boolean
      review: string
    }[]
    createdAt: string
  }[]
  stats: {
    totalMentorships: number
    activeMentorships: number
    totalMeetings: number
    completedMeetings: number
  }
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

// Admin Faculty Management Types
export interface CreateFacultyRequest {
  employeeId: string
  name: string
  phone1: string
  phone2?: string
  personalEmail: string
  collegeEmail: string
  department: string
  office: string
  officeHours: string
  password: string
  btech?: string
  mtech?: string
  phd?: string
}

export interface CreateFacultyResponse {
  message: string
  faculty: {
    id: string
    employeeId: string
    name: string
    email: string
    collegeEmail: string
    department: string
    isActive: boolean
  }
}

export interface UpdateFacultyRequest {
  name?: string
  phone1?: string
  phone2?: string
  personalEmail?: string
  collegeEmail?: string
  department?: string
  office?: string
  officeHours?: string
  btech?: string
  mtech?: string
  phd?: string
  isActive?: boolean
}

export interface UpdateFacultyResponse {
  message: string
  faculty: {
    id: string
    employeeId: string
    name: string
    email: string
    collegeEmail: string
    department: string
    isActive: boolean
  }
}

export interface ChangeHODRequest {
  facultyId: string
  department: string
}

export interface ChangeHODResponse {
  message: string
  newHOD: {
    hodId: string
    facultyId: string
    name: string
    employeeId: string
    department: string
  }
  previousHOD?: {
    id: string
    name: string
    employeeId: string
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

export interface MentorshipGroupMeetingStudent {
  studentId: string
  name: string
  rollNumber: number
  review: string
  attended: boolean
}

export interface MentorshipGroupMeeting {
  id: string
  date: string
  time: string | null
  description: string
  status: 'UPCOMING' | 'COMPLETED' | 'YET_TO_DONE' | 'CANCELLED'
  studentCount: number
  students: MentorshipGroupMeetingStudent[]
  createdAt: string
}

// Alias for use in faculty-group page
export type GroupMeeting = MentorshipGroupMeeting

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
  groupMeetings?: GroupMeeting[]  // New GroupMeeting model data
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
    department?: string,
    year?: number,
    programme?: string
  ): Promise<DepartmentStudentsResponse> {
    const params = new URLSearchParams()
    if (department) params.append('department', department)
    if (year !== undefined && year !== 0) params.append('year', year.toString())
    if (programme) params.append('programme', programme)
    const query = params.toString()
    return this.request<DepartmentStudentsResponse>(`/api/department/students${query ? `?${query}` : ''}`)
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

  // Get faculty by ID (for HOD, ADMIN)
  async getFacultyById(facultyId: string): Promise<FacultyByIdResponse> {
    return this.request<FacultyByIdResponse>(`/api/faculty/${facultyId}`)
  }

  // Get faculty mentor details (for HOD only)
  async getFacultyMentorDetails(facultyId: string): Promise<FacultyMentorDetailsResponse> {
    return this.request<FacultyMentorDetailsResponse>(`/api/faculty/${facultyId}/mentor`)
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

  // Admin Faculty Management endpoints
  async createFaculty(data: CreateFacultyRequest): Promise<CreateFacultyResponse> {
    return this.request<CreateFacultyResponse>('/api/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateFaculty(facultyId: string, data: UpdateFacultyRequest): Promise<UpdateFacultyResponse> {
    return this.request<UpdateFacultyResponse>(`/api/admin/faculty/${facultyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changeHod(facultyId: string, department: string): Promise<ChangeHODResponse> {
    return this.request<ChangeHODResponse>('/api/hod/change', {
      method: 'POST',
      body: JSON.stringify({ facultyId, department }),
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

  async updateMeetingReviews(data: UpdateMeetingReviewsRequest): Promise<UpdateMeetingReviewsResponse> {
    return this.request<UpdateMeetingReviewsResponse>('/api/meetings/update-reviews', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateMeeting(data: UpdateMeetingRequest): Promise<UpdateMeetingResponse> {
    return this.request<UpdateMeetingResponse>('/api/meetings/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Student Update APIs
  async updatePersonalProblems(data: UpdatePersonalProblemsRequest): Promise<StudentPersonalProblems> {
    return this.request<StudentPersonalProblems>('/api/student/personal-problems/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Faculty/HOD/Admin update special issues suggestions and outcomes
  async updateStudentSpecialIssues(rollno: number, data: UpdateSpecialIssuesRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/department/student/${rollno}/special-issues`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateCareerDetailsAll(data: UpdateCareerDetailsRequest): Promise<StudentCareerDetails> {
    return this.request<StudentCareerDetails>('/api/student/career-details/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateCareerRankings(data: UpdateCareerRankingsRequest): Promise<{ message: string; careerRankings: StudentCareerDetails['careerRankings'] }> {
    return this.request<{ message: string; careerRankings: StudentCareerDetails['careerRankings'] }>('/api/student/career-details/rankings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateCareerHobbies(hobbies: string[]): Promise<{ message: string; hobbies: string[] }> {
    return this.request<{ message: string; hobbies: string[] }>('/api/student/career-details/hobbies', {
      method: 'PUT',
      body: JSON.stringify({ hobbies }),
    })
  }

  async updateCareerStrengths(strengths: string[]): Promise<{ message: string; strengths: string[] }> {
    return this.request<{ message: string; strengths: string[] }>('/api/student/career-details/strengths', {
      method: 'PUT',
      body: JSON.stringify({ strengths }),
    })
  }

  async updateCareerAreasToImprove(areasToImprove: string[]): Promise<{ message: string; areasToImprove: string[] }> {
    return this.request<{ message: string; areasToImprove: string[] }>('/api/student/career-details/areas-to-improve', {
      method: 'PUT',
      body: JSON.stringify({ areasToImprove }),
    })
  }

  async updateCareerCore(core: string[]): Promise<{ message: string; core: string[] }> {
    return this.request<{ message: string; core: string[] }>('/api/student/career-details/core', {
      method: 'PUT',
      body: JSON.stringify({ core }),
    })
  }

  async updateCareerIT(it: string[]): Promise<{ message: string; it: string[] }> {
    return this.request<{ message: string; it: string[] }>('/api/student/career-details/it', {
      method: 'PUT',
      body: JSON.stringify({ it }),
    })
  }

  async updateCareerHigherEducation(higherEducation: string[]): Promise<{ message: string; higherEducation: string[] }> {
    return this.request<{ message: string; higherEducation: string[] }>('/api/student/career-details/higher-education', {
      method: 'PUT',
      body: JSON.stringify({ higherEducation }),
    })
  }

  async updateCareerStartup(startup: string[]): Promise<{ message: string; startup: string[] }> {
    return this.request<{ message: string; startup: string[] }>('/api/student/career-details/startup', {
      method: 'PUT',
      body: JSON.stringify({ startup }),
    })
  }

  async updateCareerFamilyBusiness(familyBusiness: string[]): Promise<{ message: string; familyBusiness: string[] }> {
    return this.request<{ message: string; familyBusiness: string[] }>('/api/student/career-details/family-business', {
      method: 'PUT',
      body: JSON.stringify({ familyBusiness }),
    })
  }

  async updateCareerOtherInterests(otherInterests: string[]): Promise<{ message: string; otherInterests: string[] }> {
    return this.request<{ message: string; otherInterests: string[] }>('/api/student/career-details/other-interests', {
      method: 'PUT',
      body: JSON.stringify({ otherInterests }),
    })
  }

  // Request Management APIs
  async cancelRequest(requestId: string): Promise<{ message: string; requestId: string }> {
    return this.request<{ message: string; requestId: string }>(`/api/student/requests/${requestId}/cancel`, {
      method: 'DELETE',
    })
  }

  async createDeleteInternshipRequest(internshipId: string, reason?: string): Promise<{ message: string; requestId: string; status: string }> {
    return this.request<{ message: string; requestId: string; status: string }>('/api/student/internships/delete-request', {
      method: 'POST',
      body: JSON.stringify({ internshipId, reason }),
    })
  }

  async createDeleteProjectRequest(projectId: string, reason?: string): Promise<{ message: string; requestId: string; status: string }> {
    return this.request<{ message: string; requestId: string; status: string }>('/api/student/projects/delete-request', {
      method: 'POST',
      body: JSON.stringify({ projectId, reason }),
    })
  }

  async createMeetingRequest(data: StudentMeetingRequest): Promise<{ message: string; requestId: string; status: string; assignedTo: string }> {
    return this.request<{ message: string; requestId: string; status: string; assignedTo: string }>('/api/student/meeting/request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Dashboard Stats APIs
  async getStudentDashboardStats(): Promise<StudentDashboardStats> {
    return this.request<StudentDashboardStats>('/api/student/dashboard/stats')
  }

  async getFacultyDashboardStats(): Promise<FacultyDashboardStats> {
    return this.request<FacultyDashboardStats>('/api/faculty/dashboard/stats')
  }

  async getHodDashboardStats(): Promise<HodDashboardStats> {
    return this.request<HodDashboardStats>('/api/hod/dashboard/stats')
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    return this.request<AdminDashboardStats>('/api/admin/dashboard/stats')
  }

  // Export APIs
  async exportStudentsCSV(department?: string, year?: number, programme?: string): Promise<void> {
    const params = new URLSearchParams()
    if (department) params.append('department', department)
    if (year) params.append('year', year.toString())
    if (programme) params.append('programme', programme)
    
    const url = `/api/export/students${params.toString() ? '?' + params.toString() : ''}`
    
    // For file downloads, we need to handle differently
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      // Try to parse JSON error message from backend
      let errMsg = `Export failed (${response.status})`
      try {
        const payload = await response.json()
        if (payload && payload.message) errMsg = payload.message
      } catch (_) {
        // not JSON, fall back to statusText
        if (response.statusText) errMsg = response.statusText
      }
      throw new Error(errMsg)
    }

    // Get the blob and trigger download
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Student Details APIs (for Faculty/HOD/Admin)
  async getStudentByRollNumber(rollno: number): Promise<StudentDetails> {
    return this.request<StudentDetails>(`/api/department/student/${rollno}`)
  }

  // Update Student (Admin only)
  async updateStudentByRollNumber(rollno: number, data: UpdateStudentRequest): Promise<{ message: string; updatedFields: string[]; student: { id: string; name: string; rollNumber: number; status: string; accountStatus: string } }> {
    return this.request<{ message: string; updatedFields: string[]; student: { id: string; name: string; rollNumber: number; status: string; accountStatus: string } }>(`/api/admin/student/${rollno}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Student Data by Roll Number APIs (for Faculty/HOD/Admin viewing)
  async getStudentProjectsByRollNumber(rollno: number): Promise<StudentProjectsByRollno> {
    return this.request<StudentProjectsByRollno>(`/api/department/student/${rollno}/projects`)
  }

  async getStudentInternshipsByRollNumber(rollno: number): Promise<StudentInternshipsByRollno> {
    return this.request<StudentInternshipsByRollno>(`/api/department/student/${rollno}/internships`)
  }

  async getStudentCareerByRollNumber(rollno: number): Promise<StudentCareerByRollno> {
    return this.request<StudentCareerByRollno>(`/api/department/student/${rollno}/career`)
  }

  async getStudentProblemsByRollNumber(rollno: number): Promise<StudentProblemsByRollno> {
    return this.request<StudentProblemsByRollno>(`/api/department/student/${rollno}/problems`)
  }

  async getStudentMentoringByRollNumber(rollno: number): Promise<StudentMentoringByRollno> {
    return this.request<StudentMentoringByRollno>(`/api/department/student/${rollno}/mentoring`)
  }

  async getStudentAcademicByRollNumber(rollno: number): Promise<StudentAcademicByRollno> {
    return this.request<StudentAcademicByRollno>(`/api/department/student/${rollno}/academic`)
  }

  async getStudentCoCurricularByRollNumber(rollno: number): Promise<StudentCoCurricularByRollno> {
    return this.request<StudentCoCurricularByRollno>(`/api/department/student/${rollno}/cocurricular`)
  }
}

export const api = new ApiService()
