import styles from '../../styles/Templates.module.css';

const TemplateClassic = ({ data }) => {
    const { personalInfo, professionalSummary, experience, education, skills, additionalSections } = data;

    return (
        <div className={`${styles.document} ${styles.classicFont}`}>
            <div className={styles.classicName}>{personalInfo?.fullName}</div>
            <div className={styles.classicContact}>
                {[personalInfo?.email, personalInfo?.phone, personalInfo?.location].filter(Boolean).join(' | ')}
            </div>

            {professionalSummary && (
                <div className={styles.section}>
                    <div className={styles.classicSectionTitle}>Professional Summary</div>
                    <div>{professionalSummary}</div>
                </div>
            )}

            {experience?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.classicSectionTitle}>Experience</div>
                    {experience.map((exp, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween} style={{ fontWeight: 'bold' }}>
                                <span>{exp.role}</span>
                                <span>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className={styles.flexBetween} style={{ fontStyle: 'italic', marginBottom: '4px' }}>
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

            {education?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.classicSectionTitle}>Education</div>
                    {education.map((edu, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween} style={{ fontWeight: 'bold' }}>
                                <span>{edu.institution}</span>
                                <span>{edu.location}</span>
                            </div>
                            <div className={styles.flexBetween} style={{ fontStyle: 'italic' }}>
                                <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                                <span>{edu.startDate} - {edu.endDate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {skills?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.classicSectionTitle}>Skills</div>
                    {skills.map((skillGroup, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>
                            <strong>{skillGroup.category}: </strong>
                            <span>{skillGroup.items?.join(', ')}</span>
                        </div>
                    ))}
                </div>
            )}

            {additionalSections?.length > 0 && additionalSections.map((section, idx) => (
                 <div key={idx} className={styles.section}>
                    <div className={styles.classicSectionTitle}>{section.sectionTitle}</div>
                    {section.items?.map((item, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween} style={{ fontWeight: 'bold' }}>
                                <span>{item.heading}</span>
                                <span>{item.date}</span>
                            </div>
                            <div style={{ fontStyle: 'italic' }}>{item.subheading}</div>
                            {item.description && <div>{item.description}</div>}
                        </div>
                    ))}
                 </div>
            ))}
        </div>
    );
};

export default TemplateClassic;