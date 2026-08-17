import { resumeSchema } from './resumeSchema';

export const normalizeResumeData = (data) => {
    // Uses Zod to deeply parse, fallback, and guarantee structure
    // Prevents app crashes from AI returning strings instead of arrays
    return resumeSchema.parse(data || {});
};