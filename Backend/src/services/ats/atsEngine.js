/**
 * Deterministic ATS scoring engine.
 * Computes exact mathematical scores (0-100) based on reproducible structural criteria,
 * keyword density, and evidence parsing.
 */
export const computeDeterministicAtsScore = (resumeData = {}, jobDescription = '') => {
    const personalInfo = resumeData.personalInfo || {};
    const summary = resumeData.professionalSummary || '';
    const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
    const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
    const education = Array.isArray(resumeData.education) ? resumeData.education : [];
    const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];

    // 1. Parseability (Max 100)
    let parseabilityScore = 40;
    if (personalInfo.fullName) parseabilityScore += 15;
    if (personalInfo.email) parseabilityScore += 15;
    if (personalInfo.phone) parseabilityScore += 15;
    if (personalInfo.location) parseabilityScore += 15;
    parseabilityScore = Math.min(100, parseabilityScore);

    // 2. Completeness (Max 100)
    let completenessScore = 20;
    if (summary.trim().length > 30) completenessScore += 20;
    if (experience.length > 0) completenessScore += 25;
    if (projects.length > 0) completenessScore += 15;
    if (education.length > 0) completenessScore += 10;
    if (skills.length > 0) completenessScore += 10;
    completenessScore = Math.min(100, completenessScore);

    // 3. Content Impact (Quantification & Action Verbs) (Max 100)
    let actionVerbsCount = 0;
    let metricsCount = 0;
    const actionVerbRegex = /\b(built|developed|led|managed|optimized|created|designed|architected|increased|reduced|improved|implemented|delivered)\b/gi;
    const metricRegex = /\b\d+(?:%|\+|\$|k|m)?\b/gi;

    const fullText = JSON.stringify(resumeData);
    const verbMatches = fullText.match(actionVerbRegex) || [];
    const metricMatches = fullText.match(metricRegex) || [];
    actionVerbsCount = verbMatches.length;
    metricsCount = metricMatches.length;

    let contentImpactScore = Math.min(100, (actionVerbsCount * 6) + (metricsCount * 8));

    // 4. Keyword Match & JD Relevance (Max 100)
    let keywordMatchScore = 75; // Default generic analysis match
    const jdGaps = [];

    if (jobDescription && jobDescription.trim().length > 20) {
        const jdWords = Array.from(new Set(jobDescription.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
        const resumeWords = new Set(fullText.toLowerCase().match(/\b[a-z]{4,}\b/g) || []);

        let matched = 0;
        jdWords.forEach(w => {
            if (resumeWords.has(w)) matched++;
            else if (['python', 'javascript', 'react', 'node', 'docker', 'kubernetes', 'aws', 'sql', 'typescript', 'java'].includes(w)) {
                jdGaps.push({
                    skill: w,
                    reason: `"${w}" is a target requirement in the Job Description.`,
                    recommendation: `"${w}" is a JD requirement and is not currently evidenced in your resume. Add it only if you have real experience.`
                });
            }
        });

        if (jdWords.length > 0) {
            keywordMatchScore = Math.min(100, Math.round((matched / jdWords.length) * 100));
        }
    }

    // 5. Formatting (Max 100)
    let formattingScore = 85;
    if (experience.some(e => !e.startDate || !e.endDate)) formattingScore -= 10;
    formattingScore = Math.max(50, formattingScore);

    // Final Weighted Average
    const totalScore = Math.round(
        (parseabilityScore * 0.20) +
        (completenessScore * 0.20) +
        (contentImpactScore * 0.25) +
        (keywordMatchScore * 0.25) +
        (formattingScore * 0.10)
    );

    return {
        atsScore: {
            total: totalScore,
            parseability: parseabilityScore,
            keywordMatch: keywordMatchScore,
            contentQuality: contentImpactScore,
            quantification: Math.min(100, metricsCount * 12),
            completeness: completenessScore
        },
        scoreRationale: {
            parseabilityReason: `Parseability score is ${parseabilityScore}/100 based on standard contact detail coverage.`,
            keywordMatchReason: `Keyword match is ${keywordMatchScore}/100 based on exact requirement correlation.`,
            contentQualityReason: `Content impact score is ${contentImpactScore}/100 based on ${actionVerbsCount} action verbs and ${metricsCount} metric data points.`,
            quantificationReason: `Quantification score is based on metric density across bullet points.`
        },
        jdGaps: jdGaps.slice(0, 5)
    };
};
