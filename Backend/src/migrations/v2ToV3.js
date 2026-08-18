import crypto from 'crypto';

const generateStableId = () => 'id_' + crypto.randomBytes(6).toString('hex');

const ensureStableIds = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item !== 'object' || item === null) return item;
        return {
            ...item,
            _id: item._id || generateStableId()
        };
    });
};

export const migrateV2ToV3 = (doc) => {
    if (!doc) return doc;
    const content = doc.content || {};

    const normalizedContent = {
        ...content,
        schemaVersion: 3,
        metadata: {
            persona: content.metadata?.persona || doc.metadata?.persona || 'experienced',
            targetRole: content.metadata?.targetRole || doc.metadata?.targetRole || '',
            candidateLevel: content.metadata?.candidateLevel || doc.metadata?.candidateLevel || 'mid',
            jobType: content.metadata?.jobType || doc.metadata?.jobType || 'technical'
        },
        personalInfo: {
            fullName: content.personalInfo?.fullName || '',
            email: content.personalInfo?.email || '',
            phone: content.personalInfo?.phone || '',
            location: content.personalInfo?.location || '',
            links: ensureStableIds(content.personalInfo?.links).map(link => ({
                platform: link.platform || 'Link',
                url: link.url || '',
                _id: link._id || generateStableId()
            }))
        },
        professionalSummary: content.professionalSummary || '',
        experience: ensureStableIds(content.experience).map(exp => ({
            ...exp,
            organization: exp.organization || '',
            role: exp.role || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: exp.description || '',
            achievements: Array.isArray(exp.achievements) ? exp.achievements : []
        })),
        projects: ensureStableIds(content.projects).map(proj => ({
            ...proj,
            title: proj.title || '',
            description: proj.description || '',
            date: proj.date || '',
            githubUrl: proj.githubUrl || '',
            liveUrl: proj.liveUrl || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
            highlights: Array.isArray(proj.highlights) ? proj.highlights : []
        })),
        education: ensureStableIds(content.education).map(edu => ({
            ...edu,
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || ''
        })),
        skills: ensureStableIds(content.skills).map(skillGroup => ({
            ...skillGroup,
            category: skillGroup.category || 'Core Skills',
            items: Array.isArray(skillGroup.items) ? skillGroup.items : []
        })),
        certifications: ensureStableIds(content.certifications).map(cert => ({
            ...cert,
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || ''
        })),
        achievements: Array.isArray(content.achievements) ? content.achievements : [],
        additionalSections: ensureStableIds(content.additionalSections).map(section => ({
            ...section,
            sectionTitle: section.sectionTitle || 'Custom Section',
            items: ensureStableIds(section.items).map(item => ({
                ...item,
                heading: item.heading || '',
                subheading: item.subheading || '',
                date: item.date || '',
                description: item.description || ''
            }))
        }))
    };

    return {
        ...doc,
        schemaVersion: 3,
        content: normalizedContent,
        metadata: normalizedContent.metadata,
        aiState: {
            askedQuestions: doc.aiState?.askedQuestions || [],
            suggestions: doc.aiState?.suggestions || [],
            interactionHistory: doc.aiState?.interactionHistory || []
        }
    };
};
