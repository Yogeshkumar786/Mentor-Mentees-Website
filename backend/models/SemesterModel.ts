import mongoose, { Schema, Document, Model } from "mongoose";

interface ISemester extends Document {
  semester: number;
  subjects: mongoose.Types.ObjectId[];
  sgpa: number;
  cgpa: number;
}

const semesterSchema: Schema<ISemester> = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
  },
  subjects: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    required: true,
  },
  sgpa: {
    type: Number,
    required: true,
  },
  cgpa: {
    type: Number,
    required: true,
  },
});

const Semester: Model<ISemester> = mongoose.model<ISemester>("Semester", semesterSchema);

export default Semester;