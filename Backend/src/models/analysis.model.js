import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    extractedText: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        default: ""
    },
    analysisResults: {
        type: Object,
        required: true
    },
    generatedResume: {
        type: Object,
        default: null
    }
}, { timestamps: true });

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;