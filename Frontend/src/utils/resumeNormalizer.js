import { generateId } from './idGenerator';

/**
 * Ensures arrays have stable IDs so React and SmartEditable don't lose track 
 * of elements when reordering, adding, or typing.
 */
const ensureStableIds = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
        // Primitive arrays (like strings) do not get objects
        if (typeof item === 'string') return item; 
        return {
            ...item,
            _id: item._id || generateId()
        };
    });
};

/**
 * Safely merges database data with required fallback structures.
 * This guarantees NO existing data is wiped by strict parsers, while 
 * ensuring UI arrays exist to prevent .map() crashes.
 */
export const normalizeResumeData = (data) => {
    if (!data) return {};

    const safeData = {
        ...data, // Preserve all original Mongoose/JSON data payload
        
        personalInfo: {
            fullName: data.personalInfo?.fullName || '',
            email: data.personalInfo?.email || '',
            phone: data.personalInfo?.phone || '',
            location: data.personalInfo?.location || '',
            links: Array.isArray(data.personalInfo?.links) ? data.personalInfo.links : []
        },
        metadata: {
            persona: data.metadata?.persona || 'experienced',
            ...(data.metadata || {})
        },
        professionalSummary: data.professionalSummary || '',
        
        // Guarantee arrays exist and have stable editing IDs
        experience: ensureStableIds(data.experience),
        projects: ensureStableIds(data.projects),
        education: ensureStableIds(data.education),
        skills: ensureStableIds(data.skills),
        certifications: ensureStableIds(data.certifications),
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        
        additionalSections: ensureStableIds(data.additionalSections).map(section => ({
            ...section,
            items: ensureStableIds(section.items)
        }))
    };

    return safeData;
};