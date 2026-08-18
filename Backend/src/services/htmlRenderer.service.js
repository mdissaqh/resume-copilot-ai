import { formatDate } from './dateFormatter.js';

export const renderResumeToHtml = (resumeData) => {
    if (!resumeData) return '<html><body>No data</body></html>';

    const {
        personalInfo = {},
        professionalSummary = '',
        experience = [],
        projects = [],
        education = [],
        skills = [],
        certifications = [],
        additionalSections = [],
        metadata = {}
    } = resumeData;

    const persona = metadata.persona || 'experienced';

    // Contact info items
    const contactParts = [];
    if (personalInfo.email) contactParts.push(`<span>${personalInfo.email}</span>`);
    if (personalInfo.phone) contactParts.push(`<span>${personalInfo.phone}</span>`);
    if (personalInfo.location) contactParts.push(`<span>${personalInfo.location}</span>`);
    if (Array.isArray(personalInfo.links)) {
        personalInfo.links.forEach(l => {
            if (l.url) {
                contactParts.push(`<a href="${l.url}" target="_blank" class="link">${l.platform || l.url}</a>`);
            }
        });
    }

    // Helper section renderers
    const renderExperience = () => {
        if (!experience || experience.length === 0) return '';
        const items = experience.map(exp => `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${exp.role || ''}</div>
                    <div class="dateLocation">${formatDate(exp.startDate)}${exp.startDate || exp.endDate ? ' – ' : ''}${formatDate(exp.endDate)}</div>
                </div>
                <div class="rowBetween">
                    <div class="secondaryText">${exp.organization || ''}</div>
                    ${exp.location ? `<div class="dateLocation">${exp.location}</div>` : ''}
                </div>
                ${exp.description ? `<div class="paragraph">${exp.description}</div>` : ''}
                ${Array.isArray(exp.achievements) && exp.achievements.length > 0 ? `
                    <ul class="bulletList">
                        ${exp.achievements.map(ach => ach ? `<li class="bulletItem"><span class="bulletPoint">•</span><div class="bulletContent">${ach}</div></li>` : '').join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');

        return `<div class="section"><h2 class="sectionTitle">Professional Experience</h2>${items}</div>`;
    };

    const renderProjects = () => {
        if (!projects || projects.length === 0) return '';
        const items = projects.map(proj => `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${proj.title || ''}</div>
                    <div class="dateLocation">${formatDate(proj.date)}</div>
                </div>
                <div class="rowBetween">
                    <div class="secondaryText">${proj.description || ''}</div>
                    <div class="projectLinks">
                        ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" class="link">GitHub</a>` : ''}
                        ${proj.liveUrl ? `<a href="${proj.liveUrl}" target="_blank" class="link">Live Demo</a>` : ''}
                    </div>
                </div>
                ${Array.isArray(proj.highlights) && proj.highlights.length > 0 ? `
                    <ul class="bulletList">
                        ${proj.highlights.map(hl => hl ? `<li class="bulletItem"><span class="bulletPoint">•</span><div class="bulletContent">${hl}</div></li>` : '').join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');

        return `<div class="section"><h2 class="sectionTitle">Projects</h2>${items}</div>`;
    };

    const renderEducation = () => {
        if (!education || education.length === 0) return '';
        const items = education.map(edu => `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${edu.institution || ''}</div>
                    <div class="dateLocation">${edu.location || ''}</div>
                </div>
                <div class="rowBetween">
                    <div>${edu.degree || ''}${edu.degree && edu.fieldOfStudy ? ' in ' : ''}${edu.fieldOfStudy || ''}</div>
                    <div class="dateLocation">${formatDate(edu.startDate)}${edu.startDate || edu.endDate ? ' – ' : ''}${formatDate(edu.endDate)}</div>
                </div>
            </div>
        `).join('');

        return `<div class="section"><h2 class="sectionTitle">Education</h2>${items}</div>`;
    };

    const renderSkills = () => {
        if (!skills || skills.length === 0) return '';
        const items = skills.map(group => `
            <div class="skillItem">
                <span class="skillCategory">${group.category || 'Skills'}:</span>
                <span class="skillContent">${Array.isArray(group.items) ? group.items.join(', ') : group.items || ''}</span>
            </div>
        `).join('');

        return `<div class="section"><h2 class="sectionTitle">Skills</h2>${items}</div>`;
    };

    const renderCertifications = () => {
        if (!certifications || certifications.length === 0) return '';
        const items = certifications.map(cert => `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${cert.name || ''}</div>
                    <div class="dateLocation">${formatDate(cert.date)}</div>
                </div>
                <div class="secondaryText">${cert.issuer || ''}</div>
            </div>
        `).join('');

        return `<div class="section"><h2 class="sectionTitle">Certifications</h2>${items}</div>`;
    };

    const renderCustomSections = () => {
        if (!additionalSections || additionalSections.length === 0) return '';
        return additionalSections.map(sec => {
            if (!sec.items || sec.items.length === 0) return '';
            const items = sec.items.map(item => `
                <div class="blockItem">
                    <div class="rowBetween">
                        <div class="primaryText">${item.heading || ''}</div>
                        <div class="dateLocation">${formatDate(item.date)}</div>
                    </div>
                    <div class="secondaryText">${item.subheading || ''}</div>
                    ${item.description ? `<div class="paragraph">${item.description}</div>` : ''}
                </div>
            `).join('');

            return `<div class="section"><h2 class="sectionTitle">${sec.sectionTitle || 'Custom Section'}</h2>${items}</div>`;
        }).join('');
    };

    // Persona-based section ordering
    let bodySections = [];
    if (persona === 'fresher') {
        bodySections = [renderEducation(), renderProjects(), renderSkills(), renderExperience()];
    } else if (persona === 'career-changer') {
        bodySections = [renderSkills(), renderExperience(), renderProjects(), renderEducation()];
    } else {
        bodySections = [renderExperience(), renderSkills(), renderProjects(), renderEducation()];
    }

    bodySections.push(renderCertifications(), renderCustomSections());

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${personalInfo.fullName || 'Resume'}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #ffffff;
            color: #1f2937;
            width: 210mm;
            min-height: 297mm;
            padding: 16mm 18mm;
            margin: 0 auto;
            -webkit-print-color-adjust: exact;
        }
        .header {
            text-align: center;
            margin-bottom: 14pt;
            padding-bottom: 8pt;
            border-bottom: 1.5pt solid #1a1a1a;
        }
        .name {
            font-size: 22pt;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-transform: uppercase;
            color: #111827;
            margin-bottom: 6pt;
            line-height: 1.15;
        }
        .contactInfo {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 6pt;
            font-size: 9.5pt;
            color: #374151;
        }
        .contactSeparator {
            color: #9ca3af;
        }
        .link {
            color: #2563eb;
            text-decoration: underline;
        }
        .sectionTitle {
            font-size: 11.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #111827;
            border-bottom: 1pt solid #111827;
            padding-bottom: 3pt;
            margin: 12pt 0 6pt 0;
        }
        .blockItem {
            margin-bottom: 6pt;
        }
        .rowBetween {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            width: 100%;
            gap: 12px;
        }
        .primaryText {
            font-weight: 700;
            font-size: 10.5pt;
            color: #111827;
            flex: 1;
        }
        .secondaryText {
            font-style: italic;
            font-size: 10pt;
            color: #374151;
            flex: 1;
        }
        .dateLocation {
            font-weight: 600;
            font-size: 9.5pt;
            color: #4b5563;
            white-space: nowrap;
            text-align: right;
            margin-left: auto;
        }
        .paragraph {
            font-size: 9.5pt;
            line-height: 1.4;
            color: #374151;
            margin-top: 2pt;
        }
        .bulletList {
            list-style: none;
            padding-left: 0;
            margin-top: 2pt;
        }
        .bulletItem {
            display: flex;
            align-items: flex-start;
            gap: 6pt;
            margin-bottom: 3pt;
            padding-left: 8pt;
        }
        .bulletPoint {
            color: #111827;
            font-size: 10pt;
        }
        .bulletContent {
            flex: 1;
            font-size: 9.5pt;
            line-height: 1.4;
            color: #1f2937;
        }
        .skillItem {
            display: flex;
            align-items: flex-start;
            gap: 6pt;
            margin-bottom: 4pt;
            font-size: 9.5pt;
        }
        .skillCategory {
            font-weight: 700;
            color: #111827;
            white-space: nowrap;
        }
        .skillContent {
            color: #374151;
        }
        .projectLinks {
            display: flex;
            gap: 8pt;
            font-size: 9pt;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <header class="header">
        <h1 class="name">${personalInfo.fullName || 'YOUR FULL NAME'}</h1>
        <div class="contactInfo">
            ${contactParts.join(' <span class="contactSeparator">|</span> ')}
        </div>
    </header>

    ${professionalSummary ? `
        <div class="section">
            <h2 class="sectionTitle">Professional Summary</h2>
            <div class="paragraph">${professionalSummary}</div>
        </div>
    ` : ''}

    ${bodySections.join('')}
</body>
</html>`;
};
