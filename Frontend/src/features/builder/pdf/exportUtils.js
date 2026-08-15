import { pdf } from '@react-pdf/renderer';
import { getTemplate } from './TemplateRegistry';

export const downloadPDF = async (resumeData, templateId) => {
    try {
        const doc = getTemplate(templateId, resumeData);
        if (!doc) throw new Error("Invalid template or missing data");
        
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const safeName = resumeData?.personalInfo?.fullName?.trim() || 'Resume';
        link.download = `${safeName}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up memory
    } catch (e) {
        console.error("PDF Generation Error:", e);
        throw new Error("Failed to generate PDF. Please try again.");
    }
};