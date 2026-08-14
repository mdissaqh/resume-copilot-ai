import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { generateResumeApi, saveResumeApi } from "../api/builder.api";
import Editor from "../components/Editor/Editor";
import Preview from "../components/Preview/Preview";
import styles from "../styles/BuilderPage.module.css";
import { downloadPDF } from "../utils/pdfExport";
import { downloadDOCX } from "../utils/docxExport";

const BuilderPage = () => {
    const { id } = useParams();
    const [dbResumeId, setDbResumeId] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [templateId, setTemplateId] = useState("classic");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const dropdownRef = useRef(null);

    const [step, setStep] = useState("select-template");
    const [activeTab, setActiveTab] = useState("editor");

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                const data = await generateResumeApi(id);
                setDbResumeId(data.resume._id);
                setResumeData(data.resume.content);
                if (data.resume.templateId) setTemplateId(data.resume.templateId);
            } catch (err) {
                setError("Failed to load or generate the resume.");
            } finally {
                setLoading(false);
            }
        };
        fetchAndGenerate();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDownloadOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        setExporting(true);
        setIsDownloadOpen(false);
        try {
            await downloadPDF(resumeData, templateId);
        } catch (e) {
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadDOCX = async () => {
        setExporting(true);
        setIsDownloadOpen(false);
        try {
            await downloadDOCX(resumeData, templateId);
        } catch (e) {
            alert("Failed to generate DOCX. Please try again.");
        } finally {
            setExporting(false);
        }
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
                    <p style={{ color: '#70757a', marginTop: '10px' }}>Select a starting template.</p>
                    <div className={styles.templateGrid}>
                        {['classic', 'modern', 'minimal'].map(t => (
                            <div key={t} className={styles.templateCard} onClick={() => { setTemplateId(t); setIsDirty(true); setStep("workspace"); }}>
                                <h3 style={{textTransform: 'capitalize'}}>{t}</h3>
                                <p>ATS-friendly professional layout.</p>
                            </div>
                        ))}
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
                    <button className={styles.backLink} onClick={() => setStep("select-template")}>Layout</button>
                    <span className={styles.statusText}>{isDirty ? "Unsaved" : "Saved"}</span>
                    
                    <div className={styles.downloadDropdown} ref={dropdownRef}>
                        <button className={styles.downloadToggle} onClick={() => setIsDownloadOpen(!isDownloadOpen)} disabled={exporting}>
                            {exporting ? "Generating..." : "Download ▼"}
                        </button>
                        {isDownloadOpen && (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.dropdownItem} onClick={handleDownloadPDF}>Download PDF</button>
                                <button className={styles.dropdownItem} onClick={handleDownloadDOCX}>Download DOCX</button>
                            </div>
                        )}
                    </div>
                    
                    <button className={styles.saveButton} onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
            
            <div className={styles.mobileTabs}>
                <button className={`${styles.tabBtn} ${activeTab === 'editor' ? styles.activeTab : ''}`} onClick={() => setActiveTab('editor')}>✎ Edit Resume</button>
                <button className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.activeTab : ''}`} onClick={() => setActiveTab('preview')}>👁 Preview</button>
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