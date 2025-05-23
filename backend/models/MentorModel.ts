import mongoose, { Schema, Model } from "mongoose";

interface IMentor {
    name: string;
    department: string;
    email: string;
    phone: number;
    office: string;
    officeHours: string;
}

const MentorSchema: Schema<IMentor> = new Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    office: {
        type: String,
        required: true
    },
    officeHours: {
        type: String,
        required: true
    }
})

const Mentor: Model<IMentor> = mongoose.model<IMentor>("Mentor", MentorSchema);
export default Mentor;