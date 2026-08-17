import React from 'react';
import { SmartEditable, SmartLinkEditable } from '../../SmartEditable/SmartEditable';
import { useResumeStore } from '../../../../../store/useResumeStore';
import { Trash2, Plus } from 'lucide-react';
import { generateId } from '../../../../../utils/idGenerator';
import styles from './ClassicHTMLTemplate.module.css';

/**
 * REFACTORED FOR PAGINATION ENGINE
 * Instead of returning a single monolithic JSX tree, this generator
 * returns a flat array of 'Blocks'. The PaginationEngine measures and 
 * splits these blocks across physical A4 pages.
 */
export const generateClassicBlocks = (data) => {
    if (!data) return [];
    
    // We fetch actions safely outside components for inline buttons
    const { addArrayItem, removeArrayItem } = useResumeStore.getState();

    const { 
        personalInfo, professionalSummary, experience, projects, 
        education, skills, certifications, achievements, additionalSections 
    } = data;

    const blocks = [];

    // --- HEADER BLOCK ---
    const contactItems = [];
    contactItems.push(<SmartEditable key="email" inline path={['personalInfo', 'email']} text={personalInfo?.email} placeholder="Email" />);
    contactItems.push(<SmartEditable key="phone" inline path={['personalInfo', 'phone']} text={personalInfo?.phone} placeholder="Phone" />);
    contactItems.push(<SmartEditable key="location" inline path={['personalInfo', 'location']} text={personalInfo?.location} placeholder="City, State" />);
    
    if (personalInfo?.links) {
        personalInfo.links.forEach((link, idx) => {
            contactItems.push(
                <SmartLinkEditable 
                    key={`link-${idx}`} 
                    path={['personalInfo', 'links', idx]} 
                    label={link.platform || link.url} 
                    url={link.url} 
                    className={styles.link} 
                />
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
                    <button className={styles.addBtn} style={{ marginTop: 0 }} onClick={() => addArrayItem(['personalInfo', 'links'], { platform: 'LinkedIn', url: '' })}>
                        <Plus size={14}/> Link
                    </button>
                </div>
            </header>
        )
    });

    // --- SUMMARY BLOCK ---
    if (professionalSummary && professionalSummary.trim() !== '') {
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
                    <SmartEditable type="multiline" path={['professionalSummary']} text={professionalSummary} placeholder="Add a compelling professional summary..." />
                </div>
            )
        });
    }

    // --- EXPERIENCE BLOCKS ---
    if (experience && experience.length > 0) {
        blocks.push({
            id: 'exp-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Experience</h2>
        });

        experience.forEach((exp, idx) => {
            const expId = exp._id || `exp-${idx}`;
            
            // Experience Header
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
                        {exp.description && (
                            <div className={styles.paragraph}>
                                <SmartEditable type="multiline" path={['experience', idx, 'description']} text={exp.description} placeholder="Optional description..." />
                            </div>
                        )}
                    </div>
                )
            });

            // Experience Bullets
            exp.achievements?.forEach((ach, jdx) => {
                blocks.push({
                    id: `exp-ach-${expId}-${jdx}`,
                    type: 'bullet', // This type tells PaginationEngine to wrap it in a <ul>
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

            // Add Bullet Button
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

        // Add Experience Button
        blocks.push({
            id: 'exp-add-btn',
            type: 'control',
            content: (
                <button className={styles.addBtn} style={{ marginBottom: '14pt' }} onClick={() => addArrayItem(['experience'], { _id: generateId(), role: '', organization: '', achievements: [''] })}>
                    <Plus size={14}/> Add Experience
                </button>
            )
        });
    }

    // --- PROJECTS BLOCKS ---
    if (projects && projects.length > 0) {
        blocks.push({
            id: 'proj-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Projects</h2>
        });

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
    }

    // --- EDUCATION BLOCKS ---
    if (education && education.length > 0) {
        blocks.push({
            id: 'edu-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Education</h2>
        });

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
    }

    // --- SKILLS BLOCKS ---
    if (skills && skills.length > 0) {
        blocks.push({
            id: 'skills-title',
            type: 'section-title',
            content: <h2 className={styles.sectionTitle}>Skills</h2>
        });

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
    }

    return blocks;
};

// Fallback default export for strict compatibility
export default generateClassicBlocks;