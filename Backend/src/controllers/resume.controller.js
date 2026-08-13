import Analysis from "../models/analysis.model.js";
import Resume from "../models/resume.model.js";
import { generateStructuredResume } from "../services/ai.service.js";

export const getUserAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 }) 
            .select("-extractedText"); 
        res.status(200).json({ success: true, analyses });
    } catch (error) {
        console.error("Error fetching user analyses:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const getAnalysisById = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await Analysis.findOne({ _id: id, userId: req.user._id });
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found." });
        res.status(200).json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const generateResume = async (req, res) => {
    try {
        const { id: analysisId } = req.params;

        let existingResume = await Resume.findOne({ analysisId, userId: req.user._id });
        if (existingResume) {
            return res.status(200).json({ 
                success: true, 
                message: "Loaded existing resume.", 
                resume: existingResume 
            });
        }

        const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user._id });
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found." });

        console.log("Generating structured JSON resume via AI...");
        const structuredResume = await generateStructuredResume(analysis.extractedText, analysis.jobDescription);

        const newResume = await Resume.create({
            userId: req.user._id,
            analysisId: analysis._id,
            content: structuredResume,
            templateId: "classic"
        });

        res.status(200).json({ 
            success: true, 
            message: "Resume generated successfully.", 
            resume: newResume 
        });
    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(500).json({ success: false, message: "Failed to generate resume." });
    }
};

export const updateResume = async (req, res) => {
    try {
        const { id } = req.params; 
        const { content, templateId } = req.body;

        if (!content) return res.status(400).json({ success: false, message: "Resume content is required." });

        const updatedResume = await Resume.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { content, templateId: templateId || "classic" },
            { new: true }
        );

        if (!updatedResume) return res.status(404).json({ success: false, message: "Resume not found." });

        res.status(200).json({ success: true, message: "Resume saved successfully.", resume: updatedResume });
    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).json({ success: false, message: "Failed to save resume." });
    }
};