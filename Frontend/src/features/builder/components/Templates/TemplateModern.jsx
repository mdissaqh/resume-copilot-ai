import { validateAndFormatURL } from '../../../../utils/urlValidator';
import { templateConfig } from '../../../../utils/templateConfig';
import styles from '../../styles/Templates.module.css';

const TemplateModern = ({ data }) => {
    const config = templateConfig.modern;
    
    const renderContactLinks = () => {
        const items = [data.personalInfo?.email, data.personalInfo?.phone, data.personalInfo?.location].filter(Boolean);
        const links = data.personalInfo?.links || [];
        
        return (
            <div className={styles.contactWrapperModern} style={{ justifyContent: config.headerAlign }}>
                {items.map((item, i) => (
                    <span key={i} className={styles.contactItemModern}>{item}</span>
                ))}
                {links.map((link, i) => {
                    const validUrl = validateAndFormatURL(link.url);
                    return validUrl ? (
                        <a key={`link-${i}`} href={validUrl} target="_blank" rel="noreferrer" className={styles.linkItemModern}>
                            {link.platform}
                        </a>
                    ) : null;
                })}
            </div>
        );
    };

    return (
        <div className={`${styles.document} ${styles.fontModern}`}>
            <div className={styles.nameModern} style={{ textAlign: config.headerAlign }}>{data.personalInfo?.fullName}</div>
            {renderContactLinks()}

            {data.professionalSummary && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleModern}>Professional Summary</div>
                    <div className={styles.summaryText}>{data.professionalSummary}</div>
                </div>
            )}

            {data.experience?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleModern}>Experience</div>
                    {data.experience.map((exp, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span className={styles.boldModern}>{exp.role}</span>
                                <span className={styles.dateTextModern}>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className={styles.orgTextModern}>
                                {exp.organization} {exp.location ? `| ${exp.location}` : ''}
                            </div>
                            <ul className={styles.bulletsModern}>
                                {exp.achievements?.map((ach, j) => <li key={j}>{ach}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.projects?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleModern}>Projects</div>
                    {data.projects.map((proj, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span className={styles.boldModern}>{proj.title}</span>
                                <span className={styles.dateTextModern}>{proj.date}</span>
                            </div>
                            <div className={styles.flexBetween}>
                                <span className={styles.orgTextModern}>{proj.description}</span>
                                <div className={styles.projectLinks}>
                                    {validateAndFormatURL(proj.githubUrl) && <a href={validateAndFormatURL(proj.githubUrl)} target="_blank" rel="noreferrer" className={styles.linkItemModern}>GitHub</a>}
                                    {validateAndFormatURL(proj.liveUrl) && <a href={validateAndFormatURL(proj.liveUrl)} target="_blank" rel="noreferrer" className={styles.linkItemModern}>Live Demo</a>}
                                </div>
                            </div>
                            <ul className={styles.bulletsModern}>
                                {proj.highlights?.map((ach, j) => <li key={j}>{ach}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {data.education?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleModern}>Education</div>
                    {data.education.map((edu, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.flexBetween}>
                                <span className={styles.boldModern}>{edu.institution}</span>
                                <span className={styles.dateTextModern}>{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <div>
                                {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.skills?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleModern}>Skills</div>
                    <div className={styles.skillsContainer}>
                        {data.skills.map((skillGroup, i) => (
                            <div key={i} className={styles.skillRow}>
                                <span className={styles.boldModern}>{skillGroup.category}: </span>
                                <span>{skillGroup.items?.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateModern;