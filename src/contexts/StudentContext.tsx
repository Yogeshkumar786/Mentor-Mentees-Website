
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for student data
interface BasicInfo {
  name: string;
  rollNo: string;
  regNo: string;
  branch: string;
  email: string;
  program: string;
  gender: string;
  pwd: string;
  community: string;
  aadharNo: string;
  passportDetail: string;
  country: string;
  bloodGroup: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  phoneNo: string;
  parentNo: string;
  emergencyNo: string;
  address: string;
  dayScholar: string;
  parentAddress: string;
  yearOfAdmission: string;
  dob: string;
}

interface EducationMarks {
  tenthPercentage: number;
  twelfthPercentage: number;
  jeeMain: number;
  jeeAdvance: number;
}

export interface Semester {
  semester: number;
  cgpa: number;
  sgpa: number;
  backlogs: number;
  cumulativeCredits: number;
  creditsPassed: number;
  backlogCredits: number;
}

export interface SemesterSubject {
  slNo: number;
  subject: string;
  minor1: number;
  midExam: number;
  minor2: number;
  endExam: number;
  total: number;
}

export interface AttendanceRecord {
  slNo: number;
  courseDetails: string;
  conductedHours: number;
  attendedHours: number;
  attendancePercentage: number;
  remarks: string;
}

export interface PersonalProblem {
  id: string;
  problem: string;
  isChecked: boolean;
}

export interface Internship {
  semester: number;
  type: string;
  status: string;
  organization: string;
  stipend: string;
  duration: string;
  location: string;
  approved: boolean;
}

export interface Project {
  semester: number;
  title: string;
  description: string;
  technologies: string;
  mentor: string;
  status: string;
  approved: boolean;
}

export interface CareerDetail {
  category: string;
  detail: string;
}

export interface CoCurricularActivity {
  date: string;
  semester: number;
  eventDetails: string;
  participationDetails: string;
  awards: string;
  approved: boolean;
}

export interface MentorQuestion {
  date: string;
  facultyName: string;
  branch: string;
  phoneNumber: string;
  question: string;
  remarksGiven: string;
}

interface StudentContextType {
  basicInfo: BasicInfo;
  educationMarks: EducationMarks;
  semesters: Semester[];
  currentSemesterDetails: {
    subjects: SemesterSubject[];
    attendance: AttendanceRecord[];
  };
  personalProblems: PersonalProblem[];
  internships: Internship[];
  projects: Project[];
  careerDetails: CareerDetail[];
  coCurricularActivities: CoCurricularActivity[];
  mentorQuestions: MentorQuestion[];
  updatePersonalProblems: (problems: PersonalProblem[]) => void;
  addInternship: (internship: Omit<Internship, 'approved'>) => void;
  addProject: (project: Omit<Project, 'approved'>) => void;
  updateCareerDetail: (category: string, detail: string) => void;
  addCoCurricularActivity: (activity: Omit<CoCurricularActivity, 'approved'>) => void;
  addMentorQuestion: (question: Omit<MentorQuestion, 'remarksGiven'>) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Sample data
const initialBasicInfo: BasicInfo = {
  name: 'John Doe',
  rollNo: 'BT20CSE001',
  regNo: 'R2021001',
  branch: 'Computer Science and Engineering',
  email: 'student@nitap.ac.in',
  program: 'B.Tech',
  gender: 'Male',
  pwd: 'No',
  community: 'General',
  aadharNo: '1234 5678 9012',
  passportDetail: 'A12345678',
  country: 'India',
  bloodGroup: 'O+',
  fatherName: 'Robert Doe',
  fatherOccupation: 'Engineer',
  motherName: 'Jane Doe',
  motherOccupation: 'Teacher',
  phoneNo: '9876543210',
  parentNo: '9876543211',
  emergencyNo: '9876543212',
  address: '123 Main St, Visakhapatnam',
  dayScholar: 'No',
  parentAddress: '123 Main St, Visakhapatnam',
  yearOfAdmission: '2020',
  dob: '15/08/2002',
};

const initialEducationMarks: EducationMarks = {
  tenthPercentage: 90,
  twelfthPercentage: 90,
  jeeMain: 90,
  jeeAdvance: 90,
};

const initialSemesters: Semester[] = [
  { semester: 1, cgpa: 9.2, sgpa: 9.4, backlogs: 0, cumulativeCredits: 25, creditsPassed: 25, backlogCredits: 0 },
  { semester: 2, cgpa: 9.3, sgpa: 9.3, backlogs: 0, cumulativeCredits: 50, creditsPassed: 50, backlogCredits: 0 },
  { semester: 3, cgpa: 9.4, sgpa: 9.4, backlogs: 0, cumulativeCredits: 75, creditsPassed: 75, backlogCredits: 0 },
  { semester: 4, cgpa: 9.3, sgpa: 9.3, backlogs: 0, cumulativeCredits: 100, creditsPassed: 100, backlogCredits: 0 },
  { semester: 5, cgpa: 9.3, sgpa: 9.3, backlogs: 0, cumulativeCredits: 125, creditsPassed: 125, backlogCredits: 0 },
  { semester: 6, cgpa: 9.3, sgpa: 9.3, backlogs: 0, cumulativeCredits: 150, creditsPassed: 150, backlogCredits: 0 },
  { semester: 7, cgpa: 9.3, sgpa: 9.3, backlogs: 0, cumulativeCredits: 175, creditsPassed: 175, backlogCredits: 0 },
  { semester: 8, cgpa: 9.3, sgpa: 9.3, backlogs: 0, cumulativeCredits: 200, creditsPassed: 200, backlogCredits: 0 },
];

const initialSemesterSubjects: SemesterSubject[] = [
  { slNo: 1, subject: 'Mathematics', minor1: 24, midExam: 28, minor2: 25, endExam: 67, total: 87 },
  { slNo: 2, subject: 'Physics', minor1: 23, midExam: 27, minor2: 24, endExam: 66, total: 86 },
  { slNo: 3, subject: 'Computer Science', minor1: 25, midExam: 30, minor2: 25, endExam: 70, total: 92 },
  { slNo: 4, subject: 'Electronics', minor1: 22, midExam: 26, minor2: 23, endExam: 65, total: 85 },
  { slNo: 5, subject: 'Engineering Drawing', minor1: 24, midExam: 27, minor2: 24, endExam: 68, total: 88 },
  { slNo: 6, subject: 'Programming', minor1: 25, midExam: 29, minor2: 25, endExam: 69, total: 90 },
  { slNo: 7, subject: 'Communication Skills', minor1: 23, midExam: 28, minor2: 24, endExam: 67, total: 87 },
  { slNo: 8, subject: 'Environmental Studies', minor1: 24, midExam: 27, minor2: 24, endExam: 66, total: 86 },
  { slNo: 9, subject: 'Workshop Practice', minor1: 25, midExam: 30, minor2: 25, endExam: 68, total: 89 },
  { slNo: 10, subject: 'Engineering Mechanics', minor1: 22, midExam: 26, minor2: 23, endExam: 65, total: 84 },
];

const initialAttendance: AttendanceRecord[] = [
  { slNo: 1, courseDetails: 'Mathematics', conductedHours: 45, attendedHours: 43, attendancePercentage: 96, remarks: 'Good' },
  { slNo: 2, courseDetails: 'Physics', conductedHours: 45, attendedHours: 44, attendancePercentage: 98, remarks: 'Excellent' },
  { slNo: 3, courseDetails: 'Computer Science', conductedHours: 45, attendedHours: 45, attendancePercentage: 100, remarks: 'Excellent' },
  { slNo: 4, courseDetails: 'Electronics', conductedHours: 45, attendedHours: 42, attendancePercentage: 93, remarks: 'Good' },
  { slNo: 5, courseDetails: 'Engineering Drawing', conductedHours: 45, attendedHours: 43, attendancePercentage: 96, remarks: 'Good' },
  { slNo: 6, courseDetails: 'Programming', conductedHours: 45, attendedHours: 44, attendancePercentage: 98, remarks: 'Excellent' },
  { slNo: 7, courseDetails: 'Communication Skills', conductedHours: 45, attendedHours: 42, attendancePercentage: 93, remarks: 'Good' },
  { slNo: 8, courseDetails: 'Environmental Studies', conductedHours: 45, attendedHours: 43, attendancePercentage: 96, remarks: 'Good' },
  { slNo: 9, courseDetails: 'Workshop Practice', conductedHours: 45, attendedHours: 45, attendancePercentage: 100, remarks: 'Excellent' },
  { slNo: 10, courseDetails: 'Engineering Mechanics', conductedHours: 45, attendedHours: 42, attendancePercentage: 93, remarks: 'Good' },
];

const initialPersonalProblems: PersonalProblem[] = [
  { id: '1', problem: 'Stress', isChecked: false },
  { id: '2', problem: 'Anger', isChecked: false },
  { id: '3', problem: 'Emotional problem', isChecked: false },
  { id: '4', problem: 'Low self-Esteem', isChecked: false },
  { id: '5', problem: 'Examination Anxiety', isChecked: true },
  { id: '6', problem: 'Negative Thoughts', isChecked: false },
  { id: '7', problem: 'Exam phobia', isChecked: true },
  { id: '8', problem: 'Stammering', isChecked: false },
  { id: '9', problem: 'Financial Problems', isChecked: false },
  { id: '10', problem: 'Mood Swings', isChecked: false },
  { id: '11', problem: 'Disturbed relationship with teachers', isChecked: false },
  { id: '12', problem: 'Disturbed relationship with Parents', isChecked: false },
  { id: '13', problem: 'Disturbed peer relationship with friends', isChecked: false },
  { id: '14', problem: 'Disciplinary problems in college', isChecked: false },
  { id: '15', problem: 'Poor command of English', isChecked: false },
  { id: '16', problem: 'Tobacco / Alcohol use', isChecked: false },
  { id: '17', problem: 'Suicidal attempt/ thought', isChecked: false },
  { id: '18', problem: 'Disappointment with course', isChecked: false },
  { id: '19', problem: 'Time management problem', isChecked: true },
  { id: '20', problem: 'Relationship Problems', isChecked: false },
  { id: '21', problem: 'Low Self-Motivation', isChecked: false },
  { id: '22', problem: 'Conflicts', isChecked: false },
  { id: '23', problem: 'Procrastination', isChecked: true },
  { id: '24', problem: 'Frustration', isChecked: false },
  { id: '25', problem: 'Poor Decisive Power', isChecked: false },
  { id: '26', problem: 'Adjustment Problem', isChecked: false },
  { id: '27', problem: 'Lack of Expression', isChecked: false },
  { id: '28', problem: 'Poor concentration', isChecked: false },
  { id: '29', problem: 'Stage phobia', isChecked: true },
  { id: '30', problem: 'Worries about future', isChecked: true },
  { id: '31', problem: 'Poor Memory Problem', isChecked: false },
  { id: '32', problem: 'Migraine Headache', isChecked: false },
  { id: '33', problem: 'Fear of public speaking', isChecked: true },
];

const initialInternships: Internship[] = [
  { semester: 4, type: 'Summer Internship', status: 'Completed', organization: 'Tech Solutions Inc.', stipend: '₹15,000', duration: '2 months', location: 'Hyderabad', approved: true },
  { semester: 6, type: 'Industry Internship', status: 'Ongoing', organization: 'Cloud Services Ltd.', stipend: '₹25,000', duration: '3 months', location: 'Bangalore', approved: true },
];

const initialProjects: Project[] = [
  { semester: 5, title: 'Student Management System', description: 'A web-based application to manage student records, attendance, and performance.', technologies: 'React, Node.js, MongoDB', mentor: 'Prof. Jane Smith', status: 'Completed', approved: true },
  { semester: 7, title: 'Smart Traffic Management', description: 'IoT-based traffic management system with real-time monitoring and congestion prediction.', technologies: 'Python, TensorFlow, Raspberry Pi, AWS', mentor: 'Dr. Robert Johnson', status: 'Ongoing', approved: true },
];

const initialCareerDetails: CareerDetail[] = [
  { category: 'Hobbies', detail: 'Playing Chess, Hiking, Reading' },
  { category: 'Strengths', detail: 'Problem-solving, Programming, Team leadership' },
  { category: 'Areas to improve', detail: 'Public speaking, Time management' },
  { category: 'Core', detail: 'Machine Learning, AI' },
  { category: 'IT', detail: 'Web development, Mobile app development' },
  { category: 'Higher Education', detail: 'Planning for MS in Computer Science' },
  { category: 'Startup', detail: 'Interested in EdTech sector' },
  { category: 'Family Business', detail: 'None' },
  { category: 'Others Interests', detail: 'Photography, Music production' },
];

const initialCoCurricularActivities: CoCurricularActivity[] = [
  { date: '15/03/2023', semester: 5, eventDetails: 'National Tech Symposium', participationDetails: 'Paper Presentation', awards: 'First Prize', approved: true },
  { date: '21/09/2023', semester: 6, eventDetails: 'Hackathon 2023', participationDetails: 'Team Lead', awards: 'Runner-up', approved: true },
];

const initialMentorQuestions: MentorQuestion[] = [];

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [basicInfo] = useState<BasicInfo>(initialBasicInfo);
  const [educationMarks] = useState<EducationMarks>(initialEducationMarks);
  const [semesters] = useState<Semester[]>(initialSemesters);
  const [currentSemesterDetails] = useState({
    subjects: initialSemesterSubjects,
    attendance: initialAttendance,
  });
  const [personalProblems, setPersonalProblems] = useState<PersonalProblem[]>(initialPersonalProblems);
  const [internships, setInternships] = useState<Internship[]>(initialInternships);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [careerDetails, setCareerDetails] = useState<CareerDetail[]>(initialCareerDetails);
  const [coCurricularActivities, setCoCurricularActivities] = useState<CoCurricularActivity[]>(initialCoCurricularActivities);
  const [mentorQuestions, setMentorQuestions] = useState<MentorQuestion[]>(initialMentorQuestions);

  const updatePersonalProblems = (problems: PersonalProblem[]) => {
    setPersonalProblems(problems);
  };

  const addInternship = (internship: Omit<Internship, 'approved'>) => {
    setInternships([...internships, { ...internship, approved: false }]);
  };

  const addProject = (project: Omit<Project, 'approved'>) => {
    setProjects([...projects, { ...project, approved: false }]);
  };

  const updateCareerDetail = (category: string, detail: string) => {
    setCareerDetails(
      careerDetails.map((item) =>
        item.category === category ? { ...item, detail } : item
      )
    );
  };

  const addCoCurricularActivity = (activity: Omit<CoCurricularActivity, 'approved'>) => {
    setCoCurricularActivities([...coCurricularActivities, { ...activity, approved: false }]);
  };

  const addMentorQuestion = (question: Omit<MentorQuestion, 'remarksGiven'>) => {
    setMentorQuestions([...mentorQuestions, { ...question, remarksGiven: '' }]);
  };

  return (
    <StudentContext.Provider
      value={{
        basicInfo,
        educationMarks,
        semesters,
        currentSemesterDetails,
        personalProblems,
        internships,
        projects,
        careerDetails,
        coCurricularActivities,
        mentorQuestions,
        updatePersonalProblems,
        addInternship,
        addProject,
        updateCareerDetail,
        addCoCurricularActivity,
        addMentorQuestion,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
