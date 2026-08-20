import Analysis from "../models/analysis.model.js";
import Resume from "../models/resume.model.js";
import {
    extractRawResumeJSON,
    transformAndOptimizeResume,
    refreshAICopilot,
    refineSectionAI,
    generateScratchResumeAI
} from "../services/ai.service.js";
import { generatePdfFromHtml } from "../services/pdfGenerator.service.js";
import { renderResumeToHtml } from "../services/htmlRenderer.service.js";
import { ensureDocumentUpToDate } from "../migrations/migrationRunner.js";

export const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id })
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, resumes });
    } catch (error) {
        console.error("Error fetching user resumes:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

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

export const getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findOne({ _id: id, userId: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });

        const upToDate = await ensureDocumentUpToDate(resume);
        res.status(200).json({ success: true, resume: upToDate });
    } catch (error) {
        console.error("Error getting resume by ID:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Resume.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!deleted) return res.status(404).json({ success: false, message: "Resume not found." });
        res.status(200).json({ success: true, message: "Resume deleted successfully." });
    } catch (error) {
        console.error("Error deleting resume:", error);
        res.status(500).json({ success: false, message: "Failed to delete resume." });
    }
};

export const createScratchResume = async (req, res) => {
    try {
        const { targetRole, jobDescription, persona, candidateLevel, jobType } = req.body;

        let initialDoc;
        if (targetRole || jobDescription) {
            initialDoc = await generateScratchResumeAI(
                targetRole,
                jobDescription,
                persona || 'experienced',
                candidateLevel || (persona === 'fresher' ? 'entry' : 'mid'),
                jobType || 'technical'
            );
        } else {
            initialDoc = {
                metadata: {
                    persona: persona || 'experienced',
                    targetRole: targetRole || '',
                    candidateLevel: persona === 'fresher' ? 'entry' : 'mid',
                    jobType: 'technical'
                },
                personalInfo: { fullName: '', email: '', phone: '', location: '', links: [] },
                professionalSummary: '',
                experience: [],
                projects: [],
                education: [],
                skills: [{ category: 'Core Skills', items: [] }],
                certifications: [],
                achievements: [],
                additionalSections: []
            };
        }

        const newResume = await Resume.create({
            userId: req.user._id,
            title: targetRole ? `${targetRole} Resume` : "My ATS Resume",
            templateId: "evergreen",
            schemaVersion: 3,
            metadata: initialDoc.metadata || {
                persona: persona || 'experienced',
                targetRole: targetRole || '',
                candidateLevel: candidateLevel || 'mid',
                jobType: jobType || 'technical'
            },
            originalContent: initialDoc,
            content: initialDoc,
            aiState: { askedQuestions: [], suggestions: [], interactionHistory: [] }
        });

        res.status(201).json({
            success: true,
            message: "Resume created successfully.",
            resume: newResume,
            resumeId: newResume._id
        });
    } catch (error) {
        console.error("Error creating scratch resume:", error);
        res.status(500).json({ success: false, message: "Failed to create resume document." });
    }
};

// Generates or fetches an existing Resume by Resume ID or Analysis ID safely
export const generateResume = async (req, res) => {
    try {
        const { id: targetId } = req.params;

        // 1. Check if targetId is an existing Resume ID or Analysis ID
        let existingResume = await Resume.findOne({
            $or: [
                { _id: targetId, userId: req.user._id },
                { analysisId: targetId, userId: req.user._id }
            ]
        });

        if (existingResume) {
            const migrated = await ensureDocumentUpToDate(existingResume);
            return res.status(200).json({
                success: true,
                message: "Loaded existing resume.",
                resume: migrated
            });
        }

        // 2. Look up Analysis if resume does not exist yet
        const analysis = await Analysis.findOne({ _id: targetId, userId: req.user._id });
        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analysis or Resume not found. Please upload a document or build from scratch."
            });
        }

        const [rawResume, structuredResume] = await Promise.all([
            extractRawResumeJSON(analysis.extractedText).catch(() => ({})),
            transformAndOptimizeResume(analysis.extractedText, analysis.jobDescription).catch(() => ({}))
        ]);

        const newResume = await Resume.create({
            userId: req.user._id,
            analysisId: analysis._id,
            title: analysis.title || "My ATS Resume",
            originalContent: rawResume,
            content: structuredResume,
            templateId: "evergreen",
            schemaVersion: 3,
            metadata: structuredResume.metadata || { persona: "experienced", targetRole: "" }
        });

        await Analysis.updateOne({ _id: analysis._id }, { $set: { resumeId: newResume._id } });

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
        const { content, templateId, metadata, aiState } = req.body;

        if (!content) return res.status(400).json({ success: false, message: "Resume content is required." });

        const existingDoc = await Resume.findOne({ _id: id, userId: req.user._id });
        if (!existingDoc) return res.status(404).json({ success: false, message: "Resume not found." });

        // Update working content and update originalContent verified facts set to include manual edits
        const updatedResume = await Resume.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            {
                content,
                templateId: templateId || existingDoc.templateId || "evergreen",
                schemaVersion: 3,
                ...(metadata && { metadata }),
                ...(aiState && { aiState }),
                // Record user manual edits as verified facts in originalContent
                originalContent: {
                    ...(existingDoc.originalContent || {}),
                    userManualEdits: content
                }
            },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Resume saved successfully.", resume: updatedResume });
    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).json({ success: false, message: "Failed to save resume." });
    }
};

export const downloadResumePDF = async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await Resume.findOne({ _id: id, userId: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });

        const html = renderResumeToHtml(resume.content);
        const pdfBuffer = await generatePdfFromHtml(html);

        const safeName = (resume.content?.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}_Resume.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error downloading PDF:", error);
        res.status(500).json({ success: false, message: "Failed to generate PDF document." });
    }
};

export const refreshCopilot = async (req, res) => {
    try {
        const { id } = req.params;
        const { interactionHistory, askedQuestions, jobDescription } = req.body;

        const resume = await Resume.findOne({ _id: id, userId: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });

        let effectiveJD = jobDescription || "";
        if (!effectiveJD && resume.analysisId) {
            const analysis = await Analysis.findById(resume.analysisId);
            if (analysis) effectiveJD = analysis.jobDescription || "";
        }

        const effectiveHistory = interactionHistory || resume.aiState?.interactionHistory || [];
        const effectiveAskedQuestions = askedQuestions || resume.aiState?.askedQuestions || [];

        const result = await refreshAICopilot({
            currentResume: resume.content,
            targetRole: resume.metadata?.targetRole || "",
            jobDescription: effectiveJD,
            candidateLevel: resume.metadata?.candidateLevel || "mid",
            jobType: resume.metadata?.jobType || "technical",
            interactionHistory: effectiveHistory,
            askedQuestions: effectiveAskedQuestions
        });

        // Persist updated AI state in DB
        await Resume.updateOne(
            { _id: id, userId: req.user._id },
            {
                $set: {
                    "aiState.interactionHistory": effectiveHistory,
                    "aiState.askedQuestions": effectiveAskedQuestions,
                    "aiState.suggestions": result.suggestions || []
                }
            }
        );

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error refreshing Copilot:", error);
        res.status(500).json({ success: false, message: "Failed to refresh Copilot." });
    }
};

export const refreshGuestCopilot = async (req, res) => {
    try {
        const { currentResume, targetRole, jobDescription, candidateLevel, jobType, interactionHistory, askedQuestions } = req.body;

        if (!currentResume) {
            return res.status(400).json({ success: false, message: "Current resume state required for guest copilot." });
        }

        const result = await refreshAICopilot({
            currentResume,
            targetRole: targetRole || currentResume.metadata?.targetRole || "",
            jobDescription: jobDescription || "",
            candidateLevel: candidateLevel || currentResume.metadata?.candidateLevel || "mid",
            jobType: jobType || currentResume.metadata?.jobType || "technical",
            interactionHistory: interactionHistory || [],
            askedQuestions: askedQuestions || []
        });

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error refreshing Guest Copilot:", error);
        res.status(500).json({ success: false, message: "Failed to refresh Copilot for guest." });
    }
};

export const refineContent = async (req, res) => {
    try {
        const { existingText, userInstruction, context } = req.body;
        if (!userInstruction) return res.status(400).json({ success: false, message: "Instruction required." });

        const result = await refineSectionAI(existingText || "", userInstruction, context || {});
        res.status(200).json({ success: true, refinedText: result.refinedText });
    } catch (error) {
        console.error("Error refining content:", error);
        res.status(500).json({ success: false, message: "Refinement failed." });
    }
};

export const migrateGuestResume = async (req, res) => {
    try {
        const { guestDraftId, guestResume, guestAnalysis, interactionHistory, aiState } = req.body;
        if (!guestResume) {
            return res.status(400).json({ success: false, message: "No guest resume data provided." });
        }

        // Idempotency check: if guestDraftId was already migrated for this user, return existing resume
        if (guestDraftId) {
            const existingResume = await Resume.findOne({ userId: req.user._id, guestDraftId });
            if (existingResume) {
                return res.status(200).json({
                    success: true,
                    message: "Guest resume already migrated.",
                    resumeId: existingResume._id,
                    resume: existingResume
                });
            }
        }

        let analysisId = null;
        if (guestAnalysis && guestAnalysis.extractedText) {
            const newAnalysis = await Analysis.create({
                userId: req.user._id,
                title: guestAnalysis.analysisTitle || "Guest Resume Analysis",
                extractedText: guestAnalysis.extractedText,
                jobDescription: guestAnalysis.jobDescription || "",
                analysisResults: guestAnalysis.analysisResult || guestAnalysis
            });
            analysisId = newAnalysis._id;
        }

        const newResume = await Resume.create({
            userId: req.user._id,
            analysisId: analysisId,
            guestDraftId: guestDraftId || null,
            title: guestResume.metadata?.targetRole ? `${guestResume.metadata.targetRole} Resume` : "My ATS Resume",
            originalContent: guestResume,
            content: guestResume,
            templateId: "evergreen",
            schemaVersion: 3,
            metadata: guestResume.metadata || { persona: "experienced", targetRole: "" },
            aiState: aiState || { interactionHistory: interactionHistory || [], askedQuestions: [], suggestions: [] }
        });

        if (analysisId) {
            await Analysis.updateOne({ _id: analysisId }, { $set: { resumeId: newResume._id } });
        }

        res.status(200).json({
            success: true,
            message: "Guest resume migrated successfully.",
            resumeId: newResume._id,
            resume: newResume
        });
    } catch (error) {
        console.error("Error migrating guest resume:", error);
        res.status(500).json({ success: false, message: "Guest resume migration failed." });
    }
};