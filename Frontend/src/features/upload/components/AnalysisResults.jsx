import styles from '../styles/AnalysisResults.module.css';

export const AnalysisResults = ({ analysis, onReset }) => {
    if (!analysis) return null;

    const rawScore = analysis.atsScore;
    const isDetailedScore = typeof rawScore === 'object' && rawScore !== null;
    const totalScore = isDetailedScore ? (rawScore.total || 0) : (rawScore || 0);
    const breakdown = isDetailedScore ? rawScore : null;

    // 2. Safe Array Extraction (Guards against undefined or invalid AI responses)
    const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
    const keywords = Array.isArray(analysis.recommendedKeywords) ? analysis.recommendedKeywords : [];
    const jdGaps = Array.isArray(analysis.jdGaps) ? analysis.jdGaps : [];
    const missingInfo = Array.isArray(analysis.missingInformation) ? analysis.missingInformation : [];

    return (
        <div className={styles.container}>
            
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>{analysis.analysisTitle || "Resume Analysis Results"}</h2>
                    <p className={styles.summary}>{analysis.summary || "No summary available."}</p>
                </div>
                <div className={styles.scoreContainer}>
                    <div className={styles.scoreCircle}>
                        <span className={styles.scoreNumber}>{totalScore}</span>
                        <span className={styles.scoreLabel}>/ 100</span>
                    </div>
                    <span className={styles.scoreSubtitle}>Overall Match</span>
                </div>
            </div>

            {breakdown && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>ATS Score Breakdown</h3>
                    <div className={styles.breakdownGrid}>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Parseability</span>
                            <span className={styles.metricValue}>{breakdown.parseability ?? "N/A"}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Keyword Match</span>
                            <span className={styles.metricValue}>{breakdown.keywordMatch ?? "N/A"}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Content Quality</span>
                            <span className={styles.metricValue}>{breakdown.contentQuality ?? "N/A"}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Quantification</span>
                            <span className={styles.metricValue}>{breakdown.quantification ?? "N/A"}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Completeness</span>
                            <span className={styles.metricValue}>{breakdown.completeness ?? "N/A"}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.grid2Col}>
                <div className={styles.card}>
                    <h3 className={`${styles.sectionTitle} ${styles.successText}`}>Strengths</h3>
                    {strengths.length > 0 ? (
                        <ul className={styles.list}>
                            {strengths.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className={styles.emptyText}>No specific strengths identified.</p>
                    )}
                </div>

                <div className={styles.card}>
                    <h3 className={`${styles.sectionTitle} ${styles.dangerText}`}>Areas for Improvement</h3>
                    {weaknesses.length > 0 ? (
                        <ul className={styles.list}>
                            {weaknesses.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className={styles.emptyText}>No major weaknesses identified.</p>
                    )}
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Recommended Keywords to Add</h3>
                {keywords.length > 0 ? (
                    <div className={styles.tagCloud}>
                        {keywords.map((kw, idx) => (
                            <span key={idx} className={styles.tag}>{kw}</span>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyText}>No keyword recommendations available.</p>
                )}
            </div>

            {(jdGaps.length > 0 || missingInfo.length > 0) && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Additional Feedback</h3>
                    {jdGaps.length > 0 && (
                        <div className={styles.gapWarningBox}>
                            <h4 className={styles.subHeading}>Missing Job Description Requirements:</h4>
                            <ul className={styles.list}>
                                {jdGaps.map((gap, idx) => (
                                    <li key={idx}><strong>{gap.skill}:</strong> {gap.reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {missingInfo.length > 0 && (
                        <div className={styles.infoWarningBox}>
                            <h4 className={styles.subHeading}>Suggested Information:</h4>
                            <ul className={styles.list}>
                                {missingInfo.map((info, idx) => (
                                    <li key={idx}><strong>{info.label}</strong> - {info.reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {onReset && (
                <div className={styles.actionContainer}>
                    <button onClick={onReset} className={styles.resetButton}>Analyze Another Resume</button>
                </div>
            )}
        </div>
    );
};