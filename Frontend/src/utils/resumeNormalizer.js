import { resumeSchema } from './resumeSchema';
import { generateId } from './idGenerator';

/**
 * Ensures arrays have stable IDs so React and SmartEditable don't lose track 
 * of elements when reordering, adding, or typing.
 */
const injectStableIds = (data) => {
    const ensureIds = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => {
            if (typeof item === 'string') return item; // Primitive arrays (e.g. string achievements) don't get IDs here, they are handled at the wrapper level if needed
            return {
                ...item,
                _id: item._id || generateId()
            };
        });
    };

    if (!data) return data;

    return {
        ...data,
        experience: ensureIds(data.experience),
        projects: ensureIds(data.projects),
        education: ensureIds(data.education),
        skills: ensureIds(data.skills),
        certifications: ensureIds(data.certifications),
        additionalSections: ensureIds(data.additionalSections).map(section => ({
            ...section,
            items: ensureIds(section.items)
        }))
    };
};

export const normalizeResumeData = (data) => {
    // 1. Zod safely parses and applies schema defaults/fallbacks
    const validatedData = resumeSchema.parse(data || {});
    // 2. Inject stable IDs for the WYSIWYG editor's list management
    return injectStableIds(validatedData);
};