import { generateId } from './idGenerator';

/**
 * Ensures arrays have stable IDs so React key tracking remains continuous
 * during reorders, insertions, or typing.
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
 * Normalizes resume JSON data cleanly, preserving all original user facts
 * while guaranteeing predictable array types and stable IDs.
 */
export const normalizeResumeData = (data) => {
    if (!data) return {};

    const metadata = {
        persona: data.metadata?.persona || 'experienced',
        targetRole: data.metadata?.targetRole || '',
        candidateLevel: data.metadata?.candidateLevel || 'mid',
        jobType: data.metadata?.jobType || 'technical',
        ...(data.metadata || {})
    };

    const personalInfo = {
        fullName: data.personalInfo?.fullName || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        links: Array.isArray(data.personalInfo?.links) 
            ? data.personalInfo.links.map(link => ({
                platform: link.platform || 'Link',
                url: link.url || '',
                _id: link._id || generateId()
            }))
            : []
    };

    const experience = ensureStableIds(data.experience).map(exp => ({
        ...exp,
        organization: exp.organization || '',
        role: exp.role || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        description: exp.description || '',
        achievements: Array.isArray(exp.achievements) ? exp.achievements : []
    }));

    const projects = ensureStableIds(data.projects).map(proj => ({
        ...proj,
        title: proj.title || '',
        description: proj.description || '',
        date: proj.date || '',
        githubUrl: proj.githubUrl || '',
        liveUrl: proj.liveUrl || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        highlights: Array.isArray(proj.highlights) ? proj.highlights : []
    }));

    const education = ensureStableIds(data.education).map(edu => ({
        ...edu,
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || ''
    }));

    const skills = ensureStableIds(data.skills).map(skillGroup => ({
        ...skillGroup,
        category: skillGroup.category || 'Core Skills',
        items: Array.isArray(skillGroup.items) ? skillGroup.items : []
    }));

    const certifications = ensureStableIds(data.certifications).map(cert => ({
        ...cert,
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || ''
    }));

    const achievements = Array.isArray(data.achievements) ? data.achievements : [];

    const additionalSections = ensureStableIds(data.additionalSections).map(section => ({
        ...section,
        sectionTitle: section.sectionTitle || 'Custom Section',
        items: ensureStableIds(section.items).map(item => ({
            ...item,
            heading: item.heading || '',
            subheading: item.subheading || '',
            date: item.date || '',
            description: item.description || ''
        }))
    }));

    return {
        ...data,
        schemaVersion: 2,
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