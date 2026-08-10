import { Router } from "express";
import { getUserAnalyses, getAnalysisById } from "../controllers/resume.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/analyses", requireAuth, getUserAnalyses);
router.get("/analyses/:id", requireAuth, getAnalysisById);

export default router;