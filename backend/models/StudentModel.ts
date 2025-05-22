import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStudent extends Document {
  name: string;
  aadhar: number;
  phone: {
    number: string;
    code: number;
  };
  registration_number: number;
  roll_number: number;
  passPort: string;
  emergency_contact: number;
  personal_email: string;
  college_email: string;
  dob: Date;
  address: string;
  program: string;
  branch: string;
  bloodGroup: string;
  dayScholar: boolean;
  fatherName: string;
  fatherOccupation?: string;
  father_aadhar?: number;
  father_number?: number;
  motherName: string;
  motherOccupation?: string;
  mother_aadhar?: number;
  mother_number?: number;
  gender: "Male" | "Female";
  community: "General" | "OBC" | "SC" | "ST" | "EWS";
  x_marks: number;
  xii_marks: number;
  jee_mains: number;
  jee_advanced?: number;
  internships: Types.ObjectId[];
  personalProblem?: Types.ObjectId;
  projects: Types.ObjectId[];
  careerDetails?: Types.ObjectId;
  coCurriculars: Types.ObjectId[];
  semesters: Types.ObjectId[];
}

const studentSchema = new Schema<IStudent>(
  {
    name: {
      type: String, required: true
    },
    aadhar: {
      type: Number,
      required: true
    },
    phone: {
      number: {
        type: String,
        required: true
      },
      code: {
        type: Number,
        required: true
      }
    },
    registration_number: {
      type: Number,
      required: true
    },
    roll_number: {
      type: Number,
      required: true
    },
    passPort: {
      type: String,
      default: "Not Available"
    },
    emergency_contact: {
      type: Number,
      required: true
    },
    personal_email: {
      type: String,
      required: true
    },
    college_email: {
      type: String,
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    program: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      required: true
    },
    bloodGroup: {
      type: String,
      required: true
    },
    dayScholar: {
      type: Boolean,
      required: true
    },
    fatherName: {
      type: String,
      required: true
    },
    fatherOccupation: {
      type: String
    },
    father_aadhar: {
      type: Number
    },
    father_number: {
      type: Number
    },
    motherName: {
      type: String,
      required: true
    },
    motherOccupation: {
      type: String
    },
    mother_aadhar: {
      type: Number
    },
    mother_number: {
      type: Number
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"]
    },
    community: {
      type: String,
      required: true,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
    },
    x_marks: {
      type: Number,
      required: true
    },
    xii_marks: {
      type: Number,
      required: true
    },
    jee_mains: {
      type: Number,
      required: true
    },
    jee_advanced: {
      type: Number
    },
    internships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship"
      },
    ],
    personalProblem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalProblem",
    },
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }],
    careerDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareerDetails",
    },
    coCurriculars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoCurricular"
      }
    ],
    semesters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester"
    }],
  },
  { timestamps: true }
);

const Student = mongoose.model<IStudent>("Student", studentSchema);
export default Student;