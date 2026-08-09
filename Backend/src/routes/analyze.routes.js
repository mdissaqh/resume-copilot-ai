import express from "express"
import upload from "../middlewares/upload.middleware.js"
import { analyzeResume } from "../controllers/analyze.controller.js"
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuth, upload.single("resume"), analyzeResume)

export default router;