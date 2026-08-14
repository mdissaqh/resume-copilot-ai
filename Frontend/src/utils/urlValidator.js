export const validateAndFormatURL = (url) => {
    if (!url || typeof url !== 'string') return '';
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//i)) {
        formattedUrl = 'https://' + formattedUrl;
    }
    try {
        new URL(formattedUrl);
        return formattedUrl;
    } catch (e) {
        return '';
    }
};