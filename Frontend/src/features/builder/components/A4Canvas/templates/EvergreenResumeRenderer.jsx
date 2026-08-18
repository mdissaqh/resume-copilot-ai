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
    data.experience?.forEach(exp => {
        charCount += (exp.role?.length || 0) + (exp.organization?.length || 0) + (exp.description?.length || 0);
        exp.achievements?.forEach(a => charCount += (a?.length || 0));
    });
    data.projects?.forEach(p => {
        charCount += (p.title?.length || 0) + (p.description?.length || 0);
        p.highlights?.forEach(h => charCount += (h?.length || 0));
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

    if (Array.isArray(personalInfo?.links) && personalInfo.links.length > 0) {
        personalInfo.links.forEach((link, idx) => {
            contactItems.push(
                <div key={`link-${idx}`} className={styles.contactItem}>
                    <SmartLinkEditable
                        title="Edit Contact Link"
                        labelPath={['personalInfo', 'links', idx, 'platform']}
                        urlPath={['personalInfo', 'links', idx, 'url']}
                        label={link?.platform}
                        url={link?.url}
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
        const hasItems = experience && experience.length > 0;
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
            experience.forEach((exp, idx) => {
                const expId = exp._id || `exp-${idx}`;

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
                                    <SmartEditable type="multiline" path={['experience', idx, 'description']} text={exp.description} placeholder="Role overview..." />
                                </div>
                            )}
                            {exp.achievements?.map((ach, jdx) => (
                                <div key={`exp-bullet-${jdx}`} className={`${styles.bulletItem} ${densityClass}`} data-node-id={`${expId}-bullet-${jdx}`}>
                                    <span className={styles.bulletPoint}>•</span>
                                    <div className={styles.bulletContent}>
                                        <SmartEditable
                                            type="multiline"
                                            path={['experience', idx, 'achievements', jdx]}
                                            text={ach}
                                            placeholder="Describe a measurable impact (Backspace when empty to remove)..."
                                            onBackspaceEmpty={() => removeArrayItem(['experience', idx, 'achievements'], jdx)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button className={styles.addBtn} onClick={() => addArrayItem(['experience', idx, 'achievements'], '')}>
                                <Plus size={12} /> Add Bullet
                            </button>
                        </div>
                    )
                });
            });

            res.push({
                id: 'add-experience-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginTop: 4, marginBottom: 8 }} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                        <Plus size={12} /> Add Role
                    </button>
                )
            });
        }

        return res;
    };

    // --- PROJECTS SECTION ---
    const renderProjectsBlocks = () => {
        const hasItems = projects && projects.length > 0;
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
                    <h2 className={styles.sectionTitle}>Projects</h2>
                    {!hasItems && (
                        <div className={styles.emptyPlaceholder} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                            <Plus size={14} /> Add Project
                        </div>
                    )}
                </SectionWrapper>
            )
        });

        if (hasItems) {
            projects.forEach((proj, idx) => {
                const projId = proj._id || `proj-${idx}`;

                res.push({
                    id: `proj-${projId}`,
                    type: 'block-item',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={projId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['projects'], idx)} title="Delete project"><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.leftCol} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: '1 1 auto', maxWidth: '75%' }}>
                                    <div className={styles.primaryText} style={{ display: 'inline-flex', alignItems: 'center', maxWidth: '60%', width: 'auto' }}>
                                        <SmartEditable inline path={['projects', idx, 'title']} text={proj.title} placeholder="Project Title" />
                                    </div>
                                    <div className={styles.projectLinks} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        {proj.liveUrl ? (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                                <SmartLinkEditable
                                                    title="Edit Live Demo Link"
                                                    labelPath={['projects', idx, 'liveLabel']}
                                                    urlPath={['projects', idx, 'liveUrl']}
                                                    label={proj.liveLabel}
                                                    url={proj.liveUrl}
                                                    defaultLabel="Live Demo"
                                                    className={styles.link}
                                                />
                                                <button className={styles.iconBtnDanger} style={{ padding: 1 }} onClick={() => updateField(['projects', idx, 'liveUrl'], '')} title="Delete Live Demo link">
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className={styles.addBtn} style={{ fontSize: '7.5pt' }} onClick={() => updateField(['projects', idx, 'liveUrl'], 'https://demo.com')}>
                                                <LinkIcon size={10} /> + Live Demo
                                            </button>
                                        )}

                                        {proj.githubUrl ? (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                                <SmartLinkEditable
                                                    title="Edit GitHub Link"
                                                    labelPath={['projects', idx, 'githubLabel']}
                                                    urlPath={['projects', idx, 'githubUrl']}
                                                    label={proj.githubLabel}
                                                    url={proj.githubUrl}
                                                    defaultLabel="GitHub"
                                                    className={styles.link}
                                                />
                                                <button className={styles.iconBtnDanger} style={{ padding: 1 }} onClick={() => updateField(['projects', idx, 'githubUrl'], '')} title="Delete GitHub link">
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className={styles.addBtn} style={{ fontSize: '7.5pt' }} onClick={() => updateField(['projects', idx, 'githubUrl'], 'https://github.com')}>
                                                <LinkIcon size={10} /> + GitHub
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.rightCol}>
                                    {proj.date ? (
                                        <div className={styles.dateLocation}>
                                            <SmartEditable inline path={['projects', idx, 'date']} text={proj.date} placeholder="Date" />
                                        </div>
                                    ) : (
                                        <button className={styles.addBtn} style={{ fontSize: '7.5pt' }} onClick={() => updateField(['projects', idx, 'date'], '2024')}>
                                            <Calendar size={10} /> + Add Date
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className={styles.secondaryText} style={{ marginTop: 2, width: '100%' }}>
                                <SmartEditable type="multiline" path={['projects', idx, 'description']} text={proj.description} placeholder="Brief project description..." />
                            </div>
                            {proj.highlights?.map((hl, jdx) => (
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
        const hasItems = education && education.length > 0;
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
            education.forEach((edu, idx) => {
                const eduId = edu._id || `edu-${idx}`;
                const degreeValue = edu.degree || '';

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
                                        <SmartEditable path={['education', idx, 'degree']} text={degreeValue} placeholder="Degree, Field of Study & Score (e.g. B.E in CSE • 8.5 CGPA)" />
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
        const hasItems = skills && skills.length > 0;
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
            skills.forEach((skillGroup, idx) => {
                const skillId = skillGroup._id || `skill-${idx}`;
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
                                    text={Array.isArray(skillGroup.items) ? skillGroup.items.join(', ') : skillGroup.items}
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
        const hasItems = certifications && certifications.length > 0;
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
            certifications.forEach((cert, idx) => {
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

    // --- CUSTOM ADDITIONAL SECTIONS (SINGLE EDITABLE TITLE HEADER) ---
    const renderCustomSectionsBlocks = () => {
        const hasItems = additionalSections && additionalSections.length > 0;
        if (!hasItems) return [];
        const res = [];

        additionalSections.forEach((sec, idx) => {
            const secId = sec._id || `custom-${idx}`;
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

                        {sec.items?.map((item, jdx) => {
                            const itemId = item._id || `custom-item-${jdx}`;
                            const bulletText = typeof item === 'string' ? item : (item.description || item.heading || '');
                            return (
                                <div key={`custom-item-${itemId}`} className={`${styles.bulletItem} ${densityClass}`} data-node-id={itemId}>
                                    <span className={styles.bulletPoint}>•</span>
                                    <div className={styles.bulletContent}>
                                        <SmartEditable
                                            type="multiline"
                                            path={['additionalSections', idx, 'items', jdx]}
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
