import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition, ExternalHyperlink } from "docx";
import { validateAndFormatURL } from '../../../utils/urlValidator';

export const downloadDOCX = async (resumeData, templateId) => {
    const sections = [];

    if (resumeData.personalInfo) {
        sections.push(new Paragraph({
            children: [
                new TextRun({ 
                    text: resumeData.personalInfo.fullName?.toUpperCase() || "NAME", 
                    size: 28, bold: true, color: "000000" 
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }));
        
        const contactChildren = [];
        const items = [resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.location].filter(Boolean);
        
        items.forEach((item, i) => {
            contactChildren.push(new TextRun({ text: item, size: 20, color: "000000" }));
            if (i < items.length - 1 || (resumeData.personalInfo.links?.length > 0)) {
                contactChildren.push(new TextRun({ text: "  |  ", size: 20, color: "000000" }));
            }
        });

        resumeData.personalInfo.links?.forEach((link, i) => {
            const validUrl = validateAndFormatURL(link.url);
            if (validUrl) {
                contactChildren.push(new ExternalHyperlink({
                    children: [new TextRun({ text: link.platform, style: "Hyperlink", size: 20 })],
                    link: validUrl
                }));
                if (i < resumeData.personalInfo.links.length - 1) {
                    contactChildren.push(new TextRun({ text: "  |  ", size: 20, color: "000000" }));
                }
            }
        });

        sections.push(new Paragraph({
            children: contactChildren,
            alignment: AlignmentType.CENTER,
            border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
            spacing: { after: 300 }
        }));
    }

    if (resumeData.professionalSummary) {
        sections.push(new Paragraph({ text: "PROFESSIONAL SUMMARY", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        sections.push(new Paragraph({ text: resumeData.professionalSummary, spacing: { after: 200 }, style: "normalText" }));
    }

    if (resumeData.experience?.length > 0) {
        sections.push(new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.experience.forEach(exp => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.role, bold: true, color: "000000" }),
                    new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, bold: true, color: "000000" })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.organization, italics: true, color: "000000" }),
                    new TextRun({ text: `\t${exp.location || ''}`, italics: true })
                ],
                spacing: { after: 100 }
            }));
            exp.achievements?.forEach(ach => {
                sections.push(new Paragraph({ text: ach, bullet: { level: 0 }, style: "normalText" }));
            });
            sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        });
    }

    if (resumeData.projects?.length > 0) {
        sections.push(new Paragraph({ text: "PROJECTS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.projects.forEach(proj => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: proj.title, bold: true, color: "000000" }),
                    new TextRun({ text: `\t${proj.date || ''}`, bold: true, color: "000000" })
                ]
            }));
            if (proj.description) {
                sections.push(new Paragraph({ text: proj.description, style: "normalText", spacing: { after: 100 } }));
            }
            proj.highlights?.forEach(ach => {
                sections.push(new Paragraph({ text: ach, bullet: { level: 0 }, style: "normalText" }));
            });
            sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        });
    }

    if (resumeData.education?.length > 0) {
        sections.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.education.forEach(edu => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: edu.institution, bold: true, color: "000000" }),
                    new TextRun({ text: `\t${edu.location || ''}` })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: `${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}`, style: "normalText" }),
                    new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, color: "000000" })
                ],
                spacing: { after: 100 }
            }));
        });
    }

    if (resumeData.skills?.length > 0) {
        sections.push(new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.skills.forEach(skill => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `${skill.category}: `, bold: true, color: "000000" }),
                    new TextRun({ text: skill.items?.join(', '), style: "normalText" })
                ],
                spacing: { after: 50 }
            }));
        });
    }

    const doc = new Document({
        styles: {
            default: {
                heading2: { 
                    run: { font: "Times New Roman", size: 24, bold: true, color: "000000" },
                    paragraph: { border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } } }
                },
                document: { run: { font: "Times New Roman", size: 20, color: "000000" } } 
            },
            paragraphStyles: [
                { id: "normalText", name: "Normal Text", basedOn: "Normal", run: { font: "Times New Roman", size: 20, color: "000000" } }
            ],
            characterStyles: [
                {
                    id: "Hyperlink",
                    name: "Hyperlink",
                    basedOn: "Default Paragraph Font",
                    run: { color: "0000EE", underline: { type: "single" } }
                }
            ]
        },
        sections: [{ children: sections }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo?.fullName || 'Resume'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};