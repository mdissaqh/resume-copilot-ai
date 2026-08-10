import Analysis from "../models/analysis.model.js";
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

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({ success: false, message: "Analysis not found or unauthorized." });
        }

        res.status(200).json({ success: true, analysis });
    } catch (error) {
        console.error("Error fetching single analysis:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const generateResume = async (req, res) => {
    try {
        const { id } = req.params;

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({ success: false, message: "Analysis not found or unauthorized." });
        }

        if (analysis.generatedResume) {
            return res.status(200).json({ 
                success: true, 
                message: "Returned cached resume.", 
                resume: analysis.generatedResume 
            });
        }

        console.log("Generating structured JSON resume via AI...");
        const structuredResume = await generateStructuredResume(
            analysis.extractedText, 
            analysis.jobDescription
        );

        analysis.generatedResume = structuredResume;
        await analysis.save();

        res.status(200).json({ 
            success: true, 
            message: "Resume generated successfully.", 
            resume: structuredResume 
        });

    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(500).json({ success: false, message: "Failed to generate resume." });
    }
};