import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, Send, CornerDownLeft, Target } from 'lucide-react';
import styles from './AIQuestionCard.module.css';

export const AIQuestionCard = ({ question, onAnswer, onSkip, loading }) => {
    const [answerText, setAnswerText] = useState('');

    // Highlight target node and smooth-scroll into view when active question changes
    useEffect(() => {
        if (!question || !question.targetNodeId) return;

        const targetEl = document.querySelector(`[data-node-id="${question.targetNodeId}"]`);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.style.outline = '2px solid #2563eb';
            targetEl.style.outlineOffset = '4px';
            targetEl.style.borderRadius = '6px';
            targetEl.style.transition = 'all 0.3s ease';

            return () => {
                targetEl.style.outline = 'none';
            };
        }
    }, [question]);

    if (!question) return null;

    const handleSubmitText = () => {
        if (!answerText.trim()) return;
        onAnswer(question, answerText);
        setAnswerText('');
    };

    return (
        <div className={styles.questionCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerTitle}>
                    <Sparkles size={16} className={styles.sparkle} />
                    <span>AI Copilot Question</span>
                </div>
                {onSkip && (
                    <button className={styles.skipBtn} onClick={() => onSkip(question.id)}>
                        Skip
                    </button>
                )}
            </div>

            <p className={styles.questionText}>{question.message || question.question}</p>

            {question.targetNodeId && (
                <div className={styles.targetBadge}>
                    <Target size={12} /> Target highlighted on document
                </div>
            )}

            {/* Answer Controls */}
            {question.type === 'yes_no' ? (
                <div className={styles.buttonRow}>
                    <button className={styles.btnYes} onClick={() => onAnswer(question, 'Yes')} disabled={loading}>
                        <Check size={14} /> Yes
                    </button>
                    <button className={styles.btnNo} onClick={() => onAnswer(question, 'No')} disabled={loading}>
                        <X size={14} /> No
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
    );
};
