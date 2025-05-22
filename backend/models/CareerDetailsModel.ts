import mongoose, { Document, Schema } from "mongoose";

interface CareerDetails extends Document {
    hobbies: string[];
    strengths: string[];
    areas_to_improve: string[];
    core: string[];
    it: string[];
    higher_education: string[];
    startup: string[];
    family_business: string[];
    other_interests: string[];
}

const CareerDetailsSchema: Schema<CareerDetails> = new mongoose.Schema(
    {
        hobbies: {
            type: [
                {
                    type: String,
                },
            ],
        },
        strengths: {
            type: [
                {
                    type: String,
                },
            ],
        },
        areas_to_improve: {
            type: [
                {
                    type: String,
                },
            ],
        },
        core: {
            type: [
                {
                    type: String,
                },
            ],
        },
        it: {
            type: [
                {
                    type: String,
                },
            ],
        },
        higher_education: {
            type: [
                {
                    type: String,
                },
            ],
        },
        startup: {
            type: [
                {
                    type: String,
                },
            ],
        },
        family_business: {
            type: [
                {
                    type: String,
                },
            ],
        },
        other_interests: {
            type: [
                {
                    type: String,
                },
            ],
        },
    },
    { timestamps: true }
);

const CareerDetailsModel = mongoose.model < CareerDetails > (
    "CareerDetails",
    CareerDetailsSchema
);

export default CareerDetailsModel;