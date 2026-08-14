import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateResumeAnalysis = async (resumeText, jobDescription) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        let prompt = `You are an expert ATS software and Senior Technical Recruiter. Deeply analyze the following resume text. `;

        if (jobDescription) {
            prompt += `Compare against this Job Description: "${jobDescription}". Calculate a matching percentage. `;
        } else {
            prompt += `Evaluate on standard industry best practices and impact. `;
        }
        
        prompt += `
        Resume Text:
        "${resumeText}"

        You MUST return a JSON object with this EXACT structure:
        {
            "analysisTitle": "A concise, meaningful identifier for this record (e.g., 'Senior Frontend Developer Analysis' or 'Data Analyst - Finance Analysis'). Max 6 words.",
            "atsScore": Number (between 0 and 100),
            "summary": "A brief 2-3 sentence overview.",
            "strengths": ["Array of strong points"],
            "weaknesses": ["Array of areas needing improvement"],
            "recommendedKeywords": ["Array of up to 5 keywords"]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate AI analysis from Gemini.");
    }
};

export const generateStructuredResume = async (resumeText, jobDescription) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });

        let prompt = `You are an elite Executive Resume Writer. Rewrite and format the resume into an ATS-optimized JSON structure.
        CRITICAL RULES: DO NOT HALLUCINATE OR FABRICATE. Determine the profession and categorize appropriately. Be truthful to the original text.`;

        if (jobDescription) {
            prompt += `\nTAILORING: Emphasize skills aligning with this JD: "${jobDescription}"`;
        }

        prompt += `
        Original Resume Text: "${resumeText}"

        Return JSON matching this structure exactly:
        {
          "personalInfo": { "fullName": "String", "email": "String", "phone": "String", "location": "String" },
          "professionalSummary": "String",
          "experience": [ { "organization": "String", "role": "String", "location": "String", "startDate": "String", "endDate": "String", "description": "String", "achievements": ["String"] } ],
          "education": [ { "institution": "String", "degree": "String", "fieldOfStudy": "String", "location": "String", "startDate": "String", "endDate": "String" } ],
          "skills": [ { "category": "String", "items": ["String"] } ],
          "additionalSections": [ { "sectionTitle": "String", "items": [ { "heading": "String", "subheading": "String", "date": "String", "description": "String" } ] } ]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini Generation API Error:", error);
        throw new Error("Failed to generate structured resume.");
    }
};