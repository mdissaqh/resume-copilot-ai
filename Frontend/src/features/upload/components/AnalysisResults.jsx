import styles from '../styles/AnalysisResults.module.css';

export const AnalysisResults = ({ analysis, onReset }) => {
    if (!analysis) {
        return null;
    }
    const { atsScore, summary, strengths, weaknesses, recommendedKeywords } = analysis;
    const getScoreColorStyle = (score) => {
        if (score >= 80) return { backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#34a853' };
        if (score >= 60) return { backgroundColor: '#fef7e0', color: '#b06000', borderColor: '#fbbc04' };
        return { backgroundColor: '#fce8e6', color: '#c5221f', borderColor: '#ea4335' };
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>ATS Analysis Report</h2>
                <div className={styles.scoreBadge} style={getScoreColorStyle(atsScore)}>
                    <span className={styles.scoreNumber}>{atsScore}</span>
                    <span className={styles.scoreLabel}>Score</span>
                </div>
            </div>
            <div className={styles.summaryBox}>
                <strong>Overview: </strong> {summary}
            </div>
            <div className={styles.grid}>
                <div>
                    <h3 className={styles.sectionTitle}>Key Strengths</h3>
                    <ul className={styles.list}>
                        {strengths && strengths.map((item, index) => (
                            <li key={index} className={`${styles.listItem} ${styles.strengthItem}`}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className={styles.sectionTitle}>Areas for Improvement</h3>
                    <ul className={styles.list}>
                        {weaknesses && weaknesses.map((item, index) => (
                            <li key={index} className={`${styles.listItem} ${styles.weaknessItem}`}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {recommendedKeywords && recommendedKeywords.length > 0 && (
                <div>
                    <h3 className={styles.sectionTitle}>Recommended Keywords to Add</h3>
                    <div className={styles.keywordsContainer}>
                        {recommendedKeywords.map((keyword, index) => (
                            <span key={index} className={styles.keywordTag}>
                                + {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <button className={styles.resetBtn} onClick={onReset}>
                ← Analyze Another Resume
            </button>
        </div>
    )
}