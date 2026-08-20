import { generateId } from './idGenerator';

/**
 * Ensures all array items have a stable _id.
 * String items (like achievement bullets) are left as-is.
 */
const ensureStableIds = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item !== 'object' || item === null) return item;
        return {
            ...item,
            _id: item._id || generateId()
        };
    });
};

/**
 * Normalizes an additionalSection item to always use the canonical
 * { heading, subheading, date, description } shape regardless of whether
 * the AI returned { title, description } or { heading, description }.
 */
const normalizeCustomItem = (item) => {
    if (typeof item === 'string') return { _id: generateId(), heading: item, description: item };
    return {
        _id: item._id || generateId(),
        heading:     item.heading    || item.title    || '',
        subheading:  item.subheading || item.subtitle || '',
        date:        item.date       || '',
        description: item.description || ''
    };
};

/**
 * Canonical resume normalizer — SINGLE SOURCE OF TRUTH for frontend data shape.
 *
 * Contract guarantees:
 *   - schemaVersion is always 3 (never downgrades to 2)
 *   - Every array item has a stable _id
 *   - education.score is preserved
 *   - certifications.url is preserved
 *   - additionalSections items always use { heading, description } shape
 *   - metadata.sectionOrder, jobDescription, jdProvided are preserved
 *   - Normalization is IDEMPOTENT: normalize(normalize(data)) === normalize(data)
 *   - Unknown top-level fields are forwarded (spread) so nothing is silently dropped
 */
export const normalizeResumeData = (data) => {
    if (!data) return {};

    // --- METADATA ---
    const metadata = {
        persona:        'experienced',
        targetRole:     '',
        candidateLevel: 'mid',
        jobType:        'technical',
        jdProvided:     false,
        jobDescription: '',
        sectionOrder:   null,
        ...(data.metadata || {}),
        // Explicit overrides to guarantee types
        jdProvided: Boolean(data.metadata?.jdProvided || data.metadata?.jobDescription),
    };
    // Ensure sectionOrder is always null or an array (never undefined)
    if (!Array.isArray(metadata.sectionOrder)) {
        metadata.sectionOrder = null;
    }

    // --- PERSONAL INFO ---
    const personalInfo = {
        fullName: data.personalInfo?.fullName || '',
        email:    data.personalInfo?.email    || '',
        phone:    data.personalInfo?.phone    || '',
        location: data.personalInfo?.location || '',
        links: Array.isArray(data.personalInfo?.links)
            ? data.personalInfo.links.map(link => ({
                _id:      link._id      || generateId(),
                platform: link.platform || 'Link',
                url:      link.url      || ''
            }))
            : []
    };

    // --- EXPERIENCE ---
    const experience = ensureStableIds(data.experience).map(exp => ({
        ...exp,
        _id:          exp._id || generateId(),
        organization: exp.organization || '',
        role:         exp.role         || '',
        location:     exp.location     || '',
        startDate:    exp.startDate    || '',
        endDate:      exp.endDate      || '',
        description:  exp.description  || '',
        achievements: Array.isArray(exp.achievements) ? exp.achievements : []
    }));

    // --- PROJECTS ---
    const projects = ensureStableIds(data.projects).map(proj => ({
        ...proj,
        _id:         proj._id         || generateId(),
        title:       proj.title       || '',
        description: proj.description || '',
        date:        proj.date        || '',
        githubUrl:   proj.githubUrl   || '',
        liveUrl:     proj.liveUrl     || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        highlights:   Array.isArray(proj.highlights)   ? proj.highlights   : []
    }));

    // --- EDUCATION ---
    const education = ensureStableIds(data.education).map(edu => ({
        ...edu,
        _id:         edu._id         || generateId(),
        institution: edu.institution || '',
        degree:      edu.degree      || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        score:       edu.score || edu.cgpa || edu.gpa || '',  // ← CRITICAL: preserve score
        location:    edu.location    || '',
        startDate:   edu.startDate   || '',
        endDate:     edu.endDate     || ''
    }));

    // --- SKILLS ---
    const skills = ensureStableIds(data.skills).map(skillGroup => ({
        ...skillGroup,
        _id:      skillGroup._id      || generateId(),
        category: skillGroup.category || 'Core Skills',
        items:    Array.isArray(skillGroup.items) ? skillGroup.items : []
    }));

    // --- CERTIFICATIONS ---
    const certifications = ensureStableIds(data.certifications).map(cert => ({
        ...cert,
        _id:    cert._id    || generateId(),
        name:   cert.name   || '',
        issuer: cert.issuer || '',
        date:   cert.date   || '',
        url:    cert.url    || '',          // ← CRITICAL: preserve url
        platform: cert.platform || ''
    }));

    // --- ACHIEVEMENTS (top-level string array) ---
    const achievements = Array.isArray(data.achievements) ? data.achievements : [];

    // --- ADDITIONAL SECTIONS ---
    const additionalSections = ensureStableIds(data.additionalSections).map(section => ({
        ...section,
        _id:          section._id          || generateId(),
        id:           section.id           || '',
        sectionTitle: section.sectionTitle || 'Custom Section',
        items: ensureStableIds(Array.isArray(section.items) ? section.items : []).map(normalizeCustomItem)
    }));

    return {
        // Forward any unknown top-level keys (future-proofing)
        ...data,
        // Canonical schema version — NEVER allow it to be 2
        schemaVersion: 3,
        metadata,
        personalInfo,
        professionalSummary: data.professionalSummary || '',
        experience,
        projects,
        education,
        skills,
        certifications,
        achievements,
        additionalSections
    };
};