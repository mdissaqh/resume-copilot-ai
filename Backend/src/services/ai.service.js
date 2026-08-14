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
            prompt += `Compare against this Job Description: "${jobDescription}". Identify critical missing skills. `;
        }
        
        prompt += `
        Resume Text:
        "${resumeText}"

        You MUST return a JSON object with this EXACT structure:
        {
            "analysisTitle": "A concise, meaningful identifier for this record (e.g., 'Senior Frontend Developer Analysis'). Max 6 words.",
            "atsScore": {
                "total": Number (0-100),
                "parseability": Number (0-100),
                "keywordMatch": Number (0-100),
                "contentQuality": Number (0-100),
                "quantification": Number (0-100),
                "completeness": Number (0-100)
            },
            "summary": "A brief 2-3 sentence overview.",
            "strengths": ["Array of strong points"],
            "weaknesses": ["Array of areas needing improvement"],
            "recommendedKeywords": ["Array of up to 5 keywords"],
            "jdGaps": [
                { "skill": "String", "reason": "String explaining why this JD requirement is missing from the resume." }
            ],
            "missingInformation": [
                { "field": "String (e.g., 'linkedin', 'portfolio')", "label": "String", "reason": "String", "priority": "high|medium|low" }
            ]
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
        CRITICAL RULES: DO NOT HALLUCINATE OR FABRICATE. Do NOT invent URLs, metrics, or skills. `;

        if (jobDescription) {
            prompt += `Tailor to this JD: "${jobDescription}". Do NOT add skills the candidate does not have. `;
        }

        prompt += `
        Original Resume Text: "${resumeText}"

        Return JSON matching this structure exactly:
        {
          "personalInfo": { 
             "fullName": "String", "email": "String", "phone": "String", "location": "String",
             "links": [{ "platform": "String (e.g., LinkedIn)", "url": "String" }]
          },
          "professionalSummary": "String",
          "experience": [ { "organization": "String", "role": "String", "location": "String", "startDate": "String", "endDate": "String", "description": "String", "achievements": ["String (Include quantified metrics if present in original text)"] } ],
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