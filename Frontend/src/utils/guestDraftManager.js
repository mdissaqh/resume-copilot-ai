import { generateId } from './idGenerator';
import { normalizeResumeData } from './resumeNormalizer';

const GUEST_DRAFT_KEY = 'guest_resume_draft';

export const getGuestDraft = () => {
    try {
        const raw = localStorage.getItem(GUEST_DRAFT_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error parsing guest draft:", e);
        return null;
    }
};

export const createGuestDraft = (initialDoc = {}, jobDescription = '', analysis = null) => {
    const guestDraftId = 'guest_' + generateId();
    const normalized = normalizeResumeData(initialDoc);

    const draft = {
        guestDraftId,
        originalContent: JSON.parse(JSON.stringify(normalized)),
        content: normalized,
        targetRole: normalized.metadata?.targetRole || '',
        jobDescription: jobDescription || '',
        analysis: analysis || null,
        aiState: {
            askedQuestions: [],
            suggestions: [],
            interactionHistory: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(draft));
    return draft;
};

export const updateGuestDraft = (content, extraState = {}) => {
    try {
        const current = getGuestDraft() || createGuestDraft(content);
        const updated = {
            ...current,
            content: normalizeResumeData(content),
            ...extraState,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error("Error updating guest draft:", e);
    }
};

export const clearGuestDraft = () => {
    try {
        localStorage.removeItem(GUEST_DRAFT_KEY);
    } catch (e) {
        console.error("Error clearing guest draft:", e);
    }
};
