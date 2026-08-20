import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught application error captured by ErrorBoundary:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.iconCircle}>
                            <AlertTriangle size={32} className={styles.icon} />
                        </div>
                        <h2 className={styles.title}>Resume Builder Notice</h2>
                        <p className={styles.message}>
                            An unexpected rendering error occurred. Don't worry—your resume data is safely saved in local state.
                        </p>
                        {this.state.error?.message && (
                            <div className={styles.errorDetails}>
                                <code>{this.state.error.message}</code>
                            </div>
                        )}
                        <div className={styles.actions}>
                            <button className={styles.primaryBtn} onClick={this.handleReset}>
                                <RefreshCw size={15} /> Reload Workspace
                            </button>
                            <a href="/dashboard" className={styles.secondaryBtn}>
                                <Home size={15} /> Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
