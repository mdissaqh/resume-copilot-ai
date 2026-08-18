import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Check, X, Edit2, CornerDownLeft } from 'lucide-react';
import { useResumeStore } from '../../../../store/useResumeStore';
import styles from './InlineAISuggestion.module.css';

export const InlineAISuggestion = ({ suggestions = [], onResolve }) => {
    const { updateField } = useResumeStore();
    
    const [positions, setPositions] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [editingId, setEditingId] = useState(null);
    const [editedText, setEditedText] = useState('');

    // Check mobile viewport
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Recalculate physical pixel positions for each active suggestion target node
    const updatePositions = useCallback(() => {
        const newPositions = {};

        suggestions.forEach((s) => {
            if (!s.targetNodeId) return;

            const targetEl = document.querySelector(`[data-node-id="${s.targetNodeId}"]`);
            if (targetEl) {
                const rect = targetEl.getBoundingClientRect();
                // Find nearest workspace scroll parent
                const workspaceEl = targetEl.closest('.workspace_canvasArea__7z-y5') || document.body;
                const workspaceRect = workspaceEl.getBoundingClientRect();

                newPositions[s.id || s.suggestionId] = {
                    top: rect.top - workspaceRect.top + workspaceEl.scrollTop,
                    left: rect.right - workspaceRect.left + 12,
                    height: rect.height,
                    width: rect.width
                };

                // Highlight target node on screen with subtle blue ring
                targetEl.style.outline = '2px solid #3b82f6';
                targetEl.style.outlineOffset = '2px';
                targetEl.style.borderRadius = '4px';
                targetEl.style.transition = 'outline 0.2s ease';
            }
        });

        setPositions(newPositions);
    }, [suggestions]);

    // Recalculate on scroll, resize, or DOM mutations
    useEffect(() => {
        updatePositions();
        window.addEventListener('scroll', updatePositions, true);
        window.addEventListener('resize', updatePositions);

        const observer = new MutationObserver(updatePositions);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });

        return () => {
            window.removeEventListener('scroll', updatePositions, true);
            window.removeEventListener('resize', updatePositions);
            observer.disconnect();

            // Clear highlights on cleanup
            suggestions.forEach((s) => {
                if (s.targetNodeId) {
                    const el = document.querySelector(`[data-node-id="${s.targetNodeId}"]`);
                    if (el) el.style.outline = 'none';
                }
            });
        };
    }, [suggestions, updatePositions]);

    const handleAccept = (suggestion, textToApply) => {
        if (suggestion.targetPath) {
            updateField(suggestion.targetPath, textToApply || suggestion.proposedText || suggestion.answerText);
        }
        if (onResolve) onResolve(suggestion.id || suggestion.suggestionId, 'accepted');
    };

    const handleReject = (suggestionId) => {
        if (onResolve) onResolve(suggestionId, 'rejected');
    };

    const handleYesNoAnswer = (suggestion, answer) => {
        if (suggestion.targetPath) {
            if (answer === 'Yes' && suggestion.proposedText) {
                updateField(suggestion.targetPath, suggestion.proposedText);
            }
        }
        if (onResolve) onResolve(suggestion.id || suggestion.suggestionId, 'answered', answer);
    };

    if (suggestions.length === 0) return null;

    return (
        <div className={styles.overlayContainer}>
            {suggestions.map((s) => {
                const sId = s.id || s.suggestionId;
                const pos = positions[sId];

                // If element is not in DOM yet or mobile view, render anchored card/sheet
                if (isMobile || !pos) {
                    return (
                        <div key={sId} className={styles.mobileSheet}>
                            <div className={styles.popoverHeader}>
                                <Sparkles size={14} className={styles.sparkle} />
                                <span>AI Suggestion</span>
                                <button className={styles.closeBtn} onClick={() => handleReject(sId)}><X size={14}/></button>
                            </div>
                            <p className={styles.messageText}>{s.message || s.reasoning}</p>

                            {s.type === 'yes_no' ? (
                                <div className={styles.actionRow}>
                                    <button className={styles.btnYes} onClick={() => handleYesNoAnswer(s, 'Yes')}>Yes</button>
                                    <button className={styles.btnNo} onClick={() => handleYesNoAnswer(s, 'No')}>No</button>
                                </div>
                            ) : (
                                <div className={styles.diffBox}>
                                    {s.originalText && <div className={styles.diffOriginal}>"{s.originalText}"</div>}
                                    {s.proposedText && <div className={styles.diffProposed}>"{s.proposedText}"</div>}
                                    <div className={styles.actionRow}>
                                        <button className={styles.btnAccept} onClick={() => handleAccept(s)}><Check size={13}/> Accept</button>
                                        <button className={styles.btnReject} onClick={() => handleReject(sId)}><X size={13}/> Dismiss</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                // Desktop Spatially Anchored Popover
                return (
                    <div
                        key={sId}
                        className={styles.desktopPopover}
                        style={{
                            top: `${pos.top}px`,
                            left: `${pos.left}px`
                        }}
                    >
                        <div className={styles.popoverHeader}>
                            <Sparkles size={14} className={styles.sparkle} />
                            <span className={styles.headerTitle}>{s.category || 'AI Suggestion'}</span>
                            <button className={styles.closeBtn} onClick={() => handleReject(sId)}><X size={14}/></button>
                        </div>

                        <p className={styles.messageText}>{s.message || s.reasoning}</p>

                        {/* Structured Answer: Yes/No Questions */}
                        {s.type === 'yes_no' ? (
                            <div className={styles.actionRow}>
                                <button className={styles.btnYes} onClick={() => handleYesNoAnswer(s, 'Yes')}>
                                    <Check size={13} /> Yes
                                </button>
                                <button className={styles.btnNo} onClick={() => handleYesNoAnswer(s, 'No')}>
                                    <X size={13} /> No
                                </button>
                            </div>
                        ) : s.proposedText ? (
                            /* Text Suggestion Diff View */
                            <div className={styles.diffBox}>
                                {s.originalText && <div className={styles.diffOriginal}>"{s.originalText}"</div>}
                                <div className={styles.diffProposed}>"{s.proposedText}"</div>
                                
                                {editingId === sId ? (
                                    <div className={styles.editWrapper}>
                                        <textarea 
                                            className={styles.editTextarea}
                                            value={editedText}
                                            onChange={(e) => setEditedText(e.target.value)}
                                        />
                                        <button className={styles.btnAccept} onClick={() => { handleAccept(s, editedText); setEditingId(null); }}>
                                            Apply Edit
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.actionRow}>
                                        <button className={styles.btnAccept} onClick={() => handleAccept(s)}>
                                            <Check size={13}/> Accept
                                        </button>
                                        <button className={styles.btnEdit} onClick={() => { setEditingId(sId); setEditedText(s.proposedText); }}>
                                            <Edit2 size={13}/> Edit
                                        </button>
                                        <button className={styles.btnReject} onClick={() => handleReject(sId)}>
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Text Input Question */
                            <div className={styles.editWrapper}>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    placeholder="Type answer..."
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAccept(s, editedText)}
                                />
                                <button className={styles.btnAccept} onClick={() => handleAccept(s, editedText)}>
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
