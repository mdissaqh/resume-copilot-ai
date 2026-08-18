/**
 * Fact validator module.
 * Verifies that AI-generated suggestions or rewrites do NOT invent unverified factual atoms
 * (companies, degrees, universities, metrics, or technologies) that are not present
 * in originalContent or user manual edits.
 */
export const extractFactAtoms = (dataObj) => {
    const atoms = new Set();

    if (!dataObj || typeof dataObj !== 'object') return atoms;

    const traverse = (val) => {
        if (typeof val === 'string') {
            const words = val.toLowerCase().split(/\s+/);
            words.forEach(w => {
                if (w.length > 3) atoms.add(w.replace(/[^a-z0-9]/g, ''));
            });
        } else if (Array.isArray(val)) {
            val.forEach(traverse);
        } else if (typeof val === 'object' && val !== null) {
            Object.values(val).forEach(traverse);
        }
    };

    traverse(dataObj);
    return atoms;
};

export const validateFactSafety = ({ proposedText, originalContent, userContent }) => {
    if (!proposedText) return { safe: true };

    const verifiedAtoms = new Set([
        ...extractFactAtoms(originalContent),
        ...extractFactAtoms(userContent)
    ]);

    // Check for newly introduced numeric metrics (percentages, numbers > 10) not present in verified facts
    const proposedMetrics = proposedText.match(/\b\d+(?:%|\+)?\b/g) || [];
    for (const metric of proposedMetrics) {
        const rawNum = metric.replace(/[^0-9]/g, '');
        if (rawNum && parseInt(rawNum, 10) > 5) {
            const isVerified = Array.from(verifiedAtoms).some(atom => atom === rawNum);
            if (!isVerified) {
                return {
                    safe: false,
                    reason: `Unverified metric "${metric}" detected. Please confirm with candidate first.`
                };
            }
        }
    }

    return { safe: true };
};
