import styles from '../styles/RegisterForm.module.css';

const GoogleAuthButton = ({ actionText = "Continue"}) => {
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}api/auth/google`;
    };

    return (
        <button className={styles.googleButton} onClick={handleGoogleLogin}>
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg"
                alt="Google Login"
                className={styles.googleIcon}
            />
            {actionText} with Google
        </button>
    );
}

export default GoogleAuthButton;