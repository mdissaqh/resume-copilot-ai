import styles from '../../styles/Editor.module.css';

const Editor = ({ resumeData, onChange }) => {
    
    const handleTextChange = (path, value) => {
        onChange(path, value);
    };

    const handleArrayTextChange = (path, value) => {
        const arrayValue = value.split('\n').filter(line => line.trim() !== '');
        onChange(path, arrayValue);
    };

    const moveItem = (arrayPath, array, index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === array.length - 1) return;
        const newArray = [...array];
        const temp = newArray[index];
        newArray[index] = newArray[index + direction];
        newArray[index + direction] = temp;
        onChange(arrayPath, newArray);
    };

    const deleteItem = (arrayPath, array, index) => {
        const newArray = array.filter((_, i) => i !== index);
        onChange(arrayPath, newArray);
    };

    return (
        <div>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input className={styles.input} value={resumeData.personalInfo?.fullName || ''} onChange={(e) => handleTextChange(['personalInfo', 'fullName'], e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input className={styles.input} value={resumeData.personalInfo?.email || ''} onChange={(e) => handleTextChange(['personalInfo', 'email'], e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input className={styles.input} value={resumeData.personalInfo?.phone || ''} onChange={(e) => handleTextChange(['personalInfo', 'phone'], e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Location</label>
                        <input className={styles.input} value={resumeData.personalInfo?.location || ''} onChange={(e) => handleTextChange(['personalInfo', 'location'], e.target.value)} />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Professional Summary</h3>
                <div className={styles.formGroup}>
                    <textarea className={styles.textarea} value={resumeData.professionalSummary || ''} onChange={(e) => handleTextChange(['professionalSummary'], e.target.value)} />
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Experience</h3>
                {resumeData.experience?.map((exp, index) => (
                    <div key={index} className={styles.arrayItem}>
                        <div className={styles.itemHeader}>
                            <button className={styles.controlBtn} onClick={() => moveItem(['experience'], resumeData.experience, index, -1)}>↑</button>
                            <button className={styles.controlBtn} onClick={() => moveItem(['experience'], resumeData.experience, index, 1)}>↓</button>
                            <button className={`${styles.controlBtn} ${styles.deleteBtn}`} onClick={() => deleteItem(['experience'], resumeData.experience, index)}>Remove</button>
                        </div>
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

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Education</h3>
                {resumeData.education?.map((edu, index) => (
                    <div key={index} className={styles.arrayItem}>
                        <div className={styles.itemHeader}>
                            <button className={styles.controlBtn} onClick={() => moveItem(['education'], resumeData.education, index, -1)}>↑</button>
                            <button className={styles.controlBtn} onClick={() => moveItem(['education'], resumeData.education, index, 1)}>↓</button>
                            <button className={`${styles.controlBtn} ${styles.deleteBtn}`} onClick={() => deleteItem(['education'], resumeData.education, index)}>Remove</button>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}><label>Institution</label><input className={styles.input} value={edu.institution || ''} onChange={(e) => handleTextChange(['education', index, 'institution'], e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Degree</label><input className={styles.input} value={edu.degree || ''} onChange={(e) => handleTextChange(['education', index, 'degree'], e.target.value)} /></div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Skills</h3>
                {resumeData.skills?.map((skill, index) => (
                    <div key={index} className={styles.arrayItem}>
                        <div className={styles.itemHeader}>
                            <button className={`${styles.controlBtn} ${styles.deleteBtn}`} onClick={() => deleteItem(['skills'], resumeData.skills, index)}>Remove</button>
                        </div>
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