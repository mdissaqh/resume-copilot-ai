import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnalysisByIdApi } from "../api/dashboard.api";
import { AnalysisResults } from "../../upload/components/AnalysisResults";
import styles from "../styles/ViewAnalysisPage.module.css";

const ViewAnalysisPage = () => {
    const { id } = useParams();
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSingleAnalysis = async () => {
            try {
                const data = await getAnalysisByIdApi(id);
                setAnalysisData(data.analysis);
            } catch (err) {
                console.error("Failed to load analysis", err);
                setError("Unable to load this analysis. It may not exist or you don't have access.");
            } finally {
                setLoading(false);
            }
        };
        fetchSingleAnalysis();
    }, [id]);

    if (loading) return <div className={styles.loader}>Loading analysis...</div>;
    if (error) return <div className={styles.errorBox}>{error}</div>;
    if (!analysisData) return null;

    return (
        <div className={styles.container}>
            <div className={styles.backLinkWrapper}>
                <Link to="/dashboard" className={styles.backLink}>
                    &larr; Back to Dashboard
                </Link>
            </div>
            
            <AnalysisResults 
                analysis={analysisData.analysisResults} 
                onReset={() => {}} 
            />

            <div className={styles.buildActionWrapper}>
                 <Link to={`/build/${id}`} className={styles.buildButton}>
                    Build Resume from this Analysis &rarr;
                </Link>
            </div>
        </div>
    );
};

export default ViewAnalysisPage;