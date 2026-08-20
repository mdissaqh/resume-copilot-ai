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
    refreshGuestCopilot,
    refineContent,
    migrateGuestResume,
    deleteResume
} from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, createScratchResume);
router.get("/list", requireAuth, getUserResumes);
router.get("/analyses", requireAuth, getUserAnalyses);
router.get("/analyses/:id", requireAuth, getAnalysisById);
router.get("/:id", requireAuth, getResumeById);
router.delete("/:id", requireAuth, deleteResume);
router.post("/:id/generate", requireAuth, generateResume);
router.put("/:id", requireAuth, updateResume);
router.get("/:id/pdf", requireAuth, downloadResumePDF);

// Guest migration & AI endpoints
router.post("/migrate-guest", requireAuth, migrateGuestResume);
router.post("/guest/copilot/refresh", refreshGuestCopilot);
router.post("/:id/copilot/refresh", requireAuth, refreshCopilot);
router.post("/refine", requireAuth, refineContent);

export default router;