import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, X } from 'lucide-react';
import styles from './AuthWallModal.module.css';
import { updateGuestDraft } from '../../../utils/guestDraftManager';

export const AuthWallModal = ({ isOpen, onClose, resumeData }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSaveLocalAndRedirect = (path) => {
        if (resumeData) {
            updateGuestDraft(resumeData);
        }
        onClose();
        navigate(path);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={18} />
                </button>

                <div className={styles.headerIcon}>
                    <Sparkles size={28} color="#2563eb" />
                </div>

                <h2 className={styles.title}>Your Resume is Ready!</h2>
                <p className={styles.subtitle}>
                    Create a free account or sign in to unlock high-resolution vector PDF downloads, cloud autosave, and lifetime access.
                </p>

                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <Lock size={14} className={styles.lockIcon} />
                        <span>Unlock Instant PDF Download</span>
                    </div>
                    <div className={styles.featureItem}>
                        <Sparkles size={14} className={styles.lockIcon} />
                        <span>Cloud Persistence & Multi-Device Sync</span>
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button 
                        className={styles.primaryBtn} 
                        onClick={() => handleSaveLocalAndRedirect('/register?redirect=download')}
                    >
                        Create Free Account <ArrowRight size={16} />
                    </button>

                    <button 
                        className={styles.secondaryBtn} 
                        onClick={() => handleSaveLocalAndRedirect('/login?redirect=download')}
                    >
                        Log In to Existing Account
                    </button>
                </div>
            </div>
        </div>
    );
};
