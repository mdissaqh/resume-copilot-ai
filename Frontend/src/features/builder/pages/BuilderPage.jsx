import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { generateResumeApi, refreshCopilotApi, getResumeByIdApi, downloadResumePDFApi } from "../api/builder.api";
import { getAnalysisByIdApi } from "../../dashboard/api/dashboard.api";
import { A4Canvas } from "../components/A4Canvas/A4Canvas";
import { InlineAISuggestion } from "../components/AICopilot/InlineAISuggestion";
import { AIQuestionCard } from "../components/AICopilot/AIQuestionCard";
import { AuthWallModal } from "../../auth/components/AuthWallModal";
import styles from "../styles/BuilderPage.module.css";
import { useResumeStore } from "../../../store/useResumeStore";
import { useAuth } from "../../auth/hooks/useAuth";
import { getGuestDraft, createGuestDraft } from "../../../utils/guestDraftManager";
import { Download, ArrowLeft, UserCircle, Undo2, Redo2, CloudCheck, CloudUpload, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

const BuilderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const {
        resumeData,
        setResumeData,
        updateField,
        saveStatus,
        undo,
        redo,
        past,
        future,
        dbResumeId
    } = useResumeStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    // AI Copilot State
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [activeSuggestions, setActiveSuggestions] = useState([]);
    const [interactionHistory, setInteractionHistory] = useState([]);
    const [scanning, setScanning] = useState(false);

    // 1. Initial Document Loading Logic (Upload vs Scratch vs Guest)
    useEffect(() => {
        const fetchAndGenerate = async () => {
            setLoading(true);
            setError(null);

            try {
                if (id && id.startsWith('guest_')) {
                    // Guest local draft envelope
                    const draft = getGuestDraft();
                    if (draft && draft.content) {
                        setResumeData(draft.content, null, 'evergreen');
                    } else {
                        const newDraft = createGuestDraft();
                        setResumeData(newDraft.content, null, 'evergreen');
                    }
                } else if (id && id !== 'placeholder') {
                    // Authenticated or existing resume document by real Resume ID
                    let data;
                    try {
                        data = await getResumeByIdApi(id);
                    } catch {
                        data = await generateResumeApi(id);
                    }

                    if (data && data.resume) {
                        setResumeData(data.resume.content, data.resume._id, data.resume.templateId);
                        if (data.resume.analysisId) {
                            try {
                                await getAnalysisByIdApi(data.resume.analysisId);
                            } catch {
                                console.warn("Analysis details not attached.");
                            }
                        }
                    }
                } else {
                    const draft = createGuestDraft();
                    navigate(`/build/${draft.guestDraftId}`, { replace: true });
                }
            } catch (err) {
                console.error("Builder Load Error:", err);
                setError("Unable to load the requested resume. Please try re-selecting it from your dashboard or uploading a new file.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndGenerate();
    }, [id, navigate, setResumeData]);

    // 2. Controlled Copilot Refresh Logic
    const handleScanCopilot = useCallback(async () => {
        if (!dbResumeId && isAuthenticated) return;
        setScanning(true);
        try {
            if (dbResumeId && isAuthenticated) {
                const res = await refreshCopilotApi(dbResumeId, interactionHistory);
                if (res.questions && res.questions.length > 0) {
                    setActiveQuestion(res.questions[0]);
                } else {
                    setActiveQuestion(null);
                }
                setActiveSuggestions(res.suggestions || []);
            }
        } catch (err) {
            console.error("Copilot Scan Error:", err);
        } finally {
            setScanning(false);
        }
    }, [dbResumeId, isAuthenticated, interactionHistory]);

    // Handle Question Answers (One-by-One progression)
    const handleAnswerQuestion = (question, answerValue) => {
        if (question.targetPath) {
            if (question.type === 'yes_no') {
                if (answerValue === 'Yes' && question.proposedText) {
                    updateField(question.targetPath, question.proposedText);
                }
            } else {
                updateField(question.targetPath, answerValue);
            }
        }

        const qId = question.id || question.questionId;
        setInteractionHistory(prev => [...prev, qId]);
        setActiveQuestion(null);

        setTimeout(() => {
            handleScanCopilot();
        }, 500);
    };

    const handleSkipQuestion = (questionId) => {
        setInteractionHistory(prev => [...prev, questionId]);
        setActiveQuestion(null);
        setTimeout(() => handleScanCopilot(), 300);
    };

    const handleResolveSuggestion = (suggestionId) => {
        setInteractionHistory(prev => [...prev, suggestionId]);
        setActiveSuggestions(prev => prev.filter(s => (s.id || s.suggestionId) !== suggestionId));
    };

    const togglePersona = (e) => {
        updateField(['metadata', 'persona'], e.target.value);
    };

    // Download PDF Action with Guest Wall Enforcement and Server-Side Puppeteer API
    const handleDownloadPDF = async () => {
        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        setExporting(true);
        try {
            if (dbResumeId) {
                const blobData = await downloadResumePDFApi(dbResumeId);
                const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                const safeName = (resumeData?.personalInfo?.fullName || 'Resume').trim().replace(/\s+/g, '_');
                link.setAttribute('download', `${safeName}_Resume.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            } else {
                alert("Please save your resume before downloading.");
            }
        } catch (e) {
            console.error("PDF Download Error:", e);
            alert("Failed to generate PDF document. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const renderSaveStatus = () => {
        if (!isAuthenticated) {
            return <span className={styles.statusDirty}>Guest Mode (Local)</span>;
        }
        if (saveStatus === 'saving') {
            return <span className={styles.statusSaving}><CloudUpload size={14} className={styles.spin} /> Saving...</span>;
        }
        if (saveStatus === 'error') {
            return <span className={styles.statusError}><AlertCircle size={14} /> Save failed</span>;
        }
        if (saveStatus === 'dirty') {
            return <span className={styles.statusDirty}>Unsaved changes</span>;
        }
        return <span className={styles.statusSaved}><CloudCheck size={14} /> Saved</span>;
    };

    if (error) return (
        <div className={styles.errorBox}>
            <p>{error}</p>
            <Link to="/dashboard" style={{ marginTop: 12, color: '#2563eb', fontWeight: 600 }}>← Return to Dashboard</Link>
        </div>
    );

    if (loading) return (
        <div className={styles.loadingBox}>
            <p>✨ Preparing your AI resume workspace...</p>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Guest Download Restriction Modal */}
            <AuthWallModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                resumeData={resumeData}
            />

            {/* Header Toolbar */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link to={isAuthenticated ? "/dashboard" : "/upload"} className={styles.backLink}>
                        <ArrowLeft size={16} /> {isAuthenticated ? "Dashboard" : "Back"}
                    </Link>

                    <div className={styles.templateSelector}>
                        <UserCircle size={16} className={styles.iconMuted} />
                        <select value={resumeData?.metadata?.persona || 'experienced'} onChange={togglePersona} className={styles.select}>
                            <option value="fresher">Student / Fresher</option>
                            <option value="experienced">Experienced Pro</option>
                            <option value="career-changer">Career Changer</option>
                        </select>
                    </div>

                    {/* Undo / Redo History Controls */}
                    <div className={styles.historyControls}>
                        <button
                            className={styles.historyBtn}
                            onClick={undo}
                            disabled={past.length === 0}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 size={16} />
                        </button>
                        <button
                            className={styles.historyBtn}
                            onClick={redo}
                            disabled={future.length === 0}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 size={16} />
                        </button>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    {/* Controlled AI Scan Button */}
                    {isAuthenticated && (
                        <button className={styles.aiScanBtn} onClick={handleScanCopilot} disabled={scanning}>
                            <Sparkles size={15} />
                            <span>{scanning ? "Scanning..." : "Ask Copilot"}</span>
                            {scanning && <RefreshCw size={12} className={styles.spin} />}
                        </button>
                    )}

                    {renderSaveStatus()}

                    <button className={styles.primaryBtn} onClick={handleDownloadPDF} disabled={exporting}>
                        <Download size={16} /> {exporting ? "Generating PDF..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className={styles.workspace}>
                <div className={styles.canvasArea}>
                    <div style={{ width: '100%', maxWidth: '840px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Single Question Interview Card */}
                        {activeQuestion && (
                            <AIQuestionCard
                                question={activeQuestion}
                                onAnswer={handleAnswerQuestion}
                                onSkip={handleSkipQuestion}
                                loading={scanning}
                            />
                        )}

                        <A4Canvas resumeData={resumeData} />
                    </div>

                    {/* Spatially Anchored Inline AI Suggestions */}
                    <InlineAISuggestion
                        suggestions={activeSuggestions}
                        onResolve={handleResolveSuggestion}
                    />
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;