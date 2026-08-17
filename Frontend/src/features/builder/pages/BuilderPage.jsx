import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { generateResumeApi, saveResumeApi } from "../api/builder.api";
import { getAnalysisByIdApi } from "../../dashboard/api/dashboard.api";
import { A4Canvas } from "../components/A4Canvas/A4Canvas";
import FeedbackPanel from "../components/FeedbackPanel/FeedbackPanel";
import styles from "../styles/BuilderPage.module.css";
import { downloadPDF } from "../pdf/exportUtils"; 
import { useResumeStore } from "../../../store/useResumeStore";
import { Download, Save, LayoutTemplate, ArrowLeft, UserCircle } from 'lucide-react';

const BuilderPage = () => {
    const { id } = useParams();

    const { resumeData, setResumeData, isDirty, resetDirty, updateField } = useResumeStore();

    const [dbResumeId, setDbResumeId] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [templateId, setTemplateId] = useState("classic");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                if (id && id !== 'placeholder') {
                    const analysisReq = await getAnalysisByIdApi(id);
                    setAnalysisData(analysisReq.analysis.analysisResults);

                    const data = await generateResumeApi(id);
                    setDbResumeId(data.resume._id);
                    setResumeData(data.resume.content);
                    if (data.resume.templateId) setTemplateId(data.resume.templateId);
                } else {
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
                    <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={styles.select}>
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

            <div className={styles.workspace}>
                {/* 
                  The Editor pane has been completely removed.
                  The A4 Canvas is now the primary, centered workspace.
                */}
                <div className={styles.canvasArea}>
                    <FeedbackPanel analysisResults={analysisData} />
                    <A4Canvas resumeData={resumeData} templateId={templateId} />
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;