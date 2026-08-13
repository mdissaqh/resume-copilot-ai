import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Analysis",
        required: true
    },
    title: {
        type: String,
        default: "My ATS Resume"
    },
    templateId: {
        type: String,
        default: "classic"
    },
    content: {
        type: Object,
        required: true
    }
}, { timestamps: true });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;