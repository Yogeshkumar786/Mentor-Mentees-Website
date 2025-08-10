import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  hodId?: mongoose.Types.ObjectId;
  facultyId?: mongoose.Types.ObjectId;
  studentIds?: mongoose.Types.ObjectId[];
  date: Date;
  time: string;
  description?: string;
}

const MeetingSchema: Schema = new Schema({
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HOD',
    required: false,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
