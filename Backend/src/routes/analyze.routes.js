import express from "express"
import upload from "../middlewares/upload.middleware.js"
import { analyzeResume, migrateGuestAnalysis } from "../controllers/analyze.controller.js"
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuth, upload.single("resume"), analyzeResume)

router.post("/migrate-guest", requireAuth, migrateGuestAnalysis);

export default router;