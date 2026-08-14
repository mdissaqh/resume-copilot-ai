import { validateAndFormatURL } from '../../../../utils/urlValidator';
import { templateConfig } from '../../../../utils/templateConfig';
import styles from '../../styles/Templates.module.css';

const TemplateClassic = ({ data }) => {
    const config = templateConfig.classic;
    
    const renderContactLinks = () => {
        const items = [data.personalInfo?.email, data.personalInfo?.phone, data.personalInfo?.location].filter(Boolean);
        const links = data.personalInfo?.links || [];
        
        return (
            <div className={styles.contactWrapper} style={{ justifyContent: config.headerAlign }}>
                {items.map((item, i) => (
                    <span key={i} className={styles.contactItem}>{item}</span>
                ))}
                {links.map((link, i) => {
                    const validUrl = validateAndFormatURL(link.url);
                    return validUrl ? (
                        <a key={`link-${i}`} href={validUrl} target="_blank" rel="noreferrer" className={styles.linkItem}>
                            {link.platform}
                        </a>
                    ) : null;
                })}
            </div>
        );
    };

    return (
        <div className={`${styles.document} ${styles.fontClassic}`}>
            <div className={styles.name} style={{ textAlign: config.headerAlign }}>{data.personalInfo?.fullName}</div>
            {renderContactLinks()}

            {data.professionalSummary && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleClassic}>Professional Summary</div>
                    <div className={styles.summaryText}>{data.professionalSummary}</div>
                </div>
            )}

            {data.experience?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleClassic}>Experience</div>
                    {data.experience.map((exp, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span className={styles.bold}>{exp.role}</span>
                                <span className={styles.bold}>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className={styles.flexBetween}>
                                <span className={styles.italic}>{exp.organization}</span>
                                <span className={styles.italic}>{exp.location}</span>
                            </div>
                            <ul className={styles.bullets}>
                                {exp.achievements?.map((ach, j) => <li key={j}>{ach}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.projects?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleClassic}>Projects</div>
                    {data.projects.map((proj, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span className={styles.bold}>{proj.title}</span>
                                <span className={styles.bold}>{proj.date}</span>
                            </div>
                            <div className={styles.flexBetween}>
                                <span className={styles.italic}>{proj.description}</span>
                                <div className={styles.projectLinks}>
                                    {validateAndFormatURL(proj.githubUrl) && <a href={validateAndFormatURL(proj.githubUrl)} target="_blank" rel="noreferrer" className={styles.linkItem}>GitHub</a>}
                                    {validateAndFormatURL(proj.liveUrl) && <a href={validateAndFormatURL(proj.liveUrl)} target="_blank" rel="noreferrer" className={styles.linkItem}>Live Demo</a>}
                                </div>
                            </div>
                            <ul className={styles.bullets}>
                                {proj.highlights?.map((ach, j) => <li key={j}>{ach}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.education?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleClassic}>Education</div>
                    {data.education.map((edu, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span className={styles.bold}>{edu.institution}</span>
                                <span className={styles.bold}>{edu.location}</span>
                            </div>
                            <div className={styles.flexBetween}>
                                <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                                <span>{edu.startDate} - {edu.endDate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.skills?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleClassic}>Skills</div>
                    <div className={styles.skillsContainer}>
                        {data.skills.map((skillGroup, i) => (
                            <div key={i} className={styles.skillRow}>
                                <span className={styles.bold}>{skillGroup.category}: </span>
                                <span>{skillGroup.items?.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateClassic;