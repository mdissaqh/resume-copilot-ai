import { Router } from "express";
import {
    getUserResumes,
    getUserAnalyses,
    getAnalysisById,
    getResumeById,
    createScratchResume,
    generateResume,
    updateResume,
    downloadResumePDF,
    refreshCopilot,
    refineContent,
    migrateGuestResume
} from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, createScratchResume);
router.get("/list", requireAuth, getUserResumes);
router.get("/analyses", requireAuth, getUserAnalyses);
router.get("/analyses/:id", requireAuth, getAnalysisById);
router.get("/:id", requireAuth, getResumeById);
router.post("/:id/generate", requireAuth, generateResume);
router.put("/:id", requireAuth, updateResume);
router.get("/:id/pdf", requireAuth, downloadResumePDF);

// Guest migration & AI endpoints
router.post("/migrate-guest", requireAuth, migrateGuestResume);
router.post("/:id/copilot/refresh", requireAuth, refreshCopilot);
router.post("/refine", requireAuth, refineContent);

export default router;