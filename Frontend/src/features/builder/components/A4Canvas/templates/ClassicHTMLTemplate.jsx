import React from 'react';
import { SmartEditable, SmartLinkEditable } from '../../SmartEditable/SmartEditable';
import { useResumeStore } from '../../../../../store/useResumeStore';
import { Trash2, Plus } from 'lucide-react';
import { generateId } from '../../../../../utils/idGenerator';
import styles from './ClassicHTMLTemplate.module.css';

export const classicTemplateStyles = {
    document: styles.document
};

export const generateClassicBlocks = (data) => {
    if (!data) return [];
    
    const { addArrayItem, removeArrayItem } = useResumeStore.getState();

    const { 
        personalInfo, professionalSummary, experience, projects, 
        education, skills, certifications, achievements, additionalSections 
    } = data;

    const blocks = [];

    // --- HEADER BLOCK ---
    // Contact fields are now ALWAYS pushed, ensuring placeholders appear if empty.
    const contactItems = [];
    contactItems.push(<SmartEditable key="email" inline path={['personalInfo', 'email']} text={personalInfo?.email} placeholder="Email Address" />);
    contactItems.push(<SmartEditable key="phone" inline path={['personalInfo', 'phone']} text={personalInfo?.phone} placeholder="Phone Number" />);
    contactItems.push(<SmartEditable key="location" inline path={['personalInfo', 'location']} text={personalInfo?.location} placeholder="City, State" />);
    
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
            <header className={styles.header}>
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
                    {/* Inline Add Link Button */}
                    <button className={styles.addBtn} style={{ marginTop: 0 }} onClick={() => addArrayItem(['personalInfo', 'links'], { platform: 'LinkedIn', url: '' })}>
                        <Plus size={14}/> Add Link
                    </button>
                </div>
            </header>
        )
    });

    // --- SUMMARY BLOCK ---
    // Section title and content area are always visible
    blocks.push({
        id: 'summary-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Professional Summary</h2>
    });
    blocks.push({
        id: 'summary-content',
        type: 'content',
        content: (
            <div className={styles.paragraph}>
                <SmartEditable type="multiline" path={['professionalSummary']} text={professionalSummary} placeholder="Add a compelling professional summary highlighting your key strengths..." />
            </div>
        )
    });

    // --- EXPERIENCE BLOCKS ---
    blocks.push({
        id: 'exp-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Experience</h2>
    });

    if (experience && experience.length > 0) {
        experience.forEach((exp, idx) => {
            const expId = exp._id || `exp-${idx}`;
            
            blocks.push({
                id: `exp-header-${expId}`,
                type: 'block-header',
                content: (
                    <div className={styles.blockItem}>
                        <div className={styles.inlineControls}>
                            <button className={styles.iconBtn} onClick={() => removeArrayItem(['experience'], idx)}><Trash2 size={14}/></button>
                        </div>
                        <div className={styles.rowBetween}>
                            <div className={styles.primaryText}>
                                <SmartEditable path={['experience', idx, 'role']} text={exp.role} placeholder="Job Title" />
                            </div>
                            <div className={styles.dateLocation}>
                                <SmartEditable inline path={['experience', idx, 'startDate']} text={exp.startDate} placeholder="Start Date" />
                                <span> - </span>
                                <SmartEditable inline path={['experience', idx, 'endDate']} text={exp.endDate} placeholder="End Date" />
                            </div>
                        </div>
                        <div className={styles.rowBetween}>
                            <div className={styles.secondaryText}>
                                <SmartEditable path={['experience', idx, 'organization']} text={exp.organization} placeholder="Company Name" />
                            </div>
                            <div className={styles.dateLocation}>
                                <SmartEditable inline path={['experience', idx, 'location']} text={exp.location} placeholder="Location" />
                            </div>
                        </div>
                        {exp.description !== undefined && (
                            <div className={styles.paragraph}>
                                <SmartEditable type="multiline" path={['experience', idx, 'description']} text={exp.description} placeholder="Optional role description..." />
                            </div>
                        )}
                    </div>
                )
            });

            exp.achievements?.forEach((ach, jdx) => {
                blocks.push({
                    id: `exp-ach-${expId}-${jdx}`,
                    type: 'bullet', 
                    content: (
                        <li className={styles.bulletItem}>
                            <span className={styles.bulletPoint}>•</span>
                            <div className={styles.bulletContent}>
                                <SmartEditable 
                                    type="multiline" 
                                    path={['experience', idx, 'achievements', jdx]} 
                                    text={ach} 
                                    placeholder="Describe a measurable achievement..." 
                                    onBackspaceEmpty={() => removeArrayItem(['experience', idx, 'achievements'], jdx)}
                                />
                            </div>
                        </li>
                    )
                });
            });

            // Hover Add Bullet button for this specific experience
            blocks.push({
                id: `exp-addbul-${expId}`,
                type: 'control',
                content: (
                    <button className={styles.addBtn} onClick={() => addArrayItem(['experience', idx, 'achievements'], '')}>
                        <Plus size={14}/> Add Bullet
                    </button>
                )
            });
        });

        // Hover Add Experience button at the bottom of the section
        blocks.push({
            id: 'exp-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                    <Plus size={14}/> Add Experience
                </button>
            )
        });
    } else {
        // EMPTY STATE PLACEHOLDER
        blocks.push({
            id: 'exp-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                    <Plus size={18} /> Add Experience
                </button>
            )
        });
    }

    // --- EDUCATION BLOCKS ---
    blocks.push({
        id: 'edu-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Education</h2>
    });

    if (education && education.length > 0) {
        education.forEach((edu, idx) => {
            const eduId = edu._id || `edu-${idx}`;
            blocks.push({
                id: `edu-item-${eduId}`,
                type: 'content',
                content: (
                    <div className={styles.blockItem}>
                        <div className={styles.inlineControls}>
                            <button className={styles.iconBtn} onClick={() => removeArrayItem(['education'], idx)}><Trash2 size={14}/></button>
                        </div>
                        <div className={styles.rowBetween}>
                            <div className={styles.primaryText}>
                                <SmartEditable path={['education', idx, 'institution']} text={edu.institution} placeholder="University / School" />
                            </div>
                            <div className={styles.dateLocation}>
                                <SmartEditable inline path={['education', idx, 'location']} text={edu.location} placeholder="Location" />
                            </div>
                        </div>
                        <div className={styles.rowBetween}>
                            <div style={{flex: 1}}>
                                <SmartEditable inline path={['education', idx, 'degree']} text={edu.degree} placeholder="Degree" />
                                <span> in </span>
                                <SmartEditable inline path={['education', idx, 'fieldOfStudy']} text={edu.fieldOfStudy} placeholder="Field of Study" />
                            </div>
                            <div className={styles.dateLocation}>
                                <SmartEditable inline path={['education', idx, 'startDate']} text={edu.startDate} placeholder="Start Date" />
                                <span> - </span>
                                <SmartEditable inline path={['education', idx, 'endDate']} text={edu.endDate} placeholder="Graduation Date" />
                            </div>
                        </div>
                    </div>
                )
            });
        });

        blocks.push({
            id: 'edu-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['education'], { _id: generateId(), institution: '', degree: '' })}>
                    <Plus size={14}/> Add Education
                </button>
            )
        });
    } else {
        // EMPTY STATE PLACEHOLDER
        blocks.push({
            id: 'edu-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['education'], { _id: generateId(), institution: '', degree: '' })}>
                    <Plus size={18} /> Add Education
                </button>
            )
        });
    }

    // --- SKILLS BLOCKS ---
    blocks.push({
        id: 'skills-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Skills</h2>
    });

    if (skills && skills.length > 0) {
        skills.forEach((skillGroup, idx) => {
            const skillId = skillGroup._id || `skill-${idx}`;
            blocks.push({
                id: `skill-item-${skillId}`,
                type: 'content',
                content: (
                    <div className={styles.skillItem}>
                        <div className={styles.inlineControls}>
                            <button className={styles.iconBtn} onClick={() => removeArrayItem(['skills'], idx)}><Trash2 size={14}/></button>
                        </div>
                        <div className={styles.skillCategory}>
                            <SmartEditable path={['skills', idx, 'category']} text={skillGroup.category} placeholder="Category" />
                            <span>:</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <SmartEditable 
                                type="multiline"
                                path={['skills', idx, 'items']} 
                                text={skillGroup.items?.join(', ')} 
                                placeholder="React, Node.js, Typescript..." 
                                onChangeOverride={(val) => val.split(',').map(s => s.trim()).filter(Boolean)}
                            />
                        </div>
                    </div>
                )
            });
        });

        blocks.push({
            id: 'skills-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['skills'], { _id: generateId(), category: 'New Category', items: [] })}>
                    <Plus size={14}/> Add Skill Category
                </button>
            )
        });
    } else {
        blocks.push({
            id: 'skills-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['skills'], { _id: generateId(), category: 'Languages', items: [] })}>
                    <Plus size={18} /> Add Skills
                </button>
            )
        });
    }

    // --- PROJECTS BLOCKS ---
    blocks.push({
        id: 'proj-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Projects</h2>
    });

    if (projects && projects.length > 0) {
        projects.forEach((proj, idx) => {
            const projId = proj._id || `proj-${idx}`;
            
            blocks.push({
                id: `proj-header-${projId}`,
                type: 'block-header',
                content: (
                    <div className={styles.blockItem}>
                        <div className={styles.inlineControls}>
                            <button className={styles.iconBtn} onClick={() => removeArrayItem(['projects'], idx)}><Trash2 size={14}/></button>
                        </div>
                        <div className={styles.rowBetween}>
                            <div className={styles.primaryText}>
                                <SmartEditable path={['projects', idx, 'title']} text={proj.title} placeholder="Project Title" />
                            </div>
                            <div className={styles.dateLocation}>
                                <SmartEditable inline path={['projects', idx, 'date']} text={proj.date} placeholder="Date" />
                            </div>
                        </div>
                        <div className={styles.rowBetween} style={{ alignItems: 'center' }}>
                            <div className={styles.secondaryText}>
                                <SmartEditable path={['projects', idx, 'description']} text={proj.description} placeholder="Brief description..." />
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
                blocks.push({
                    id: `proj-hl-${projId}-${jdx}`,
                    type: 'bullet',
                    content: (
                        <li className={styles.bulletItem}>
                            <span className={styles.bulletPoint}>•</span>
                            <div className={styles.bulletContent}>
                                <SmartEditable 
                                    type="multiline" 
                                    path={['projects', idx, 'highlights', jdx]} 
                                    text={hl} 
                                    placeholder="Add technical highlight..." 
                                    onBackspaceEmpty={() => removeArrayItem(['projects', idx, 'highlights'], jdx)}
                                />
                            </div>
                        </li>
                    )
                });
            });

            blocks.push({
                id: `proj-addbul-${projId}`,
                type: 'control',
                content: (
                    <button className={styles.addBtn} onClick={() => addArrayItem(['projects', idx, 'highlights'], '')}>
                        <Plus size={14}/> Add Bullet
                    </button>
                )
            });
        });

        blocks.push({
            id: 'proj-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                    <Plus size={14}/> Add Project
                </button>
            )
        });
    } else {
        blocks.push({
            id: 'proj-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['projects'], { _id: generateId(), title: '', highlights: [''] })}>
                    <Plus size={18} /> Add Project
                </button>
            )
        });
    }

    // --- CERTIFICATIONS ---
    blocks.push({
        id: 'certs-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Certifications</h2>
    });

    if (certifications && certifications.length > 0) {
        certifications.forEach((cert, idx) => {
            const certId = cert._id || `cert-${idx}`;
            blocks.push({
                id: `cert-item-${certId}`,
                type: 'block-header',
                content: (
                    <div className={styles.blockItem}>
                        <div className={styles.inlineControls}>
                            <button className={styles.iconBtn} onClick={() => removeArrayItem(['certifications'], idx)}><Trash2 size={14}/></button>
                        </div>
                        <div className={styles.rowBetween}>
                            <div className={styles.primaryText}>
                                <SmartEditable path={['certifications', idx, 'name']} text={cert.name} placeholder="Certification Name" />
                            </div>
                            <div className={styles.dateLocation}>
                                <SmartEditable inline path={['certifications', idx, 'date']} text={cert.date} placeholder="Date" />
                            </div>
                        </div>
                        <div className={styles.secondaryText}>
                            <SmartEditable path={['certifications', idx, 'issuer']} text={cert.issuer} placeholder="Issuing Organization" />
                        </div>
                    </div>
                )
            });
        });

        blocks.push({
            id: 'certs-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['certifications'], { _id: generateId(), name: '', issuer: '' })}>
                    <Plus size={14}/> Add Certification
                </button>
            )
        });
    } else {
        blocks.push({
            id: 'certs-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['certifications'], { _id: generateId(), name: '', issuer: '' })}>
                    <Plus size={18} /> Add Certification
                </button>
            )
        });
    }

    // --- STANDALONE ACHIEVEMENTS ---
    blocks.push({
        id: 'achievements-title',
        type: 'section-title',
        content: <h2 className={styles.sectionTitle}>Key Achievements</h2>
    });

    if (achievements && achievements.length > 0) {
        achievements.forEach((ach, idx) => {
            blocks.push({
                id: `ach-${idx}`,
                type: 'bullet',
                content: (
                    <li className={styles.bulletItem}>
                        <span className={styles.bulletPoint}>•</span>
                        <div className={styles.bulletContent}>
                            <SmartEditable 
                                type="multiline" 
                                path={['achievements', idx]} 
                                text={ach} 
                                placeholder="Describe a key achievement..." 
                                onBackspaceEmpty={() => removeArrayItem(['achievements'], idx)}
                            />
                        </div>
                    </li>
                )
            });
        });

        blocks.push({
            id: 'ach-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['achievements'], '')}>
                    <Plus size={14}/> Add Key Achievement
                </button>
            )
        });
    } else {
        blocks.push({
            id: 'ach-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['achievements'], '')}>
                    <Plus size={18} /> Add Key Achievement
                </button>
            )
        });
    }

    // --- ADDITIONAL SECTIONS ---
    // If empty, we render one generic "Custom Section" block header to allow discovery.
    if (additionalSections && additionalSections.length > 0) {
        additionalSections.forEach((section, idx) => {
            const sectionId = section._id || `custom-${idx}`;
            
            blocks.push({
                id: `custom-title-${sectionId}`,
                type: 'section-title',
                content: (
                    <div style={{ position: 'relative' }}>
                        <div className={styles.inlineControls}>
                            <button className={styles.iconBtn} onClick={() => removeArrayItem(['additionalSections'], idx)}><Trash2 size={14}/></button>
                        </div>
                        <h2 className={styles.sectionTitle}>
                            <SmartEditable path={['additionalSections', idx, 'sectionTitle']} text={section.sectionTitle} placeholder="Custom Section Title" />
                        </h2>
                    </div>
                )
            });

            section.items?.forEach((item, jdx) => {
                const itemId = item._id || `custom-item-${jdx}`;
                blocks.push({
                    id: `custom-item-${sectionId}-${itemId}`,
                    type: 'block-header',
                    content: (
                        <div className={styles.blockItem}>
                            <div className={styles.inlineControls}>
                                <button className={styles.iconBtn} onClick={() => removeArrayItem(['additionalSections', idx, 'items'], jdx)}><Trash2 size={14}/></button>
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

            blocks.push({
                id: `custom-item-add-${sectionId}`,
                type: 'control',
                content: (
                    <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['additionalSections', idx, 'items'], { _id: generateId(), heading: '', description: '' })}>
                        <Plus size={14}/> Add Item
                    </button>
                )
            });
        });

        blocks.push({
            id: 'custom-sec-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['additionalSections'], { _id: generateId(), sectionTitle: 'New Section', items: [] })}>
                    <Plus size={14}/> Add Another Section
                </button>
            )
        });
    } else {
        blocks.push({
            id: 'custom-empty-state',
            type: 'control',
            content: (
                <button className={styles.emptySectionPlaceholder} onClick={() => addArrayItem(['additionalSections'], { _id: generateId(), sectionTitle: 'New Custom Section', items: [] })}>
                    <Plus size={18} /> Add Custom Section
                </button>
            )
        });
    }

    return blocks;
};