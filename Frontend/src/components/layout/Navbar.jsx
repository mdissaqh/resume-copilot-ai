import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import styles from "./Navbar.module.css";

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Main Navigation">
                <Link to="/" className={styles.brandContainer}>
                    <img 
                        src="https://ik.imagekit.io/p4nbkerbz/ResumeCopilot%20AI/Logo/image.png?updatedAt=1785834829474" 
                        alt="ResumeCopilot Logo" 
                        className={styles.logoImage} 
                    />
                    <span className={styles.brandText}>
                        ResumeCopilot <span className={styles.brandHighlight}>AI</span>
                    </span>
                </Link>

                <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle navigation">
                    ☰
                </button>

                <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <div className={styles.userSection}>
                                <span className={styles.greeting} title={user?.name}>
                                    Hi, {user?.name}
                                </span>
                            </div>
                            <button 
                                onClick={() => { logout(); setIsMenuOpen(false); }} 
                                className={styles.logoutBtn}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.loginLink} onClick={() => setIsMenuOpen(false)}>
                                Log in
                            </Link>
                            <Link to="/register" className={styles.primaryBtn} onClick={() => setIsMenuOpen(false)}>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};