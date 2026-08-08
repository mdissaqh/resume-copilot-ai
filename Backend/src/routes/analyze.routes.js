import express from "express"

import upload from "../middlewares/upload.middleware.js"
import { analyzeResume } from "../controllers/analyze.controller.js"

const router = express.Router();

router.post("/", upload.single("resume"), analyzeResume)

export default router;