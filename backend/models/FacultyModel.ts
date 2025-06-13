import mongoose, { Schema, Model } from "mongoose";

interface IFaculty {
  employeeId: string;
  name: string;
  phone1: number;
  phone2: number;
  personalEmail: string;
  collegeEmail: string;
  department: string;
  mtech?: string;
  phd?: string;
  office: string;
  officeHours: string;
  mentoring_students: mongoose.Types.ObjectId[];
}

const FacultySchema: Schema<IFaculty> = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone1: {
      type: Number,
      required: true,
    },
    phone2: {
      type: Number,
      required: false,
    },
    personalEmail: {
      type: String,
      required: true,
    },
    collegeEmail: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    mtech: {
      type: String,
      required: false,
    },
    phd: {
      type: String,
      required: false,
    },
    office: {
      type: String,
      required: true,
    },
    officeHours: {
      type: String,
      required: true,
    },
    mentoring_students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

const Faculty: Model<IFaculty> = mongoose.model("Faculty", FacultySchema);

export default Faculty;