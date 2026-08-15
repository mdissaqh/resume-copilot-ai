import React, { useState, useEffect, useRef } from 'react';
import { 
    Trash2, Plus, Link as LinkIcon, Briefcase, GraduationCap, 
    Code, FolderGit2, Award, ChevronDown, ChevronUp, User, Zap, LayoutList 
} from 'lucide-react';
import { normalizeResumeData } from '../../../../utils/resumeNormalizer';
import { setIn, pushIn, removeIn } from '../../utils/pathHelpers';
import styles from '../../styles/Editor.module.css';

const SectionAccordion = ({ id, title, icon: Icon, badgeCount, isOpen, onToggle, children }) => {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionHeader} onClick={() => onToggle(id)}>
                <div className={styles.sectionTitleWrap}>
                    <div className={styles.sectionIcon}><Icon size={20} /></div>
                    <h3 className={styles.sectionTitle}>{title}</h3>
                    {badgeCount > 0 && <span className={styles.sectionBadge}>{badgeCount}</span>}
                </div>
                {isOpen ? <ChevronUp className={styles.chevron} size={20} /> : <ChevronDown className={styles.chevron} size={20} />}
            </div>
            {isOpen && <div className={styles.sectionContent}>{children}</div>}
        </div>
    );
};

const Editor = ({ resumeData, onChange, analysisResults, initialFocus }) => {
    const [localData, setLocalData] = useState(() => normalizeResumeData(resumeData));
    
    // 1. Dynamically expand the section the user requested from the Analysis page
    const [expandedSections, setExpandedSections] = useState({ 
        [initialFocus || 'personalInfo']: true 
    });

    // 2. Refs for sync management
    const debounceTimer = useRef(null);
    const lastPushedData = useRef(normalizeResumeData(resumeData));

    // 3. The Sync Loop Protector: Only overwrite local typing if the incoming data is genuinely new
    useEffect(() => {
        const normalizedParent = normalizeResumeData(resumeData);
        // Compare parent data against the last data we pushed.
        // If they differ, the parent changed via AI Action, Template Swap, or Initial Load.
        if (JSON.stringify(normalizedParent) !== JSON.stringify(lastPushedData.current)) {
            setLocalData(normalizedParent);
            lastPushedData.current = normalizedParent;
        }
    }, [resumeData]);

    // 4. Safe Dispatcher: Updates local UI instantly, debounces upward to parent/PDF
    const dispatchChange = (newData) => {
        setLocalData(newData);
        
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        debounceTimer.current = setTimeout(() => {
            lastPushedData.current = newData; // Record what we are sending to prevent echo overwrites
            onChange(newData);
        }, 800);
    };

    // 5. Immutable Path Updaters
    const handleTextChange = (pathArray, value) => dispatchChange(setIn(localData, pathArray, value));
    
    const handleArrayTextChange = (pathArray, value) => {
        const arrayValue = value.split('\n').filter(line => line.trim() !== '');
        dispatchChange(setIn(localData, pathArray, arrayValue));
    };

    const addArrayItem = (pathArray, emptyObj) => dispatchChange(pushIn(localData, pathArray, emptyObj));
    const removeArrayItem = (pathArray, index) => dispatchChange(removeIn(localData, pathArray, index));

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    // --- PERSONA-BASED ORDERING LOGIC ---
    const persona = localData?.metadata?.persona || 'experienced';
    
    const getSectionOrder = () => {
        const base = ['personalInfo'];
        if (persona === 'fresher') {
            return [...base, 'education', 'projects', 'skills', 'experience', 'certifications', 'achievements', 'additionalSections'];
        } else if (persona === 'career-changer') {
            return [...base, 'professionalSummary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'additionalSections'];
        }
        return [...base, 'professionalSummary', 'experience', 'skills', 'education', 'projects', 'certifications', 'achievements', 'additionalSections'];
    };

    // --- SECTION RENDERERS ---

    const renderPersonalInfo = () => (
        <SectionAccordion id="personalInfo" title="Personal Information" icon={User} badgeCount={0} isOpen={expandedSections['personalInfo']} onToggle={toggleSection}>
            <div className={styles.grid}>
                <div className={styles.formGroup}><label>Full Name *</label><input className={styles.input} placeholder="e.g. Jane Doe" value={localData.personalInfo.fullName || ''} onChange={(e) => handleTextChange(['personalInfo', 'fullName'], e.target.value)} /></div>
                <div className={styles.formGroup}><label>Email *</label><input className={styles.input} placeholder="jane@example.com" value={localData.personalInfo.email || ''} onChange={(e) => handleTextChange(['personalInfo', 'email'], e.target.value)} /></div>
                <div className={styles.formGroup}><label>Phone (Optional)</label><input className={styles.input} placeholder="+1 234 567 8900" value={localData.personalInfo.phone || ''} onChange={(e) => handleTextChange(['personalInfo', 'phone'], e.target.value)} /></div>
                <div className={styles.formGroup}><label>Location (Optional)</label><input className={styles.input} placeholder="City, State" value={localData.personalInfo.location || ''} onChange={(e) => handleTextChange(['personalInfo', 'location'], e.target.value)} /></div>
            </div>
            
            <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Professional Links</label>
                {localData.personalInfo.links?.map((link, index) => (
                    <div key={`link-${index}`} className={styles.gridArray}>
                        <input className={styles.input} placeholder="Platform (e.g. LinkedIn)" value={link.platform || ''} onChange={(e) => handleTextChange(['personalInfo', 'links', index, 'platform'], e.target.value)} />
                        <input className={styles.input} placeholder="https://..." value={link.url || ''} onChange={(e) => handleTextChange(['personalInfo', 'links', index, 'url'], e.target.value)} />
                        <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['personalInfo', 'links'], index)} title="Remove Link"><Trash2 size={18} /></button>
                    </div>
                ))}
                <button className={styles.actionBtn} style={{ alignSelf: 'flex-start' }} onClick={() => addArrayItem(['personalInfo', 'links'], { platform: '', url: '' })}>
                    <Plus size={16} /> Add Link (LinkedIn, GitHub, Portfolio)
                </button>
            </div>
        </SectionAccordion>
    );

    const renderSummary = () => (
        <SectionAccordion id="professionalSummary" title="Professional Summary" icon={User} badgeCount={0} isOpen={expandedSections['professionalSummary']} onToggle={toggleSection}>
            <div className={styles.formGroup}>
                <label>Summary (Keep it concise, 2-3 sentences max)</label>
                <textarea className={styles.textarea} placeholder="Experienced software engineer specializing in scalable backend systems..." value={localData.professionalSummary || ''} onChange={(e) => handleTextChange(['professionalSummary'], e.target.value)} />
            </div>
        </SectionAccordion>
    );

    const renderExperience = () => (
        <SectionAccordion id="experience" title="Experience" icon={Briefcase} badgeCount={localData.experience?.length || 0} isOpen={expandedSections['experience']} onToggle={toggleSection}>
            {localData.experience?.length === 0 ? (
                <div className={styles.emptyState}>
                    <Briefcase size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Highlight your professional history and measurable impact.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['experience'], { organization: '', role: '', startDate: '', endDate: '', achievements: [] })}><Plus size={18} /> Add Experience</button>
                </div>
            ) : (
                <>
                    {localData.experience?.map((exp, index) => (
                        <div key={`exp-${index}`} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemTitle}>{exp.role || 'New Role'} at {exp.organization || 'Company'}</span>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['experience'], index)}><Trash2 size={18} /></button>
                            </div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}><label>Job Title</label><input className={styles.input} value={exp.role || ''} onChange={(e) => handleTextChange(['experience', index, 'role'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Company / Organization</label><input className={styles.input} value={exp.organization || ''} onChange={(e) => handleTextChange(['experience', index, 'organization'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Start Date</label><input className={styles.input} placeholder="Jan 2020" value={exp.startDate || ''} onChange={(e) => handleTextChange(['experience', index, 'startDate'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>End Date</label><input className={styles.input} placeholder="Present" value={exp.endDate || ''} onChange={(e) => handleTextChange(['experience', index, 'endDate'], e.target.value)} /></div>
                            </div>
                            
                            {/* Progressive Disclosure */}
                            {exp.location !== undefined ? (
                                <div className={styles.formGroup}><label>Location (Optional)</label><input className={styles.input} value={exp.location || ''} onChange={(e) => handleTextChange(['experience', index, 'location'], e.target.value)} /></div>
                            ) : null}

                            <div className={styles.formGroup}>
                                <label>Key Achievements (One per line)</label>
                                <textarea className={styles.textarea} placeholder="• Improved API response times by 40%..." value={exp.achievements?.join('\n') || ''} onChange={(e) => handleArrayTextChange(['experience', index, 'achievements'], e.target.value)} />
                            </div>

                            <div className={styles.progressiveActions}>
                                {exp.location === undefined && (
                                    <button className={styles.actionBtn} onClick={() => handleTextChange(['experience', index, 'location'], '')}><Plus size={14} /> Add Location</button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['experience'], { organization: '', role: '', startDate: '', endDate: '', achievements: [] })}><Plus size={18} /> Add Another Role</button>
                </>
            )}
        </SectionAccordion>
    );

    const renderProjects = () => (
        <SectionAccordion id="projects" title="Projects" icon={FolderGit2} badgeCount={localData.projects?.length || 0} isOpen={expandedSections['projects']} onToggle={toggleSection}>
            {localData.projects?.length === 0 ? (
                <div className={styles.emptyState}>
                    <FolderGit2 size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Projects demonstrate practical skills. Highly recommended for tech roles and students.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['projects'], { title: '', description: '', highlights: [] })}><Plus size={18} /> Add Project</button>
                </div>
            ) : (
                <>
                    {localData.projects?.map((proj, index) => (
                        <div key={`proj-${index}`} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemTitle}>{proj.title || 'New Project'}</span>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['projects'], index)}><Trash2 size={18} /></button>
                            </div>
                            <div className={styles.formGroup}><label>Project Name</label><input className={styles.input} value={proj.title || ''} onChange={(e) => handleTextChange(['projects', index, 'title'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Brief Description</label><textarea className={styles.textarea} style={{minHeight: '60px'}} value={proj.description || ''} onChange={(e) => handleTextChange(['projects', index, 'description'], e.target.value)} /></div>
                            
                            {/* Progressive Disclosure Fields */}
                            <div className={styles.grid}>
                                {proj.date !== undefined && <div className={styles.formGroup}><label>Date</label><input className={styles.input} value={proj.date || ''} onChange={(e) => handleTextChange(['projects', index, 'date'], e.target.value)} /></div>}
                                {proj.githubUrl !== undefined && <div className={styles.formGroup}><label>GitHub URL</label><input className={styles.input} value={proj.githubUrl || ''} onChange={(e) => handleTextChange(['projects', index, 'githubUrl'], e.target.value)} /></div>}
                                {proj.liveUrl !== undefined && <div className={styles.formGroup}><label>Live Demo URL</label><input className={styles.input} value={proj.liveUrl || ''} onChange={(e) => handleTextChange(['projects', index, 'liveUrl'], e.target.value)} /></div>}
                            </div>

                            {proj.highlights !== undefined && (
                                <div className={styles.formGroup}>
                                    <label>Technical Details / Highlights (One per line)</label>
                                    <textarea className={styles.textarea} value={proj.highlights?.join('\n') || ''} onChange={(e) => handleArrayTextChange(['projects', index, 'highlights'], e.target.value)} />
                                </div>
                            )}

                            <div className={styles.progressiveActions}>
                                {proj.date === undefined && <button className={styles.actionBtn} onClick={() => handleTextChange(['projects', index, 'date'], '')}><Plus size={14} /> Add Date</button>}
                                {proj.githubUrl === undefined && <button className={styles.actionBtn} onClick={() => handleTextChange(['projects', index, 'githubUrl'], '')}><Plus size={14} /> Add GitHub Link</button>}
                                {proj.liveUrl === undefined && <button className={styles.actionBtn} onClick={() => handleTextChange(['projects', index, 'liveUrl'], '')}><Plus size={14} /> Add Live Demo Link</button>}
                                {proj.highlights === undefined && <button className={styles.actionBtn} onClick={() => handleTextChange(['projects', index, 'highlights'], [])}><Plus size={14} /> Add Bullet Points</button>}
                            </div>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['projects'], { title: '', description: '' })}><Plus size={18} /> Add Another Project</button>
                </>
            )}
        </SectionAccordion>
    );

    const renderEducation = () => (
        <SectionAccordion id="education" title="Education" icon={GraduationCap} badgeCount={localData.education?.length || 0} isOpen={expandedSections['education']} onToggle={toggleSection}>
            {localData.education?.length === 0 ? (
                <div className={styles.emptyState}>
                    <GraduationCap size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Add your degrees and academic qualifications.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['education'], { institution: '', degree: '' })}><Plus size={18} /> Add Education</button>
                </div>
            ) : (
                <>
                    {localData.education?.map((edu, index) => (
                        <div key={`edu-${index}`} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemTitle}>{edu.institution || 'New Institution'}</span>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['education'], index)}><Trash2 size={18} /></button>
                            </div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}><label>Institution / University</label><input className={styles.input} value={edu.institution || ''} onChange={(e) => handleTextChange(['education', index, 'institution'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Degree (e.g. B.S., B.A.)</label><input className={styles.input} value={edu.degree || ''} onChange={(e) => handleTextChange(['education', index, 'degree'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Field of Study / Major</label><input className={styles.input} value={edu.fieldOfStudy || ''} onChange={(e) => handleTextChange(['education', index, 'fieldOfStudy'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Graduation Date</label><input className={styles.input} placeholder="May 2024" value={edu.endDate || ''} onChange={(e) => handleTextChange(['education', index, 'endDate'], e.target.value)} /></div>
                                
                                {/* Progressive */}
                                {edu.location !== undefined && <div className={styles.formGroup}><label>Location</label><input className={styles.input} value={edu.location || ''} onChange={(e) => handleTextChange(['education', index, 'location'], e.target.value)} /></div>}
                                {edu.startDate !== undefined && <div className={styles.formGroup}><label>Start Date</label><input className={styles.input} value={edu.startDate || ''} onChange={(e) => handleTextChange(['education', index, 'startDate'], e.target.value)} /></div>}
                            </div>
                            
                            <div className={styles.progressiveActions}>
                                {edu.location === undefined && <button className={styles.actionBtn} onClick={() => handleTextChange(['education', index, 'location'], '')}><Plus size={14} /> Add Location</button>}
                                {edu.startDate === undefined && <button className={styles.actionBtn} onClick={() => handleTextChange(['education', index, 'startDate'], '')}><Plus size={14} /> Add Start Date</button>}
                            </div>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['education'], { institution: '', degree: '' })}><Plus size={18} /> Add Another Degree</button>
                </>
            )}
        </SectionAccordion>
    );

    const renderSkills = () => (
        <SectionAccordion id="skills" title="Skills" icon={Code} badgeCount={localData.skills?.length || 0} isOpen={expandedSections['skills']} onToggle={toggleSection}>
             {localData.skills?.length === 0 ? (
                <div className={styles.emptyState}>
                    <Code size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Add skills to align with ATS keywords.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['skills'], { category: 'Languages', items: [] })}><Plus size={18} /> Add Skill Group</button>
                </div>
            ) : (
                <>
                    {localData.skills?.map((skill, index) => (
                        <div key={`skill-${index}`} className={styles.itemCard}>
                            <div className={styles.itemHeader} style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 8}}>
                                <span className={styles.itemTitle}>{skill.category || 'New Category'}</span>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['skills'], index)}><Trash2 size={18} /></button>
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: '12px' }}><label>Category (e.g. Frameworks, Tools)</label><input className={styles.input} value={skill.category || ''} onChange={(e) => handleTextChange(['skills', index, 'category'], e.target.value)} /></div>
                            <div className={styles.formGroup}>
                                <label>Skills (Comma separated)</label>
                                <input className={styles.input} placeholder="React, Node.js, AWS" value={skill.items?.join(', ') || ''} onChange={(e) => handleTextChange(['skills', index, 'items'], e.target.value.split(',').map(s=>s.trim()))} />
                            </div>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['skills'], { category: '', items: [] })}><Plus size={18} /> Add Another Category</button>
                </>
            )}
        </SectionAccordion>
    );

    const renderCertifications = () => (
        <SectionAccordion id="certifications" title="Certifications" icon={Award} badgeCount={localData.certifications?.length || 0} isOpen={expandedSections['certifications']} onToggle={toggleSection}>
             {localData.certifications?.length === 0 ? (
                <div className={styles.emptyState}>
                    <Award size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Licenses and certifications can strengthen your credibility.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['certifications'], { name: '', issuer: '' })}><Plus size={18} /> Add Certification</button>
                </div>
            ) : (
                <>
                    {localData.certifications?.map((cert, index) => (
                        <div key={`cert-${index}`} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemTitle}>{cert.name || 'New Certification'}</span>
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['certifications'], index)}><Trash2 size={18} /></button>
                            </div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}><label>Certification Name</label><input className={styles.input} value={cert.name || ''} onChange={(e) => handleTextChange(['certifications', index, 'name'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Issuing Organization</label><input className={styles.input} value={cert.issuer || ''} onChange={(e) => handleTextChange(['certifications', index, 'issuer'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Date</label><input className={styles.input} value={cert.date || ''} onChange={(e) => handleTextChange(['certifications', index, 'date'], e.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['certifications'], { name: '', issuer: '' })}><Plus size={18} /> Add Another Certification</button>
                </>
            )}
        </SectionAccordion>
    );

    const renderAchievements = () => (
        <SectionAccordion id="achievements" title="Achievements & Awards" icon={Zap} badgeCount={localData.achievements?.length || 0} isOpen={expandedSections['achievements']} onToggle={toggleSection}>
             {localData.achievements?.length === 0 ? (
                <div className={styles.emptyState}>
                    <Zap size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Add notable standalone awards or recognitions.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['achievements'], '')}><Plus size={18} /> Add Achievement</button>
                </div>
            ) : (
                <div className={styles.formGroup}>
                    {localData.achievements?.map((ach, index) => (
                        <div key={`ach-${index}`} className={styles.gridArray} style={{ gridTemplateColumns: '1fr auto', marginBottom: '8px' }}>
                            <input className={styles.input} value={ach || ''} onChange={(e) => handleTextChange(['achievements', index], e.target.value)} />
                            <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['achievements'], index)}><Trash2 size={18} /></button>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} style={{ marginTop: '8px' }} onClick={() => addArrayItem(['achievements'], '')}><Plus size={18} /> Add Another</button>
                </div>
            )}
        </SectionAccordion>
    );

    const renderAdditionalSections = () => (
        <SectionAccordion id="additionalSections" title="Custom Sections" icon={LayoutList} badgeCount={localData.additionalSections?.length || 0} isOpen={expandedSections['additionalSections']} onToggle={toggleSection}>
            {localData.additionalSections?.length === 0 ? (
                <div className={styles.emptyState}>
                    <LayoutList size={32} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Add custom sections like Volunteering, Publications, or Languages.</p>
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['additionalSections'], { sectionTitle: '', items: [] })}><Plus size={18} /> Add Custom Section</button>
                </div>
            ) : (
                <>
                    {localData.additionalSections?.map((section, index) => (
                        <div key={`custom-${index}`} className={styles.itemCard}>
                            <div className={styles.itemHeader} style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 12}}>
                                <input className={styles.input} style={{fontWeight: 600, fontSize: '1rem', flex: 1, marginRight: '12px'}} placeholder="Section Title (e.g. Volunteer Work)" value={section.sectionTitle || ''} onChange={(e) => handleTextChange(['additionalSections', index, 'sectionTitle'], e.target.value)} />
                                <button className={styles.iconBtnDanger} onClick={() => removeArrayItem(['additionalSections'], index)}><Trash2 size={18} /></button>
                            </div>
                            
                            {section.items?.map((item, iIndex) => (
                                <div key={`custom-item-${iIndex}`} className={styles.itemCard} style={{backgroundColor: '#ffffff', padding: '16px', marginBottom: '12px'}}>
                                     <button className={styles.removeAbsoluteBtn} onClick={() => removeArrayItem(['additionalSections', index, 'items'], iIndex)} title="Remove Item"><Trash2 size={16} /></button>
                                     <div className={styles.grid}>
                                        <div className={styles.formGroup}><label>Heading</label><input className={styles.input} value={item.heading || ''} onChange={(e) => handleTextChange(['additionalSections', index, 'items', iIndex, 'heading'], e.target.value)} /></div>
                                        <div className={styles.formGroup}><label>Subheading</label><input className={styles.input} value={item.subheading || ''} onChange={(e) => handleTextChange(['additionalSections', index, 'items', iIndex, 'subheading'], e.target.value)} /></div>
                                        <div className={styles.formGroup}><label>Date</label><input className={styles.input} value={item.date || ''} onChange={(e) => handleTextChange(['additionalSections', index, 'items', iIndex, 'date'], e.target.value)} /></div>
                                     </div>
                                     <div className={styles.formGroup}>
                                        <label>Description</label>
                                        <textarea className={styles.textarea} style={{minHeight: '60px'}} value={item.description || ''} onChange={(e) => handleTextChange(['additionalSections', index, 'items', iIndex, 'description'], e.target.value)} />
                                     </div>
                                </div>
                            ))}
                            <button className={styles.actionBtn} onClick={() => addArrayItem(['additionalSections', index, 'items'], { heading: '', subheading: '', date: '', description: '' })}><Plus size={14} /> Add Item</button>
                        </div>
                    ))}
                    <button className={styles.primaryAddBtn} onClick={() => addArrayItem(['additionalSections'], { sectionTitle: '', items: [] })}><Plus size={18} /> Add Another Custom Section</button>
                </>
            )}
        </SectionAccordion>
    );

    const renderMap = {
        personalInfo: renderPersonalInfo,
        professionalSummary: renderSummary,
        experience: renderExperience,
        projects: renderProjects,
        education: renderEducation,
        skills: renderSkills,
        certifications: renderCertifications,
        achievements: renderAchievements,
        additionalSections: renderAdditionalSections
    };

    return (
        <div className={styles.editorContainer}>
            {getSectionOrder().map(sectionId => (
                <React.Fragment key={sectionId}>
                    {renderMap[sectionId]()}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Editor;