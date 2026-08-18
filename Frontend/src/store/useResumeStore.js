import { create } from 'zustand';
import { normalizeResumeData } from '../utils/resumeNormalizer';
import { setIn, pushIn, removeIn } from '../features/builder/utils/pathHelpers';
import { saveResumeApi } from '../features/builder/api/builder.api';

const MAX_HISTORY_LENGTH = 30;

export const useResumeStore = create((set, get) => ({
    resumeData: null,
    dbResumeId: null,
    templateId: 'evergreen',
    interactionHistory: [],
    
    // Undo / Redo State
    past: [],
    future: [],

    // Autosave Status: 'saved' | 'saving' | 'dirty' | 'error'
    saveStatus: 'saved',
    saveTimer: null,

    // Hydrate store with loaded document
    setResumeData: (data, dbId = null, template = 'evergreen') => {
        const normalized = normalizeResumeData(data);
        const history = normalized?.interactionHistory || data?.interactionHistory || [];
        set({
            resumeData: normalized,
            dbResumeId: dbId,
            templateId: template || 'evergreen',
            interactionHistory: history,
            past: [],
            future: [],
            saveStatus: 'saved'
        });
    },

    recordInteraction: (id) => {
        if (!id) return;
        set((state) => {
            if (state.interactionHistory.includes(id)) return state;
            const updatedHistory = [...state.interactionHistory, id];
            const updatedResume = state.resumeData
                ? { ...state.resumeData, interactionHistory: updatedHistory }
                : state.resumeData;
            return {
                interactionHistory: updatedHistory,
                resumeData: updatedResume,
                saveStatus: 'dirty'
            };
        });
        get().triggerAutosave();
    },

    setTemplateId: (templateId) => {
        set({ templateId });
        get().triggerAutosave();
    },

    // Save history snapshot before making changes
    recordHistory: () => {
        const { resumeData, past } = get();
        if (!resumeData) return;
        const newPast = [...past, JSON.stringify(resumeData)].slice(-MAX_HISTORY_LENGTH);
        set({ past: newPast, future: [] });
    },

    // Undo change
    undo: () => {
        const { past, future, resumeData } = get();
        if (past.length === 0) return;

        const previousState = JSON.parse(past[past.length - 1]);
        const newPast = past.slice(0, past.length - 1);
        const newFuture = [JSON.stringify(resumeData), ...future];

        set({
            resumeData: previousState,
            past: newPast,
            future: newFuture,
            saveStatus: 'dirty'
        });
        get().triggerAutosave();
    },

    // Redo change
    redo: () => {
        const { past, future, resumeData } = get();
        if (future.length === 0) return;

        const nextState = JSON.parse(future[0]);
        const newFuture = future.slice(1);
        const newPast = [...past, JSON.stringify(resumeData)];

        set({
            resumeData: nextState,
            past: newPast,
            future: newFuture,
            saveStatus: 'dirty'
        });
        get().triggerAutosave();
    },

    // Field mutation helpers
    updateField: (pathArray, value) => {
        get().recordHistory();
        set((state) => {
            if (!state.resumeData) return state;
            return {
                resumeData: setIn(state.resumeData, pathArray, value),
                saveStatus: 'dirty'
            };
        });
        get().triggerAutosave();
    },

    addArrayItem: (pathArray, emptyObj) => {
        get().recordHistory();
        set((state) => {
            if (!state.resumeData) return state;
            return {
                resumeData: pushIn(state.resumeData, pathArray, emptyObj),
                saveStatus: 'dirty'
            };
        });
        get().triggerAutosave();
    },

    removeArrayItem: (pathArray, index) => {
        get().recordHistory();
        set((state) => {
            if (!state.resumeData) return state;
            return {
                resumeData: removeIn(state.resumeData, pathArray, index),
                saveStatus: 'dirty'
            };
        });
        get().triggerAutosave();
    },

    // Section Ordering Helpers
    getSectionOrder: () => {
        const state = get();
        const customOrder = state.resumeData?.metadata?.sectionOrder;
        if (Array.isArray(customOrder) && customOrder.length > 0) {
            return customOrder;
        }
        const persona = state.resumeData?.metadata?.persona || 'experienced';
        if (persona === 'fresher') {
            return ['summary', 'education', 'projects', 'skills', 'experience', 'certifications', 'additionalSections'];
        } else if (persona === 'career-changer') {
            return ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'additionalSections'];
        }
        return ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'additionalSections'];
    },

    moveSectionUp: (sectionKey) => {
        const currentOrder = get().getSectionOrder();
        const idx = currentOrder.indexOf(sectionKey);
        if (idx <= 0) return;
        const newOrder = [...currentOrder];
        const temp = newOrder[idx - 1];
        newOrder[idx - 1] = newOrder[idx];
        newOrder[idx] = temp;
        get().updateField(['metadata', 'sectionOrder'], newOrder);
    },

    moveSectionDown: (sectionKey) => {
        const currentOrder = get().getSectionOrder();
        const idx = currentOrder.indexOf(sectionKey);
        if (idx < 0 || idx >= currentOrder.length - 1) return;
        const newOrder = [...currentOrder];
        const temp = newOrder[idx + 1];
        newOrder[idx + 1] = newOrder[idx];
        newOrder[idx] = temp;
        get().updateField(['metadata', 'sectionOrder'], newOrder);
    },

    moveSectionToTop: (sectionKey) => {
        const currentOrder = get().getSectionOrder();
        const filtered = currentOrder.filter(k => k !== sectionKey);
        filtered.unshift(sectionKey);
        get().updateField(['metadata', 'sectionOrder'], filtered);
    },

    moveSectionToBottom: (sectionKey) => {
        const currentOrder = get().getSectionOrder();
        const filtered = currentOrder.filter(k => k !== sectionKey);
        filtered.push(sectionKey);
        get().updateField(['metadata', 'sectionOrder'], filtered);
    },

    deleteSection: (sectionKey) => {
        const state = get();
        if (!state.resumeData) return;
        if (sectionKey === 'summary') {
            get().updateField(['professionalSummary'], '');
        } else if (Array.isArray(state.resumeData[sectionKey])) {
            get().updateField([sectionKey], []);
        }
        const currentOrder = get().getSectionOrder();
        const newOrder = currentOrder.filter(k => k !== sectionKey);
        get().updateField(['metadata', 'sectionOrder'], newOrder);
    },

    // Debounced background autosave (1500ms debounce)
    triggerAutosave: () => {
        const { saveTimer } = get();
        if (saveTimer) clearTimeout(saveTimer);

        const newTimer = setTimeout(() => {
            get().performSave();
        }, 1500);

        set({ saveTimer: newTimer });
    },

    performSave: async () => {
        const { dbResumeId, resumeData, templateId, saveStatus, interactionHistory } = get();
        if (!dbResumeId || !resumeData || saveStatus === 'saving') return;

        set({ saveStatus: 'saving' });
        try {
            const payloadContent = { ...resumeData, interactionHistory };
            await saveResumeApi(dbResumeId, payloadContent, templateId, null, { interactionHistory });
            set({ saveStatus: 'saved' });
        } catch (err) {
            console.error("Autosave failed:", err);
            set({ saveStatus: 'error' });
        }
    }
}));