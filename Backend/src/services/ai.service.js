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

export const generateStructuredResume = async (resumeText, jobDescription) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });

        let prompt = `You are an elite Executive Resume Writer. Rewrite and format the resume into an ATS-optimized JSON structure.
        CRITICAL RULES:
        1. DO NOT HALLUCINATE OR FABRICATE. Do NOT invent URLs, metrics, job titles, employers, or skills.
        2. ORIGINAL CONTENT IS BASELINE: Preserve all valid information. You are an optimizer, not a destructive summarizer.
        3. PROJECTS STAY PROJECTS: If the candidate lists academic/personal Projects, put them in the 'projects' array. DO NOT convert projects into 'experience' and NEVER invent the title 'Developer' for them.
        4. QUANTIFICATION: Extract and emphasize existing metrics. Do not invent new ones.`;

        if (jobDescription) {
            prompt += `\n5. TAILORING: Tailor to this JD: "${jobDescription}". Prioritize relevant existing skills and keywords. Do NOT add skills the candidate does not have.`;
        }

        prompt += `
        Original Resume Text: "${resumeText}"

        Return JSON matching this exact structure:
        {
          "personalInfo": { "fullName": "String", "email": "String", "phone": "String", "location": "String", "links": [{ "platform": "String (e.g., LinkedIn, GitHub)", "url": "String" }] },
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
        console.error("Gemini Generation API Error:", error);
        throw new Error("Failed to generate structured resume.");
    }
};