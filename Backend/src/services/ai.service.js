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
        const prompt = `You are a strict data extraction system. Extract information from this resume into structured JSON.
        CRITICAL RULES:
        1. Extract ALL facts present in the text, INCLUDING custom sections, achievements, hackathons, competitive ranks, awards, publications, and extracurriculars.
        2. Format any achievements, awards, hackathons, or custom sections into the "additionalSections" array.
        3. DO NOT rewrite, optimize, or invent facts.
        4. For education items, always extract "score" (CGPA, GPA, percentage) as a separate field.
        5. For certifications, always extract the credential "url" if present.
        6. For additionalSections items, use "heading" (not "title") and "description" fields.

        Resume Text: "${resumeText}"

        Return JSON:
        {
          "personalInfo": { "fullName": "String", "email": "String", "phone": "String", "location": "String", "links": [{ "platform": "String", "url": "String" }] },
          "professionalSummary": "String",
          "experience": [ { "organization": "String", "role": "String", "location": "String", "startDate": "String", "endDate": "String", "description": "String", "achievements": ["String"] } ],
          "projects": [ { "title": "String", "technologies": ["String"], "date": "String", "liveUrl": "String", "githubUrl": "String", "description": "String", "highlights": ["String"] } ],
          "education": [ { "institution": "String", "degree": "String", "fieldOfStudy": "String", "score": "String", "location": "String", "startDate": "String", "endDate": "String" } ],
          "skills": [ { "category": "String", "items": ["String"] } ],
          "certifications": [ { "name": "String", "issuer": "String", "date": "String", "url": "String" } ],
          "achievements": [ "String" ],
          "additionalSections": [ { "id": "String", "sectionTitle": "String", "items": [ { "heading": "String", "subheading": "String", "date": "String", "description": "String" } ] } ]
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
        2. EXTRACT CUSTOM SECTIONS: Extract achievements, awards, hackathons, and custom sections into "additionalSections".
        3. IMPROVE WORDING: Strengthen bullet points with action verbs, impact statements, and professional tone.
        4. CLASSIFY JOB TYPE & PERSONA: Identify if candidate is technical vs non-technical, fresher vs experienced.
        5. For education items, always preserve "score" (CGPA, GPA, percentage) as a separate field.
        6. For certifications, always preserve the credential "url" if present.
        7. For additionalSections items, use "heading" (not "title") and "description" fields.
        8. JD skills NOT present in the candidate resume should go in jdGaps only — do NOT add them to skills.

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
            "jobType": "technical|non-technical",
            "jdProvided": ${Boolean(jobDescription)}
          },
          "personalInfo": { "fullName": "String", "email": "String", "phone": "String", "location": "String", "links": [{ "platform": "String", "url": "String" }] },
          "professionalSummary": "String",
          "experience": [ { "organization": "String", "role": "String", "location": "String", "startDate": "String", "endDate": "String", "description": "String", "achievements": ["String"] } ],
          "projects": [ { "title": "String", "technologies": ["String"], "date": "String", "liveUrl": "String", "githubUrl": "String", "description": "String", "highlights": ["String"] } ],
          "education": [ { "institution": "String", "degree": "String", "fieldOfStudy": "String", "score": "String", "location": "String", "startDate": "String", "endDate": "String" } ],
          "skills": [ { "category": "String", "items": ["String"] } ],
          "certifications": [ { "name": "String", "issuer": "String", "date": "String", "url": "String" } ],
          "achievements": [ "String" ],
          "additionalSections": [ { "id": "String", "sectionTitle": "String", "items": [ { "heading": "String", "subheading": "String", "date": "String", "description": "String" } ] } ]
        }`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini Optimization Error:", error);
        throw new Error("Failed to optimize resume JSON.");
    }
};

/**
 * COPILOT REFRESH — Structured, state-aware question generation.
 *
 * Receives the actual binding map from the frontend so the AI can reference
 * real node IDs instead of inventing array indexes like education[0].
 *
 * The AI output contract uses targetRef: { nodeId, field } instead of
 * the fragile targetPath array-index approach.
 */
export const refreshAICopilot = async ({
    currentResume,
    targetRole,
    jobDescription,
    candidateLevel,
    jobType,
    interactionHistory = [],
    askedQuestions = [],
    bindingMap = null
}) => {
    try {
        // Serialize the binding map summary for the AI to reference real node IDs
        const bindingSummary = bindingMap
            ? JSON.stringify(
                Object.entries(bindingMap.nodes || {})
                    .filter(([, node]) => node.nodeId && !node.field)
                    .slice(0, 60) // Keep prompt size reasonable
                    .map(([key, node]) => ({ ref: key, nodeId: node.nodeId, section: node.section })),
                null, 0
              )
            : null;

        const prompt = `You are ResumeCopilot AI performing an intelligent, professional, state-aware inspection of the current resume.

CRITICAL RULES & DIRECTIVES:

1. EXHAUSTIVE GAP INSPECTION:
   Systematically audit EVERY section: personalInfo, summary, experience, education, projects, skills, certifications, additionalSections.
   If ANY field is missing, incomplete, or improvable, generate targeted questions.
   Do NOT stop until EVERY meaningful gap has been answered or skipped.

2. USE REAL NODE IDS — NEVER INVENT ARRAY INDEXES:
   You are provided with the ACTUAL BINDING MAP of the resume below.
   Each entry shows: ref key → nodeId → section.
   When targeting a question, use targetRef.nodeId from this map, NOT invented indexes like "edu-1" or "education[0]".
   Example: if binding map shows nodeId "id_abc123" for an education item, use that exact nodeId.

3. HANDLE EMPTY COLLECTIONS CORRECTLY:
   If education is EMPTY [], do NOT ask "what is education[0].degree".
   Instead, use operation "ADD_ITEM_AND_SET" with collection: "education" and the fields object.
   This creates the item safely before writing fields.

4. BATCH GENERATION (3 to 5 QUESTIONS):
   Generate 3-5 high-priority, distinct questions in the "questions" array.

5. ANTI-LOOP DIRECTIVE:
   Review interactionHistory: ${JSON.stringify(interactionHistory.slice(-50))}
   and askedQuestions: ${JSON.stringify(askedQuestions.slice(-30))}.
   NEVER re-ask questions with IDs already in interactionHistory.
   If a question was SKIPPED (skipped === true or answer === "SKIPPED"), do NOT regenerate the SAME field question.
   Skipping one field does NOT block questions about other fields.

6. DATE COLLECTION:
   When asking for dates (education, experience, projects), ask for BOTH start and end year in ONE question.
   Example: "What are your degree start and end years? (e.g. 2020 - 2024)"

7. QUESTION TYPES:
   - type "text": for raw candidate input needed
   - type "yes_no": for proposals, confirmations, enhancements — MUST include proposedText
   DO NOT use type "yes_no" without providing proposedText.

8. AI MUST NOT FABRICATE FACTS:
   Never add skills, employers, projects, or achievements that the candidate did not provide.
   JD skills not in the resume go in jdGaps — not in questions that add them to the resume.

9. PRIORITY ORDERING:
   P0 = missing critical info (name, contact)
   P1 = missing section content (no education at all)
   P2 = incomplete section (education exists but has no dates)
   P3 = improvement suggestions

10. COMPLETION:
    Set "isComplete": true ONLY when ALL sections have complete, accurate, non-empty content.

Current Resume State:
${JSON.stringify(currentResume, null, 0)}

Target Role: "${targetRole || ''}"
Job Description: "${jobDescription || ''}"
Candidate Level: "${candidateLevel || 'mid'}"

ACTUAL BINDING MAP (use these nodeIds in targetRef — do NOT invent your own):
${bindingSummary || '(binding map not available — use targetRef based on content inspection)'}

Return JSON matching EXACTLY this structure (no extra fields):
{
  "isComplete": false,
  "finalSummary": null,
  "questions": [
    {
      "id": "q_unique_stable_id",
      "type": "text",
      "priority": "P0",
      "message": "What is your full name?",
      "placeholder": "e.g. Mohammed Ali",
      "targetRef": {
        "nodeId": null,
        "field": "fullName",
        "section": "personalInfo",
        "collection": null,
        "operation": "SET_FIELD"
      },
      "mutation": {
        "operation": "SET_FIELD",
        "valueType": "string"
      }
    },
    {
      "id": "q_edu_add_first",
      "type": "text",
      "priority": "P1",
      "message": "What is your current degree, institution, and graduation year? (e.g. B.E. Computer Science, ABC University, 2020-2024)",
      "placeholder": "B.E. Computer Science, ABC University, 2020-2024",
      "targetRef": {
        "nodeId": null,
        "field": null,
        "section": "education",
        "collection": "education",
        "operation": "ADD_ITEM_AND_SET"
      },
      "mutation": {
        "operation": "ADD_ITEM_AND_SET",
        "collection": "education",
        "valueType": "string"
      }
    },
    {
      "id": "q_skills_add_git",
      "type": "yes_no",
      "priority": "P2",
      "message": "Would you like to add Git & GitHub to your Technical Skills?",
      "placeholder": "",
      "proposedText": "React, Node.js, Git, GitHub",
      "targetRef": {
        "nodeId": "ACTUAL_SKILL_NODEID_FROM_BINDING_MAP",
        "field": "items",
        "section": "skills",
        "collection": null,
        "operation": "SET_FIELD"
      },
      "mutation": {
        "operation": "SET_FIELD",
        "valueType": "string[]"
      }
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());

        // Validate and sanitize AI output before returning
        return sanitizeCopilotResponse(parsed);
    } catch (error) {
        console.error("Copilot Refresh Error:", error);
        return { isComplete: false, questions: [], finalSummary: null };
    }
};

/**
 * Sanitizes the AI Copilot response to ensure it conforms to the contract.
 * PERMISSIVE: only reject questions that are structurally unusable (no id, no message).
 * Do NOT reject questions merely because optional fields (targetRef, proposedText) are missing.
 * Target highlighting and question display are SEPARATE concerns.
 */
const sanitizeCopilotResponse = (parsed) => {
    if (!parsed || typeof parsed !== 'object') {
        return { isComplete: false, questions: [], finalSummary: null };
    }

    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const validatedQuestions = questions
        .filter(q => {
            // Only hard-reject questions with no id or no displayable message
            if (!q || !q.id || !q.message) return false;
            return true;
        })
        .map(q => ({
            ...q,
            // Normalize legacy targetNodeId / targetPath into targetRef
            targetRef: q.targetRef || legacyToTargetRef(q),
            // Ensure mutation field exists
            mutation: q.mutation || { operation: 'SET_FIELD', valueType: 'string' }
        }));

    return {
        isComplete: Boolean(parsed.isComplete),
        finalSummary: parsed.finalSummary || null,
        questions: validatedQuestions
    };
};

/**
 * Convert old-style { targetNodeId, targetPath } to new targetRef format.
 * Backward compatibility bridge.
 */
const legacyToTargetRef = (q) => {
    if (!q) return null;
    const path = Array.isArray(q.targetPath) ? q.targetPath : [];
    return {
        nodeId:     q.targetNodeId || null,
        field:      path.length >= 3 ? String(path[path.length - 1]) : null,
        section:    path.length >= 1 ? String(path[0]) : null,
        collection: null,
        operation:  'SET_FIELD'
    };
};

export const generateScratchResumeAI = async (targetRole = "", jobDescription = "", persona = "experienced", candidateLevel = "mid", jobType = "technical") => {
    try {
        const prompt = `You are an elite Executive Resume Writer. Generate a clean baseline JSON outline for a resume strictly tailored to target role: "${targetRole}" and job description: "${jobDescription}".
        
        CRITICAL RULES:
        1. DO NOT INVENT OR HALLUCINATE fake employment history, fake company names (e.g., Google, Acme), or fake personal details.
        2. Set personalInfo with empty strings (fullName: "", email: "", phone: "", location: "", links: []).
        3. Experience and Education should be clean empty arrays [] so AI copilot can interactively ask the candidate for their real work experience and institution details.
        4. Include a clean professional summary starter template matching ${targetRole}.
        5. Include relevant target skill categories with empty items arrays matching ${targetRole}.
        6. Do NOT invent fake projects or certifications.
        
        Return JSON matching this exact structure:
        {
          "metadata": {
            "persona": "${persona}",
            "targetRole": "${targetRole}",
            "candidateLevel": "${candidateLevel}",
            "jobType": "${jobType}",
            "jdProvided": ${Boolean(jobDescription)}
          },
          "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "links": [] },
          "professionalSummary": "Results-oriented professional targeting ${targetRole || 'Software Engineer'} role.",
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
            metadata: { persona, targetRole, candidateLevel, jobType, jdProvided: Boolean(jobDescription) },
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
        const prompt = `You are ResumeCopilot AI. Refine and enhance text based on user instructions.
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