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
    const [templateId, setTemplateId] = useState("classic");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    
    const [step, setStep] = useState("select-template");
    const [activeTab, setActiveTab] = useState("editor");

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                const data = await generateResumeApi(id);
                setDbResumeId(data.resume._id);
                setResumeData(data.resume.content);
                if (data.resume.templateId) {
                    setTemplateId(data.resume.templateId);
                }
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
            await saveResumeApi(dbResumeId, resumeData, templateId);
            setIsDirty(false);
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleSelectTemplate = (selectedId) => {
        setTemplateId(selectedId);
        setIsDirty(true);
        setStep("workspace");
    };

    if (error) return <div className={styles.errorBox}>{error}</div>;
    if (loading) return <div className={styles.loadingBox}><p>✨ Preparing your professional workspace...</p></div>;

    if (step === "select-template") {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link to="/dashboard" className={styles.backLink}>&larr; Dashboard</Link>
                </div>
                <div className={styles.templateSelection}>
                    <h2>Choose Your Resume Layout</h2>
                    <p style={{ color: '#70757a', marginTop: '10px' }}>Select a starting template. You can customize the content in the next step.</p>
                    <div className={styles.templateGrid}>
                        <div className={styles.templateCard} onClick={() => handleSelectTemplate('classic')}>
                            <h3>Classic</h3>
                            <p>Traditional, formal structure. Best for law, finance, and academia.</p>
                        </div>
                        <div className={styles.templateCard} onClick={() => handleSelectTemplate('modern')}>
                            <h3>Modern</h3>
                            <p>Clean lines, distinct headers. Ideal for tech, marketing, and business.</p>
                        </div>
                        <div className={styles.templateCard} onClick={() => handleSelectTemplate('minimal')}>
                            <h3>Minimal</h3>
                            <p>Highly spacious, elegant design. Great for creative fields and management.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link to="/dashboard" className={styles.backLink}>&larr; Dashboard</Link>
                <div className={styles.headerActions}>
                    <button className={styles.backLink} onClick={() => setStep("select-template")}>
                        Change Template
                    </button>
                    <span className={styles.statusText}>
                        {isDirty ? "Unsaved changes" : "All changes saved"}
                    </span>
                    <button className={styles.saveButton} onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>
            
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
                    <Preview resumeData={resumeData} templateId={templateId} />
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;