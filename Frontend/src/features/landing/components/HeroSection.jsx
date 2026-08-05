import { Link } from "react-router-dom";
import styles from "../styles/HeroSection.module.css";


export const HeroSection = () => {
    return (
        <section className={styles.heroContainer}>
            <h1 className={styles.title}>
                Build <span className={styles.highlight}>ATS-Friendly</span> Resumes in Minutes
            </h1>
            <p className={styles.subtitle}>
                ResumeCopilot AI helps you analyze, format, and tailor your resume to perfectly match real job descriptions. 
            </p>

            <div className={styles.buttonGroup}>
                <Link to="/upload" className={styles.primaryButton}>
                    📄 Check Existing Resume
                </Link>
                <Link to="/build" className={styles.secondaryButton}>
                    ✨ Create from Scratch
                </Link>
            </div>
        </section>
    )
}