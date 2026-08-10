import Analysis from "../models/analysis.model.js";

export const getUserAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select("-extractedText");

        res.status(200).json({ success: true, analyses });
    } catch (error) {
        console.error("Error fetching user analyses:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const getAnalysisById = async (req, res) => {
    try {
        const { id } = req.params;

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({ success: false, message: "Analysis not found or unauthorized." });
        }

        res.status(200).json({ success: true, analysis });
    } catch (error) {
        console.error("Error fetching single analysis:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};