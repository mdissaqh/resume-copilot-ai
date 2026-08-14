import styles from './FeedbackPanel.module.css';

const FeedbackPanel = ({ analysisResults }) => {
    if (!analysisResults) return null;
    
    const { jdGaps, missingInformation } = analysisResults;
    const hasGaps = jdGaps && jdGaps.length > 0;
    const hasMissingInfo = missingInformation && missingInformation.length > 0;

    if (!hasGaps && !hasMissingInfo) return null;

    return (
        <div className={styles.panelContainer}>
            <h3 className={styles.panelTitle}>✨ AI Optimization Feedback</h3>
            
            {hasGaps && (
                <div className={styles.feedbackSection}>
                    <h4 className={styles.warningHeading}>⚠ Skills to Develop (JD Gaps)</h4>
                    <p className={styles.helperText}>These skills are required by the JD but were not found in your resume. They were NOT added automatically to maintain honesty.</p>
                    <ul className={styles.gapList}>
                        {jdGaps.map((gap, i) => (
                            <li key={i}><strong>{gap.skill}:</strong> {gap.reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {hasMissingInfo && (
                <div className={styles.feedbackSection}>
                    <h4 className={styles.infoHeading}>💡 Recommended Information</h4>
                    <ul className={styles.infoList}>
                        {missingInformation.map((info, i) => (
                            <li key={i}><strong>{info.label}:</strong> {info.reason}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FeedbackPanel;