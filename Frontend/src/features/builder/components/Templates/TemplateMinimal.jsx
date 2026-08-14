import { validateAndFormatURL } from '../../../../utils/urlValidator';
import { templateConfig } from '../../../../utils/templateConfig';
import styles from '../../styles/Templates.module.css';

const TemplateMinimal = ({ data }) => {
    const config = templateConfig.minimal;
    
    const renderContactLinks = () => {
        const items = [data.personalInfo?.email, data.personalInfo?.phone, data.personalInfo?.location].filter(Boolean);
        const links = data.personalInfo?.links || [];
        
        return (
            <div className={styles.contactWrapperMinimal} style={{ justifyContent: config.headerAlign }}>
                {items.map((item, i) => (
                    <span key={i} className={styles.contactItemMinimal}>{item}</span>
                ))}
                {links.map((link, i) => {
                    const validUrl = validateAndFormatURL(link.url);
                    return validUrl ? (
                        <a key={`link-${i}`} href={validUrl} target="_blank" rel="noreferrer" className={styles.linkItemMinimal}>
                            {link.platform}
                        </a>
                    ) : null;
                })}
            </div>
        );
    };

    return (
        <div className={`${styles.document} ${styles.fontMinimal}`}>
            <div className={styles.nameMinimal} style={{ textAlign: config.headerAlign }}>{data.personalInfo?.fullName}</div>
            {renderContactLinks()}

            {data.professionalSummary && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleMinimal}>ABOUT</div>
                    <div className={styles.summaryText}>{data.professionalSummary}</div>
                </div>
            )}

            {data.experience?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleMinimal}>EXPERIENCE</div>
                    {data.experience.map((exp, i) => (
                        <div key={i} className={styles.flexRowMinimal}>
                            <div className={styles.leftColMinimal}>
                                <div>{exp.startDate}</div>
                                <div>{exp.endDate}</div>
                            </div>
                            <div className={styles.rightColMinimal}>
                                <div className={styles.boldMinimal}>{exp.role}</div>
                                <div className={styles.orgTextMinimal}>{exp.organization}</div>
                                <ul className={styles.bulletsMinimal}>
                                    {exp.achievements?.map((ach, j) => <li key={j}>{ach}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.projects?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleMinimal}>PROJECTS</div>
                    {data.projects.map((proj, i) => (
                        <div key={i} className={styles.flexRowMinimal}>
                            <div className={styles.leftColMinimal}>
                                <div>{proj.date}</div>
                            </div>
                            <div className={styles.rightColMinimal}>
                                <div className={styles.flexBetween}>
                                    <span className={styles.boldMinimal}>{proj.title}</span>
                                    <div className={styles.projectLinks}>
                                        {validateAndFormatURL(proj.githubUrl) && <a href={validateAndFormatURL(proj.githubUrl)} target="_blank" rel="noreferrer" className={styles.linkItemMinimal}>GitHub</a>}
                                        {validateAndFormatURL(proj.liveUrl) && <a href={validateAndFormatURL(proj.liveUrl)} target="_blank" rel="noreferrer" className={styles.linkItemMinimal}>Live Demo</a>}
                                    </div>
                                </div>
                                {proj.description && <div className={styles.orgTextMinimal}>{proj.description}</div>}
                                <ul className={styles.bulletsMinimal}>
                                    {proj.highlights?.map((ach, j) => <li key={j}>{ach}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.education?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleMinimal}>EDUCATION</div>
                    {data.education.map((edu, i) => (
                        <div key={i} className={styles.flexRowMinimal}>
                            <div className={styles.leftColMinimal}>
                                <div>{edu.startDate}</div>
                                <div>{edu.endDate}</div>
                            </div>
                            <div className={styles.rightColMinimal}>
                                <div className={styles.boldMinimal}>{edu.institution}</div>
                                <div>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.skills?.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitleMinimal}>EXPERTISE</div>
                    <div className={styles.skillsContainerMinimal}>
                        {data.skills.map((skillGroup, i) => (
                            <div key={i} className={styles.skillRowMinimal}>
                                <span className={styles.boldMinimal}>{skillGroup.category}</span> — <span>{skillGroup.items?.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateMinimal;