import { Router } from "express";
import { getUserAnalyses, getAnalysisById, generateResume, updateResume } from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/analyses", requireAuth, getUserAnalyses);
router.get("/analyses/:id", requireAuth, getAnalysisById);
router.post("/:id/generate", requireAuth, generateResume);
router.put("/:id", requireAuth, updateResume);
export default router;