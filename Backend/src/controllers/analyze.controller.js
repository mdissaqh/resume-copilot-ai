import { extractTextFromPDF, extractTextFromDOCX } from "../services/documentParser.service.js";
import { generateResumeAnalysis } from "../services/ai.service.js";
import Analysis from "../models/analysis.model.js";

export const analyzeResume = async (req, res) => {
    try {
        const file = req.file;
        const { jobDescription } = req.body;
        if (!file) {
            return res.status(400).json({ message: "Resume file is required." });
        }
        
        console.log(`Received file: ${file.originalname} (${file.size} bytes)`);

        let parsedText = "";

        if (file.mimetype === "application/pdf") {
            parsedText = await extractTextFromPDF(file.buffer);
        } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            parsedText = await extractTextFromDOCX(file.buffer)
        } else {
            return res.status(400).json({
                message: "Unsupported file format. Please upload a PDF or DOCX."
            })
        }

        console.log("Sending data to AI for analysis...");
        const aiAnalysisResult = await generateResumeAnalysis(parsedText, jobDescription);

        if (req.user) {
            await Analysis.create({
                userId: req.user._id,
                extractedText: parsedText,
                jobDescription: jobDescription || "",
                analysisResults: aiAnalysisResult
            });
            console.log("Analysis securely saved to MongoDB for user:", req.user.email);
        }

        res.status(200).json({
            message: "Resume analyzed successfully!",
            analysis: aiAnalysisResult,
            parsedText: parsedText
        });
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: "An error occurred during analysis." });
    }
}

export const migrateGuestAnalysis = async (req, res) => {
    try {
        const guestData = req.body;
        
        if (!guestData || !guestData.extractedText || !guestData.analysisResult) {
            return res.status(400).json({ success: false, message: "Invalid guest data format." });
        }

        const existingAnalysis = await Analysis.findOne({
            userId: req.user._id,
            extractedText: guestData.extractedText
        });

        if (existingAnalysis) {
            return res.status(200).json({ success: true, message: "Analysis already migrated." });
        }

        await Analysis.create({
            userId: req.user._id,
            extractedText: guestData.extractedText,
            jobDescription: guestData.jobDescription || "",
            analysisResults: guestData.analysisResult
        });

        console.log("Guest analysis successfully migrated for user:", req.user.email);
        
        res.status(200).json({ success: true, message: "Guest data migrated successfully." });
    } catch (error) {
        console.error("Error migrating guest analysis:", error);
        res.status(500).json({ success: false, message: "Internal server error during migration." });
    }
};