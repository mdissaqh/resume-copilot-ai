import { useParams, Link } from "react-router-dom";
import styles from "../styles/BuilderPage.module.css";

const BuilderPage = () => {
    const { id } = useParams();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Resume Builder</h1>
            <p className={styles.subtitle}>
                This is the entry point for building a resume based on the analysis ID: <strong>{id}</strong>
            </p>
            <div className={styles.infoBox}>
                <p className={styles.infoText}>
                    The AI resume generation and template selection features will be implemented soon.
                </p>
            </div>
            <Link to="/dashboard" className={styles.backLink}>
                &larr; Return to Dashboard
            </Link>
        </div>
    );
};

export default BuilderPage;