import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from "docx";

const getTemplateConfig = (templateId) => {
    switch (templateId) {
        case 'modern':
            return {
                font: "Arial",
                nameAlign: AlignmentType.LEFT,
                contactAlign: AlignmentType.LEFT,
                primaryColor: "2980B9",
                secondaryColor: "7F8C8D",
                textColor: "2C3E50"
            };
        case 'minimal':
            return {
                font: "Arial",
                nameAlign: AlignmentType.LEFT,
                contactAlign: AlignmentType.LEFT,
                primaryColor: "333333",
                secondaryColor: "666666",
                textColor: "444444"
            };
        case 'classic':
        default:
            return {
                font: "Times New Roman",
                nameAlign: AlignmentType.CENTER,
                contactAlign: AlignmentType.CENTER,
                primaryColor: "000000",
                secondaryColor: "000000",
                textColor: "000000"
            };
    }
};

export const downloadDOCX = async (resumeData, templateId) => {
    const config = getTemplateConfig(templateId);
    const sections = [];

    // Personal Info
    if (resumeData.personalInfo) {
        sections.push(new Paragraph({
            children: [
                new TextRun({ 
                    text: resumeData.personalInfo.fullName?.toUpperCase(), 
                    size: templateId === 'modern' ? 32 : 28, 
                    bold: templateId !== 'minimal', 
                    color: config.textColor 
                })
            ],
            alignment: config.nameAlign,
            spacing: { after: 100 }
        }));
        
        const contactArr = [resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.location].filter(Boolean);
        const separator = templateId === 'modern' ? ' • ' : templateId === 'minimal' ? '   /   ' : '  |  ';
        
        sections.push(new Paragraph({
            children: [new TextRun({ text: contactArr.join(separator), size: 20, color: config.secondaryColor })],
            alignment: config.contactAlign,
            border: templateId === 'classic' ? { bottom: { color: "000000", space: 1, value: "single", size: 6 } } : undefined,
            spacing: { after: 300 }
        }));
    }

    // Professional Summary
    if (resumeData.professionalSummary) {
        const title = templateId === 'minimal' ? "ABOUT" : templateId === 'modern' ? "SUMMARY" : "PROFESSIONAL SUMMARY";
        sections.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        sections.push(new Paragraph({ text: resumeData.professionalSummary, spacing: { after: 200 }, style: "normalText" }));
    }

    // Experience
    if (resumeData.experience?.length > 0) {
        sections.push(new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.experience.forEach(exp => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.role, bold: true, color: config.textColor }),
                    new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, bold: templateId === 'classic', color: config.secondaryColor })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.organization, italics: templateId === 'classic', bold: templateId === 'modern', color: config.textColor }),
                    new TextRun({ text: `\t${exp.location || ''}`, italics: templateId === 'classic' })
                ],
                spacing: { after: 100 }
            }));
            exp.achievements?.forEach(ach => {
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
                    new TextRun({ text: edu.institution, bold: true, color: config.textColor }),
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

    if (resumeData.skills?.length > 0) {
        const title = templateId === 'minimal' ? "EXPERTISE" : "SKILLS";
        sections.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        resumeData.skills.forEach(skill => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `${skill.category}: `, bold: true, color: config.textColor }),
                    new TextRun({ text: skill.items?.join(', '), style: "normalText" })
                ],
                spacing: { after: 50 }
            }));
        });
    }

    if (resumeData.additionalSections?.length > 0) {
        resumeData.additionalSections.forEach(section => {
            sections.push(new Paragraph({ text: section.sectionTitle?.toUpperCase(), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
            section.items?.forEach(item => {
                sections.push(new Paragraph({
                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                    children: [
                        new TextRun({ text: item.heading, bold: true, color: config.textColor }),
                        new TextRun({ text: `\t${item.date || ''}`, color: config.secondaryColor })
                    ]
                }));
                sections.push(new Paragraph({
                    children: [new TextRun({ text: item.subheading, italics: templateId === 'classic', bold: templateId === 'modern' })]
                }));
                if (item.description) {
                    sections.push(new Paragraph({ text: item.description, style: "normalText", spacing: { before: 50 } }));
                }
                sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
            });
        });
    }

    const doc = new Document({
        styles: {
            default: {
                heading2: { 
                    run: { font: config.font, size: templateId === 'minimal' ? 22 : 24, bold: true, color: config.primaryColor },
                    paragraph: { border: templateId !== 'minimal' ? { bottom: { color: templateId === 'modern' ? "ECF0F1" : "000000", space: 1, value: "single", size: templateId === 'modern' ? 12 : 6 } } : undefined }
                },
                document: { run: { font: config.font, size: 20, color: config.textColor } } // 20 half-points = 10pt
            },
            paragraphStyles: [
                { id: "normalText", name: "Normal Text", basedOn: "Normal", run: { font: config.font, size: 20, color: config.textColor } }
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