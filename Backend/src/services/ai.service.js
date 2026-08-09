import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateResumeAnalysis = async (resumeText, jobDescription) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        let prompt = `You are an expert ATS (Applicant Tracking System) software and a Senior Technical Recruiter. Your job is to deeply analyze the following resume text. `;

        if (jobDescription) {
            prompt += `
            Compare the resume against this Target Job Description:
            "${jobDescription}"
            Calculate a matching percentage based on required skills, experience, and keywords.`;
        } else {
            prompt += `
            No specific job description was provided. Provide a general ATS analysis, 
            evaluating the resume on standard industry best practices, formatting, and impact.`;
        }
        prompt += `
        Resume Text to Analyze:
        "${resumeText}"

        You MUST return a raw JSON object with the following EXACT structure. Do not include markdown formatting, just the JSON:
        {
            "atsScore": Number (between 0 and 100),
            "summary": "A brief 2-3 sentence overview of the candidate's profile.",
            "strengths": ["Array of strong points found in the resume"],
            "weaknesses": ["Array of areas needing improvement"],
            "recommendedKeywords": ["Array of up to 5 important keywords they should add"]
        }`;

        const result = await model.generateContent(prompt);
        console.log(result)
        const responseText = result.response.text();
        const analysisData = JSON.parse(responseText);

        return analysisData;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate AI analysis from Gemini.");
    }
}