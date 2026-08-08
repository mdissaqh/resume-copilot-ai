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

        const parsedText = "This will be the extracted text.";

        res.status(200).json({
            message: "File successfully received and validated by the backend!",
            fileReceived: file.originalname,
            hasJobDescription: !!jobDescription
        });
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: "An error occurred during analysis." });
    }
}