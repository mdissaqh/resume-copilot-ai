import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key_for_dev");
const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
});

export const generateResumeAnalysis = async (resumeText, jobDescription) => {
    try {
        let prompt = `You are an elite ATS Analyzer and Technical Recruiter. Analyze the following resume text. `;

        if (jobDescription) {
            prompt += `Compare strictly against this target Job Description: "${jobDescription}". Identify critical missing skills. Do NOT hallucinate candidate skills. `;
        } else {
            prompt += `Provide a General ATS Optimization analysis. Evaluate completeness, keyword density, and formatting. `;
        }

        prompt += `
        Resume Text: "${resumeText}"

        Return JSON matching this exact structure:
        {
            "analysisTitle": "String (e.g., 'Senior Full-Stack Developer Analysis')",
            "atsScore": {
                "total": Number (0-100),
                "parseability": Number (0-100),
                "keywordMatch": Number (0-100),
                "contentQuality": Number (0-100),
                "quantification": Number (0-100),
                "completeness": Number (0-100)
            },
            "scoreRationale": {
                "parseabilityReason": "String explaining structure score",
                "keywordMatchReason": "String explaining keyword match score",
                "contentQualityReason": "String explaining impact & action verb score",
                "quantificationReason": "String explaining metric density score"
            },
            "summary": "String (2-3 sentences)",
            "strengths": ["Array of verified strong points"],
            "weaknesses": ["Array of areas needing improvement"],
            "jdGaps": [
                { "skill": "String", "reason": "String explaining missing requirement", "recommendation": "Actionable advice" }
            ],
            "editorRecommendations": [
                { 
                  "section": "projects|personalInfo|experience|skills|education", 
                  "fieldTarget": "String", 
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
        console.error("Gemini API Analysis Error:", error);
        throw new Error("Failed to generate AI analysis.");
    }
};

export const extractRawResumeJSON = async (resumeText) => {
    try {
        let prompt = `You are a strict data extraction system. Extract information from this resume into structured JSON.
        CRITICAL RULES:
        1. Extract ONLY facts present in the text.
        2. DO NOT rewrite, optimize, or improve.
        3. DO NOT invent URLs, metrics, job titles, companies, or skills.

        Resume Text: "${resumeText}"

        Return JSON:
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

export const transformAndOptimizeResume = async (resumeText, jobDescription) => {
    try {
        let prompt = `You are an elite Executive Resume Writer and ATS Optimizer. Rewrite the resume into a highly optimized canonical JSON structure.
        CRITICAL RULES:
        1. DO NOT INVENT FACTS. Do NOT hallucinate metrics, employers, roles, or skills the candidate does not possess.
        2. IMPROVE WORDING: Strengthen bullet points with action verbs, impact statements, and professional tone.
        3. CLASSIFY JOB TYPE & PERSONA: Identify if candidate is technical vs non-technical, fresher vs experienced.

        Original Resume Text: "${resumeText}"`;

        if (jobDescription) {
            prompt += `\nTarget Job Description: "${jobDescription}"`;
        }

        prompt += `
        Return JSON:
        {
          "metadata": {
            "persona": "fresher|experienced|career-changer",
            "targetRole": "String",
            "candidateLevel": "entry|mid|senior",
            "jobType": "technical|non-technical"
          },
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
        console.error("Gemini Optimization Error:", error);
        throw new Error("Failed to optimize resume JSON.");
    }
};

// CONTROLLED REFRESH API SERVICE: Analyzes current resume vs interaction history and returns spatially target-anchored suggestions & structured questions
export const refreshAICopilot = async ({ currentResume, targetRole, jobDescription, candidateLevel, jobType, interactionHistory = [] }) => {
    try {
        let prompt = `You are ResumeCopilot AI performing an intelligent, state-aware inspection of the current resume.
        CRITICAL ANTI-LOOP & QUALITY FILTER DIRECTIVE:
        1. Review the interactionHistory array provided: ${JSON.stringify(interactionHistory)}. You MUST NOT ask about, suggest changes for, or target any nodes associated with these recorded IDs. If a user previously answered, skipped, or rejected a prompt regarding any node or question/suggestion ID in interactionHistory, you are strictly forbidden from bringing it up again.
        2. QUALITY FILTER: I am providing you the exact current state of the document. If a node (like a project description, experience bullet, or summary) already contains strong action verbs and measurable metrics, DO NOT suggest refining it again. You MUST move on to other missing fields (like missing dates, missing links, or empty summaries). ONLY return a suggestion if the text is objectively poor or missing critical facts.

        CRITICAL RULES:
        1. SPATIAL TARGETING: Every suggestion and question MUST target a specific node ID in the resume.
           - Node ID for summary is 'professionalSummary'
           - Node ID for experience items is item._id (e.g. 'exp_1') or item._id + '-bullet-' + index (e.g. 'exp_1-bullet-0')
           - Node ID for projects is project._id or project._id + '-hl-' + index
           - Node ID for personal info is 'personalInfo'
        2. SEQUENTIAL INTERROGATION: Return AT MOST ONE high-priority question in "questions" and AT MOST ONE suggestion in "suggestions". Prioritize missing critical fields (e.g. asking for full name, email, or missing summary via a 'text' input) BEFORE suggesting optimizations (e.g. asking "Did this achieve a measurable result?" via a 'yes_no' input).
        3. FACT SAFETY: DO NOT invent company names, dates, or metrics. Ask Yes/No or text questions if information is unverified.
        4. QUESTION TYPES:
           - Use 'yes_no' type for confirmation questions.
           - Use 'text' type when actual data input is required.

        Current Resume State: ${JSON.stringify(currentResume)}
        Target Role: "${targetRole || ''}"
        Target Job Description: "${jobDescription || ''}"

        Return JSON matching this structure:
        {
          "questions": [
            {
              "id": "q_101",
              "type": "yes_no|text",
              "targetNodeId": "exp_1-bullet-0",
              "targetPath": ["experience", 0, "achievements", 0],
              "message": "Did this work achieve a measurable performance improvement?",
              "proposedText": "Optimized REST APIs, reducing response times by 35% across production microservices."
            }
          ],
          "suggestions": [
            {
              "id": "s_201",
              "suggestionId": "s_201",
              "targetNodeId": "professionalSummary",
              "targetPath": ["professionalSummary"],
              "category": "action_verb",
              "reasoning": "Strengthen summary hook with active leadership verbs.",
              "originalText": "${currentResume.professionalSummary || ''}",
              "proposedText": "Results-driven Software Engineer with proven expertise in building scalable cloud solutions..."
            }
          ],
          "analysis": {
            "missingInformation": ["LinkedIn URL", "GitHub Repository"],
            "priority": "medium"
          }
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Copilot Refresh Error:", error);
        return { questions: [], suggestions: [], analysis: { missingInformation: [], priority: "low" } };
    }
};

export const refineSectionAI = async (existingText, userInstruction, context = {}) => {
    try {
        let prompt = `You are ResumeCopilot AI. Refine and enhance text based on user instructions.
        CRITICAL FACT-MERGING RULE:
        1. INTELLIGENTLY PRESERVE all original achievements, tools, and facts from Existing Text.
        2. MERGE the new details or user instruction smoothly.
        3. DO NOT discard original details to replace with only the instruction.

        Existing Text: "${existingText}"
        User Instruction: "${userInstruction}"
        Context: ${JSON.stringify(context)}

        Return JSON:
        {
          "refinedText": "String"
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Refine Section Error:", error);
        throw new Error("Failed to refine section text.");
    }
};