import { create } from 'zustand';
import { normalizeResumeData } from '../utils/resumeNormalizer';
import { setIn, pushIn, removeIn } from '../features/builder/utils/pathHelpers';

export const useResumeStore = create((set) => ({
    resumeData: null,
    isDirty: false,
    
    setResumeData: (data) => set({ 
        resumeData: normalizeResumeData(data), 
        isDirty: false 
    }),
    
    updateField: (pathArray, value) => set((state) => {
        if (!state.resumeData) return state;
        return { 
            resumeData: setIn(state.resumeData, pathArray, value), 
            isDirty: true 
        };
    }),
    
    addArrayItem: (pathArray, emptyObj) => set((state) => {
        if (!state.resumeData) return state;
        return { 
            resumeData: pushIn(state.resumeData, pathArray, emptyObj), 
            isDirty: true 
        };
    }),
    
    removeArrayItem: (pathArray, index) => set((state) => {
        if (!state.resumeData) return state;
        return { 
            resumeData: removeIn(state.resumeData, pathArray, index), 
            isDirty: true 
        };
    }),
    
    resetDirty: () => set({ isDirty: false }),
}));