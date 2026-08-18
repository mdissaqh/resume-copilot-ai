import crypto from 'crypto';

/**
 * Computes a deterministic SHA-256 fingerprint for node ID and text content.
 */
export const computeDeterministicFingerprint = (targetNodeId = '', textContent = '') => {
    const rawString = `${targetNodeId.trim()}::${String(textContent).trim().toLowerCase()}`;
    return crypto.createHash('sha256').update(rawString).digest('hex').substring(0, 16);
};

export const isDuplicateFingerprint = (fingerprint, historyArray = []) => {
    if (!fingerprint) return false;
    return historyArray.includes(fingerprint);
};
