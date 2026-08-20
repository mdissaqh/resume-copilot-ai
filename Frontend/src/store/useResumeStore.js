import { create } from 'zustand';
import { normalizeResumeData } from '../utils/resumeNormalizer';
import { setIn, pushIn, removeIn } from '../features/builder/utils/pathHelpers';
import { saveResumeApi } from '../features/builder/api/builder.api';
import { updateGuestDraft } from '../utils/guestDraftManager';
import { applyAIMutation } from '../utils/resumeMutationEngine';
import { buildBindingMap } from '../utils/resumeBindingMap';

const MAX_HISTORY_LENGTH = 30;

export const useResumeStore = create((set, get) => ({
    resumeData: null,
    dbResumeId: null,
    templateId: 'evergreen',
    interactionHistory: [],
    askedQuestions: [],
    questionsQueue: [],

    // Undo / Redo State
    past: [],
    future: [],

    // Autosave Status: 'saved' | 'saving' | 'dirty' | 'error'
    saveStatus: 'saved',
    saveTimer: null,

    // Hydrate store with loaded document
    setResumeData: (data, dbId = null, template = 'evergreen') => {
        const normalized = normalizeResumeData(data);
        const history = normalized?.interactionHistory || data?.aiState?.interactionHistory || data?.interactionHistory || [];
        const asked   = data?.aiState?.askedQuestions  || data?.askedQuestions || [];
        set({
            resumeData: normalized,
            dbResumeId: dbId,
            templateId: template || 'evergreen',
            interactionHistory: history,
            askedQuestions: asked,
            questionsQueue: [],
            past: [],
            future: [],
            saveStatus: 'saved'
        });
    },

    setQuestionsQueue: (questions) => {
        set({ questionsQueue: questions || [] });
    },

    popNextQuestion: () => {
        set((state) => ({
            questionsQueue: state.questionsQueue.slice(1)
        }));
    },

    recordInteraction: (id) => {
        if (!id) return;
        set((state) => {
            if (state.interactionHistory.includes(id)) return state;
            const updatedHistory = [...state.interactionHistory, id];
            const updatedResume  = state.resumeData
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

    recordQuestionAnswer: (question, answerValue, isSkipped = false) => {
        if (!question) return;
        const qId = question.id || question.questionId;
        const qEntry = {
            id:        qId,
            question:  question.message || question.question,
            type:      question.type,
            // Store targetRef (new contract) for precise anti-loop matching
            targetRef: question.targetRef || null,
            // Keep legacy targetPath for backward compat
            targetPath: question.targetPath || null,
            answer:    isSkipped ? "SKIPPED" : answerValue,
            skipped:   isSkipped,
            timestamp: new Date().toISOString()
        };

        set((state) => {
            const history       = state.interactionHistory.includes(qId) ? state.interactionHistory : [...state.interactionHistory, qId];
            const filteredAsked = state.askedQuestions.filter(q => q.id !== qId);
            const updatedAsked  = [...filteredAsked, qEntry];
            return {
                interactionHistory: history,
                askedQuestions:     updatedAsked,
                saveStatus:         'dirty'
            };
        });

        get().triggerAutosave();
    },

    /**
     * Apply an AI question answer using the typed mutation engine.
     * This is the canonical way to handle AI-driven mutations — NOT raw updateField calls.
     * Returns { appliedPath, description } for diagnostics.
     */
    applyAIMutation: (question, answerValue) => {
        const state = get();
        if (!state.resumeData || !question) return { appliedPath: null, description: 'No-op' };

        state.recordHistory();

        // Build binding map from current state for accurate path resolution
        const bindingMap = buildBindingMap(state.resumeData);

        const { resumeData: updatedResume, appliedPath, description } = applyAIMutation({
            question,
            answerValue,
            resumeData: state.resumeData,
            bindingMap
        });

        if (process.env.NODE_ENV === 'development' || window?.__RESUME_DEBUG__) {
            console.log(`[MutationEngine] ${description}`, { appliedPath, question: question.id });
        }

        set({ resumeData: updatedResume, saveStatus: 'dirty' });
        get().triggerAutosave();
        return { appliedPath, description };
    },

    /**
     * Ensure a section key exists in metadata.sectionOrder.
     * Called after creating a new collection item so the section
     * automatically becomes visible in the A4 renderer.
     */
    ensureSectionInOrder: (sectionKey) => {
        const state = get();
        if (!state.resumeData || !sectionKey) return;

        // Map of data keys → section order keys
        const orderKeyMap = {
            experience: 'experience',
            projects:   'projects',
            education:  'education',
            skills:     'skills',
            certifications: 'certifications',
            additionalSections: 'additionalSections',
            professionalSummary: 'summary'
        };
        const orderKey = orderKeyMap[sectionKey] || sectionKey;

        const currentOrder = Array.isArray(state.resumeData.metadata?.sectionOrder)
            ? state.resumeData.metadata.sectionOrder
            : null;

        // Only act if a custom order is set and the key is missing
        if (currentOrder && !currentOrder.includes(orderKey)) {
            get().updateField(['metadata', 'sectionOrder'], [...currentOrder, orderKey]);
        }
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
        const newPast       = past.slice(0, past.length - 1);
        const newFuture     = [JSON.stringify(resumeData), ...future];
        set({ resumeData: previousState, past: newPast, future: newFuture, saveStatus: 'dirty' });
        get().triggerAutosave();
    },

    // Redo change
    redo: () => {
        const { past, future, resumeData } = get();
        if (future.length === 0) return;
        const nextState  = JSON.parse(future[0]);
        const newFuture  = future.slice(1);
        const newPast    = [...past, JSON.stringify(resumeData)];
        set({ resumeData: nextState, past: newPast, future: newFuture, saveStatus: 'dirty' });
        get().triggerAutosave();
    },

    // Field mutation helpers
    updateField: (pathArray, value) => {
        // Safety guard: NEVER allow the literal strings "Yes" or "No" to overwrite resume content
        if (typeof value === 'string' && (value.trim() === 'Yes' || value.trim() === 'No')) {
            return;
        }
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

    /**
     * Update a specific array item identified by its stable _id.
     * Safer than index-based updates because _id is stable across re-renders.
     */
    updateArrayItem: (collection, itemId, fields) => {
        const state = get();
        if (!state.resumeData || !collection || !itemId) return;
        const arr = Array.isArray(state.resumeData[collection]) ? state.resumeData[collection] : [];
        const idx = arr.findIndex(item => item._id === itemId);
        if (idx < 0) return;
        get().recordHistory();
        const updatedItem = { ...arr[idx], ...fields };
        set((st) => ({
            resumeData: setIn(st.resumeData, [collection, idx], updatedItem),
            saveStatus: 'dirty'
        }));
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
        [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
        get().updateField(['metadata', 'sectionOrder'], newOrder);
    },

    moveSectionDown: (sectionKey) => {
        const currentOrder = get().getSectionOrder();
        const idx = currentOrder.indexOf(sectionKey);
        if (idx < 0 || idx >= currentOrder.length - 1) return;
        const newOrder = [...currentOrder];
        [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
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
        const newTimer = setTimeout(() => { get().performSave(); }, 1500);
        set({ saveTimer: newTimer });
    },

    performSave: async () => {
        const { dbResumeId, resumeData, templateId, saveStatus, interactionHistory, askedQuestions } = get();
        if (!resumeData || saveStatus === 'saving') return;

        // If guest mode, persist in local storage envelope
        if (!dbResumeId) {
            updateGuestDraft(resumeData, {
                aiState: { interactionHistory, askedQuestions, suggestions: [] }
            });
            set({ saveStatus: 'saved' });
            return;
        }

        set({ saveStatus: 'saving' });
        try {
            // Always send schemaVersion: 3 explicitly so the backend never downgrades
            const payloadContent = { ...resumeData, schemaVersion: 3, interactionHistory };
            const aiStatePayload = { interactionHistory, askedQuestions };
            await saveResumeApi(dbResumeId, payloadContent, templateId, resumeData.metadata, aiStatePayload);
            set({ saveStatus: 'saved' });
        } catch (err) {
            console.error("Autosave failed:", err);
            set({ saveStatus: 'error' });
        }
    }
}));