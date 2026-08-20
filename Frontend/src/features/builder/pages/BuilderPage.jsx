import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { generateResumeApi, refreshCopilotApi, refreshGuestCopilotApi, getResumeByIdApi } from "../api/builder.api";
import { getAnalysisByIdApi } from "../../dashboard/api/dashboard.api";
import { A4Canvas } from "../components/A4Canvas/A4Canvas";
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
    const printableRef = useRef(null);

    const {
        resumeData,
        setResumeData,
        updateField,
        saveStatus,
        undo,
        redo,
        past,
        future,
        dbResumeId,
        questionsQueue,
        setQuestionsQueue,
        popNextQuestion,
        recordInteraction,
        recordQuestionAnswer
    } = useResumeStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const initialScanDone = useRef(false);

    // Active Question is the head of the questions queue
    const activeQuestion = questionsQueue && questionsQueue.length > 0 ? questionsQueue[0] : null;

    // react-to-print native browser ATS-parsable PDF generator
    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `${(resumeData?.personalInfo?.fullName || 'Resume').trim().replace(/\s+/g, '_')}_Resume`,
    });

    // 1. Initial Document Loading Logic (Upload vs Scratch vs Guest)
    useEffect(() => {
        const fetchAndGenerate = async () => {
            setLoading(true);
            setError(null);
            initialScanDone.current = false;

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

    // 2. Controlled Copilot Batch Refresh Logic (using fresh store state)
    const handleScanCopilot = useCallback(async () => {
        const state = useResumeStore.getState();
        if (!state.resumeData) return;

        setScanning(true);
        try {
            const currentHistory = state.interactionHistory || [];
            const currentAsked = state.askedQuestions || [];

            let res;
            if (state.dbResumeId && isAuthenticated) {
                res = await refreshCopilotApi(
                    state.dbResumeId,
                    currentHistory,
                    currentAsked,
                    state.resumeData.metadata?.jobDescription || ""
                );
            } else {
                res = await refreshGuestCopilotApi({
                    currentResume: state.resumeData,
                    targetRole: state.resumeData.metadata?.targetRole || "",
                    jobDescription: state.resumeData.metadata?.jobDescription || "",
                    candidateLevel: state.resumeData.metadata?.candidateLevel || "mid",
                    jobType: state.resumeData.metadata?.jobType || "technical",
                    interactionHistory: currentHistory,
                    askedQuestions: currentAsked
                });
            }

            if (res && Array.isArray(res.questions)) {
                // Filter out any questions already in interactionHistory or askedQuestions
                const askedIds = new Set([
                    ...currentHistory,
                    ...currentAsked.map(q => q.id)
                ]);
                const newQuestions = res.questions.filter(q => q && q.id && !askedIds.has(q.id));

                if (newQuestions.length > 0) {
                    setQuestionsQueue(newQuestions);
                }
            }
        } catch (err) {
            console.error("Copilot Scan Error:", err);
        } finally {
            setScanning(false);
        }
    }, [isAuthenticated, setQuestionsQueue]);

    // 3. Automatic Initial Copilot Scan right after document is ready
    useEffect(() => {
        if (!loading && resumeData && !initialScanDone.current) {
            initialScanDone.current = true;
            const timer = setTimeout(() => {
                handleScanCopilot();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [loading, resumeData, handleScanCopilot]);

    // Handle Question Answers (One-by-One queue progression with anti-loop memory)
    const handleAnswerQuestion = (question, answerValue) => {
        if (!question) return;

        if (question.targetPath) {
            if (question.type === 'yes_no') {
                if (answerValue === 'Yes' && question.proposedText) {
                    updateField(question.targetPath, question.proposedText);
                }
            } else {
                updateField(question.targetPath, answerValue);
            }
        }

        // Record Q&A and interaction ID
        recordQuestionAnswer(question, answerValue, false);
        const qId = question.id || question.questionId;
        if (qId) recordInteraction(qId);

        // Pop current question from local queue
        popNextQuestion();

        // Check if queue needs replenishment
        setTimeout(() => {
            const currentQueue = useResumeStore.getState().questionsQueue;
            if (!currentQueue || currentQueue.length === 0) {
                handleScanCopilot();
            }
        }, 150);
    };

    // Handle Question Skip
    const handleSkipQuestion = (questionId) => {
        const currentQ = activeQuestion || { id: questionId };
        recordQuestionAnswer(currentQ, "SKIPPED", true);
        if (questionId) recordInteraction(questionId);

        popNextQuestion();

        setTimeout(() => {
            const currentQueue = useResumeStore.getState().questionsQueue;
            if (!currentQueue || currentQueue.length === 0) {
                handleScanCopilot();
            }
        }, 150);
    };

    const togglePersona = (e) => {
        updateField(['metadata', 'persona'], e.target.value);
    };

    // Download PDF Action with Guest Wall Enforcement and Native Print Engine
    const handleDownloadPDF = () => {
        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }
        handlePrint();
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
                    <button className={styles.aiScanBtn} onClick={handleScanCopilot} disabled={scanning}>
                        <Sparkles size={15} />
                        <span>{scanning ? "Scanning..." : (questionsQueue.length > 0 ? `Questions (${questionsQueue.length})` : "Ask Copilot")}</span>
                        {scanning && <RefreshCw size={12} className={styles.spin} />}
                    </button>

                    {renderSaveStatus()}

                    <button className={styles.primaryBtn} onClick={handleDownloadPDF}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className={styles.workspace}>
                <div className={styles.canvasArea}>
                    <div ref={printableRef} style={{ width: '100%', maxWidth: '840px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <A4Canvas resumeData={resumeData} />
                    </div>

                    {/* Single Question Bottom-Docked Card */}
                    {activeQuestion && (
                        <AIQuestionCard
                            key={activeQuestion.id || activeQuestion.questionId}
                            question={activeQuestion}
                            onAnswer={handleAnswerQuestion}
                            onSkip={handleSkipQuestion}
                            loading={scanning}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;