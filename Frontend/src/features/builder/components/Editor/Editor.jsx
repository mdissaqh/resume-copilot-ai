import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Link as LinkIcon, Briefcase, GraduationCap, Code, FolderGit2, Award, Zap } from 'lucide-react';
import { normalizeResumeData } from '../../../../utils/resumeNormalizer';
import styles from '../../styles/Editor.module.css';

const Editor = ({ resumeData, onChange, analysisResults }) => {
    const [localData, setLocalData] = useState(normalizeResumeData(resumeData));

    useEffect(() => {
        setLocalData(normalizeResumeData(resumeData));
    }, [resumeData]);

    const handleTextChange = (path, value) => {
        const newData = JSON.parse(JSON.stringify(localData));
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
            if (current[path[i]] === undefined) current[path[i]] = {};
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setLocalData(newData);
        
        // Debounce update to prevent heavy PDF regeneration on every keystroke
        const handler = setTimeout(() => { onChange(path, value); }, 500);
        return () => clearTimeout(handler);
    };

    const handleArrayTextChange = (path, value) => {
        const arrayValue = value.split('\n').filter(line => line.trim() !== '');
        handleTextChange(path, arrayValue);
    };

    const addArrayItem = (path, emptyObj) => {
        const newData = JSON.parse(JSON.stringify(localData));
        if (!newData[path]) newData[path] = [];
        newData[path].push(emptyObj);
        setLocalData(newData);
        onChange([path], newData[path]);
    };

    const removeArrayItem = (path, index) => {
        const newData = JSON.parse(JSON.stringify(localData));
        if (newData[path]) {
            newData[path].splice(index, 1);
            setLocalData(newData);
            onChange([path], newData[path]);
        }
    };

    // Safely extract AI editor recommendations
    const recommendations = Array.isArray(analysisResults?.editorRecommendations) ? analysisResults.editorRecommendations : [];

    return (
        <div className={styles.editorContainer}>
            {/* Personal Info */}
            <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}><label>Full Name</label><input className={styles.input} value={localData.personalInfo.fullName} onChange={(e) => handleTextChange(['personalInfo', 'fullName'], e.target.value)} /></div>
                    <div className={styles.formGroup}><label>Email</label><input className={styles.input} value={localData.personalInfo.email} onChange={(e) => handleTextChange(['personalInfo', 'email'], e.target.value)} /></div>
                    <div className={styles.formGroup}><label>Phone</label><input className={styles.input} value={localData.personalInfo.phone} onChange={(e) => handleTextChange(['personalInfo', 'phone'], e.target.value)} /></div>
                    <div className={styles.formGroup}><label>Location</label><input className={styles.input} value={localData.personalInfo.location} onChange={(e) => handleTextChange(['personalInfo', 'location'], e.target.value)} /></div>
                </div>

                <div className={styles.sectionHeaderFlex} style={{ marginTop: '24px' }}>
                    <h4 className={styles.subTitle}><LinkIcon size={16} /> Professional Links</h4>
                    <button className={styles.addBtn} onClick={() => addArrayItem('personalInfo.links', { platform: '', url: '' })}><Plus size={16} /> Add Link</button>
                </div>
                
                {localData.personalInfo.links.map((link, index) => (
                    <div key={index} className={styles.gridArray}>
                        <div className={styles.formGroup}><input className={styles.input} placeholder="Platform (e.g., LinkedIn)" value={link.platform} onChange={(e) => handleTextChange(['personalInfo', 'links', index, 'platform'], e.target.value)} /></div>
                        <div className={styles.formGroup}><input className={styles.input} placeholder="https://..." value={link.url} onChange={(e) => handleTextChange(['personalInfo', 'links', index, 'url'], e.target.value)} /></div>
                        <button className={styles.iconBtnDanger} onClick={() => removeArrayItem('personalInfo.links', index)} title="Remove Link"><Trash2 size={18} /></button>
                    </div>
                ))}
                
                {/* Dynamic AI UI: Personal Info Recommendations */}
                {recommendations.filter(r => r.section === 'personalInfo' && r.action === 'ADD_INPUT').map((rec, idx) => (
                    <div key={`rec-pi-${idx}`} className={styles.recommendationBanner}>
                        <div className={styles.recText}><strong>💡 General ATS Advice:</strong> {rec.reason}</div>
                        <button className={styles.actionBtn} onClick={() => addArrayItem('personalInfo.links', { platform: rec.label, url: '' })}>+ Add {rec.label}</button>
                    </div>
                ))}
            </div>

            {/* Professional Summary */}
            <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Professional Summary</h3>
                <div className={styles.formGroup}>
                    <textarea className={styles.textarea} value={localData.professionalSummary} onChange={(e) => handleTextChange(['professionalSummary'], e.target.value)} />
                </div>
            </div>

            {/* Experience */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeaderFlex}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}><Briefcase size={20} /> Experience</h3>
                    <button className={styles.addBtn} onClick={() => addArrayItem('experience', { organization: '', role: '', startDate: '', endDate: '', achievements: [] })}><Plus size={16} /> Add Experience</button>
                </div>
                {localData.experience.map((exp, index) => (
                    <div key={index} className={styles.itemCard}>
                        <button className={styles.removeAbsoluteBtn} onClick={() => removeArrayItem('experience', index)} title="Remove Experience"><Trash2 size={18} /></button>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}><label>Organization</label><input className={styles.input} value={exp.organization || ''} onChange={(e) => handleTextChange(['experience', index, 'organization'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Role</label><input className={styles.input} value={exp.role || ''} onChange={(e) => handleTextChange(['experience', index, 'role'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Start Date</label><input className={styles.input} value={exp.startDate || ''} onChange={(e) => handleTextChange(['experience', index, 'startDate'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>End Date</label><input className={styles.input} value={exp.endDate || ''} onChange={(e) => handleTextChange(['experience', index, 'endDate'], e.target.value)} /></div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Achievements / Responsibilities (One per line)</label>
                            <textarea className={styles.textarea} value={exp.achievements?.join('\n') || ''} onChange={(e) => handleArrayTextChange(['experience', index, 'achievements'], e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeaderFlex}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}><FolderGit2 size={20} /> Projects</h3>
                    <button className={styles.addBtn} onClick={() => addArrayItem('projects', { title: '', date: '', description: '', githubUrl: '', liveUrl: '', highlights: [] })}><Plus size={16} /> Add Project</button>
                </div>
                {localData.projects.map((proj, index) => {
                    // Check if AI specifically targets this project index for an addition
                    const projRecs = recommendations.filter(r => r.section === 'projects' && r.fieldTarget === `projects[${index}].${r.field}`);
                    
                    return (
                        <div key={index} className={styles.itemCard}>
                            <button className={styles.removeAbsoluteBtn} onClick={() => removeArrayItem('projects', index)} title="Remove Project"><Trash2 size={18} /></button>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}><label>Project Title</label><input className={styles.input} value={proj.title || ''} onChange={(e) => handleTextChange(['projects', index, 'title'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>Date (Optional)</label><input className={styles.input} value={proj.date || ''} onChange={(e) => handleTextChange(['projects', index, 'date'], e.target.value)} /></div>
                                <div className={styles.formGroup}><label>GitHub URL</label><input className={styles.input} value={proj.githubUrl || ''} onChange={(e) => handleTextChange(['projects', index, 'githubUrl'], e.target.value)} placeholder="https://..." /></div>
                                <div className={styles.formGroup}><label>Live URL</label><input className={styles.input} value={proj.liveUrl || ''} onChange={(e) => handleTextChange(['projects', index, 'liveUrl'], e.target.value)} placeholder="https://..." /></div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea className={styles.textarea} style={{ minHeight: '60px' }} value={proj.description || ''} onChange={(e) => handleTextChange(['projects', index, 'description'], e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Highlights / Technical Details (One per line)</label>
                                <textarea className={styles.textarea} value={proj.highlights?.join('\n') || ''} onChange={(e) => handleArrayTextChange(['projects', index, 'highlights'], e.target.value)} />
                            </div>
                            
                            {/* Dynamic AI UI: Project Specific Inputs */}
                            {projRecs.map((rec, rIdx) => (
                                <div key={rIdx} className={styles.recommendationBanner}>
                                    <div className={styles.recText}><strong>💡 General ATS Advice:</strong> {rec.reason}</div>
                                    {!proj[rec.field] && (
                                        <div className={styles.formGroup} style={{marginBottom: 0, marginTop: '10px'}}>
                                            <label>{rec.label}</label>
                                            <input className={styles.input} placeholder={rec.suggestedValue || "https://..."} onChange={(e) => handleTextChange(['projects', index, rec.field], e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Education */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeaderFlex}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}><GraduationCap size={20} /> Education</h3>
                    <button className={styles.addBtn} onClick={() => addArrayItem('education', { institution: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '' })}><Plus size={16} /> Add Education</button>
                </div>
                {localData.education.map((edu, index) => (
                    <div key={index} className={styles.itemCard}>
                        <button className={styles.removeAbsoluteBtn} onClick={() => removeArrayItem('education', index)} title="Remove Education"><Trash2 size={18} /></button>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}><label>Institution</label><input className={styles.input} value={edu.institution || ''} onChange={(e) => handleTextChange(['education', index, 'institution'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Degree / Qualification</label><input className={styles.input} value={edu.degree || ''} onChange={(e) => handleTextChange(['education', index, 'degree'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Field of Study</label><input className={styles.input} value={edu.fieldOfStudy || ''} onChange={(e) => handleTextChange(['education', index, 'fieldOfStudy'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Location</label><input className={styles.input} value={edu.location || ''} onChange={(e) => handleTextChange(['education', index, 'location'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Start Date</label><input className={styles.input} value={edu.startDate || ''} onChange={(e) => handleTextChange(['education', index, 'startDate'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>End Date</label><input className={styles.input} value={edu.endDate || ''} onChange={(e) => handleTextChange(['education', index, 'endDate'], e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeaderFlex}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}><Code size={20} /> Skills</h3>
                    <button className={styles.addBtn} onClick={() => addArrayItem('skills', { category: '', items: [] })}><Plus size={16} /> Add Skill Group</button>
                </div>
                {localData.skills.map((skill, index) => (
                    <div key={index} className={styles.itemCard}>
                        <button className={styles.removeAbsoluteBtn} onClick={() => removeArrayItem('skills', index)} title="Remove Skill"><Trash2 size={18} /></button>
                        <div className={styles.formGroup} style={{ marginBottom: '12px' }}><label>Category (e.g., Languages, Frameworks)</label><input className={styles.input} value={skill.category || ''} onChange={(e) => handleTextChange(['skills', index, 'category'], e.target.value)} /></div>
                        <div className={styles.formGroup}>
                            <label>Items (Comma separated)</label>
                            <input className={styles.input} value={skill.items?.join(', ') || ''} onChange={(e) => handleTextChange(['skills', index, 'items'], e.target.value.split(',').map(s=>s.trim()))} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Certifications */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeaderFlex}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}><Award size={20} /> Certifications</h3>
                    <button className={styles.addBtn} onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}><Plus size={16} /> Add Cert</button>
                </div>
                {localData.certifications.map((cert, index) => (
                    <div key={index} className={styles.itemCard}>
                        <button className={styles.removeAbsoluteBtn} onClick={() => removeArrayItem('certifications', index)} title="Remove Certification"><Trash2 size={18} /></button>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}><label>Certification Name</label><input className={styles.input} value={cert.name || ''} onChange={(e) => handleTextChange(['certifications', index, 'name'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Issuer</label><input className={styles.input} value={cert.issuer || ''} onChange={(e) => handleTextChange(['certifications', index, 'issuer'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Date</label><input className={styles.input} value={cert.date || ''} onChange={(e) => handleTextChange(['certifications', index, 'date'], e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Achievements */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionHeaderFlex}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}><Zap size={20} /> Achievements</h3>
                    <button className={styles.addBtn} onClick={() => addArrayItem('achievements', '')}><Plus size={16} /> Add Achievement</button>
                </div>
                {localData.achievements.map((ach, index) => (
                    <div key={index} className={styles.gridArray}>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}><input className={styles.input} value={ach || ''} onChange={(e) => handleTextChange(['achievements', index], e.target.value)} /></div>
                        <button className={styles.iconBtnDanger} onClick={() => removeArrayItem('achievements', index)} title="Remove"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Editor;