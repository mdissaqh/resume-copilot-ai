import React from 'react';
import { SmartEditable, SmartLinkEditable } from '../../SmartEditable/SmartEditable';
import { SectionWrapper } from '../SectionWrapper';
import { useResumeStore } from '../../../../../store/useResumeStore';
import { Trash2, Plus, Calendar, Link as LinkIcon } from 'lucide-react';
import { generateId } from '../../../../../utils/idGenerator';
import styles from './EvergreenResumeRenderer.module.css';

const getDensityClass = (data) => {
    if (!data) return styles.densityNormal;

    let charCount = 0;
    if (data.professionalSummary) charCount += data.professionalSummary.length;
    
    const expList = Array.isArray(data.experience) ? data.experience : [];
    expList.forEach(exp => {
        charCount += (exp.role?.length || 0) + (exp.organization?.length || 0) + (exp.description?.length || 0);
        const achievements = Array.isArray(exp.achievements) ? exp.achievements : [];
        achievements.forEach(a => charCount += (a?.length || 0));
    });

    const projList = Array.isArray(data.projects) ? data.projects : [];
    projList.forEach(p => {
        charCount += (p.title?.length || 0) + (p.description?.length || 0);
        const highlights = Array.isArray(p.highlights) ? p.highlights : [];
        highlights.forEach(h => charCount += (h?.length || 0));
    });

    if (charCount > 3500) return styles.densityCompact;
    if (charCount < 1200) return styles.densityRelaxed;
    return styles.densityNormal;
};

export const generateEvergreenBlocks = (data) => {
    if (!data) return [];

    const {
        addArrayItem,
        removeArrayItem,
        updateField,
        getSectionOrder,
        moveSectionUp,
        moveSectionDown,
        deleteSection
    } = useResumeStore.getState();

    const {
        personalInfo,
        professionalSummary,
        experience,
        projects,
        education,
        skills,
        certifications,
        additionalSections
    } = data;

    const densityClass = getDensityClass(data);
    const blocks = [];
    const sectionOrder = getSectionOrder();

    // --- HEADER BLOCK ---
    const contactItems = [];
    contactItems.push(
        <div key="email" className={styles.contactItem}>
            <SmartEditable inline path={['personalInfo', 'email']} text={personalInfo?.email} placeholder="email@example.com" />
        </div>
    );
    contactItems.push(
        <div key="phone" className={styles.contactItem}>
            <SmartEditable inline path={['personalInfo', 'phone']} text={personalInfo?.phone} placeholder="+1 234 567 8900" />
        </div>
    );
    contactItems.push(
        <div key="location" className={styles.contactItem}>
            <SmartEditable inline path={['personalInfo', 'location']} text={personalInfo?.location} placeholder="City, Country" />
        </div>
    );

    const rawLinks = Array.isArray(personalInfo?.links) ? personalInfo.links : (typeof personalInfo?.links === 'string' && personalInfo.links ? [{ platform: 'Link', url: personalInfo.links }] : []);
    const linksList = [...rawLinks];

    if (personalInfo?.linkedin && typeof personalInfo.linkedin === 'string' && !linksList.some(l => (typeof l === 'object' ? l.url : l) === personalInfo.linkedin)) {
        linksList.push({ platform: 'LinkedIn', url: personalInfo.linkedin });
    }
    if (personalInfo?.github && typeof personalInfo.github === 'string' && !linksList.some(l => (typeof l === 'object' ? l.url : l) === personalInfo.github)) {
        linksList.push({ platform: 'GitHub', url: personalInfo.github });
    }

    if (linksList.length > 0) {
        linksList.forEach((link, idx) => {
            const linkObj = typeof link === 'string' ? { platform: 'Link', url: link } : link;
            const labelText = linkObj?.platform || 'Link';
            const urlText = linkObj?.url || (typeof link === 'string' ? link : '');

            contactItems.push(
                <div key={`link-${idx}`} className={styles.contactItem}>
                    <SmartLinkEditable
                        title="Edit Contact Link"
                        labelPath={['personalInfo', 'links', idx, 'platform']}
                        urlPath={['personalInfo', 'links', idx, 'url']}
                        label={labelText}
                        url={urlText}
                        defaultLabel="Link"
                        className={styles.link}
                    />
                    <button className={styles.iconBtnDanger} style={{ marginLeft: 4 }} onClick={() => removeArrayItem(['personalInfo', 'links'], idx)} title="Remove link">
                        <Trash2 size={10} />
                    </button>
                </div>
            );
        });
    }

    contactItems.push(
        <div key="add-link-btn" className={styles.contactItem}>
            <button
                className={styles.addBtn}
                style={{ fontSize: '7.5pt' }}
                onClick={() => addArrayItem(['personalInfo', 'links'], { platform: 'LinkedIn', url: '' })}
            >
                <Plus size={10} /> Link
            </button>
        </div>
    );

    blocks.push({
        id: 'header',
        type: 'header',
        content: (
            <header className={`${styles.header} ${densityClass}`} data-node-id="personalInfo">
                <h1 className={styles.name}>
                    <SmartEditable path={['personalInfo', 'fullName']} text={personalInfo?.fullName} placeholder="YOUR FULL NAME" />
                </h1>
                <div className={styles.contactInfo}>
                    {contactItems}
                </div>
            </header>
        )
    });

    // --- SUMMARY SECTION ---
    const renderSummaryBlocks = () => {
        const hasSummary = professionalSummary !== undefined && professionalSummary !== null;
        if (!hasSummary && professionalSummary === '') return [];

        return [{
            id: 'section-summary',
            type: 'content',
            content: (
                <SectionWrapper
                    sectionKey="summary"
                    title="Professional Summary"
                    onMoveUp={() => moveSectionUp('summary')}
                    onMoveDown={() => moveSectionDown('summary')}
                    onDelete={() => deleteSection('summary')}
                >
                    <h2 className={styles.sectionTitle}>Professional Summary</h2>
                    <div className={`${styles.paragraph} ${densityClass}`} data-node-id="professionalSummary">
                        <SmartEditable type="multiline" path={['professionalSummary']} text={professionalSummary} placeholder="Add a compelling professional summary highlighting your key strengths..." />
                    </div>
                </SectionWrapper>
            )
        }];
    };

    // --- EXPERIENCE SECTION ---
    const renderExperienceBlocks = () => {
        const rawExpList = Array.isArray(experience) ? experience : [];
        const isExpEmpty = (exp) => {
            if (!exp) return true;
            const r = (exp.role || '').trim();
            const o = (exp.organization || '').trim();
            const achs = (Array.isArray(exp.achievements) ? exp.achievements : []).filter(a => a && String(a).trim());
            return (!r || r === 'Job Title') && (!o || o === 'Company Name') && achs.length === 0;
        };
        const expList = rawExpList.filter(exp => !isExpEmpty(exp));
        const hasItems = expList.length > 0;
        const res = [];

        res.push({
            id: 'title-experience',
            type: 'section-title',
            content: (
                <SectionWrapper
                    sectionKey="experience"
                    title="Experience"
                    onMoveUp={() => moveSectionUp('experience')}
                    onMoveDown={() => moveSectionDown('experience')}
                    onDelete={() => deleteSection('experience')}
                    isEmpty={!hasItems}
                >
                    <h2 className={styles.sectionTitle}>Professional Experience</h2>
                    {!hasItems && (
                        <div className={styles.emptyPlaceholder} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                            <Plus size={14} /> Add Experience
                        </div>
                    )}
                </SectionWrapper>
            )
        });

        if (hasItems) {
            expList.forEach((exp, idx) => {
                const expId = exp._id || `exp-${idx}`;
                const achievementsList = Array.isArray(exp.achievements) ? exp.achievements : [];

                res.push({
                    id: `exp-${expId}`,
                    type: 'block-item',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={expId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['experience'], idx)} title="Delete role"><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.leftCol}>
                                    <div className={styles.primaryText}>
                                        <SmartEditable path={['experience', idx, 'role']} text={exp.role} placeholder="Job Title" />
                                    </div>
                                    <div className={styles.secondaryText}>
                                        <SmartEditable path={['experience', idx, 'organization']} text={exp.organization} placeholder="Company Name" />
                                    </div>
                                </div>
                                <div className={styles.rightCol}>
                                    <div className={styles.dateLocation}>
                                        <SmartEditable inline path={['experience', idx, 'startDate']} text={exp.startDate} placeholder="2020 – Present" />
                                    </div>
                                    {exp.location && (
                                        <div className={styles.dateLocation}>
                                            <SmartEditable inline path={['experience', idx, 'location']} text={exp.location} placeholder="Location" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {exp.description && (
                                <div className={styles.paragraph}>
                                    <SmartEditable type="multiline" path={['experience', idx, 'description']} text={exp.description} placeholder="Overview..." />
                                </div>
                            )}
                            {achievementsList.map((ach, jdx) => (
                                <div key={`exp-ach-${jdx}`} className={`${styles.bulletItem} ${densityClass}`} data-node-id={`${expId}-bullet-${jdx}`}>
                                    <span className={styles.bulletPoint}>•</span>
                                    <div className={styles.bulletContent}>
                                        <SmartEditable
                                            type="multiline"
                                            path={['experience', idx, 'achievements', jdx]}
                                            text={ach}
                                            placeholder="Add bullet point achievement (Backspace when empty to remove)..."
                                            onBackspaceEmpty={() => removeArrayItem(['experience', idx, 'achievements'], jdx)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button className={styles.addBtn} onClick={() => addArrayItem(['experience'], idx, 'achievements', '')}>
                                <Plus size={12} /> Add Achievement Bullet
                            </button>
                        </div>
                    )
                });
            });

            res.push({
                id: 'add-exp-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginTop: 4, marginBottom: 8 }} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                        <Plus size={12} /> Add Experience Item
                    </button>
                )
            });
        }

        return res;
    };

    // --- PROJECTS SECTION ---
    const renderProjectsBlocks = () => {
        const projList = Array.isArray(projects) ? projects : [];
        const hasItems = projList.length > 0;
        const res = [];

        res.push({
            id: 'title-projects',
            type: 'section-title',
            content: (
                <SectionWrapper
                    sectionKey="projects"
                    title="Projects"
                    onMoveUp={() => moveSectionUp('projects')}
                    onMoveDown={() => moveSectionDown('projects')}
                    onDelete={() => deleteSection('projects')}
                    isEmpty={!hasItems}
                >
                    <h2 className={styles.sectionTitle}>Key Projects</h2>
                    {!hasItems && (
                        <div className={styles.emptyPlaceholder} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                            <Plus size={14} /> Add Project
                        </div>
                    )}
                </SectionWrapper>
            )
        });

        if (hasItems) {
            projList.forEach((proj, idx) => {
                const projId = proj._id || `proj-${idx}`;
                const highlightsList = Array.isArray(proj.highlights) ? proj.highlights : [];

                res.push({
                    id: `proj-${projId}`,
                    type: 'block-item',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={projId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['projects'], idx)} title="Delete project"><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.leftCol}>
                                    <div className={styles.primaryText}>
                                        <SmartEditable path={['projects', idx, 'title']} text={proj.title} placeholder="Project Name" />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {proj.githubUrl ? (
                                            <SmartLinkEditable
                                                title="Edit GitHub Link"
                                                labelPath={['projects', idx, 'githubPlatform']}
                                                urlPath={['projects', idx, 'githubUrl']}
                                                label="GitHub"
                                                url={proj.githubUrl}
                                                defaultLabel="GitHub"
                                                className={styles.link}
                                            />
                                        ) : (
                                            <button className={styles.addBtn} style={{ fontSize: '7.5pt' }} onClick={() => updateField(['projects', idx, 'githubUrl'], 'https://github.com')}>
                                                <LinkIcon size={10} /> + GitHub
                                            </button>
                                        )}
                                        {proj.liveUrl ? (
                                            <SmartLinkEditable
                                                title="Edit Live Demo Link"
                                                labelPath={['projects', idx, 'livePlatform']}
                                                urlPath={['projects', idx, 'liveUrl']}
                                                label="Live Demo"
                                                url={proj.liveUrl}
                                                defaultLabel="Live Demo"
                                                className={styles.link}
                                            />
                                        ) : (
                                            <button className={styles.addBtn} style={{ fontSize: '7.5pt' }} onClick={() => updateField(['projects', idx, 'liveUrl'], 'https://demo.com')}>
                                                <LinkIcon size={10} /> + Live Demo
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.rightCol}>
                                    <div className={styles.dateLocation}>
                                        <SmartEditable inline path={['projects', idx, 'date']} text={proj.date} placeholder="2023" />
                                    </div>
                                </div>
                            </div>
                            {proj.description && (
                                <div className={styles.paragraph}>
                                    <SmartEditable type="multiline" path={['projects', idx, 'description']} text={proj.description} placeholder="Overview..." />
                                </div>
                            )}
                            {highlightsList.map((hl, jdx) => (
                                <div key={`proj-hl-${jdx}`} className={`${styles.bulletItem} ${densityClass}`} data-node-id={`${projId}-hl-${jdx}`}>
                                    <span className={styles.bulletPoint}>•</span>
                                    <div className={styles.bulletContent}>
                                        <SmartEditable
                                            type="multiline"
                                            path={['projects', idx, 'highlights', jdx]}
                                            text={hl}
                                            placeholder="Add key technical accomplishment (Backspace when empty to remove)..."
                                            onBackspaceEmpty={() => removeArrayItem(['projects', idx, 'highlights'], jdx)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button className={styles.addBtn} onClick={() => addArrayItem(['projects'], idx, 'highlights', '')}>
                                <Plus size={12} /> Add Highlight
                            </button>
                        </div>
                    )
                });
            });

            res.push({
                id: 'add-project-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginTop: 4, marginBottom: 8 }} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                        <Plus size={12} /> Add Project
                    </button>
                )
            });
        }

        return res;
    };

    // --- EDUCATION SECTION ---
    const renderEducationBlocks = () => {
        const eduList = Array.isArray(education) ? education : [];
        const hasItems = eduList.length > 0;
        const res = [];

        res.push({
            id: 'title-education',
            type: 'section-title',
            content: (
                <SectionWrapper
                    sectionKey="education"
                    title="Education"
                    onMoveUp={() => moveSectionUp('education')}
                    onMoveDown={() => moveSectionDown('education')}
                    onDelete={() => deleteSection('education')}
                    isEmpty={!hasItems}
                >
                    <h2 className={styles.sectionTitle}>Education</h2>
                    {!hasItems && (
                        <div className={styles.emptyPlaceholder} onClick={() => addArrayItem(['education'], { _id: generateId(), institution: '', degree: '' })}>
                            <Plus size={14} /> Add Education
                        </div>
                    )}
                </SectionWrapper>
            )
        });

        if (hasItems) {
            eduList.forEach((edu, idx) => {
                const eduId = edu._id || `edu-${idx}`;
                
                let degreeValue = edu.degree || '';
                const fieldOfStudy = edu.fieldOfStudy || '';
                const scoreVal = edu.score || edu.cgpa || edu.gpa || '';
                
                if (fieldOfStudy && !degreeValue.toLowerCase().includes(fieldOfStudy.toLowerCase())) {
                    degreeValue = degreeValue ? `${degreeValue} in ${fieldOfStudy}` : fieldOfStudy;
                }
                if (scoreVal && !degreeValue.toLowerCase().includes(scoreVal.toLowerCase())) {
                    degreeValue = degreeValue ? `${degreeValue} • ${scoreVal}` : scoreVal;
                }

                res.push({
                    id: `edu-${eduId}`,
                    type: 'block-item',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={eduId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['education'], idx)} title="Delete item"><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.leftCol} style={{ flex: '0 1 75%' }}>
                                    <div className={styles.primaryText}>
                                        <SmartEditable path={['education', idx, 'institution']} text={edu.institution} placeholder="University / Institution" />
                                    </div>
                                    <div className={styles.secondaryText}>
                                        <SmartEditable path={['education', idx, 'degree']} text={degreeValue} placeholder="Degree, Field of Study & Score" />
                                    </div>
                                </div>
                                <div className={styles.rightCol}>
                                    <div className={styles.dateLocation}>
                                        <SmartEditable inline path={['education', idx, 'startDate']} text={edu.startDate} placeholder="2020 – 2024" />
                                    </div>
                                    {edu.location && (
                                        <div className={styles.dateLocation}>
                                            <SmartEditable inline path={['education', idx, 'location']} text={edu.location} placeholder="Location" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                });
            });

            res.push({
                id: 'add-education-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginTop: 4, marginBottom: 8 }} onClick={() => addArrayItem(['education'], { _id: generateId(), institution: '', degree: '' })}>
                        <Plus size={12} /> Add Education Item
                    </button>
                )
            });
        }

        return res;
    };

    // --- SKILLS SECTION ---
    const renderSkillsBlocks = () => {
        const skillList = Array.isArray(skills) ? skills : [];
        const hasItems = skillList.length > 0;
        const res = [];

        res.push({
            id: 'title-skills',
            type: 'section-title',
            content: (
                <SectionWrapper
                    sectionKey="skills"
                    title="Skills"
                    onMoveUp={() => moveSectionUp('skills')}
                    onMoveDown={() => moveSectionDown('skills')}
                    onDelete={() => deleteSection('skills')}
                    isEmpty={!hasItems}
                >
                    <h2 className={styles.sectionTitle}>Skills</h2>
                    {!hasItems && (
                        <div className={styles.emptyPlaceholder} onClick={() => addArrayItem(['skills'], { _id: generateId(), category: 'Core Skills', items: [] })}>
                            <Plus size={14} /> Add Skills Category
                        </div>
                    )}
                </SectionWrapper>
            )
        });

        if (hasItems) {
            skillList.forEach((skillGroup, idx) => {
                const skillId = skillGroup._id || `skill-${idx}`;
                const skillItemsText = Array.isArray(skillGroup.items) ? skillGroup.items.join(', ') : (skillGroup.items || '');
                res.push({
                    id: `skill-${skillId}`,
                    type: 'block-item',
                    content: (
                        <div className={`${styles.skillItem} ${densityClass}`} data-node-id={skillId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['skills'], idx)} title="Delete category"><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.skillCategory} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', fontWeight: 700, marginRight: 6 }}>
                                <SmartEditable inline path={['skills', idx, 'category']} text={skillGroup.category} placeholder="Category" />
                                <span style={{ fontWeight: 700, marginLeft: 2 }}>:</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <SmartEditable
                                    type="multiline"
                                    path={['skills', idx, 'items']}
                                    text={skillItemsText}
                                    placeholder="JavaScript, React, Node.js..."
                                />
                            </div>
                        </div>
                    )
                });
            });

            res.push({
                id: 'add-skill-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginTop: 4, marginBottom: 8 }} onClick={() => addArrayItem(['skills'], { _id: generateId(), category: 'New Category', items: [] })}>
                        <Plus size={12} /> Add Skill Category
                    </button>
                )
            });
        }

        return res;
    };

    // --- CERTIFICATIONS SECTION ---
    const renderCertificationsBlocks = () => {
        const certList = Array.isArray(certifications) ? certifications : [];
        const hasItems = certList.length > 0;
        const res = [];

        res.push({
            id: 'title-certifications',
            type: 'section-title',
            content: (
                <SectionWrapper
                    sectionKey="certifications"
                    title="Certifications"
                    onMoveUp={() => moveSectionUp('certifications')}
                    onMoveDown={() => moveSectionDown('certifications')}
                    onDelete={() => deleteSection('certifications')}
                    isEmpty={!hasItems}
                >
                    <h2 className={styles.sectionTitle}>Certifications</h2>
                    {!hasItems && (
                        <div className={styles.emptyPlaceholder} onClick={() => addArrayItem(['certifications'], { _id: generateId(), name: '', issuer: '' })}>
                            <Plus size={14} /> Add Certification
                        </div>
                    )}
                </SectionWrapper>
            )
        });

        if (hasItems) {
            certList.forEach((cert, idx) => {
                const certId = cert._id || `cert-${idx}`;
                res.push({
                    id: `cert-${certId}`,
                    type: 'block-item',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={certId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['certifications'], idx)} title="Delete item"><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.leftCol}>
                                    <div className={styles.primaryText}>
                                        <SmartEditable path={['certifications', idx, 'name']} text={cert.name} placeholder="Certification Title" />
                                    </div>
                                    <div className={styles.secondaryText}>
                                        <SmartEditable path={['certifications', idx, 'issuer']} text={cert.issuer} placeholder="Issuing Body" />
                                    </div>
                                </div>
                                <div className={styles.rightCol}>
                                    <div className={styles.dateLocation}>
                                        <SmartEditable inline path={['certifications', idx, 'date']} text={cert.date} placeholder="Date" />
                                    </div>
                                    {cert.url ? (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                                            <SmartLinkEditable
                                                title="Edit Certificate Link"
                                                labelPath={['certifications', idx, 'platform']}
                                                urlPath={['certifications', idx, 'url']}
                                                label={cert.platform}
                                                url={cert.url}
                                                defaultLabel="Link"
                                                className={styles.link}
                                            />
                                            <button className={styles.iconBtnDanger} style={{ padding: 1 }} onClick={() => updateField(['certifications', idx, 'url'], '')} title="Delete credential link">
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button className={styles.addBtn} style={{ fontSize: '7.5pt', marginTop: 2 }} onClick={() => updateField(['certifications', idx, 'url'], 'https://credential.com')}>
                                            <LinkIcon size={10} /> + Add Link
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                });
            });

            res.push({
                id: 'add-certification-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginTop: 4, marginBottom: 8 }} onClick={() => addArrayItem(['certifications'], { _id: generateId(), name: '', issuer: '' })}>
                        <Plus size={12} /> Add Certification
                    </button>
                )
            });
        }

        return res;
    };

    // --- CUSTOM ADDITIONAL SECTIONS ---
    const renderCustomSectionsBlocks = () => {
        const addList = Array.isArray(additionalSections) ? additionalSections : [];
        if (addList.length === 0) return [];
        const res = [];

        addList.forEach((sec, idx) => {
            const secId = sec._id || `custom-${idx}`;
            const itemList = Array.isArray(sec.items) ? sec.items : [];
            res.push({
                id: `custom-${secId}`,
                type: 'block-item',
                content: (
                    <div className={styles.blockItem} style={{ marginBottom: 12 }}>
                        <SectionWrapper
                            sectionKey="additionalSections"
                            title={sec.sectionTitle || 'Custom Section'}
                            onMoveUp={() => moveSectionUp('additionalSections')}
                            onMoveDown={() => moveSectionDown('additionalSections')}
                            onDelete={() => removeArrayItem(['additionalSections'], idx)}
                        >
                            <h2 className={styles.sectionTitle}>
                                <SmartEditable path={['additionalSections', idx, 'sectionTitle']} text={sec.sectionTitle} placeholder="Custom Section Title" />
                            </h2>
                        </SectionWrapper>
                        {itemList.map((item, jdx) => {
                            const itemId = (typeof item === 'object' && item?._id) ? item._id : `custom-item-${jdx}`;
                            const bulletText = typeof item === 'string' ? item : (item?.description || item?.title || item?.heading || '');
                            const itemPath = typeof item === 'string' 
                                ? ['additionalSections', idx, 'items', jdx] 
                                : ['additionalSections', idx, 'items', jdx, (item && item.description !== undefined) ? 'description' : 'title'];

                            return (
                                <div key={`custom-item-${itemId}`} className={`${styles.bulletItem} ${densityClass}`} data-node-id={itemId}>
                                    <span className={styles.bulletPoint}>•</span>
                                    <div className={styles.bulletContent}>
                                        <SmartEditable
                                            type="multiline"
                                            path={itemPath}
                                            text={bulletText}
                                            placeholder="Add bullet point text (Backspace when empty to remove)..."
                                            onBackspaceEmpty={() => removeArrayItem(['additionalSections', idx, 'items'], jdx)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <button className={styles.addBtn} style={{ marginTop: 4 }} onClick={() => addArrayItem(['additionalSections', idx, 'items'], '')}>
                            <Plus size={12} /> Add Point
                        </button>
                    </div>
                )
            });
        });

        return res;
    };

    // DYNAMIC MAP
    const sectionMap = {
        summary: renderSummaryBlocks,
        experience: renderExperienceBlocks,
        projects: renderProjectsBlocks,
        education: renderEducationBlocks,
        skills: renderSkillsBlocks,
        certifications: renderCertificationsBlocks,
        additionalSections: renderCustomSectionsBlocks
    };

    // MAP OVER SECTION ORDER
    sectionOrder.forEach(key => {
        if (sectionMap[key]) {
            blocks.push(...sectionMap[key]());
        }
    });

    return blocks;
};
