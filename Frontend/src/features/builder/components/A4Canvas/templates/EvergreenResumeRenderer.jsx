import React from 'react';
import { SmartEditable, SmartLinkEditable } from '../../SmartEditable/SmartEditable';
import { useResumeStore } from '../../../../../store/useResumeStore';
import { Trash2, Plus } from 'lucide-react';
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

    const { addArrayItem, removeArrayItem } = useResumeStore.getState();
    const {
        personalInfo, professionalSummary, experience, projects,
        education, skills, certifications, additionalSections, metadata
    } = data;

    const persona = metadata?.persona || 'experienced';
    const densityClass = getDensityClass(data);
    const blocks = [];

    // --- HEADER BLOCK ---
    const contactItems = [];
    contactItems.push(<SmartEditable key="email" inline path={['personalInfo', 'email']} text={personalInfo?.email} placeholder="email@example.com" />);
    contactItems.push(<SmartEditable key="phone" inline path={['personalInfo', 'phone']} text={personalInfo?.phone} placeholder="+1 234 567 8900" />);
    contactItems.push(<SmartEditable key="location" inline path={['personalInfo', 'location']} text={personalInfo?.location} placeholder="City, Country" />);

    if (personalInfo?.links && personalInfo.links.length > 0) {
        personalInfo.links.forEach((link, idx) => {
            contactItems.push(
                <SmartLinkEditable key={`link-${idx}`} path={['personalInfo', 'links', idx]} label={link.platform || link.url} url={link.url} className={styles.link} />
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
                    {contactItems.map((item, index) => (
                        <React.Fragment key={index}>
                            {item}
                            {index < contactItems.length - 1 && <span className={styles.contactSeparator} aria-hidden="true">|</span>}
                        </React.Fragment>
                    ))}
                    <button className={styles.addBtn} onClick={() => addArrayItem(['personalInfo', 'links'], { platform: 'LinkedIn', url: '' })}>
                        <Plus size={12} /> Add Link
                    </button>
                </div>
            </header>
        )
    });

    // --- SUMMARY BLOCK ---
    if (professionalSummary !== undefined) {
        blocks.push({
            id: 'summary-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Professional Summary</h2>
        });
        blocks.push({
            id: 'summary-content',
            type: 'content',
            content: (
                <div className={`${styles.paragraph} ${densityClass}`} data-node-id="professionalSummary">
                    <SmartEditable type="multiline" path={['professionalSummary']} text={professionalSummary} placeholder="Add a compelling professional summary highlighting your key strengths..." />
                </div>
            )
        });
    }

    // SECTION BUILDERS WITH NODE ANNOTATIONS AND FLEX DATE ALIGNMENT
    const renderExperienceSection = () => {
        const sectionBlocks = [];
        sectionBlocks.push({
            id: 'exp-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Professional Experience</h2>
        });

        if (experience && experience.length > 0) {
            experience.forEach((exp, idx) => {
                const expId = exp._id || `exp-${idx}`;
                sectionBlocks.push({
                    id: `exp-header-${expId}`,
                    type: 'block-header',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={expId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['experience'], idx)}><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}>
                                    <SmartEditable path={['experience', idx, 'role']} text={exp.role} placeholder="Job Title" />
                                </div>
                                <div className={styles.dateLocation}>
                                    <SmartEditable inline path={['experience', idx, 'startDate']} text={exp.startDate} placeholder="Start Date" />
                                    <span> – </span>
                                    <SmartEditable inline path={['experience', idx, 'endDate']} text={exp.endDate} placeholder="End Date" />
                                </div>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.secondaryText}>
                                    <SmartEditable path={['experience', idx, 'organization']} text={exp.organization} placeholder="Company Name" />
                                </div>
                                {exp.location !== undefined && (
                                    <div className={styles.dateLocation}>
                                        <SmartEditable inline path={['experience', idx, 'location']} text={exp.location} placeholder="Location" />
                                    </div>
                                )}
                            </div>
                            {exp.description && (
                                <div className={styles.paragraph}>
                                    <SmartEditable type="multiline" path={['experience', idx, 'description']} text={exp.description} placeholder="Optional role overview..." />
                                </div>
                            )}
                        </div>
                    )
                });

                exp.achievements?.forEach((ach, jdx) => {
                    const bulletNodeId = `${expId}-bullet-${jdx}`;
                    sectionBlocks.push({
                        id: `exp-ach-${expId}-${jdx}`,
                        type: 'bullet',
                        content: (
                            <li className={`${styles.bulletItem} ${densityClass}`} data-node-id={bulletNodeId}>
                                <span className={styles.bulletPoint}>•</span>
                                <div className={styles.bulletContent}>
                                    <SmartEditable
                                        type="multiline"
                                        path={['experience', idx, 'achievements', jdx]}
                                        text={ach}
                                        placeholder="Describe a measurable impact..."
                                        onBackspaceEmpty={() => removeArrayItem(['experience', idx, 'achievements'], jdx)}
                                    />
                                </div>
                            </li>
                        )
                    });
                });

                sectionBlocks.push({
                    id: `exp-addbul-${expId}`,
                    type: 'control',
                    content: (
                        <button className={styles.addBtn} onClick={() => addArrayItem(['experience', idx, 'achievements'], '')}>
                            <Plus size={12} /> Add Bullet
                        </button>
                    )
                });
            });

            sectionBlocks.push({
                id: 'exp-add-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginBottom: '12pt' }} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                        <Plus size={12} /> Add Experience
                    </button>
                )
            });
        } else {
            sectionBlocks.push({
                id: 'exp-empty-state',
                type: 'control',
                content: (
                    <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                        <Plus size={14} /> Add Experience
                    </button>
                )
            });
        }
        return sectionBlocks;
    };

    const renderProjectsSection = () => {
        const sectionBlocks = [];
        sectionBlocks.push({
            id: 'proj-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Projects</h2>
        });

        if (projects && projects.length > 0) {
            projects.forEach((proj, idx) => {
                const projId = proj._id || `proj-${idx}`;
                sectionBlocks.push({
                    id: `proj-header-${projId}`,
                    type: 'block-header',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={projId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['projects'], idx)}><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}>
                                    <SmartEditable path={['projects', idx, 'title']} text={proj.title} placeholder="Project Title" />
                                </div>
                                <div className={styles.dateLocation}>
                                    <SmartEditable inline path={['projects', idx, 'date']} text={proj.date} placeholder="Date" />
                                </div>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.secondaryText}>
                                    <SmartEditable path={['projects', idx, 'description']} text={proj.description} placeholder="Brief project description..." />
                                </div>
                                <div className={styles.projectLinks}>
                                    <SmartLinkEditable path={['projects', idx]} label="GitHub" url={proj.githubUrl} className={styles.link} />
                                    <SmartLinkEditable path={['projects', idx]} label="Live Demo" url={proj.liveUrl} className={styles.link} />
                                </div>
                            </div>
                        </div>
                    )
                });

                proj.highlights?.forEach((hl, jdx) => {
                    const highlightNodeId = `${projId}-hl-${jdx}`;
                    sectionBlocks.push({
                        id: `proj-hl-${projId}-${jdx}`,
                        type: 'bullet',
                        content: (
                            <li className={`${styles.bulletItem} ${densityClass}`} data-node-id={highlightNodeId}>
                                <span className={styles.bulletPoint}>•</span>
                                <div className={styles.bulletContent}>
                                    <SmartEditable
                                        type="multiline"
                                        path={['projects', idx, 'highlights', jdx]}
                                        text={hl}
                                        placeholder="Add key technical accomplishment..."
                                        onBackspaceEmpty={() => removeArrayItem(['projects', idx, 'highlights'], jdx)}
                                    />
                                </div>
                            </li>
                        )
                    });
                });

                sectionBlocks.push({
                    id: `proj-addbul-${projId}`,
                    type: 'control',
                    content: (
                        <button className={styles.addBtn} onClick={() => addArrayItem(['projects', idx, 'highlights'], '')}>
                            <Plus size={12} /> Add Highlight
                        </button>
                    )
                });
            });

            sectionBlocks.push({
                id: 'proj-add-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginBottom: '12pt' }} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                        <Plus size={12} /> Add Project
                    </button>
                )
            });
        } else {
            sectionBlocks.push({
                id: 'proj-empty-state',
                type: 'control',
                content: (
                    <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                        <Plus size={14} /> Add Project
                    </button>
                )
            });
        }
        return sectionBlocks;
    };

    const renderEducationSection = () => {
        const sectionBlocks = [];
        sectionBlocks.push({
            id: 'edu-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Education</h2>
        });

        if (education && education.length > 0) {
            education.forEach((edu, idx) => {
                const eduId = edu._id || `edu-${idx}`;
                sectionBlocks.push({
                    id: `edu-item-${eduId}`,
                    type: 'content',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={eduId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['education'], idx)}><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}>
                                    <SmartEditable path={['education', idx, 'institution']} text={edu.institution} placeholder="University / Institution" />
                                </div>
                                <div className={styles.dateLocation}>
                                    <SmartEditable inline path={['education', idx, 'location']} text={edu.location} placeholder="Location" />
                                </div>
                            </div>
                            <div className={styles.rowBetween}>
                                <div>
                                    <SmartEditable inline path={['education', idx, 'degree']} text={edu.degree} placeholder="Degree" />
                                    <span> in </span>
                                    <SmartEditable inline path={['education', idx, 'fieldOfStudy']} text={edu.fieldOfStudy} placeholder="Field of Study" />
                                </div>
                                <div className={styles.dateLocation}>
                                    <SmartEditable inline path={['education', idx, 'startDate']} text={edu.startDate} placeholder="Start Date" />
                                    <span> – </span>
                                    <SmartEditable inline path={['education', idx, 'endDate']} text={edu.endDate} placeholder="Graduation Date" />
                                </div>
                            </div>
                        </div>
                    )
                });
            });

            sectionBlocks.push({
                id: 'edu-add-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginBottom: '12pt' }} onClick={() => addArrayItem(['education'], { _id: generateId(), institution: '', degree: '' })}>
                        <Plus size={12} /> Add Education
                    </button>
                )
            });
        } else {
            sectionBlocks.push({
                id: 'edu-empty-state',
                type: 'control',
                content: (
                    <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['education'], { _id: generateId(), institution: '', degree: '' })}>
                        <Plus size={14} /> Add Education
                    </button>
                )
            });
        }
        return sectionBlocks;
    };

    const renderSkillsSection = () => {
        const sectionBlocks = [];
        sectionBlocks.push({
            id: 'skills-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Skills</h2>
        });

        if (skills && skills.length > 0) {
            skills.forEach((skillGroup, idx) => {
                const skillId = skillGroup._id || `skill-${idx}`;
                sectionBlocks.push({
                    id: `skill-item-${skillId}`,
                    type: 'content',
                    content: (
                        <div className={`${styles.skillItem} ${densityClass}`} data-node-id={skillId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['skills'], idx)}><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.skillCategory}>
                                <SmartEditable path={['skills', idx, 'category']} text={skillGroup.category} placeholder="Category" />
                                <span>:</span>
                            </div>
                            <div style={{ flex: 1 }}>
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

            sectionBlocks.push({
                id: 'skills-add-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginBottom: '12pt' }} onClick={() => addArrayItem(['skills'], { _id: generateId(), category: 'New Category', items: [] })}>
                        <Plus size={12} /> Add Skill Category
                    </button>
                )
            });
        } else {
            sectionBlocks.push({
                id: 'skills-empty-state',
                type: 'control',
                content: (
                    <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['skills'], { _id: generateId(), category: 'Core Skills', items: [] })}>
                        <Plus size={14} /> Add Skills
                    </button>
                )
            });
        }
        return sectionBlocks;
    };

    const renderCertificationsSection = () => {
        const sectionBlocks = [];
        sectionBlocks.push({
            id: 'certs-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Certifications</h2>
        });

        if (certifications && certifications.length > 0) {
            certifications.forEach((cert, idx) => {
                const certId = cert._id || `cert-${idx}`;
                sectionBlocks.push({
                    id: `cert-item-${certId}`,
                    type: 'block-header',
                    content: (
                        <div className={`${styles.blockItem} ${densityClass}`} data-node-id={certId}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['certifications'], idx)}><Trash2 size={13} /></button>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}>
                                    <SmartEditable path={['certifications', idx, 'name']} text={cert.name} placeholder="Certification Title" />
                                </div>
                                <div className={styles.dateLocation}>
                                    <SmartEditable inline path={['certifications', idx, 'date']} text={cert.date} placeholder="Date" />
                                </div>
                            </div>
                            <div className={styles.secondaryText}>
                                <SmartEditable path={['certifications', idx, 'issuer']} text={cert.issuer} placeholder="Issuing Body" />
                            </div>
                        </div>
                    )
                });
            });

            sectionBlocks.push({
                id: 'certs-add-btn',
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginBottom: '12pt' }} onClick={() => addArrayItem(['certifications'], { _id: generateId(), name: '', issuer: '' })}>
                        <Plus size={12} /> Add Certification
                    </button>
                )
            });
        }
        return sectionBlocks;
    };

    const renderCustomSections = () => {
        const sectionBlocks = [];
        if (additionalSections && additionalSections.length > 0) {
            additionalSections.forEach((sec, idx) => {
                const secId = sec._id || `custom-${idx}`;
                sectionBlocks.push({
                    id: `custom-title-${secId}`,
                    type: 'section-title',
                    content: (
                        <div style={{ position: 'relative' }}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['additionalSections'], idx)}><Trash2 size={13} /></button>
                            </div>
                            <h2 className={styles.sectionTitle}>
                                <SmartEditable path={['additionalSections', idx, 'sectionTitle']} text={sec.sectionTitle} placeholder="Custom Section Title" />
                            </h2>
                        </div>
                    )
                });

                sec.items?.forEach((item, jdx) => {
                    const itemId = item._id || `custom-item-${jdx}`;
                    sectionBlocks.push({
                        id: `custom-item-${secId}-${itemId}`,
                        type: 'block-header',
                        content: (
                            <div className={`${styles.blockItem} ${densityClass}`} data-node-id={itemId}>
                                <div className={styles.inlineControls}>
                                    <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['additionalSections', idx, 'items'], jdx)}><Trash2 size={13} /></button>
                                </div>
                                <div className={styles.rowBetween}>
                                    <div className={styles.primaryText}>
                                        <SmartEditable path={['additionalSections', idx, 'items', jdx, 'heading']} text={item.heading} placeholder="Heading" />
                                    </div>
                                    <div className={styles.dateLocation}>
                                        <SmartEditable inline path={['additionalSections', idx, 'items', jdx, 'date']} text={item.date} placeholder="Date" />
                                    </div>
                                </div>
                                <div className={styles.secondaryText}>
                                    <SmartEditable path={['additionalSections', idx, 'items', jdx, 'subheading']} text={item.subheading} placeholder="Subheading" />
                                </div>
                                <div className={styles.paragraph}>
                                    <SmartEditable type="multiline" path={['additionalSections', idx, 'items', jdx, 'description']} text={item.description} placeholder="Description..." />
                                </div>
                            </div>
                        )
                    });
                });

                sectionBlocks.push({
                    id: `custom-item-add-${secId}`,
                    type: 'control',
                    content: (
                        <button className={styles.addBtn} style={{ marginBottom: '12pt' }} onClick={() => addArrayItem(['additionalSections', idx, 'items'], { _id: generateId(), heading: '', description: '' })}>
                            <Plus size={12} /> Add Item
                        </button>
                    )
                });
            });
        }
        return sectionBlocks;
    };

    // ADAPTIVE SECTION ORDERING BASED ON CANDIDATE PERSONA
    if (persona === 'fresher') {
        blocks.push(...renderEducationSection());
        blocks.push(...renderProjectsSection());
        blocks.push(...renderSkillsSection());
        blocks.push(...renderExperienceSection());
    } else if (persona === 'career-changer') {
        blocks.push(...renderSkillsSection());
        blocks.push(...renderExperienceSection());
        blocks.push(...renderProjectsSection());
        blocks.push(...renderEducationSection());
    } else {
        blocks.push(...renderExperienceSection());
        blocks.push(...renderSkillsSection());
        blocks.push(...renderProjectsSection());
        blocks.push(...renderEducationSection());
    }

    blocks.push(...renderCertificationsSection());
    blocks.push(...renderCustomSections());

    return blocks;
};
