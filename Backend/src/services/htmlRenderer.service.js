import { formatDate } from './dateFormatter.js';

/**
 * Renders canonical resume JSON to a full, self-contained HTML document
 * suitable for Puppeteer PDF generation.
 *
 * CONTRACT: This renderer is driven by:
 *   - content.metadata.sectionOrder (user-defined order — ALWAYS respected if present)
 *   - metadata.persona (fallback ordering when no custom order is set)
 *
 * Field fixes:
 *   - education.score is rendered separately (not embedded in degree string)
 *   - certifications.url renders as a clickable hyperlink
 *   - additionalSections items use .heading field (not .title)
 *
 * @param {Object} resumeData - The canonical resume content JSON
 * @param {Object} [topMetadata] - The top-level Resume.metadata (may differ from content.metadata)
 */
export const renderResumeToHtml = (resumeData, topMetadata = {}) => {
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
        metadata: contentMetadata = {}
    } = resumeData;

    // Merge metadata: top-level document metadata takes precedence over content.metadata
    const metadata = {
        ...contentMetadata,
        ...topMetadata
    };

    const persona = metadata.persona || 'experienced';

    // Contact info items
    const contactParts = [];
    if (personalInfo.email)    contactParts.push(`<span>${personalInfo.email}</span>`);
    if (personalInfo.phone)    contactParts.push(`<span>${personalInfo.phone}</span>`);
    if (personalInfo.location) contactParts.push(`<span>${personalInfo.location}</span>`);
    if (Array.isArray(personalInfo.links)) {
        personalInfo.links.forEach(l => {
            if (l.url) {
                const label = l.platform || l.url;
                contactParts.push(`<a href="${l.url}" target="_blank" class="link">${label}</a>`);
            }
        });
    }

    // ─── Section Renderers ────────────────────────────────────────────────────

    const renderSummary = () => {
        if (!professionalSummary) return '';
        return `<div class="section">
            <h2 class="sectionTitle">Professional Summary</h2>
            <div class="paragraph">${professionalSummary}</div>
        </div>`;
    };

    const renderExperience = () => {
        const items = (Array.isArray(experience) ? experience : []).filter(Boolean);
        if (!items.length) return '';
        const rows = items.map(exp => `
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
                ${Array.isArray(exp.achievements) && exp.achievements.length ? `
                    <ul class="bulletList">
                        ${exp.achievements.map(ach => ach ? `<li class="bulletItem"><span class="bulletPoint">•</span><div class="bulletContent">${ach}</div></li>` : '').join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
        return `<div class="section"><h2 class="sectionTitle">Professional Experience</h2>${rows}</div>`;
    };

    const renderProjects = () => {
        const items = (Array.isArray(projects) ? projects : []).filter(Boolean);
        if (!items.length) return '';
        const rows = items.map(proj => `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${proj.title || ''}</div>
                    <div class="dateLocation">${formatDate(proj.date)}</div>
                </div>
                <div class="rowBetween">
                    <div class="secondaryText">${proj.description || ''}</div>
                    <div class="projectLinks">
                        ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" class="link">GitHub</a>` : ''}
                        ${proj.liveUrl  ? `<a href="${proj.liveUrl}"   target="_blank" class="link">Live Demo</a>` : ''}
                    </div>
                </div>
                ${Array.isArray(proj.highlights) && proj.highlights.length ? `
                    <ul class="bulletList">
                        ${proj.highlights.map(hl => hl ? `<li class="bulletItem"><span class="bulletPoint">•</span><div class="bulletContent">${hl}</div></li>` : '').join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
        return `<div class="section"><h2 class="sectionTitle">Key Projects</h2>${rows}</div>`;
    };

    const renderEducation = () => {
        const items = (Array.isArray(education) ? education : []).filter(Boolean);
        if (!items.length) return '';
        const rows = items.map(edu => {
            // Build degree display string — field of study and score are separate fields
            const degreeDisplay = [edu.degree, edu.fieldOfStudy && `in ${edu.fieldOfStudy}`, edu.score && `• ${edu.score}`]
                .filter(Boolean).join(' ');

            return `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${edu.institution || ''}</div>
                    <div class="dateLocation">${formatDate(edu.startDate)}${edu.startDate || edu.endDate ? ' – ' : ''}${formatDate(edu.endDate)}</div>
                </div>
                <div class="rowBetween">
                    <div class="secondaryText">${degreeDisplay}</div>
                    ${edu.location ? `<div class="dateLocation">${edu.location}</div>` : ''}
                </div>
            </div>`;
        }).join('');
        return `<div class="section"><h2 class="sectionTitle">Education</h2>${rows}</div>`;
    };

    const renderSkills = () => {
        const items = (Array.isArray(skills) ? skills : []).filter(Boolean);
        if (!items.length) return '';
        const rows = items.map(group => `
            <div class="skillItem">
                <span class="skillCategory">${group.category || 'Skills'}:</span>
                <span class="skillContent">${Array.isArray(group.items) ? group.items.join(', ') : group.items || ''}</span>
            </div>
        `).join('');
        return `<div class="section"><h2 class="sectionTitle">Skills</h2>${rows}</div>`;
    };

    const renderCertifications = () => {
        const items = (Array.isArray(certifications) ? certifications : []).filter(Boolean);
        if (!items.length) return '';
        const rows = items.map(cert => `
            <div class="blockItem">
                <div class="rowBetween">
                    <div class="primaryText">${cert.name || ''}</div>
                    <div class="dateLocation">${formatDate(cert.date)}</div>
                </div>
                <div class="rowBetween">
                    <div class="secondaryText">${cert.issuer || ''}</div>
                    ${cert.url ? `<div><a href="${cert.url}" target="_blank" class="link">${cert.platform || 'Credential'}</a></div>` : ''}
                </div>
            </div>
        `).join('');
        return `<div class="section"><h2 class="sectionTitle">Certifications</h2>${rows}</div>`;
    };

    const renderCustomSections = () => {
        const sections = (Array.isArray(additionalSections) ? additionalSections : []).filter(Boolean);
        if (!sections.length) return '';
        return sections.map(sec => {
            const items = (Array.isArray(sec.items) ? sec.items : []).filter(Boolean);
            if (!items.length) return '';
            const rows = items.map(item => {
                // Use canonical 'heading' field — never 'title'
                const headingText = (typeof item === 'string') ? item : (item.heading || item.title || '');
                const descText    = (typeof item === 'string') ? '' : (item.description || '');
                const subText     = (typeof item === 'string') ? '' : (item.subheading || '');
                const dateText    = (typeof item === 'string') ? '' : formatDate(item.date);

                if (!headingText && !descText) return '';
                return `
                    <div class="blockItem">
                        <div class="rowBetween">
                            <div class="primaryText">${headingText}</div>
                            ${dateText ? `<div class="dateLocation">${dateText}</div>` : ''}
                        </div>
                        ${subText  ? `<div class="secondaryText">${subText}</div>` : ''}
                        ${descText ? `<div class="paragraph">${descText}</div>` : ''}
                    </div>`;
            }).join('');
            return rows ? `<div class="section"><h2 class="sectionTitle">${sec.sectionTitle || 'Custom Section'}</h2>${rows}</div>` : '';
        }).join('');
    };

    // ─── Section Order Resolution ─────────────────────────────────────────────
    // Priority 1: user-defined sectionOrder from metadata (respects A4 canvas order)
    // Priority 2: persona-based defaults
    const sectionMap = {
        summary:            renderSummary,
        experience:         renderExperience,
        projects:           renderProjects,
        education:          renderEducation,
        skills:             renderSkills,
        certifications:     renderCertifications,
        additionalSections: renderCustomSections
    };

    let sectionOrder = [];

    if (Array.isArray(metadata.sectionOrder) && metadata.sectionOrder.length > 0) {
        // User-defined order — respect exactly, then append any unlisted sections at the end
        const listedKeys = new Set(metadata.sectionOrder);
        sectionOrder = [
            ...metadata.sectionOrder.filter(k => sectionMap[k]),
            ...Object.keys(sectionMap).filter(k => !listedKeys.has(k))
        ];
    } else if (persona === 'fresher') {
        sectionOrder = ['summary', 'education', 'projects', 'skills', 'experience', 'certifications', 'additionalSections'];
    } else if (persona === 'career-changer') {
        sectionOrder = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'additionalSections'];
    } else {
        sectionOrder = ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'additionalSections'];
    }

    const bodySections = sectionOrder.map(key => (sectionMap[key] ? sectionMap[key]() : '')).join('');

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
        .contactSeparator { color: #9ca3af; }
        .link { color: #2563eb; text-decoration: underline; }
        .section { margin-bottom: 4pt; }
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
        .blockItem { margin-bottom: 6pt; }
        .rowBetween {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            width: 100%;
            gap: 12px;
        }
        .primaryText { font-weight: 700; font-size: 10.5pt; color: #111827; flex: 1; }
        .secondaryText { font-style: italic; font-size: 10pt; color: #374151; flex: 1; }
        .dateLocation { font-weight: 600; font-size: 9.5pt; color: #4b5563; white-space: nowrap; text-align: right; margin-left: auto; }
        .paragraph { font-size: 9.5pt; line-height: 1.4; color: #374151; margin-top: 2pt; }
        .bulletList { list-style: none; padding-left: 0; margin-top: 2pt; }
        .bulletItem { display: flex; align-items: flex-start; gap: 6pt; margin-bottom: 3pt; padding-left: 8pt; }
        .bulletPoint { color: #111827; font-size: 10pt; }
        .bulletContent { flex: 1; font-size: 9.5pt; line-height: 1.4; color: #1f2937; }
        .skillItem { display: flex; align-items: flex-start; gap: 6pt; margin-bottom: 4pt; font-size: 9.5pt; }
        .skillCategory { font-weight: 700; color: #111827; white-space: nowrap; }
        .skillContent { color: #374151; }
        .projectLinks { display: flex; gap: 8pt; font-size: 9pt; white-space: nowrap; }
    </style>
</head>
<body>
    <header class="header">
        <h1 class="name">${personalInfo.fullName || 'YOUR FULL NAME'}</h1>
        <div class="contactInfo">
            ${contactParts.join(' <span class="contactSeparator">|</span> ')}
        </div>
    </header>

    ${bodySections}
</body>
</html>`;
};
