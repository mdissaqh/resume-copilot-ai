import React from 'react';
import styles from './ClassicHTMLTemplate.module.css';

// Helper to format URLs cleanly
const formatUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '');
};

const ClassicHTMLTemplate = ({ data }) => {
    if (!data) return null;

    const { 
        personalInfo, 
        professionalSummary, 
        experience, 
        projects, 
        education, 
        skills, 
        certifications, 
        achievements, 
        additionalSections 
    } = data;

    // SUB-COMPONENTS FOR CLEAN ARCHITECTURE
    // Preparing structure for Phase 3 <SmartEditable> wrappers

    const ContactRow = () => {
        if (!personalInfo) return null;
        
        const items = [];
        if (personalInfo.email) items.push(<a key="email" href={`mailto:${personalInfo.email}`} className={styles.link}><span>{personalInfo.email}</span></a>);
        if (personalInfo.phone) items.push(<span key="phone">{personalInfo.phone}</span>);
        if (personalInfo.location) items.push(<span key="location">{personalInfo.location}</span>);
        
        if (personalInfo.links && personalInfo.links.length > 0) {
            personalInfo.links.forEach((link, idx) => {
                if (link.url) {
                    items.push(
                        <a key={`link-${idx}`} href={link.url} target="_blank" rel="noreferrer" className={styles.link}>
                            <span>{formatUrl(link.url)}</span>
                        </a>
                    );
                }
            });
        }

        if (items.length === 0) return null;

        return (
            <div className={styles.contactInfo}>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {item}
                        {index < items.length - 1 && <span className={styles.contactSeparator} aria-hidden="true">|</span>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <article className={styles.document}>
            
            {/* HEADER */}
            <header className={styles.header}>
                <h1 className={styles.name}><span>{personalInfo?.fullName || ''}</span></h1>
                <ContactRow />
            </header>

            {/* SUMMARY */}
            {professionalSummary && professionalSummary.trim() !== '' && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Professional Summary</span></h2>
                    <p className={styles.paragraph}><span>{professionalSummary}</span></p>
                </section>
            )}

            {/* EXPERIENCE */}
            {experience && experience.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Experience</span></h2>
                    {experience.map((exp, idx) => (
                        <div key={`exp-${idx}`} className={styles.blockItem}>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}><span>{exp.role}</span></div>
                                <div className={styles.dateLocation}>
                                    <span>{exp.startDate}</span> {exp.endDate && <span> - {exp.endDate}</span>}
                                </div>
                            </div>
                            <div className={styles.rowBetween}>
                                <div className={styles.secondaryText}><span>{exp.organization}</span></div>
                                <div className={styles.dateLocation}><span>{exp.location}</span></div>
                            </div>
                            {exp.description && <p className={styles.paragraph}><span>{exp.description}</span></p>}
                            {exp.achievements && exp.achievements.length > 0 && (
                                <ul className={styles.bulletList}>
                                    {exp.achievements.map((ach, jdx) => (
                                        <li key={`ach-${jdx}`} className={styles.bulletItem}><span>{ach}</span></li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* PROJECTS */}
            {projects && projects.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Projects</span></h2>
                    {projects.map((proj, idx) => (
                        <div key={`proj-${idx}`} className={styles.blockItem}>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}><span>{proj.title}</span></div>
                                <div className={styles.dateLocation}><span>{proj.date}</span></div>
                            </div>
                            
                            {/* Project Links & Description */}
                            <div className={styles.rowBetween} style={{ alignItems: 'center' }}>
                                <div className={styles.secondaryText}><span>{proj.description}</span></div>
                                <div className={styles.projectLinks}>
                                    {proj.githubUrl && <a href={proj.githubUrl} className={styles.link} target="_blank" rel="noreferrer"><span>GitHub</span></a>}
                                    {proj.liveUrl && <a href={proj.liveUrl} className={styles.link} target="_blank" rel="noreferrer"><span>Live Demo</span></a>}
                                </div>
                            </div>

                            {proj.highlights && proj.highlights.length > 0 && (
                                <ul className={styles.bulletList}>
                                    {proj.highlights.map((hl, jdx) => (
                                        <li key={`hl-${jdx}`} className={styles.bulletItem}><span>{hl}</span></li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* EDUCATION */}
            {education && education.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Education</span></h2>
                    {education.map((edu, idx) => (
                        <div key={`edu-${idx}`} className={styles.blockItem}>
                            <div className={styles.rowBetween}>
                                <div className={styles.primaryText}><span>{edu.institution}</span></div>
                                <div className={styles.dateLocation}><span>{edu.location}</span></div>
                            </div>
                            <div className={styles.rowBetween}>
                                <div>
                                    <span>{edu.degree}</span> {edu.fieldOfStudy && <span>in {edu.fieldOfStudy}</span>}
                                </div>
                                <div className={styles.dateLocation}>
                                    <span>{edu.startDate}</span> {edu.endDate && <span> - {edu.endDate}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* SKILLS */}
            {skills && skills.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Skills</span></h2>
                    {skills.map((skillGroup, idx) => (
                        <div key={`skill-${idx}`} className={styles.skillItem}>
                            <span className={styles.skillCategory}><span>{skillGroup.category}:</span> </span>
                            <span>{skillGroup.items?.join(', ')}</span>
                        </div>
                    ))}
                </section>
            )}

            {/* CERTIFICATIONS */}
            {certifications && certifications.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Certifications</span></h2>
                    {certifications.map((cert, idx) => (
                        <div key={`cert-${idx}`} className={styles.blockItem}>
                            <div className={styles.rowBetween}>
                                <div>
                                    <span className={styles.primaryText}><span>{cert.name}</span></span>
                                    {cert.issuer && <span> - <span>{cert.issuer}</span></span>}
                                </div>
                                <div className={styles.dateLocation}><span>{cert.date}</span></div>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* ACHIEVEMENTS (Standalone) */}
            {achievements && achievements.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}><span>Key Achievements</span></h2>
                    <ul className={styles.bulletList}>
                        {achievements.map((ach, idx) => (
                            <li key={`ach-${idx}`} className={styles.bulletItem}><span>{ach}</span></li>
                        ))}
                    </ul>
                </section>
            )}

            {/* CUSTOM SECTIONS */}
            {additionalSections && additionalSections.length > 0 && (
                <React.Fragment>
                    {additionalSections.map((section, idx) => (
                        <section key={`custom-${idx}`} className={styles.section}>
                            <h2 className={styles.sectionTitle}><span>{section.sectionTitle}</span></h2>
                            {section.items?.map((item, jdx) => (
                                <div key={`custom-item-${jdx}`} className={styles.blockItem}>
                                    <div className={styles.rowBetween}>
                                        <div className={styles.primaryText}><span>{item.heading}</span></div>
                                        <div className={styles.dateLocation}><span>{item.date}</span></div>
                                    </div>
                                    {item.subheading && <div className={styles.secondaryText}><span>{item.subheading}</span></div>}
                                    {item.description && <p className={styles.paragraph}><span>{item.description}</span></p>}
                                </div>
                            ))}
                        </section>
                    ))}
                </React.Fragment>
            )}

        </article>
    );
};

export default ClassicHTMLTemplate;