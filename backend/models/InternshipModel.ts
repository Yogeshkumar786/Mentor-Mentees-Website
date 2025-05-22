import mongoose, { Document, Schema } from "mongoose";

interface Internship extends Document {
  semester: number;
  type: string;
  organisation: string;
  stipend: number;
  duration: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const internshipSchema: Schema<Internship> = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    organisation: {
      type: String,
      required: true,
    },
    stipend: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const InternshipModel = mongoose.model<Internship>("Internship", internshipSchema);

export default InternshipModel;