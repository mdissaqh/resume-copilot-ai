import { extractTextFromPDF, extractTextFromDOCX } from "../services/documentParser.service.js";
import { generateResumeAnalysis, extractRawResumeJSON, transformAndOptimizeResume } from "../services/ai.service.js";
import Analysis from "../models/analysis.model.js";
import Resume from "../models/resume.model.js";

const MAX_TEXT_LENGTH = 25000;

export const analyzeResume = async (req, res) => {
    try {
        const file = req.file;
        const { jobDescription } = req.body;
        if (!file) return res.status(400).json({ message: "Resume file is required." });

        let parsedText = "";
        if (file.mimetype === "application/pdf") parsedText = await extractTextFromPDF(file.buffer);
        else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") parsedText = await extractTextFromDOCX(file.buffer);
        else return res.status(400).json({ message: "Unsupported file format." });

        if (!parsedText || parsedText.trim().length < 50) {
            return res.status(400).json({
                code: "INVALID_RESUME",
                message: "We couldn't detect a valid resume in this file. Please upload a text-based PDF or DOCX."
            });
        }

        const lowerText = parsedText.toLowerCase();
        const hasKeywords = lowerText.includes('experience') || lowerText.includes('education') || lowerText.includes('skills') || lowerText.includes('work') || lowerText.includes('university') || lowerText.includes('school');

        if (!hasKeywords) {
            return res.status(400).json({
                code: "INVALID_RESUME",
                message: "We couldn't detect a valid resume in this file. It appears to be a different type of document."
            });
        }

        if (parsedText.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ message: `Document is unusually large (${parsedText.length} chars). Please upload a standard resume.` });
        }

        const aiAnalysisResult = await generateResumeAnalysis(parsedText, jobDescription);
        let createdResumeId = null;
        let createdAnalysisId = null;

        if (req.user) {
            // Generate structured resume data in parallel
            const [rawResume, structuredResume] = await Promise.all([
                extractRawResumeJSON(parsedText).catch(() => ({})),
                transformAndOptimizeResume(parsedText, jobDescription).catch(() => ({}))
            ]);

            const analysisDoc = await Analysis.create({
                userId:          req.user._id,
                title:           aiAnalysisResult.analysisTitle || "Untitled Resume Analysis",
                extractedText:   parsedText,
                jobDescription:  jobDescription || "",
                analysisResults: aiAnalysisResult
            });

            // Persist jobDescription in resume.metadata so it's always available
            // for Copilot audits without having to re-fetch the analysis document.
            const resolvedMetadata = {
                persona:        structuredResume.metadata?.persona        || 'experienced',
                targetRole:     structuredResume.metadata?.targetRole     || '',
                candidateLevel: structuredResume.metadata?.candidateLevel || 'mid',
                jobType:        structuredResume.metadata?.jobType        || 'technical',
                jobDescription: jobDescription || '',
                jdProvided:     Boolean(jobDescription)
            };

            const resumeDoc = await Resume.create({
                userId:          req.user._id,
                analysisId:      analysisDoc._id,
                title:           aiAnalysisResult.analysisTitle || "My ATS Resume",
                originalContent: rawResume || {},
                content:         { ...structuredResume, metadata: resolvedMetadata, schemaVersion: 3 },
                templateId:      "evergreen",
                schemaVersion:   3,
                metadata:        resolvedMetadata
            });

            // Bi-directional linking update
            await Analysis.updateOne({ _id: analysisDoc._id }, { $set: { resumeId: resumeDoc._id } });

            createdAnalysisId = analysisDoc._id;
            createdResumeId   = resumeDoc._id;
        }

        res.status(200).json({
            message:    "Resume analyzed successfully!",
            analysis:   aiAnalysisResult,
            parsedText: parsedText,
            analysisId: createdAnalysisId,
            resumeId:   createdResumeId
        });
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: "An error occurred during analysis." });
    }
};

export const migrateGuestAnalysis = async (req, res) => {
    try {
        const guestData = req.body;
        if (!guestData || !guestData.extractedText || !guestData.analysisResult) {
            return res.status(400).json({ success: false, message: "Invalid guest data format." });
        }

        const existingAnalysis = await Analysis.findOne({ userId: req.user._id, extractedText: guestData.extractedText });
        if (existingAnalysis) return res.status(200).json({ success: true, message: "Already migrated.", analysisId: existingAnalysis._id, resumeId: existingAnalysis.resumeId });

        const analysisDoc = await Analysis.create({
            userId:          req.user._id,
            title:           guestData.analysisResult.analysisTitle || "Guest Resume Analysis",
            extractedText:   guestData.extractedText,
            jobDescription:  guestData.jobDescription || "",
            analysisResults: guestData.analysisResult
        });

        res.status(200).json({ success: true, message: "Guest data migrated successfully.", analysisId: analysisDoc._id });
    } catch (error) {
        console.error("Error migrating guest analysis:", error);
        res.status(500).json({ success: false, message: "Internal server error during migration." });
    }
};