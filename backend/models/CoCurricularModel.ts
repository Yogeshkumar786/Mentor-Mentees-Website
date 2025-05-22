import mongoose, { Document, Schema } from "mongoose";

interface CoCurricular extends Document {
  sem: number;
  date: Date;
  eventDetails: string;
  participationDetails: string;
  awards: string;
}

const CoCurricularSchema: Schema<CoCurricular> = new mongoose.Schema(
  {
    sem: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    eventDetails: {
      type: String,
      required: true,
    },
    participationDetails: {
      type: String,
      required: true,
    },
    awards: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CoCurricularModel = mongoose.model<CoCurricular>("CoCurricular", CoCurricularSchema);

export default CoCurricularModel;