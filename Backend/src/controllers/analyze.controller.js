import { extractTextFromPDF, extractTextFromDOCX } from "../services/documentParser.service.js";

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

        if(file.mimetype === "application/pdf"){
            parsedText = await extractTextFromPDF(file.buffer);
        } else if(file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            parsedText = await extractTextFromDOCX(file.buffer)
        } else {
            return res.status(400).json({
                message: "Unsupported file format. Please upload a PDF or DOCX."
            })
        }
        console.log("Successfully extracted text length:", parsedText.length);

        res.status(200).json({
            message: "File successfully received and validated by the backend!",
            extractedTextPreview: parsedText.substring(0, 200) + "...",
            hasJobDescription: !!jobDescription
        });
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: "An error occurred during analysis." });
    }
}