import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnalysisByIdApi } from "../api/dashboard.api";
import { AnalysisResults } from "../../upload/components/AnalysisResults";
import styles from "../styles/ViewAnalysisPage.module.css";

const ViewAnalysisPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    // This handles the deep-linking from the Analysis actionable buttons
    const handleNavigateToBuilder = (sectionId) => {
        navigate(`/build/${id}?focus=${sectionId}`);
    };

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
                onNavigateToBuilder={handleNavigateToBuilder}
            />
        </div>
    );
};

export default ViewAnalysisPage;