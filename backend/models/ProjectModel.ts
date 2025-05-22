import mongoose, { Schema, Document, Model } from "mongoose";

interface IProject extends Document {
  semester: number;
  title: string;
  description: string;
  technologies: string[];
  mentor: string;
}

const projectSchema: Schema<IProject> = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  technologies: {
    type: [String],
    required: true,
  },
  mentor: {
    type: String,
    required: true,
  },
});

const Project: Model<IProject> = mongoose.model<IProject>("Project", projectSchema);

export default Project;