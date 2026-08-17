import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
});

export const generateResumeAnalysis = async (resumeText, jobDescription) => {
    try {
        let prompt = `You are an expert ATS software and Senior Technical Recruiter. Deeply analyze the following resume text. `;

        if (jobDescription) {
            prompt += `Compare against this Job Description: "${jobDescription}". Identify critical missing skills. Do NOT hallucinate skills. `;
        } else {
            prompt += `Provide a General ATS Optimization analysis. Evaluate completeness, keyword density, and formatting. `;
        }
        
        prompt += `
        Resume Text: "${resumeText}"

        You MUST return a JSON object with this EXACT structure:
        {
            "analysisTitle": "A concise identifier (e.g., 'Senior Frontend Developer Analysis'). Max 6 words.",
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
            "jdGaps": [
                { "skill": "String", "reason": "String explaining why this JD requirement is missing from the resume.", "recommendation": "Actionable advice" }
            ],
            "editorRecommendations": [
                { 
                  "section": "projects|personalInfo|experience", 
                  "fieldTarget": "String (e.g., 'personalInfo.links', 'projects[0].githubUrl')", 
                  "type": "url|text", 
                  "label": "String", 
                  "reason": "String",
                  "action": "ADD_INPUT"
                }
            ]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate AI analysis.");
    }
};

// 1. Extracts the exact baseline facts without hallucination or major changes
export const extractRawResumeJSON = async (resumeText) => {
    try {
        let prompt = `You are a strict data extraction system. Extract the information from the following resume text into a structured JSON format. 
        CRITICAL RULES:
        1. Extract ONLY what is present.
        2. DO NOT rewrite, optimize, or improve the text. 
        3. DO NOT invent URLs, metrics, job titles, employers, or skills.
        
        Resume Text: "${resumeText}"

        Return JSON matching this exact structure:
        {
          "personalInfo": { "fullName": "String", "email": "String", "phone": "String", "location": "String", "links": [{ "platform": "String", "url": "String" }] },
          "professionalSummary": "String",
          "experience": [ { "organization": "String", "role": "String", "location": "String", "startDate": "String", "endDate": "String", "description": "String", "achievements": ["String"] } ],
          "projects": [ { "title": "String", "technologies": ["String"], "date": "String", "liveUrl": "String", "githubUrl": "String", "description": "String", "highlights": ["String"] } ],
          "education": [ { "institution": "String", "degree": "String", "fieldOfStudy": "String", "location": "String", "startDate": "String", "endDate": "String" } ],
          "skills": [ { "category": "String", "items": ["String"] } ],
          "certifications": [ { "name": "String", "issuer": "String", "date": "String" } ],
          "achievements": [ "String" ],
          "additionalSections": [ { "sectionTitle": "String", "items": [ { "heading": "String", "subheading": "String", "date": "String", "description": "String" } ] } ]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        throw new Error("Failed to extract raw resume.");
    }
};

// 2. Performs a full ATS transformation and enhancement while preserving facts
export const transformAndOptimizeResume = async (resumeText, jobDescription) => {
    try {
        let prompt = `You are an elite Executive Resume Writer and ATS Optimizer. Rewrite and enhance the resume into a highly optimized JSON structure.
        CRITICAL RULES:
        1. DO NOT INVENT FACTS. Do NOT hallucinate metrics, jobs, companies, or skills the candidate does not possess.
        2. IMPROVE WORDING: Enhance bullet points with strong action verbs. Improve clarity, impact, and professional tone.
        3. STRUCTURE: Reorganize messy content into clean logic. Ensure academic/personal Projects remain in 'projects'.
        4. QUANTIFICATION: Emphasize existing metrics strongly.`;

        if (jobDescription) {
            prompt += `\n5. TAILORING: Tailor specifically to this JD: "${jobDescription}". Highlight relevant existing skills prominently without fabricating missing ones.`;
        }

        prompt += `
        Original Resume Text: "${resumeText}"

        Return JSON matching this exact structure:
        {
          "personalInfo": { "fullName": "String", "email": "String", "phone": "String", "location": "String", "links": [{ "platform": "String", "url": "String" }] },
          "professionalSummary": "String",
          "experience": [ { "organization": "String", "role": "String", "location": "String", "startDate": "String", "endDate": "String", "description": "String", "achievements": ["String"] } ],
          "projects": [ { "title": "String", "technologies": ["String"], "date": "String", "liveUrl": "String", "githubUrl": "String", "description": "String", "highlights": ["String"] } ],
          "education": [ { "institution": "String", "degree": "String", "fieldOfStudy": "String", "location": "String", "startDate": "String", "endDate": "String" } ],
          "skills": [ { "category": "String", "items": ["String"] } ],
          "certifications": [ { "name": "String", "issuer": "String", "date": "String" } ],
          "achievements": [ "String" ],
          "additionalSections": [ { "sectionTitle": "String", "items": [ { "heading": "String", "subheading": "String", "date": "String", "description": "String" } ] } ]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini Transformation Error:", error);
        throw new Error("Failed to optimize structured resume.");
    }
};