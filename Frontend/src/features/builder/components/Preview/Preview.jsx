import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/Preview.module.css';

const Preview = ({ resumeData }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const calculateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const a4WidthPx = 794; 
                const padding = 40;
                const availableWidth = containerWidth - padding;

                if (availableWidth < a4WidthPx) {
                    setScale(availableWidth / a4WidthPx);
                } else {
                    setScale(1);
                }
            }
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    if (!resumeData) return null;
    const { personalInfo, professionalSummary, experience, education, skills, additionalSections } = resumeData;

    return (
        <div className={styles.previewContainer} ref={containerRef}>
            <div className={styles.scaleWrapper} style={{ transform: `scale(${scale})` }}>
                <div className={styles.paper}>
                    
                    <div className={styles.name}>{personalInfo?.fullName}</div>
                    <div className={styles.contactInfo}>
                        {personalInfo?.email && <span>{personalInfo.email}</span>}
                        {personalInfo?.phone && <span>| {personalInfo.phone}</span>}
                        {personalInfo?.location && <span>| {personalInfo.location}</span>}
                    </div>

                    {professionalSummary && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Professional Summary</div>
                            <div className={styles.summary}>{professionalSummary}</div>
                        </div>
                    )}

                    {experience && experience.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Experience</div>
                            {experience.map((exp, i) => (
                                <div key={i} className={styles.entry}>
                                    <div className={styles.entryHeader}>
                                        <span>{exp.role}</span>
                                        <span>{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className={styles.entrySubheader}>
                                        <span>{exp.organization}</span>
                                        <span>{exp.location}</span>
                                    </div>
                                    <ul className={styles.bullets}>
                                        {exp.achievements?.map((ach, j) => <li key={j}>{ach}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {education && education.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Education</div>
                            {education.map((edu, i) => (
                                <div key={i} className={styles.entry}>
                                    <div className={styles.entryHeader}>
                                        <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                                        <span>{edu.startDate} - {edu.endDate}</span>
                                    </div>
                                    <div className={styles.entrySubheader}>
                                        <span>{edu.institution}</span>
                                        <span>{edu.location}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {skills && skills.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>Skills</div>
                            {skills.map((skillGroup, i) => (
                                <div key={i} style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.5' }}>
                                    <strong>{skillGroup.category}: </strong>
                                    <span>{skillGroup.items?.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {additionalSections && additionalSections.length > 0 && additionalSections.map((section, idx) => (
                         <div key={idx} className={styles.section}>
                            <div className={styles.sectionTitle}>{section.sectionTitle}</div>
                            {section.items?.map((item, i) => (
                                <div key={i} className={styles.entry}>
                                    <div className={styles.entryHeader}>
                                        <span>{item.heading}</span>
                                        <span>{item.date}</span>
                                    </div>
                                    <div className={styles.entrySubheader}>{item.subheading}</div>
                                    {item.description && <div className={styles.summary}>{item.description}</div>}
                                </div>
                            ))}
                         </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default Preview;