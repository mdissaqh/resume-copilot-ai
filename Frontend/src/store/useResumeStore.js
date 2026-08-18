import { create } from 'zustand';
import { normalizeResumeData } from '../utils/resumeNormalizer';
import { setIn, pushIn, removeIn } from '../features/builder/utils/pathHelpers';
import { saveResumeApi } from '../features/builder/api/builder.api';

const MAX_HISTORY_LENGTH = 30;

export const useResumeStore = create((set, get) => ({
    resumeData: null,
    dbResumeId: null,
    templateId: 'evergreen',
    
    // Undo / Redo State
    past: [],
    future: [],

    // Autosave Status: 'saved' | 'saving' | 'dirty' | 'error'
    saveStatus: 'saved',
    saveTimer: null,

    // Hydrate store with loaded document
    setResumeData: (data, dbId = null, template = 'evergreen') => set({
        resumeData: normalizeResumeData(data),
        dbResumeId: dbId,
        templateId: template || 'evergreen',
        past: [],
        future: [],
        saveStatus: 'saved'
    }),

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
        const { dbResumeId, resumeData, templateId, saveStatus } = get();
        if (!dbResumeId || !resumeData || saveStatus === 'saving') return;

        set({ saveStatus: 'saving' });
        try {
            await saveResumeApi(dbResumeId, resumeData, templateId);
            set({ saveStatus: 'saved' });
        } catch (err) {
            console.error("Autosave failed:", err);
            set({ saveStatus: 'error' });
        }
    }
}));