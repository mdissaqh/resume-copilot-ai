import crypto from 'crypto';

const generateStableId = () => 'id_' + crypto.randomBytes(6).toString('hex');

const ensureStableIds = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item !== 'object' || item === null) return item;
        return { ...item, _id: item._id || generateStableId() };
    });
};

/**
 * Normalizes a custom section item to the canonical { heading, description } shape.
 * AI sometimes returns { title, description } — this corrects it.
 */
const normalizeCustomItem = (item) => {
    if (typeof item === 'string') return { _id: generateStableId(), heading: item, description: item };
    return {
        _id:         item._id         || generateStableId(),
        heading:     item.heading     || item.title    || '',
        subheading:  item.subheading  || item.subtitle || '',
        date:        item.date        || '',
        description: item.description || ''
    };
};

export const migrateV2ToV3 = (doc) => {
    if (!doc) return doc;
    const content = doc.content || {};

    const normalizedContent = {
        ...content,
        schemaVersion: 3,
        metadata: {
            persona:        content.metadata?.persona        || doc.metadata?.persona        || 'experienced',
            targetRole:     content.metadata?.targetRole     || doc.metadata?.targetRole     || '',
            candidateLevel: content.metadata?.candidateLevel || doc.metadata?.candidateLevel || 'mid',
            jobType:        content.metadata?.jobType        || doc.metadata?.jobType        || 'technical',
            // Preserve JD context through migration
            jobDescription: content.metadata?.jobDescription || doc.metadata?.jobDescription || '',
            jdProvided:     content.metadata?.jdProvided     || doc.metadata?.jdProvided     || false,
            sectionOrder:   content.metadata?.sectionOrder   || doc.metadata?.sectionOrder   || null
        },
        personalInfo: {
            fullName: content.personalInfo?.fullName || '',
            email:    content.personalInfo?.email    || '',
            phone:    content.personalInfo?.phone    || '',
            location: content.personalInfo?.location || '',
            links: ensureStableIds(content.personalInfo?.links).map(link => ({
                _id:      link._id      || generateStableId(),
                platform: link.platform || 'Link',
                url:      link.url      || ''
            }))
        },
        professionalSummary: content.professionalSummary || '',
        experience: ensureStableIds(content.experience).map(exp => ({
            ...exp,
            _id:          exp._id          || generateStableId(),
            organization: exp.organization || '',
            role:         exp.role         || '',
            location:     exp.location     || '',
            startDate:    exp.startDate    || '',
            endDate:      exp.endDate      || '',
            description:  exp.description  || '',
            achievements: Array.isArray(exp.achievements) ? exp.achievements : []
        })),
        projects: ensureStableIds(content.projects).map(proj => ({
            ...proj,
            _id:         proj._id         || generateStableId(),
            title:       proj.title       || '',
            description: proj.description || '',
            date:        proj.date        || '',
            githubUrl:   proj.githubUrl   || '',
            liveUrl:     proj.liveUrl     || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
            highlights:   Array.isArray(proj.highlights)   ? proj.highlights   : []
        })),
        education: ensureStableIds(content.education).map(edu => ({
            ...edu,
            _id:          edu._id          || generateStableId(),
            institution:  edu.institution  || '',
            degree:       edu.degree       || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            score:        edu.score || edu.cgpa || edu.gpa || '', // ← CRITICAL: preserve score
            location:     edu.location     || '',
            startDate:    edu.startDate    || '',
            endDate:      edu.endDate      || ''
        })),
        skills: ensureStableIds(content.skills).map(skillGroup => ({
            ...skillGroup,
            _id:      skillGroup._id      || generateStableId(),
            category: skillGroup.category || 'Core Skills',
            items:    Array.isArray(skillGroup.items) ? skillGroup.items : []
        })),
        certifications: ensureStableIds(content.certifications).map(cert => ({
            ...cert,
            _id:      cert._id      || generateStableId(),
            name:     cert.name     || '',
            issuer:   cert.issuer   || '',
            date:     cert.date     || '',
            url:      cert.url      || '',       // ← CRITICAL: preserve url
            platform: cert.platform || ''
        })),
        achievements: Array.isArray(content.achievements) ? content.achievements : [],
        additionalSections: ensureStableIds(content.additionalSections).map(section => ({
            ...section,
            _id:          section._id          || generateStableId(),
            id:           section.id           || '',
            sectionTitle: section.sectionTitle || 'Custom Section',
            items: ensureStableIds(Array.isArray(section.items) ? section.items : []).map(normalizeCustomItem)
        }))
    };

    return {
        ...doc,
        schemaVersion: 3,
        content: normalizedContent,
        metadata: normalizedContent.metadata,
        aiState: {
            askedQuestions:     doc.aiState?.askedQuestions     || [],
            suggestions:        doc.aiState?.suggestions        || [],
            interactionHistory: doc.aiState?.interactionHistory || []
        }
    };
};
