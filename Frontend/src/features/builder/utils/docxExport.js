import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from "docx";

export const downloadDOCX = async (resumeData, templateId) => {
    const sections = [];

    if (resumeData.personalInfo) {
        sections.push(new Paragraph({
            text: resumeData.personalInfo.fullName?.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }));
        
        const contactArr = [resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.location].filter(Boolean);
        sections.push(new Paragraph({
            children: [new TextRun({ text: contactArr.join('  |  '), size: 20 })],
            alignment: AlignmentType.CENTER,
            border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
            spacing: { after: 300 }
        }));
    }

    if (resumeData.professionalSummary) {
        sections.push(new Paragraph({ text: "PROFESSIONAL SUMMARY", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }, spacing: { before: 200, after: 100 } }));
        sections.push(new Paragraph({ text: resumeData.professionalSummary, spacing: { after: 200 } }));
    }

    if (resumeData.experience?.length > 0) {
        sections.push(new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }, spacing: { before: 200, after: 100 } }));
        resumeData.experience.forEach(exp => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.role, bold: true }),
                    new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, bold: true })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.organization, italics: true }),
                    new TextRun({ text: `\t${exp.location}`, italics: true })
                ],
                spacing: { after: 100 }
            }));
            exp.achievements?.forEach(ach => {
                sections.push(new Paragraph({ text: ach, bullet: { level: 0 } }));
            });
            sections.push(new Paragraph({ text: "", spacing: { after: 100 } })); // Spacer
        });
    }

    if (resumeData.education?.length > 0) {
        sections.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }, spacing: { before: 200, after: 100 } }));
        resumeData.education.forEach(edu => {
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: edu.institution, bold: true }),
                    new TextRun({ text: `\t${edu.location}` })
                ]
            }));
            sections.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: `${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}` }),
                    new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}` })
                ],
                spacing: { after: 100 }
            }));
        });
    }

    if (resumeData.skills?.length > 0) {
        sections.push(new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }, spacing: { before: 200, after: 100 } }));
        resumeData.skills.forEach(skill => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `${skill.category}: `, bold: true }),
                    new TextRun({ text: skill.items?.join(', ') })
                ],
                spacing: { after: 50 }
            }));
        });
    }

    const doc = new Document({
        styles: {
            default: {
                heading1: { run: { font: "Arial", size: 28, bold: true, color: "000000" } },
                heading2: { run: { font: "Arial", size: 24, bold: true, color: "000000" } },
                document: { run: { font: "Arial", size: 20, color: "000000" } }
            }
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