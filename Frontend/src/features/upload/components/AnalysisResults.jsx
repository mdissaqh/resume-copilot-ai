import { CheckCircle2, AlertTriangle, ArrowRight, Activity, ShieldCheck, Target } from 'lucide-react';
import styles from '../styles/AnalysisResults.module.css';

export const AnalysisResults = ({ analysis, onReset, onNavigateToBuilder }) => {
    if (!analysis) return null;

    // Safely extract AI payload
    const rawScore = analysis.atsScore || {};
    const isDetailedScore = typeof rawScore === 'object' && rawScore !== null;
    
    // We convert raw numbers into explainable health states rather than displaying arbitrary 0-100 numbers
    const getHealthState = (score) => {
        if (!score) return { label: 'Unknown', className: styles.statusWarn, icon: Activity };
        if (score >= 80) return { label: 'Excellent', className: styles.statusGood, icon: CheckCircle2 };
        if (score >= 60) return { label: 'Needs Improvement', className: styles.statusWarn, icon: AlertTriangle };
        return { label: 'Critical Revision', className: styles.statusCrit, icon: AlertTriangle };
    };

    const parseability = getHealthState(isDetailedScore ? rawScore.parseability : 90); // Default good because we use @react-pdf
    const impact = getHealthState(isDetailedScore ? rawScore.quantification : rawScore);
    const roleAlignment = getHealthState(isDetailedScore ? rawScore.keywordMatch : rawScore);

    const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
    const jdGaps = Array.isArray(analysis.jdGaps) ? analysis.jdGaps : [];
    const editorRecs = Array.isArray(analysis.editorRecommendations) ? analysis.editorRecommendations : [];

    return (
        <div className={styles.dashboardContainer}>
            
            <div className={styles.header}>
                <h2 className={styles.title}>{analysis.analysisTitle || "Resume Health Overview"}</h2>
                <p className={styles.summary}>{analysis.summary || "Review your analysis below before proceeding to the builder."}</p>
            </div>

            {/* Resume Health Metrics (Replaces the fake 100-point ATS score) */}
            <div className={styles.healthOverview}>
                <div className={styles.healthCard}>
                    <span className={styles.healthCardLabel}>Structure & Parseability</span>
                    <div className={`${styles.healthStatus} ${parseability.className}`}>
                        <ShieldCheck size={20} /> {parseability.label}
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <span className={styles.healthCardLabel}>Impact & Metrics</span>
                    <div className={`${styles.healthStatus} ${impact.className}`}>
                        <Activity size={20} /> {impact.label}
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <span className={styles.healthCardLabel}>Role Alignment</span>
                    <div className={`${styles.healthStatus} ${roleAlignment.className}`}>
                        <Target size={20} /> {roleAlignment.label}
                    </div>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                {/* Actionable Weaknesses & Recommendations */}
                <div className={styles.card}>
                    <h3 className={`${styles.cardTitle} ${styles.warning}`}>
                        <AlertTriangle size={22} /> Priority Improvements
                    </h3>
                    
                    <ul className={styles.actionList}>
                        {jdGaps.map((gap, idx) => (
                            <li key={`gap-${idx}`} className={`${styles.actionItem} ${styles.actionItemWarning}`}>
                                <div className={styles.actionItemText}>
                                    <strong>Missing Skill: {gap.skill}</strong>
                                </div>
                                <div className={styles.actionItemReason}>{gap.reason}</div>
                                {onNavigateToBuilder && (
                                    <button className={styles.fixButton} onClick={() => onNavigateToBuilder('skills')}>
                                        Add to Skills <ArrowRight size={14} />
                                    </button>
                                )}
                            </li>
                        ))}

                        {editorRecs.map((rec, idx) => (
                            <li key={`rec-${idx}`} className={styles.actionItem}>
                                <div className={styles.actionItemText}>
                                    <strong>{rec.label || 'Improvement'}</strong>: {rec.reason}
                                </div>
                                {onNavigateToBuilder && rec.section && (
                                    <button className={styles.fixButton} onClick={() => onNavigateToBuilder(rec.section)}>
                                        Fix in Builder <ArrowRight size={14} />
                                    </button>
                                )}
                            </li>
                        ))}

                        {weaknesses.length > 0 && weaknesses.map((weakness, idx) => (
                            <li key={`weak-${idx}`} className={styles.actionItem}>
                                <div className={styles.actionItemText}>{weakness}</div>
                                {onNavigateToBuilder && (
                                    <button className={styles.fixButton} onClick={() => onNavigateToBuilder('experience')}>
                                        Review Experience <ArrowRight size={14} />
                                    </button>
                                )}
                            </li>
                        ))}

                        {jdGaps.length === 0 && editorRecs.length === 0 && weaknesses.length === 0 && (
                            <p className={styles.emptyText}>No major issues detected. Your resume foundation is strong.</p>
                        )}
                    </ul>
                </div>

                {/* Verified Strengths */}
                <div className={styles.card}>
                    <h3 className={`${styles.cardTitle} ${styles.success}`}>
                        <CheckCircle2 size={22} /> Verified Strengths
                    </h3>
                    {strengths.length > 0 ? (
                        <ul className={styles.bulletList}>
                            {strengths.map((item, idx) => <li key={`str-${idx}`}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className={styles.emptyText}>Analysis complete, but no specific standout strengths were identified.</p>
                    )}
                </div>
            </div>

            {/* Global Actions */}
            <div className={styles.globalActions}>
                {onReset && (
                    <button onClick={onReset} className={styles.secondaryBtn}>
                        Analyze Another Document
                    </button>
                )}
                {onNavigateToBuilder && (
                    <button onClick={() => onNavigateToBuilder('personalInfo')} className={styles.primaryBuildBtn}>
                        Open Resume Builder
                    </button>
                )}
            </div>
        </div>
    );
};