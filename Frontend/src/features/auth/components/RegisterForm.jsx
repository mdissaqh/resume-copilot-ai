import { useState } from 'react'
import { useRegister } from '../hooks/useRegister';
import style from '../styles/RegisterForm.module.css';
import { Link } from 'react-router-dom';
import GoogleAuthButton from './GoogleAuthButton';

const RegisterForm = () => {
    const { register, loading, error, successMessage } = useRegister();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            setFormData({
                name: '',
                email: '',
                password: ''
            });
        } catch (error) {
            console.error('Registration error:', error);
        }
    }
  return (
    <div className={style.container}>
      <div className={style.formCard}>
        <h2 className={style.title}>Create an Account</h2>
        {error && <div className={style.errorBox}>{error}</div>}
        {successMessage && <div className={style.successBox}>{successMessage}</div>}
        <form onSubmit={handleSubmit}>
            <div className={style.inputGroup}>
                <label className={style.label}>Full Name</label>
                <input
                    type="text"
                    name="name"
                    className={style.input}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={style.inputGroup}>
                <label className={style.label}>Email</label>
                <input
                    type="email"
                    name="email"
                    className={style.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={style.inputGroup}>
                <label className={style.label}>Password</label>
                <input
                    type="password"
                    name="password"
                    className={style.input}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" className={style.button} disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
        </form>
        <div className={style.divider}>OR</div>
        <GoogleAuthButton actionText="Sign up" />
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}


export default RegisterForm;