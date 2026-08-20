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
export const refreshAICopilot = async ({ currentResume, targetRole, jobDescription, candidateLevel, jobType, interactionHistory = [], askedQuestions = [] }) => {
    try {
        let prompt = `You are ResumeCopilot AI performing an intelligent, state-aware inspection of the current resume.
        CRITICAL ANTI-LOOP & UNIQUE QUESTION DIRECTIVE:
        1. Review interactionHistory: ${JSON.stringify(interactionHistory)} and askedQuestions: ${JSON.stringify(askedQuestions)}.
           You MUST NOT ask about, suggest changes for, or target any nodes or topics associated with these recorded IDs or previous questions.
           If the user previously answered, skipped, or dismissed a question about a project URL, GitHub link, missing field, or bullet point, you are STRICTLY FORBIDDEN from asking about it again.
        2. BATCH GENERATION: Generate a queue of 3 to 5 distinct, high-priority questions in the "questions" array.
           - Every question MUST have a UNIQUE ID string (e.g. "q_github_link_proj_1", "q_summary_opt", "q_skill_ts", "q_exp_1_metric").
           - Prioritize missing essential fields (e.g. GitHub/LinkedIn URLs for projects, missing contact details, missing dates, missing summary, or missing key skills from the Job Description).
           - Also include text enhancement suggestions as "yes_no" questions with a "proposedText".
        3. SPATIAL TARGETING: Every question MUST target a specific node ID in the resume.
           - Node ID for summary is 'professionalSummary'
           - Node ID for experience items is item._id (e.g. 'exp_1') or item._id + '-bullet-' + index (e.g. 'exp_1-bullet-0')
           - Node ID for projects is project._id or project._id + '-hl-' + index or project._id + '-url'
           - Node ID for personal info is 'personalInfo'
        4. QUESTION TYPES:
           - Use 'yes_no' type for confirmation questions (provide 'proposedText' for the user to confirm/accept).
           - Use 'text' type when actual data input is required (e.g. "What is the GitHub repository URL for 'Fab AI'?", "What was your key achievement in role X?").

        Current Resume State: ${JSON.stringify(currentResume)}
        Target Role: "${targetRole || ''}"
        Target Job Description: "${jobDescription || ''}"

        Return JSON matching this exact structure:
        {
          "questions": [
            {
              "id": "q_unique_101",
              "type": "yes_no|text",
              "targetNodeId": "proj_1",
              "targetPath": ["projects", 0, "githubUrl"],
              "message": "Please provide the GitHub repository URL for your project 'Fab AI'.",
              "placeholder": "https://github.com/username/fab-ai"
            }
          ]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Copilot Refresh Error:", error);
        return { questions: [] };
    }
};

export const generateScratchResumeAI = async (targetRole = "", jobDescription = "", persona = "experienced", candidateLevel = "mid", jobType = "technical") => {
    try {
        let prompt = `You are an elite Executive Resume Writer. Generate a canonical, highly relevant initial resume outline JSON tailored specifically for the target role: "${targetRole}" and job description: "${jobDescription}".
        
        CRITICAL RULES:
        1. Create clean starter text and structure tailored to the target role.
        2. Set appropriate skill categories matching the target role and job description.
        3. Do NOT hallucinate personal identity details (leave fullName, email, phone, location as empty strings for user input).
        4. Include a solid placeholder summary framework tailored to ${targetRole}.
        5. Provide starter experience/projects bullet frameworks relevant to ${targetRole}.
        
        Return JSON matching this exact structure:
        {
          "metadata": {
            "persona": "${persona}",
            "targetRole": "${targetRole}",
            "candidateLevel": "${candidateLevel}",
            "jobType": "${jobType}"
          },
          "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "links": [] },
          "professionalSummary": "Results-oriented professional aiming for ${targetRole || 'Software Engineer'} role with expertise in high-impact delivery.",
          "experience": [],
          "projects": [],
          "education": [],
          "skills": [ { "category": "Core Technical Skills", "items": [] } ],
          "certifications": [],
          "achievements": [],
          "additionalSections": []
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Scratch AI Generation Error:", error);
        return {
            metadata: { persona, targetRole, candidateLevel, jobType },
            personalInfo: { fullName: '', email: '', phone: '', location: '', links: [] },
            professionalSummary: targetRole ? `Targeting ${targetRole} position.` : '',
            experience: [],
            projects: [],
            education: [],
            skills: [{ category: 'Core Skills', items: [] }],
            certifications: [],
            achievements: [],
            additionalSections: []
        };
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