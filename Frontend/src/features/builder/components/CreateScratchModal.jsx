import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Briefcase, FileText, UserCheck } from 'lucide-react';
import { createScratchResumeApi } from '../api/builder.api';
import { useAuth } from '../../auth/hooks/useAuth';
import { createGuestDraft } from '../../../utils/guestDraftManager';
import styles from './CreateScratchModal.module.css';

export const CreateScratchModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [targetRole, setTargetRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [persona, setPersona] = useState('experienced');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isAuthenticated) {
                const res = await createScratchResumeApi({
                    targetRole,
                    jobDescription,
                    persona,
                    candidateLevel: persona === 'fresher' ? 'entry' : 'mid',
                    jobType: 'technical'
                });
                if (res.resumeId) {
                    onClose();
                    navigate(`/build/${res.resumeId}`);
                }
            } else {
                // Guest draft creation with tailored structure
                const draftDoc = {
                    metadata: {
                        persona,
                        targetRole: targetRole || '',
                        candidateLevel: persona === 'fresher' ? 'entry' : 'mid',
                        jobType: 'technical'
                    },
                    personalInfo: { fullName: '', email: '', phone: '', location: '', links: [] },
                    professionalSummary: targetRole ? `Motivated professional targeting ${targetRole} opportunities.` : '',
                    experience: [],
                    projects: [],
                    education: [],
                    skills: [{ category: 'Core Skills', items: [] }],
                    certifications: [],
                    achievements: [],
                    additionalSections: []
                };
                const newDraft = createGuestDraft(draftDoc, jobDescription);
                onClose();
                navigate(`/build/${newDraft.guestDraftId}`);
            }
        } catch (err) {
            console.error("Create scratch error:", err);
            setError(err.response?.data?.message || "Failed to create resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.iconCircle}>
                            <Sparkles size={20} className={styles.sparkleIcon} />
                        </div>
                        <div>
                            <h2 className={styles.title}>Create Resume from Scratch</h2>
                            <p className={styles.subtitle}>Let AI tailor your initial baseline & ask targeted questions</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            <Briefcase size={15} /> Target Job Role / Position <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Senior Full-Stack Engineer, Product Manager"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            <UserCheck size={15} /> Experience Persona
                        </label>
                        <div className={styles.personaGrid}>
                            <button
                                type="button"
                                className={`${styles.personaCard} ${persona === 'fresher' ? styles.personaActive : ''}`}
                                onClick={() => setPersona('fresher')}
                            >
                                🎓 Student / Fresher
                            </button>
                            <button
                                type="button"
                                className={`${styles.personaCard} ${persona === 'experienced' ? styles.personaActive : ''}`}
                                onClick={() => setPersona('experienced')}
                            >
                                💼 Experienced Professional
                            </button>
                            <button
                                type="button"
                                className={`${styles.personaCard} ${persona === 'career-changer' ? styles.personaActive : ''}`}
                                onClick={() => setPersona('career-changer')}
                            >
                                🔄 Career Switcher
                            </button>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            <FileText size={15} /> Target Job Description (Optional but Recommended)
                        </label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Paste the job description here so AI optimizes your resume and asks targeted questions matching the role..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading || !targetRole.trim()}>
                            {loading ? "Generating Resume..." : "Build with AI Copilot →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
