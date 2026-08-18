/**
 * Formats raw date strings like "2024-01" or "2024-01-15" cleanly into "Jan 2024".
 * Preserves "Present" or already formatted month strings.
 */
export const formatDateDisplay = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const trimmed = dateStr.trim();
    if (!trimmed) return '';

    if (trimmed.toLowerCase() === 'present') return 'Present';

    // Match YYYY-MM
    const yyyyMmMatch = trimmed.match(/^(\d{4})-(\d{2})/);
    if (yyyyMmMatch) {
        const year = yyyyMmMatch[1];
        const monthNum = parseInt(yyyyMmMatch[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (monthNum >= 1 && monthNum <= 12) {
            return `${months[monthNum - 1]} ${year}`;
        }
    }

    return trimmed;
};
