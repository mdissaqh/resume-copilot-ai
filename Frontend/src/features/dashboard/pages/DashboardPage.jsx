import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserAnalysesApi } from "../api/dashboard.api";
import { useAuth } from "../../auth/hooks/useAuth";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
    const { user } = useAuth();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getUserAnalysesApi();
                setAnalyses(data.analyses || []);
            } catch (err) {
                setError("Unable to load your analyses. Try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getFormattedScore = (atsScore) => {
        if (typeof atsScore === 'object' && atsScore !== null) {
            return atsScore.total || 0;
        }
        return atsScore || 0;
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome, {user?.name || "User"}</h1>
            <h2 className={styles.subtitle}>Your Analyses</h2>

            {loading && <p>Loading your analyses...</p>}
            {error && <div className={styles.errorBox}>{error}</div>}

            {!loading && !error && analyses.length === 0 && (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>You don't have any saved analyses yet.</p>
                    <p className={styles.analyzeText}>Analyze your resume against a job description to get started.</p>
                    <Link to="/upload" className={styles.analyzeLink}>Analyze a Resume</Link>
                </div>
            )}

            {!loading && analyses.length > 0 && (
                <div className={styles.analysisList}>
                    {analyses.map((item) => (
                        <div key={item._id} className={styles.analysisCard}>
                            <h3 className={styles.cardTitle} title={item.title}>
                                {item.title || "Untitled Resume Analysis"}
                            </h3>
                            <div className={styles.cardHeader}>
                                <span className={styles.scoreBadge}>
                                    ATS Score: {getFormattedScore(item.analysisResults?.atsScore)}
                                </span>
                                <span className={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.buttonGroup}>
                                <Link to={`/dashboard/analysis/${item._id}`} className={styles.viewButton}>View Analysis</Link>
                                <Link to={`/build/${item._id}`} className={styles.buildButton}>Build Resume</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;