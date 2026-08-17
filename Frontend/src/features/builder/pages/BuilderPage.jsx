import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { generateResumeApi, saveResumeApi } from "../api/builder.api";
import { getAnalysisByIdApi } from "../../dashboard/api/dashboard.api";
import Editor from "../components/Editor/Editor";
import Preview from "../components/Preview/Preview";
import FeedbackPanel from "../components/FeedbackPanel/FeedbackPanel";
import styles from "../styles/BuilderPage.module.css";
import { downloadPDF } from "../pdf/exportUtils"; 
import { useResumeStore } from "../../../store/useResumeStore";
import { Download, Save, LayoutTemplate, ArrowLeft, UserCircle } from 'lucide-react';

const BuilderPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialFocusSection = searchParams.get("focus") || 'personalInfo';

    const { resumeData, setResumeData, isDirty, resetDirty, updateField } = useResumeStore();

    const [dbResumeId, setDbResumeId] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [templateId, setTemplateId] = useState("classic");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const [activeTab, setActiveTab] = useState("editor");

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                // If it's a real ID from the DB
                if (id && id !== 'placeholder') {
                    const analysisReq = await getAnalysisByIdApi(id);
                    setAnalysisData(analysisReq.analysis.analysisResults);

                    const data = await generateResumeApi(id);
                    setDbResumeId(data.resume._id);
                    setResumeData(data.resume.content);
                    if (data.resume.templateId) setTemplateId(data.resume.templateId);
                } else {
                    // Blank setup for Create-from-scratch (Phase 4 stub)
                    setResumeData({});
                }
            } catch (err) {
                setError("Failed to load or generate the resume. Please ensure the document is a valid resume.");
            } finally {
                setLoading(false);
            }
        };
        fetchAndGenerate();
    }, [id, setResumeData]);

    const togglePersona = (e) => {
        updateField(['metadata', 'persona'], e.target.value);
    };

    const handleSave = async () => {
        if (!dbResumeId || !resumeData) return;
        setSaving(true);
        try {
            await saveResumeApi(dbResumeId, resumeData, templateId);
            resetDirty();
        } catch (err) {
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        setExporting(true);
        try { await downloadPDF(resumeData, templateId); } 
        catch (e) { alert("Failed to generate PDF."); } 
        finally { setExporting(false); }
    };

    if (error) return <div className={styles.errorBox}>{error}</div>;
    if (loading) return <div className={styles.loadingBox}><p>✨ Preparing your professional workspace...</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link to="/dashboard" className={styles.backLink}><ArrowLeft size={16}/> Dashboard</Link>
                
                <div className={styles.templateSelector}>
                    <UserCircle size={16} className={styles.iconMuted} />
                    <select value={resumeData?.metadata?.persona || 'experienced'} onChange={togglePersona} className={styles.select}>
                        <option value="fresher">Student / Fresher</option>
                        <option value="experienced">Experienced Pro</option>
                        <option value="career-changer">Career Changer</option>
                    </select>
                </div>

                <div className={styles.templateSelector}>
                    <LayoutTemplate size={16} className={styles.iconMuted} />
                    <select value={templateId} onChange={(e) => { setTemplateId(e.target.value); /* Trigger save logically later */ }} className={styles.select}>
                        <option value="classic">Classic</option>
                        <option value="modern">Modern</option>
                        <option value="minimal">Minimal</option>
                    </select>
                </div>

                <div className={styles.headerActions}>
                    <span className={styles.statusText}>{isDirty ? "Unsaved" : "Saved"}</span>
                    <button className={styles.primaryBtnOutline} onClick={handleSave} disabled={!isDirty || saving}>
                        <Save size={16}/> {saving ? "Saving..." : "Save"}
                    </button>
                    <button className={styles.primaryBtn} onClick={handleDownloadPDF} disabled={exporting}>
                        <Download size={16}/> {exporting ? "Generating PDF..." : "Download PDF"}
                    </button>
                </div>
            </div>
            
            <div className={styles.mobileTabs}>
                <button className={`${styles.tabBtn} ${activeTab === 'editor' ? styles.activeTab : ''}`} onClick={() => setActiveTab('editor')}>✎ Editor</button>
                <button className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.activeTab : ''}`} onClick={() => setActiveTab('preview')}>👁 Preview</button>
                <button className={`${styles.tabBtn} ${activeTab === 'feedback' ? styles.activeTab : ''}`} onClick={() => setActiveTab('feedback')}>✨ Feedback</button>
            </div>

            <div className={styles.workspace}>
                <div className={`${styles.editorPane} ${activeTab === 'editor' ? styles.paneActive : ''}`}>
                    <Editor initialFocus={initialFocusSection} />
                </div>
                
                <div className={`${styles.feedbackPane} ${activeTab === 'feedback' ? styles.paneActive : ''}`}>
                   <FeedbackPanel analysisResults={analysisData} />
                </div>

                <div className={`${styles.previewPane} ${activeTab === 'preview' ? styles.paneActive : ''}`}>
                    <Preview resumeData={resumeData} templateId={templateId} />
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;