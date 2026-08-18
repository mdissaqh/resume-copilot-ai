import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Briefcase, FileText } from "lucide-react";
import styles from "../styles/CreateResumePage.module.css";
import { useAuth } from "../../auth/hooks/useAuth";
import { createScratchResumeApi } from "../api/builder.api";
import { createGuestDraft } from "../../../utils/guestDraftManager";

const CreateResumePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [persona, setPersona] = useState("experienced");
    const [initializing, setInitializing] = useState(false);

    const handleCreateFromScratch = async () => {
        if (!targetRole.trim()) return;
        setInitializing(true);
        try {
            if (isAuthenticated) {
                const response = await createScratchResumeApi({
                    targetRole,
                    jobDescription,
                    persona
                });
                if (response && response.resumeId) {
                    navigate(`/build/${response.resumeId}`);
                }
            } else {
                const initialDoc = {
                    metadata: {
                        persona,
                        targetRole,
                        candidateLevel: persona === 'fresher' ? 'entry' : 'mid',
                        jobType: 'technical'
                    },
                    personalInfo: { fullName: '', email: '', phone: '', location: '', links: [] },
                    professionalSummary: '',
                    experience: [],
                    projects: [],
                    education: [],
                    skills: [{ category: 'Core Skills', items: [] }],
                    certifications: [],
                    achievements: [],
                    additionalSections: []
                };

                const draft = createGuestDraft(initialDoc, jobDescription);
                navigate(`/build/${draft.guestDraftId}`);
            }
        } catch (e) {
            console.error("Scratch Creation Error:", e);
            alert("Failed to initialize resume session. Please try again.");
        } finally {
            setInitializing(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.badge}>
                        <Sparkles size={16} /> AI Interactive Setup
                    </div>
                    <h1 className={styles.title}>Build Your Resume from Scratch</h1>
                    <p className={styles.subtitle}>
                        Define your target role, and ResumeCopilot AI will guide you step-by-step into a tailored A4 document.
                    </p>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <Briefcase size={16} /> Target Role / Job Title *
                    </label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Senior Frontend Engineer, Marketing Manager..."
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <FileText size={16} /> Target Job Description (Optional)
                    </label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Paste the job description here for hyper-tailored ATS optimization..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Select Candidate Level</label>
                    <div className={styles.personaGrid}>
                        <button
                            type="button"
                            className={`${styles.personaBtn} ${persona === 'fresher' ? styles.personaActive : ''}`}
                            onClick={() => setPersona('fresher')}
                        >
                            <span className={styles.personaTitle}>Student / Fresher</span>
                            <span className={styles.personaDesc}>Focuses on Education, Projects, and Skills first</span>
                        </button>
                        <button
                            type="button"
                            className={`${styles.personaBtn} ${persona === 'experienced' ? styles.personaActive : ''}`}
                            onClick={() => setPersona('experienced')}
                        >
                            <span className={styles.personaTitle}>Experienced Pro</span>
                            <span className={styles.personaDesc}>Focuses on Experience and Measurable Impact</span>
                        </button>
                        <button
                            type="button"
                            className={`${styles.personaBtn} ${persona === 'career-changer' ? styles.personaActive : ''}`}
                            onClick={() => setPersona('career-changer')}
                        >
                            <span className={styles.personaTitle}>Career Changer</span>
                            <span className={styles.personaDesc}>Highlights Transferable Skills and Projects</span>
                        </button>
                    </div>
                </div>

                <button
                    className={styles.submitBtn}
                    onClick={handleCreateFromScratch}
                    disabled={!targetRole.trim() || initializing}
                >
                    {initializing ? "Setting up Workspace..." : "Launch A4 Builder →"}
                </button>
            </div>
        </div>
    );
};

export default CreateResumePage;