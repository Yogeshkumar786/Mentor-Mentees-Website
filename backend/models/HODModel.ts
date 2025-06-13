import mongoose, { Schema, Model } from "mongoose";

interface IHOD {
  facultyId: mongoose.Types.ObjectId;
  email: string;
  password:string;
  department: string;
  startDate: Date;
  endDate?: Date;
}

const HODSchema: Schema<IHOD> = new Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      unique: true, // one faculty can be HOD once at a time
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const HOD: Model<IHOD> = mongoose.model("HOD", HODSchema);

export default HOD;