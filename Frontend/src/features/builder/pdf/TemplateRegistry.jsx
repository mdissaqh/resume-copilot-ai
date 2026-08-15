import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

export const getTemplate = (templateId, resumeData) => {
    if (!resumeData) return null;

    switch (templateId) {
        case 'modern': return <ModernTemplate data={resumeData} />;
        case 'minimal': return <MinimalTemplate data={resumeData} />;
        case 'classic':
        default:
            return <ClassicTemplate data={resumeData} />;
    }
};