import styles from '../../styles/Templates.module.css';

const TemplateModern = ({ data }) => {
    const { personalInfo, professionalSummary, experience, education, skills, additionalSections } = data;

    return (
        <div className={`${styles.document} ${styles.modernFont}`}>
            <div className={styles.modernName}>{personalInfo?.fullName}</div>
            <div className={styles.modernContact}>
                {[personalInfo?.email, personalInfo?.phone, personalInfo?.location].filter(Boolean).join(' • ')}
            </div>

            {professionalSummary && (
                <div className={styles.section}>
                    <div className={styles.modernSectionTitle}>Summary</div>
                    <div>{professionalSummary}</div>
                </div>
            )}

            {experience?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.modernSectionTitle}>Experience</div>
                    {experience.map((exp, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>{exp.role}</span>
                                <span style={{ color: '#7f8c8d' }}>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div style={{ fontWeight: '600', color: '#34495e', marginBottom: '6px' }}>
                                {exp.organization} {exp.location ? `| ${exp.location}` : ''}
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
                    <div className={styles.modernSectionTitle}>Education</div>
                    {education.map((edu, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween} style={{ fontWeight: 'bold', fontSize: '12pt' }}>
                                <span>{edu.institution}</span>
                                <span style={{ color: '#7f8c8d', fontSize: '11pt', fontWeight: 'normal' }}>{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <div style={{ color: '#34495e' }}>
                                {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {skills?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.modernSectionTitle}>Skills</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {skills.map((skillGroup, i) => (
                            <div key={i}>
                                <strong style={{ color: '#2c3e50' }}>{skillGroup.category}: </strong>
                                <span>{skillGroup.items?.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {additionalSections?.length > 0 && additionalSections.map((section, idx) => (
                 <div key={idx} className={styles.section}>
                    <div className={styles.modernSectionTitle}>{section.sectionTitle}</div>
                    {section.items?.map((item, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween} style={{ fontWeight: 'bold' }}>
                                <span>{item.heading}</span>
                                <span style={{ color: '#7f8c8d' }}>{item.date}</span>
                            </div>
                            <div style={{ color: '#34495e', fontWeight: '600' }}>{item.subheading}</div>
                            {item.description && <div>{item.description}</div>}
                        </div>
                    ))}
                 </div>
            ))}
        </div>
    );
};

export default TemplateModern;