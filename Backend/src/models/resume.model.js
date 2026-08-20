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
        required: false,
        default: null
    },
    guestDraftId: {
        type: String,
        default: null,
        index: true
    },
    title: {
        type: String,
        default: "My ATS Resume"
    },
    templateId: {
        type: String,
        default: "evergreen"
    },
    schemaVersion: {
        type: Number,
        default: 3
    },
    // Top-level metadata — canonical location for all context fields.
    // The AI, Copilot, builder, and export all read from here.
    metadata: {
        persona:        { type: String, default: "experienced" },
        targetRole:     { type: String, default: "" },
        candidateLevel: { type: String, default: "mid" },
        jobType:        { type: String, default: "technical" },
        // JD context — must survive analysis → builder → Copilot round-trips
        jobDescription: { type: String, default: "" },
        jdProvided:     { type: Boolean, default: false },
        // User-defined section display order (null = use persona default)
        sectionOrder:   { type: [String], default: null }
    },
    aiState: {
        askedQuestions:     { type: Array, default: [] },
        suggestions:        { type: Array, default: [] },
        interactionHistory: { type: Array, default: [] }
    },
    originalContent: {
        type: Object,
        required: true,
        description: "The untouched extracted source facts of the resume."
    },
    content: {
        type: Object,
        required: true,
        description: "The AI-transformed or user-edited canonical working copy."
    }
}, { timestamps: true });

// Static migration helper to upgrade older documents safely
resumeSchema.statics.migrateDocument = function (doc) {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;

    if (!obj.schemaVersion || obj.schemaVersion < 3) {
        obj.schemaVersion = 3;
        obj.templateId = obj.templateId || "evergreen";
        obj.metadata = {
            persona:        obj.content?.metadata?.persona        || obj.metadata?.persona        || "experienced",
            targetRole:     obj.content?.metadata?.targetRole     || obj.metadata?.targetRole     || "",
            candidateLevel: obj.content?.metadata?.candidateLevel || obj.metadata?.candidateLevel || "mid",
            jobType:        obj.content?.metadata?.jobType        || obj.metadata?.jobType        || "technical",
            jobDescription: obj.content?.metadata?.jobDescription || obj.metadata?.jobDescription || "",
            jdProvided:     obj.content?.metadata?.jdProvided     || obj.metadata?.jdProvided     || false,
            sectionOrder:   obj.content?.metadata?.sectionOrder   || obj.metadata?.sectionOrder   || null,
            ...(obj.metadata || {})
        };
        obj.aiState = {
            askedQuestions:     obj.aiState?.askedQuestions     || [],
            suggestions:        obj.aiState?.suggestions        || [],
            interactionHistory: obj.aiState?.interactionHistory || []
        };
    }
    return obj;
};

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;