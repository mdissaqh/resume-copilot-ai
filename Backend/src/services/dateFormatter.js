export const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const trimmed = dateStr.trim();
    if (!trimmed) return '';

    if (trimmed.toLowerCase() === 'present') return 'Present';

    // Matches YYYY-MM or YYYY-MM-DD
    const match = trimmed.match(/^(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?$/);
    if (match) {
        const year = match[1];
        const monthNum = parseInt(match[2], 10) - 1;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[monthNum]} ${year}`;
    }

    return trimmed;
};
