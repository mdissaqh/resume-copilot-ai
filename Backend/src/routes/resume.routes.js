import { Router } from "express";
import { getUserAnalyses, getAnalysisById, generateResume } from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/analyses", requireAuth, getUserAnalyses);
router.get("/analyses/:id", requireAuth, getAnalysisById);
router.post("/:id/generate", requireAuth, generateResume);

export default router;