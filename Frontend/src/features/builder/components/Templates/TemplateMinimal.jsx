import styles from '../../styles/Templates.module.css';

const TemplateMinimal = ({ data }) => {
    const { personalInfo, professionalSummary, experience, education, skills, additionalSections } = data;

    return (
        <div className={`${styles.document} ${styles.minimalFont}`}>
            <div className={styles.minimalName}>{personalInfo?.fullName}</div>
            <div className={styles.minimalContact}>
                {[personalInfo?.email, personalInfo?.phone, personalInfo?.location].filter(Boolean).join('   /   ')}
            </div>

            {professionalSummary && (
                <div className={styles.section}>
                    <div className={styles.minimalSectionTitle}>About</div>
                    <div style={{ color: '#444' }}>{professionalSummary}</div>
                </div>
            )}

            {experience?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.minimalSectionTitle}>Experience</div>
                    {experience.map((exp, i) => (
                        <div key={i} className={styles.entry} style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ width: '120px', flexShrink: 0, color: '#666', fontSize: '10pt', paddingTop: '2px' }}>
                                {exp.startDate} — <br/>{exp.endDate}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', color: '#111' }}>{exp.role}</div>
                                <div style={{ color: '#555', marginBottom: '8px' }}>{exp.organization}</div>
                                <ul className={styles.bullets} style={{ color: '#444' }}>
                                    {exp.achievements?.map((ach, j) => <li key={j} style={{ marginBottom: '4px' }}>{ach}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {education?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.minimalSectionTitle}>Education</div>
                    {education.map((edu, i) => (
                        <div key={i} className={styles.entry} style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ width: '120px', flexShrink: 0, color: '#666', fontSize: '10pt', paddingTop: '2px' }}>
                                {edu.startDate} — <br/>{edu.endDate}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', color: '#111' }}>{edu.institution}</div>
                                <div style={{ color: '#555' }}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {skills?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.minimalSectionTitle}>Expertise</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#444' }}>
                        {skills.map((skillGroup, i) => (
                            <div key={i}>
                                <strong style={{ color: '#111' }}>{skillGroup.category} </strong> 
                                — {skillGroup.items?.join(', ')}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {additionalSections?.length > 0 && additionalSections.map((section, idx) => (
                 <div className={styles.section} key={idx}>
                    <div className={styles.minimalSectionTitle}>{section.sectionTitle}</div>
                    {section.items?.map((item, i) => (
                        <div key={i} className={styles.entry} style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ width: '120px', flexShrink: 0, color: '#666', fontSize: '10pt', paddingTop: '2px' }}>
                                {item.date}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', color: '#111' }}>{item.heading}</div>
                                <div style={{ color: '#555' }}>{item.subheading}</div>
                                {item.description && <div style={{ color: '#444', marginTop: '4px' }}>{item.description}</div>}
                            </div>
                        </div>
                    ))}
                 </div>
            ))}
        </div>
    );
};

export default TemplateMinimal;