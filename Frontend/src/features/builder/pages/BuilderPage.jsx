import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { generateResumeApi } from "../api/builder.api";
import styles from "../styles/BuilderPage.module.css";

const BuilderPage = () => {
    const { id } = useParams();
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                const data = await generateResumeApi(id);
                setResumeData(data.resume);
            } catch (err) {
                console.error("Generation failed:", err);
                setError("Failed to generate the structured resume. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndGenerate();
    }, [id]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Resume Builder</h1>
                <Link to={`/dashboard/analysis/${id}`} className={styles.backLink}>
                    &larr; Back to Analysis
                </Link>
            </div>
            
            {loading && (
                <div className={styles.loadingBox}>
                    <p>✨ AI is rewriting and structuring your resume...</p>
                    <p style={{ fontSize: "0.9rem", color: "#70757a", marginTop: "10px" }}>
                        This takes about 10-15 seconds. We are mapping your experience to our flexible templates.
                    </p>
                </div>
            )}

            {error && <div className={styles.errorBox}>{error}</div>}

            {!loading && resumeData && (
                <>
                    <div className={styles.successBox}>
                        ✅ Success! The AI has successfully parsed and structured your data into our profession-agnostic JSON contract.
                    </div>
                    
                    <h3 style={{ marginBottom: "16px", color: "#1a1a1a" }}>Raw JSON Output (For Verification):</h3>
                    
                    <pre className={styles.jsonViewer}>
                        {JSON.stringify(resumeData, null, 2)}
                    </pre>
                </>
            )}
        </div>
    );
};

export default BuilderPage;