import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, Send, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useResumeStore } from '../../../../store/useResumeStore';
import { getCopilotSuggestionsApi, refineContentApi } from '../../api/builder.api';
import styles from './AICopilotDrawer.module.css';

export const AICopilotDrawer = ({ analysisResults }) => {
    const { resumeData, updateField, dbResumeId } = useResumeStore();
    
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [refining, setRefining] = useState(false);
    const [activeTarget, setActiveTarget] = useState(null);
    const [error, setError] = useState(null);

    const fetchSuggestions = async () => {
        if (!dbResumeId) return;
        setLoadingSuggestions(true);
        setError(null);
        try {
            const data = await getCopilotSuggestionsApi(dbResumeId);
            setSuggestions(data.suggestions || []);
        } catch (err) {
            setError("Unable to generate AI suggestions. Please try again.");
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleAcceptSuggestion = (suggestion) => {
        if (!suggestion.targetPath) return;
        updateField(suggestion.targetPath, suggestion.proposedText);
        setSuggestions(prev => prev.filter(s => s.suggestionId !== suggestion.suggestionId));
    };

    const handleRejectSuggestion = (suggestionId) => {
        setSuggestions(prev => prev.filter(s => s.suggestionId !== suggestionId));
    };

    const handleQuickRefine = async () => {
        if (!customPrompt.trim()) return;
        setRefining(true);
        setError(null);
        try {
            const targetPath = activeTarget ? activeTarget.path : ['professionalSummary'];
            const existingText = activeTarget ? activeTarget.text : (resumeData?.professionalSummary || '');
            
            const data = await refineContentApi(existingText, customPrompt, {
                persona: resumeData?.metadata?.persona,
                targetRole: resumeData?.metadata?.targetRole
            });

            updateField(targetPath, data.refinedText);
            setCustomPrompt('');
        } catch (err) {
            setError("Failed to refine text. Please try again.");
        } finally {
            setRefining(false);
        }
    };

    const jdGaps = Array.isArray(analysisResults?.jdGaps) ? analysisResults.jdGaps : [];

    return (
        <aside className={styles.copilotContainer}>
            <div className={styles.copilotHeader}>
                <div className={styles.headerTitle}>
                    <Sparkles className={styles.sparkleIcon} size={18} />
                    <span>AI Copilot</span>
                </div>
                <button 
                    className={styles.refreshBtn} 
                    onClick={fetchSuggestions} 
                    disabled={loadingSuggestions}
                    title="Scan document for AI improvements"
                >
                    <RefreshCw size={14} className={loadingSuggestions ? styles.spin : ''} />
                    <span>Scan</span>
                </button>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            {/* Quick Refine Input */}
            <div className={styles.refineBox}>
                <label className={styles.refineLabel}>
                    <MessageSquare size={13} /> Ask Copilot to refine target text
                </label>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.refineInput}
                        placeholder="e.g. Add 30% performance metric..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickRefine()}
                    />
                    <button className={styles.sendBtn} onClick={handleQuickRefine} disabled={refining || !customPrompt.trim()}>
                        <Send size={14} />
                    </button>
                </div>
            </div>

            {/* JD Gaps Quick Fix */}
            {jdGaps.length > 0 && (
                <div className={styles.sectionCard}>
                    <h4 className={styles.sectionHeading}>
                        <AlertCircle size={14} color="#f59e0b" /> Job Description Gaps
                    </h4>
                    <ul className={styles.gapList}>
                        {jdGaps.map((gap, i) => (
                            <li key={i} className={styles.gapItem}>
                                <div className={styles.gapSkill}>{gap.skill}</div>
                                <div className={styles.gapReason}>{gap.reason}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* AI Suggestions Feed */}
            <div className={styles.suggestionsFeed}>
                <h4 className={styles.sectionHeading}>Active Suggestions ({suggestions.length})</h4>
                
                {suggestions.length === 0 && !loadingSuggestions && (
                    <div className={styles.emptyState}>
                        <p>Click <strong>Scan</strong> above to discover targeted AI enhancements for your bullet points and summary.</p>
                    </div>
                )}

                {suggestions.map((s) => (
                    <div key={s.suggestionId || Math.random()} className={styles.suggestionCard}>
                        <div className={styles.categoryBadge}>{s.category || 'Improvement'}</div>
                        <div className={styles.cardReason}>{s.reasoning}</div>
                        
                        <div className={styles.diffBox}>
                            <div className={styles.diffOriginal}>
                                <span className={styles.diffTag}>Original:</span> {s.originalText}
                            </div>
                            <div className={styles.diffProposed}>
                                <span className={styles.diffTag}>Proposed:</span> {s.proposedText}
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button className={styles.acceptBtn} onClick={() => handleAcceptSuggestion(s)}>
                                <Check size={13} /> Accept
                            </button>
                            <button className={styles.rejectBtn} onClick={() => handleRejectSuggestion(s.suggestionId)}>
                                <X size={13} /> Dismiss
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};
