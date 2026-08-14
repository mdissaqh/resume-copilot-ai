import { useState, useEffect } from 'react';
import styles from '../../styles/Editor.module.css';

const Editor = ({ resumeData, onChange, analysisResults }) => {
    const [localData, setLocalData] = useState(resumeData);

    useEffect(() => {
        setLocalData(resumeData);
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
        
        // Debounce external change
        const handler = setTimeout(() => {
            onChange(path, value);
        }, 300);
        return () => clearTimeout(handler);
    };

    const handleArrayTextChange = (path, value) => {
        const arrayValue = value.split('\n').filter(line => line.trim() !== '');
        handleTextChange(path, arrayValue);
    };

    const missingInfo = analysisResults?.missingInformation || [];

    return (
        <div className={styles.editorContainer}>
            {/* Personal Info */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input className={styles.input} value={localData.personalInfo?.fullName || ''} onChange={(e) => handleTextChange(['personalInfo', 'fullName'], e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input className={styles.input} value={localData.personalInfo?.email || ''} onChange={(e) => handleTextChange(['personalInfo', 'email'], e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input className={styles.input} value={localData.personalInfo?.phone || ''} onChange={(e) => handleTextChange(['personalInfo', 'phone'], e.target.value)} />
                    </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', marginTop: '16px', marginBottom: '8px' }}>Professional Links</h4>
                {localData.personalInfo?.links?.map((link, index) => (
                    <div key={index} className={styles.grid} style={{ marginBottom: '8px' }}>
                        <div className={styles.formGroup}>
                            <input className={styles.input} placeholder="Platform (e.g., LinkedIn)" value={link.platform || ''} onChange={(e) => handleTextChange(['personalInfo', 'links', index, 'platform'], e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <input className={styles.input} placeholder="URL" value={link.url || ''} onChange={(e) => handleTextChange(['personalInfo', 'links', index, 'url'], e.target.value)} />
                        </div>
                    </div>
                ))}
                
                {missingInfo.filter(info => info.field === 'linkedin' || info.field === 'portfolio').map((info, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f0f7ff', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <span style={{ color: '#0066ff', fontWeight: 'bold' }}>💡 Recommended:</span> Add your {info.label} ({info.reason})
                    </div>
                ))}
            </div>

            {/* Experience */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Experience</h3>
                {localData.experience?.map((exp, index) => (
                    <div key={index} className={styles.arrayItem}>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}><label>Organization</label><input className={styles.input} value={exp.organization || ''} onChange={(e) => handleTextChange(['experience', index, 'organization'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Role</label><input className={styles.input} value={exp.role || ''} onChange={(e) => handleTextChange(['experience', index, 'role'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Start Date</label><input className={styles.input} value={exp.startDate || ''} onChange={(e) => handleTextChange(['experience', index, 'startDate'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>End Date</label><input className={styles.input} value={exp.endDate || ''} onChange={(e) => handleTextChange(['experience', index, 'endDate'], e.target.value)} /></div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Achievements (One per line)</label>
                            <textarea className={styles.textarea} value={exp.achievements?.join('\n') || ''} onChange={(e) => handleArrayTextChange(['experience', index, 'achievements'], e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Projects */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Projects</h3>
                {localData.projects?.map((proj, index) => (
                    <div key={index} className={styles.arrayItem}>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}><label>Project Title</label><input className={styles.input} value={proj.title || ''} onChange={(e) => handleTextChange(['projects', index, 'title'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Date</label><input className={styles.input} value={proj.date || ''} onChange={(e) => handleTextChange(['projects', index, 'date'], e.target.value)} /></div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea className={styles.textarea} style={{ minHeight: '60px' }} value={proj.description || ''} onChange={(e) => handleTextChange(['projects', index, 'description'], e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Highlights / Technical Details (One per line)</label>
                            <textarea className={styles.textarea} value={proj.highlights?.join('\n') || ''} onChange={(e) => handleArrayTextChange(['projects', index, 'highlights'], e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Skills</h3>
                {localData.skills?.map((skill, index) => (
                    <div key={index} className={styles.arrayItem}>
                        <div className={styles.formGroup}><label>Category</label><input className={styles.input} value={skill.category || ''} onChange={(e) => handleTextChange(['skills', index, 'category'], e.target.value)} /></div>
                        <div className={styles.formGroup}>
                            <label>Items (Comma separated)</label>
                            <input className={styles.input} value={skill.items?.join(', ') || ''} onChange={(e) => handleTextChange(['skills', index, 'items'], e.target.value.split(',').map(s=>s.trim()))} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Editor;