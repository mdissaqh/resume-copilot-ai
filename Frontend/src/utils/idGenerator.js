/**
 * Generates a stable, unique identifier for resume array items.
 * Uses crypto.randomUUID if available, with a fast mathematical fallback for older browser contexts.
 */
export const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Safe fallback ensuring stability without heavy libraries
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};