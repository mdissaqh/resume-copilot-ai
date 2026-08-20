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
import { buildBindingMap, serializeBindingMapForAI } from "../../../utils/resumeBindingMap";
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
        applyAIMutation,
        ensureSectionInOrder,
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
    const [finalSummary, setFinalSummary] = useState(null);
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
            setFinalSummary(null);

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

    // 2. Controlled Copilot Batch Refresh Logic (always uses fresh store state)
    const handleScanCopilot = useCallback(async () => {
        // Always read from store directly to avoid stale closures
        const state = useResumeStore.getState();
        if (!state.resumeData) return;

        setScanning(true);
        try {
            const currentHistory = state.interactionHistory || [];
            const currentAsked   = state.askedQuestions     || [];

            // Build the deterministic binding map from current resume state
            // This is sent to the AI so it can reference REAL node IDs
            const bindingMap = buildBindingMap(state.resumeData);
            const serializedBindingMap = {
                nodes: Object.fromEntries(
                    Object.entries(bindingMap.nodes)
                        .filter(([, node]) => node.nodeId && !node.field)
                        .slice(0, 60)
                )
            };

            let res;
            if (state.dbResumeId && isAuthenticated) {
                res = await refreshCopilotApi(
                    state.dbResumeId,
                    currentHistory,
                    currentAsked,
                    state.resumeData.metadata?.jobDescription || "",
                    serializedBindingMap  // ← NEW: pass binding map to backend/AI
                );
            } else {
                res = await refreshGuestCopilotApi({
                    currentResume:      state.resumeData,
                    targetRole:         state.resumeData.metadata?.targetRole      || "",
                    jobDescription:     state.resumeData.metadata?.jobDescription  || "",
                    candidateLevel:     state.resumeData.metadata?.candidateLevel  || "mid",
                    jobType:            state.resumeData.metadata?.jobType         || "technical",
                    interactionHistory: currentHistory,
                    askedQuestions:     currentAsked,
                    bindingMap:         serializedBindingMap  // ← NEW
                });
            }

            if (res) {
                if (res.finalSummary) {
                    setFinalSummary(res.finalSummary);
                }

                // CRITICAL FIX: Process questions regardless of isComplete.
                // isComplete: false means "still have questions to ask" — this is the NORMAL state.
                // The old condition `res.isComplete !== false` was discarding every question batch.
                if (Array.isArray(res.questions) && res.questions.length > 0) {
                    const askedIds = new Set([
                        ...currentHistory,
                        ...currentAsked.map(q => q.id)
                    ]);

                    const skippedRefs = new Set(
                        currentAsked
                            .filter(q => q.skipped || q.answer === 'SKIPPED')
                            .flatMap(q => {
                                const refs = [q.id];
                                if (q.targetRef?.nodeId && q.targetRef?.field) {
                                    refs.push(`${q.targetRef.nodeId}:${q.targetRef.field}`);
                                }
                                if (Array.isArray(q.targetPath)) {
                                    refs.push(q.targetPath.join('.').toLowerCase());
                                }
                                return refs;
                            })
                    );

                    const newQuestions = res.questions.filter(q => {
                        // Must have an id and message to display
                        if (!q || !q.id || !q.message) {
                            console.warn('[BuilderPage] Discarded question missing id or message:', q);
                            return false;
                        }
                        // Already answered/seen
                        if (askedIds.has(q.id)) return false;
                        // Precise skip anti-loop using targetRef
                        if (q.targetRef?.nodeId && q.targetRef?.field) {
                            if (skippedRefs.has(`${q.targetRef.nodeId}:${q.targetRef.field}`)) return false;
                        }
                        // Legacy path anti-loop
                        if (Array.isArray(q.targetPath)) {
                            if (skippedRefs.has(q.targetPath.join('.').toLowerCase())) return false;
                        }
                        return true;
                    });

                    console.log(`[BuilderPage] Copilot: ${res.questions.length} questions received, ${newQuestions.length} new after filter`);

                    if (newQuestions.length > 0) {
                        setQuestionsQueue(newQuestions);
                    }
                }

                // Show completion summary when AI signals done and no new questions remain
                if (res.isComplete && !res.finalSummary && (!Array.isArray(res.questions) || res.questions.length === 0)) {
                    setFinalSummary({
                        overallScore: 95,
                        structureStatus: 'Complete & ATS-Optimized',
                        summaryMessage: 'Your resume structure is complete and optimized for your target role!'
                    });
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
            const timer = setTimeout(() => { handleScanCopilot(); }, 600);
            return () => clearTimeout(timer);
        }
    }, [loading, resumeData, handleScanCopilot]);

    const { deleteSection } = useResumeStore.getState();

    /**
     * Handle Question Answers — single canonical path via mutation engine.
     * Replaced the 300-line if/else with a typed, binding-map-aware engine.
     */
    const handleAnswerQuestion = (question, answerValue) => {
        if (!question) return;

        const lowerAnswer = String(answerValue || '').toLowerCase().trim();

        // Section deletion intent detection (unchanged — this is user intent, not AI mutation)
        if (
            lowerAnswer.includes('no experience') ||
            lowerAnswer.includes('no work experience') ||
            lowerAnswer.includes("don't have experience") ||
            lowerAnswer.includes('dont have experience') ||
            lowerAnswer.includes('no job') ||
            lowerAnswer.includes('remove experience') ||
            lowerAnswer.includes('delete experience')
        ) {
            deleteSection('experience');
        } else if (
            lowerAnswer.includes('no cert') ||
            lowerAnswer.includes('no certification') ||
            lowerAnswer.includes('remove certification') ||
            lowerAnswer.includes('delete certification')
        ) {
            deleteSection('certifications');
        } else if (
            lowerAnswer.includes('no project') ||
            lowerAnswer.includes('remove project') ||
            lowerAnswer.includes('delete project')
        ) {
            deleteSection('projects');
        }

        // ── CANONICAL MUTATION via engine (replaces all the old if/else branches) ──
        const { appliedPath } = applyAIMutation(question, answerValue);

        // If mutation created a new collection item, ensure section appears in A4
        if (appliedPath && appliedPath.length >= 1) {
            ensureSectionInOrder(appliedPath[0]);
        }

        // Record Q&A and interaction ID
        recordQuestionAnswer(question, answerValue, false);
        const qId = question.id || question.questionId;
        if (qId) recordInteraction(qId);

        // Pop current question from local queue
        popNextQuestion();

        // Check if queue needs replenishment — use delay to let mutation settle
        setTimeout(() => {
            const currentQueue = useResumeStore.getState().questionsQueue;
            if (!currentQueue || currentQueue.length === 0) {
                handleScanCopilot();
            }
        }, 200);
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
        }, 200);
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

                    {/* Single Question Bottom-Docked Card or Final Assessment Summary */}
                    {(activeQuestion || finalSummary) && (
                        <AIQuestionCard
                            key={activeQuestion ? (activeQuestion.id || activeQuestion.questionId) : 'final_summary'}
                            question={activeQuestion}
                            finalSummary={!activeQuestion ? finalSummary : null}
                            onAnswer={handleAnswerQuestion}
                            onSkip={handleSkipQuestion}
                            onCloseSummary={() => setFinalSummary(null)}
                            loading={scanning}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;