import { AlertTriangle } from 'lucide-react';
import styles from './FeedbackPanel.module.css';

const FeedbackPanel = ({ analysisResults }) => {
    if (!analysisResults) return null;
    const jdGaps = Array.isArray(analysisResults.jdGaps) ? analysisResults.jdGaps : [];
    if (jdGaps.length === 0) return null;

    return (
        <div className={styles.panelContainer}>
            <h3 className={styles.panelTitle}>✨ Job Description Match Feedback</h3>
            <div className={styles.feedbackSection}>
                <h4 className={styles.warningHeading}>
                    <AlertTriangle size={18} /> Skills to Develop
                </h4>
                <p className={styles.helperText}>
                    These skills are required by the Job Description but were not found in your resume. They were NOT added automatically to maintain honesty.
                </p>
                <ul className={styles.gapList}>
                    {jdGaps.map((gap, i) => (
                        <li key={i}>
                            <strong>{gap.skill}:</strong> {gap.reason} 
                            <br/><span className={styles.recommendationText}>💡 Recommendation: {gap.recommendation}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FeedbackPanel;