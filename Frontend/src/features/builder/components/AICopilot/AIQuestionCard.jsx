import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, Send, Target } from 'lucide-react';
import styles from './AIQuestionCard.module.css';

/**
 * Resolves the question's targeting data to a DOM element.
 * Supports both new targetRef contract and legacy targetNodeId/targetPath.
 * Returns null if no matching element is found — in which case we suppress
 * the "Target highlighted" badge rather than showing a broken indicator.
 */
const resolveDomTarget = (question) => {
    if (!question) return null;

    // 1. NEW: targetRef.nodeId — look for data-node-id attribute with exact _id
    if (question.targetRef?.nodeId) {
        const el = document.querySelector(`[data-node-id="${question.targetRef.nodeId}"]`);
        if (el) return el;
    }

    // 2. LEGACY: targetNodeId
    if (question.targetNodeId) {
        const el = document.querySelector(`[data-node-id="${question.targetNodeId}"]`);
        if (el) return el;
    }

    // 3. FALLBACK: targetRef.section → data-section-key or data-node-id matching section root
    if (question.targetRef?.section) {
        const sec = String(question.targetRef.section).toLowerCase();
        const el = document.querySelector(`[data-section-key="${sec}"]`) ||
                   document.querySelector(`[data-node-id="${sec}"]`);
        if (el) return el;
    }

    // 4. LEGACY fallback: targetPath root section
    if (Array.isArray(question.targetPath) && question.targetPath.length > 0) {
        const rootSec = String(question.targetPath[0]).toLowerCase();
        const el = document.querySelector(`[data-section-key="${rootSec}"]`) ||
                   document.querySelector(`[data-node-id="${rootSec}"]`) ||
                   document.querySelector(`[data-node-id="${question.targetPath.join('.')}"]`);
        if (el) return el;
    }

    return null;
};

export const AIQuestionCard = ({ question, finalSummary, onAnswer, onSkip, onCloseSummary, loading }) => {
    const [answerText, setAnswerText] = useState('');
    const [targetFound, setTargetFound] = useState(false);

    // Highlight target node and smooth-scroll into view when active question changes
    useEffect(() => {
        if (!question) {
            setTargetFound(false);
            return;
        }

        let activeTargetEl = null;

        const highlightAndScroll = () => {
            const targetEl = resolveDomTarget(question);

            if (targetEl) {
                setTargetFound(true);
                if (activeTargetEl && activeTargetEl !== targetEl) {
                    activeTargetEl.style.outline = 'none';
                }
                activeTargetEl = targetEl;
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.style.outline = '2px solid #2563eb';
                targetEl.style.outlineOffset = '4px';
                targetEl.style.borderRadius = '6px';
                targetEl.style.transition = 'all 0.3s ease';
            } else {
                setTargetFound(false);
            }
        };

        highlightAndScroll();
        const t1 = setTimeout(highlightAndScroll, 120);
        const t2 = setTimeout(highlightAndScroll, 350);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            if (activeTargetEl) {
                activeTargetEl.style.outline = 'none';
            }
            setTargetFound(false);
        };
    }, [question]);

    if (!question && !finalSummary) return null;

    const handleSubmitText = () => {
        if (!answerText.trim()) return;
        onAnswer(question, answerText);
        setAnswerText('');
    };

    if (finalSummary) {
        return (
            <div className={styles.dockedContainer}>
                <div className={styles.summaryContainer}>
                    <div className={styles.cardHeader}>
                        <div className={styles.summaryTitle}>
                            <Sparkles size={18} />
                            <span>Resume Review Completed!</span>
                        </div>
                        {onCloseSummary && (
                            <button className={styles.skipBtn} onClick={onCloseSummary}>
                                Dismiss
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p className={styles.summaryText} style={{ margin: 0 }}>
                            {finalSummary.summaryMessage || "Your resume review and audit is complete!"}
                        </p>
                        {finalSummary.overallScore !== undefined && (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#15803d' }}>
                                ATS Score: {finalSummary.overallScore}%
                            </span>
                        )}
                    </div>
                    {Array.isArray(finalSummary.strengths) && finalSummary.strengths.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                            <strong style={{ fontSize: '0.8rem', color: '#166534' }}>✓ Verified Strengths:</strong>
                            <ul className={styles.summaryList}>
                                {finalSummary.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                    {Array.isArray(finalSummary.weaknesses) && finalSummary.weaknesses.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                            <strong style={{ fontSize: '0.8rem', color: '#b91c1c' }}>⚠️ Identified Issues & Areas Needing Improvement:</strong>
                            <ul className={styles.summaryList}>
                                {finalSummary.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                    {Array.isArray(finalSummary.jdGapsOrMissingSkills) && finalSummary.jdGapsOrMissingSkills.length > 0 && (
                        <div>
                            <strong style={{ fontSize: '0.8rem', color: '#b45309' }}>💡 Key Target Role Recommendations:</strong>
                            <ul className={styles.summaryList}>
                                {finalSummary.jdGapsOrMissingSkills.map((g, idx) => <li key={idx}>{g}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dockedContainer}>
            <div className={styles.questionCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitle}>
                        <Sparkles size={16} className={styles.sparkle} />
                        <span>AI Copilot Question</span>
                    </div>
                    {onSkip && (
                        <button className={styles.skipBtn} onClick={() => onSkip(question.id || question.questionId)}>
                            Skip / Dismiss
                        </button>
                    )}
                </div>

                <p className={styles.questionText}>{question.message || question.question}</p>

                {/* Strikethrough Diff Preview */}
                {(question.originalText || question.proposedText) && (
                    <div className={styles.diffBox}>
                        {question.originalText && (
                            <div className={styles.diffOriginal}>
                                <s>Original: "{question.originalText}"</s>
                            </div>
                        )}
                        {question.proposedText && (
                            <div className={styles.diffProposed}>
                                Proposed: "{question.proposedText}"
                            </div>
                        )}
                    </div>
                )}

                {/* Target Highlight Badge — only shown when DOM node was actually found */}
                {targetFound && (
                    <div className={styles.targetBadge}>
                        <Target size={12} /> Target highlighted on document
                    </div>
                )}

                {/* Answer Controls */}
                {(question.type === 'yes_no' || Boolean(question.proposedText)) ? (
                    <div className={styles.buttonRow}>
                        <button className={styles.btnYes} onClick={() => onAnswer(question, 'Yes')} disabled={loading}>
                            <Check size={14} /> Accept / Yes
                        </button>
                        <button className={styles.btnNo} onClick={() => onAnswer(question, 'No')} disabled={loading}>
                            <X size={14} /> Reject / No
                        </button>
                    </div>
                ) : (
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={question.placeholder || "Type your answer..."}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
                            disabled={loading}
                        />
                        <button className={styles.sendBtn} onClick={handleSubmitText} disabled={!answerText.trim() || loading}>
                            <Send size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
