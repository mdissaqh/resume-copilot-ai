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
        const responseText = result.response.text();
        const analysisData = JSON.parse(responseText);

        return analysisData;
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

        let prompt = `You are an elite Executive Resume Writer. Your task is to rewrite, format, and optimize the provided resume into a highly professional, ATS-optimized JSON structure.

        CRITICAL RULES:
        1. DO NOT HALLUCINATE OR FABRICATE. You must NOT invent jobs, companies, degrees, certifications, skills, metrics, projects, or achievements that are not explicitly present in the source text.
        2. PROFESSION AGNOSTIC. Identify the candidate's profession (e.g., Software, Medical, Legal, Teaching, Finance) and categorize skills/sections appropriately for that industry.
        3. OPTIMIZATION. Improve the wording to be action-oriented and impactful, but remain 100% truthful to the original text.`;

        if (jobDescription) {
            prompt += `\n4. TAILORING. A Job Description has been provided. Emphasize the existing skills and experiences that align best with this target role without fabricating anything:
            "${jobDescription}"`;
        }

        prompt += `
        
        Original Resume Text:
        "${resumeText}"

        Return a RAW JSON object strictly following this structure:
        {
          "personalInfo": {
            "fullName": "String",
            "email": "String",
            "phone": "String",
            "location": "String",
            "links": [{ "label": "String (e.g., LinkedIn, Portfolio)", "url": "String" }]
          },
          "professionalSummary": "String (Optimized summary)",
          "experience": [
            {
              "organization": "String",
              "role": "String",
              "location": "String",
              "startDate": "String",
              "endDate": "String",
              "description": "String (Optional brief context)",
              "achievements": ["Array of Strings (Action-oriented bullet points)"]
            }
          ],
          "education": [
            {
              "institution": "String",
              "degree": "String",
              "fieldOfStudy": "String",
              "location": "String",
              "startDate": "String",
              "endDate": "String",
              "highlights": ["Array of Strings (Optional)"]
            }
          ],
          "skills": [
            {
              "category": "String (e.g., 'Technical Skills', 'Clinical Procedures', 'Languages')",
              "items": ["Array of Strings"]
            }
          ],
          "projects": [
            {
              "title": "String",
              "role": "String (Optional)",
              "date": "String (Optional)",
              "url": "String (Optional)",
              "description": "String",
              "highlights": ["Array of Strings"]
            }
          ],
          "certifications": [
            { "name": "String", "issuer": "String", "date": "String" }
          ],
          "additionalSections": [
            {
              "sectionTitle": "String (e.g., Publications, Bar Admissions)",
              "items": [
                {
                  "heading": "String",
                  "subheading": "String",
                  "date": "String",
                  "description": "String"
                }
              ]
            }
          ]
        }
        Do NOT wrap in markdown, return only the JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Generation API Error:", error);
        throw new Error("Failed to generate structured resume from Gemini.");
    }
};