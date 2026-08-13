import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { generateResumeApi, saveResumeApi } from "../api/builder.api";
import Editor from "../components/Editor/Editor";
import Preview from "../components/Preview/Preview";
import styles from "../styles/BuilderPage.module.css";

const BuilderPage = () => {
    const { id } = useParams();
    const [dbResumeId, setDbResumeId] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState("editor");

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                const data = await generateResumeApi(id);
                setDbResumeId(data.resume._id);
                setResumeData(data.resume.content);
            } catch (err) {
                console.error("Generation failed:", err);
                setError("Failed to load or generate the resume.");
            } finally {
                setLoading(false);
            }
        };
        fetchAndGenerate();
    }, [id]);

    const updateResumeData = useCallback((pathArray, value) => {
        setResumeData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (let i = 0; i < pathArray.length - 1; i++) {
                if (current[pathArray[i]] === undefined) current[pathArray[i]] = {};
                current = current[pathArray[i]];
            }
            current[pathArray[pathArray.length - 1]] = value;
            return newData;
        });
        setIsDirty(true);
    }, []);

    const handleSave = async () => {
        if (!dbResumeId) return;
        setSaving(true);
        try {
            await saveResumeApi(dbResumeId, resumeData);
            setIsDirty(false);
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (error) return <div className={styles.errorBox}>{error}</div>;
    if (loading) return <div className={styles.loadingBox}><p>✨ Preparing your professional workspace...</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link to="/dashboard" className={styles.backLink}>&larr; Dashboard</Link>
                <div className={styles.headerActions}>
                    <span className={styles.statusText}>
                        {isDirty ? "Unsaved changes" : "All changes saved"}
                    </span>
                    <button className={styles.saveButton} onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? "Saving..." : "Save Resume"}
                    </button>
                </div>
            </div>
            
            {/* Mobile Tabs */}
            <div className={styles.mobileTabs}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'editor' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('editor')}
                >
                    ✎ Edit Resume
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    👁 Live Preview
                </button>
            </div>

            <div className={styles.workspace}>
                <div className={`${styles.editorPane} ${activeTab === 'editor' ? styles.paneActive : ''}`}>
                    <Editor resumeData={resumeData} onChange={updateResumeData} />
                </div>
                <div className={`${styles.previewPane} ${activeTab === 'preview' ? styles.paneActive : ''}`}>
                    <Preview resumeData={resumeData} />
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;