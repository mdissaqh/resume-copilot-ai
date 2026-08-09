import { extractTextFromPDF, extractTextFromDOCX } from "../services/documentParser.service.js";
import { generateResumeAnalysis } from "../services/ai.service.js";

export const analyzeResume = async (req, res) => {
    try {
        const file = req.file;
        const { jobDescription } = req.body;
        if (!file) {
            return res.status(400).json({ message: "Resume file is required." });
        }
        console.log(file);

        console.log(`Received file: ${file.originalname} (${file.size} bytes)`);

        if (jobDescription) {
            console.log("Job Description provided.");
        }

        let parsedText = "";

        if (file.mimetype === "application/pdf") {
            parsedText = await extractTextFromPDF(file.buffer);
        } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            parsedText = await extractTextFromDOCX(file.buffer)
        } else {
            return res.status(400).json({
                message: "Unsupported file format. Please upload a PDF or DOCX."
            })
        }
        console.log("Successfully extracted text length:", parsedText.length);

        console.log("Sending data to AI for analysis...");
        const aiAnalysisResult = await generateResumeAnalysis(parsedText, jobDescription);

        res.status(200).json({
            message: "Resume analyzed successfully!",
            analysis: aiAnalysisResult
        });
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: "An error occurred during analysis." });
    }
}