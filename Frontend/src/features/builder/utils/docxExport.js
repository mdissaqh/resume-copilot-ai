import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition, ExternalHyperlink } from "docx";
import { validateAndFormatURL } from '../../../utils/urlValidator';
import { normalizeResumeData } from '../../../utils/resumeNormalizer';
import { templateConfig } from '../../../utils/templateConfig';

export const downloadDOCX = async (rawResumeData, templateId) => {
    const resumeData = normalizeResumeData(rawResumeData);
    const config = templateConfig[templateId] || templateConfig.classic;
    const isMinimal = config.id === 'minimal';
    const sections = [];

    // Personal Info mapped explicitly referencing the DOCX Baseline
    if (resumeData.personalInfo.fullName) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: config.uppercaseHeaders ? resumeData.personalInfo.fullName.toUpperCase() : resumeData.personalInfo.fullName, size: isMinimal ? 22 : 28, bold: !isMinimal, color: config.primaryColor })],
            alignment: config.headerAlign === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { after: 100 }
        }));
        
        const contactChildren = [];
        const items = [resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.location].filter(Boolean);
        const separator = config.id === 'modern' ? ' • ' : config.id === 'minimal' ? '   /   ' : '  |  ';
        
        items.forEach((item, i) => {
            contactChildren.push(new TextRun({ text: item, size: 20, color: config.secondaryColor }));
            if (i < items.length - 1 || resumeData.personalInfo.links.length > 0) {
                contactChildren.push(new TextRun({ text: separator, size: 20, color: config.secondaryColor }));
            }
        });

        resumeData.personalInfo.links.forEach((link, i) => {
            const validUrl = validateAndFormatURL(link.url);
            if (validUrl) {
                contactChildren.push(new ExternalHyperlink({ children: [new TextRun({ text: link.platform, style: "Hyperlink", size: 20 })], link: validUrl }));
                if (i < resumeData.personalInfo.links.length - 1) contactChildren.push(new TextRun({ text: separator, size: 20, color: config.secondaryColor }));
            }
        });

        sections.push(new Paragraph({
            children: contactChildren, 
            alignment: config.headerAlign === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
            border: config.showBorders ? { bottom: { color: config.primaryColor, space: 1, value: "single", size: 6 } } : undefined, 
            spacing: { after: 300 }
        }));
    }

    if (resumeData.professionalSummary) {
        sections.push(new Paragraph({ text: isMinimal ? "ABOUT" : "PROFESSIONAL SUMMARY", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        sections.push(new Paragraph({ text: resumeData.professionalSummary, spacing: { after: 200 }, style: "normalText" }));
    }

    if (resumeData.experience.length > 0) {
        sections.push(new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.experience.forEach(exp => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.role, bold: true, color: config.primaryColor }),
                    new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, bold: !isMinimal, color: config.secondaryColor })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.organization, italics: config.id === 'classic', bold: config.id === 'modern', color: config.primaryColor }),
                    new TextRun({ text: `\t${exp.location || ''}`, italics: config.id === 'classic' })
                ],
                spacing: { after: 100 }
            }));
            exp.achievements?.forEach(ach => sections.push(new Paragraph({ text: ach, bullet: { level: 0 }, style: "normalText" })));
            sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        });
    }

    if (resumeData.projects.length > 0) {
        sections.push(new Paragraph({ text: "PROJECTS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.projects.forEach(proj => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: proj.title, bold: true, color: config.primaryColor }),
                    new TextRun({ text: `\t${proj.date || ''}`, bold: !isMinimal, color: config.secondaryColor })
                ]
            }));
            
            const linkRuns = [];
            if (validateAndFormatURL(proj.githubUrl)) linkRuns.push(new ExternalHyperlink({ children: [new TextRun({ text: "GitHub", style: "Hyperlink", size: 20 })], link: validateAndFormatURL(proj.githubUrl) }));
            if (validateAndFormatURL(proj.liveUrl)) {
                 if (linkRuns.length > 0) linkRuns.push(new TextRun({ text: " | ", style: "normalText" }));
                 linkRuns.push(new ExternalHyperlink({ children: [new TextRun({ text: "Live Demo", style: "Hyperlink", size: 20 })], link: validateAndFormatURL(proj.liveUrl) }));
            }
            
            if (proj.description || linkRuns.length > 0) {
                 sections.push(new Paragraph({ children: [new TextRun({ text: (proj.description ? proj.description + " " : ""), style: "normalText" }), ...linkRuns], spacing: { after: 100 } }));
            }
            
            proj.highlights?.forEach(ach => sections.push(new Paragraph({ text: ach, bullet: { level: 0 }, style: "normalText" })));
            sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        });
    }

    if (resumeData.education.length > 0) {
        sections.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.education.forEach(edu => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: edu.institution, bold: true, color: config.primaryColor }),
                    new TextRun({ text: `\t${edu.location || ''}` })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: `${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}`, style: "normalText" }),
                    new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, color: config.secondaryColor })
                ],
                spacing: { after: 100 }
            }));
        });
    }

    if (resumeData.skills.length > 0) {
        sections.push(new Paragraph({ text: isMinimal ? "EXPERTISE" : "SKILLS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.skills.forEach(skill => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `${skill.category}: `, bold: true, color: config.primaryColor }),
                    new TextRun({ text: skill.items?.join(', '), style: "normalText" })
                ],
                spacing: { after: 50 }
            }));
        });
    }
    
    if (resumeData.certifications.length > 0) {
        sections.push(new Paragraph({ text: "CERTIFICATIONS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.certifications.forEach(cert => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: cert.name, bold: true, color: config.primaryColor }),
                    new TextRun({ text: (cert.issuer ? ` - ${cert.issuer}` : '') + (cert.date ? ` (${cert.date})` : ''), style: "normalText" })
                ],
                spacing: { after: 50 }
            }));
        });
    }
    
    if (resumeData.achievements.length > 0) {
        sections.push(new Paragraph({ text: "ACHIEVEMENTS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.achievements.forEach(ach => {
            sections.push(new Paragraph({ text: ach, bullet: { level: 0 }, style: "normalText" }));
        });
    }

    const doc = new Document({
        styles: {
            default: {
                heading2: { run: { font: config.docFont, size: isMinimal ? 22 : 24, bold: true, color: config.primaryColor }, paragraph: { border: config.showBorders ? { bottom: { color: config.id === 'modern' ? "ECF0F1" : "000000", space: 1, value: "single", size: config.id === 'modern' ? 12 : 6 } } : undefined } },
                document: { run: { font: config.docFont, size: 20, color: config.primaryColor } } 
            },
            paragraphStyles: [ { id: "normalText", name: "Normal Text", basedOn: "Normal", run: { font: config.docFont, size: 20, color: config.primaryColor } } ],
            characterStyles: [ { id: "Hyperlink", name: "Hyperlink", basedOn: "Default Paragraph Font", run: { color: config.id === 'modern' ? "2980B9" : "0000EE", underline: { type: "single" } } } ]
        },
        sections: [{ children: sections }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName || 'Resume'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};