import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import styles from "../styles/RegisterForm.module.css";
import { Link } from "react-router-dom";

const LoginForm = () => {
    const { loginUser, loading, error } = useLogin();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginUser(formData);
            setFormData({
                email: '',
                password: ''
            });
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h2 className={styles.title}>Login to Your Account</h2>
                {error && <div className={styles.errorBox}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.input}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className={styles.input}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>
                    Don't have an account? <Link to="/register">Sign up here</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginForm;