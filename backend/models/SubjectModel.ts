import mongoose, { Schema, Document, Model } from "mongoose";

interface ISubject extends Document {
  subjectName: string;
  subjectCode: string;
  minor1: number;
  midExam: number;
  minor2: number;
  endExam: number;
  total: number;
  conductedHours: number;
  attendedHours: number;
  attendancePercentage: number;
  remarks: string;
}

const subjectSchema: Schema<ISubject> = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  minor1: {
    type: Number,
    required: true,
  },
  midExam: {
    type: Number,
    required: true,
  },
  minor2: {
    type: Number,
    required: true,
  },
  endExam: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  conductedHours: {
    type: Number,
    required: true,
  },
  attendedHours: {
    type: Number,
    required: true,
  },
  attendancePercentage: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
    required: true,
  },
});

const Subject: Model<ISubject> = mongoose.model<ISubject>("Subject", subjectSchema);

export default Subject;