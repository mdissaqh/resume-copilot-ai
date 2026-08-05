import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import styles from "./Navbar.module.css";

export const Navbar = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Main Navigation">
                <Link to="/" className={styles.brandContainer}>
                    <img src="https://ik.imagekit.io/p4nbkerbz/ResumeCopilot%20AI/Logo/image.png?updatedAt=1785834829474" alt="ResumeCopilot Logo" className={styles.logoImage} />
                    <span className={styles.brandText}>
                        ResumeCopilot <span className={styles.brandHighlight}>AI</span>
                    </span>
                </Link>
                <div className={styles.authButtons}>
                    {
                        isAuthenticated ? (
                            <>
                                <span className={{ marginRight: '10px', color: '#4a4a4a' }}>Hi, {user.name}</span>
                                <Link to="/dashboard" className={styles.primaryBtn}>
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={styles.loginLink}>
                                    Log in
                                </Link>
                                <Link to="/register" className={styles.primaryBtn}>
                                    Sign up
                                </Link>
                            </>
                        )
                    }
                </div>
            </nav>
        </header>
    )
}