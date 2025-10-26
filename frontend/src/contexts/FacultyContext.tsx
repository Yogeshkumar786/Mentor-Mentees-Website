"use client"

import React, { createContext, useContext, useState } from "react";

// Student type for the faculty dashboard
export type Student = {
  id: number;
  name: string;
  branch: string;
  year: string;
  rollNo: string;
  requestStatus?: "Pending" | "Accepted" | "Rejected";
};

// Question type for student questions
export type Question = {
  id: number;
  studentId: number;
  question: string;
  date: string;
  status: "Pending" | "Answered";
  answer?: string;
  answeredBy?: string;
  answeredDate?: string;
};

// Student Activity type for tracking student updates
export type StudentActivity = {
  id: number;
  studentId: number;
  type: "internship" | "project" | "cocurricular";
  description: string;
  date: string;
  status: "Pending" | "Accepted" | "Rejected";
};

// Faculty message type
export type FacultyMessage = {
  id: number;
  facultyId: number;
  studentId: number;
  message: string;
  date: string;
};

// Faculty context interface
interface FacultyContextType {
  students: Student[];
  assignedStudents: number[];
  questions: Question[];
  studentActivities: StudentActivity[];
  facultyMessages: FacultyMessage[];
  answerQuestion: (questionId: number, answer: string) => void;
  updateRequestStatus: (activityId: number, status: "Accepted" | "Rejected") => void;
  viewStudentDashboard: (studentId: number) => void;
  sendMessageToStudent: (studentId: number, message: string) => void;
}

// Mock data
const mockStudents: Student[] = [
  {
    id: 1,
    name: "Yogesh Kumar",
    branch: "CSE",
    year: "3rd",
    rollNo: "422275",
    requestStatus: "Accepted"
  },
  {
    id: 2,
    name: "Rahul Sharma",
    branch: "ECE",
    year: "2nd",
    rollNo: "422301",
    requestStatus: "Pending"
  },
  {
    id: 3,
    name: "Priya Patel",
    branch: "CSE",
    year: "4th",
    rollNo: "421150",
    requestStatus: "Accepted"
  },
  {
    id: 4,
    name: "Arjun Singh",
    branch: "MECH",
    year: "3rd",
    rollNo: "422405",
    requestStatus: "Pending"
  },
  {
    id: 5,
    name: "Sneha Reddy",
    branch: "CIVIL",
    year: "2nd",
    rollNo: "422510",
    requestStatus: "Pending"
  }
];

const mockAssignedStudents: number[] = [1, 3]; // Student IDs assigned to this faculty

const mockQuestions: Question[] = [
  {
    id: 1,
    studentId: 2,
    question: "I'm facing difficulty with the Data Structures course. Can you suggest some additional resources?",
    date: "2025-04-01",
    status: "Pending"
  },
  {
    id: 2,
    studentId: 4,
    question: "I want to join the robotics club. What are the requirements?",
    date: "2025-04-05",
    status: "Pending"
  },
  {
    id: 3,
    studentId: 1,
    question: "Could you help me with choosing electives for next semester?",
    date: "2025-03-15",
    status: "Answered",
    answer: "I would recommend the Machine Learning or Cloud Computing electives based on your interests. Let's schedule a meeting to discuss in detail.",
    answeredBy: "Dr. Ramesh Kumar",
    answeredDate: "2025-03-18"
  }
];

const mockStudentActivities: StudentActivity[] = [
  {
    id: 1,
    studentId: 1,
    type: "internship",
    description: "Summer Internship at Google",
    date: "2025-04-01",
    status: "Pending"
  },
  {
    id: 2,
    studentId: 3,
    type: "project",
    description: "AI-based Attendance System",
    date: "2025-04-02",
    status: "Pending"
  },
  {
    id: 3,
    studentId: 1,
    type: "cocurricular",
    description: "IEEE Conference Participation",
    date: "2025-04-03",
    status: "Pending"
  },
];

const mockFacultyMessages: FacultyMessage[] = [
  {
    id: 1,
    facultyId: 1, // Current faculty
    studentId: 1,
    message: "Your academic performance has been excellent this semester. Keep up the good work!",
    date: "2025-03-25",
  },
  {
    id: 2,
    facultyId: 1,
    studentId: 3,
    message: "I've reviewed your project proposal. Let's discuss some improvements next week.",
    date: "2025-04-02",
  }
];

// Create the context
const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

// Faculty provider component
export function FacultyProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [assignedStudents] = useState<number[]>(mockAssignedStudents);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(mockStudentActivities);
  const [facultyMessages, setFacultyMessages] = useState<FacultyMessage[]>(mockFacultyMessages);

  // Answer a question
  const answerQuestion = (questionId: number, answer: string) => {
    setQuestions(
      questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              status: "Answered",
              answer,
              answeredBy: "Dr. Ramesh Kumar",
              answeredDate: new Date().toISOString().split("T")[0]
            }
          : question
      )
    );
    
    // Find the student associated with this question and send them a message
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      sendMessageToStudent(question.studentId, answer);
    }
  };

  // Update activity request status (Accept/Reject)
  const updateRequestStatus = (activityId: number, status: "Accepted" | "Rejected") => {
    setStudentActivities(
      studentActivities.map((activity) =>
        activity.id === activityId ? { ...activity, status } : activity
      )
    );
  };
  
  // Send message to student
  const sendMessageToStudent = (studentId: number, message: string) => {
    const newMessage: FacultyMessage = {
      id: facultyMessages.length + 1,
      facultyId: 1, // Current faculty ID
      studentId,
      message,
      date: new Date().toISOString().split("T")[0]
    };
    
    setFacultyMessages([...facultyMessages, newMessage]);
  };
  
  // Navigate to student dashboard
  const viewStudentDashboard = (studentId: number) => {
    // This function will be implemented in the component to handle navigation
  };

  const value = {
    students,
    assignedStudents,
    questions,
    studentActivities,
    facultyMessages,
    answerQuestion,
    updateRequestStatus,
    viewStudentDashboard,
    sendMessageToStudent
  };

  return <FacultyContext.Provider value={value}>{children}</FacultyContext.Provider>;
}

// Hook to use the faculty context
export function useFaculty() {
  const context = useContext(FacultyContext);
  if (context === undefined) {
    throw new Error("useFaculty must be used within a FacultyProvider");
  }
  return context;
}
