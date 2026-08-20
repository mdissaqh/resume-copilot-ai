import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserAnalysesApi, getUserResumesApi } from "../api/dashboard.api";
import { deleteResumeApi } from "../../builder/api/builder.api";
import { useAuth } from "../../auth/hooks/useAuth";
import { CreateScratchModal } from "../../builder/components/CreateScratchModal";
import { Plus, FileText, Sparkles, Trash2, Edit3, ExternalLink, Calendar, Target } from "lucide-react";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [resumes, setResumes] = useState([]);
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scratchModalOpen, setScratchModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resumesData, analysesData] = await Promise.all([
                getUserResumesApi().catch(() => ({ resumes: [] })),
                getUserAnalysesApi().catch(() => ({ analyses: [] }))
            ]);
            setResumes(resumesData.resumes || []);
            setAnalyses(analysesData.analyses || []);
        } catch {
            setError("Unable to load your workspace dashboard. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteResume = async (resumeId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this resume?")) return;

        setDeletingId(resumeId);
        try {
            await deleteResumeApi(resumeId);
            setResumes(prev => prev.filter(r => r._id !== resumeId));
        } catch (err) {
            console.error("Failed to delete resume:", err);
            alert("Failed to delete resume.");
        } finally {
            setDeletingId(null);
        }
    };

    const getFormattedScore = (atsScore) => {
        if (typeof atsScore === 'object' && atsScore !== null) {
            return atsScore.total || 0;
        }
        return atsScore || 0;
    };

    return (
        <div className={styles.container}>
            <CreateScratchModal
                isOpen={scratchModalOpen}
                onClose={() => {
                    setScratchModalOpen(false);
                    fetchData();
                }}
            />

            {/* Header Section */}
            <div className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.title}>Welcome back, {user?.name || "User"}</h1>
                    <p className={styles.subtitle}>Manage your AI-engineered resumes and ATS optimization reports</p>
                </div>
                <button className={styles.createBtn} onClick={() => setScratchModalOpen(true)}>
                    <Plus size={18} /> Create Resume from Scratch
                </button>
            </div>

            {loading && (
                <div className={styles.loadingBox}>
                    <p>✨ Loading your resumes & analysis history...</p>
                </div>
            )}

            {error && <div className={styles.errorBox}>{error}</div>}

            {!loading && !error && (
                <>
                    {/* My Resumes Section */}
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <FileText size={20} className={styles.sectionIcon} /> My Resumes ({resumes.length})
                        </h2>
                    </div>

                    {resumes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyText}>You haven't built any resumes yet.</p>
                            <div className={styles.emptyActionGroup}>
                                <button className={styles.primaryActionBtn} onClick={() => setScratchModalOpen(true)}>
                                    <Sparkles size={16} /> Create from Scratch
                                </button>
                                <Link to="/upload" className={styles.secondaryActionBtn}>
                                    Upload Existing Resume
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {resumes.map((resume) => (
                                <div key={resume._id} className={styles.resumeCard}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.badgeRow}>
                                            <span className={styles.templateBadge}>
                                                {resume.templateId || "Evergreen"}
                                            </span>
                                            {resume.metadata?.targetRole && (
                                                <span className={styles.roleBadge}>
                                                    <Target size={12} /> {resume.metadata.targetRole}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDeleteResume(resume._id, e)}
                                            disabled={deletingId === resume._id}
                                            title="Delete Resume"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    <h3 className={styles.cardTitle}>{resume.title || "My ATS Resume"}</h3>
                                    <p className={styles.nameSub}>
                                        Candidate: <strong>{resume.content?.personalInfo?.fullName || "Not Specified"}</strong>
                                    </p>

                                    <div className={styles.cardMeta}>
                                        <span><Calendar size={13} /> {new Date(resume.updatedAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <Link to={`/build/${resume._id}`} className={styles.editBtn}>
                                            <Edit3 size={15} /> Edit Resume
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recent Analyses Section */}
                    {analyses.length > 0 && (
                        <>
                            <div className={`${styles.sectionHeader} ${styles.mtLarge}`}>
                                <h2 className={styles.sectionTitle}>
                                    <Sparkles size={20} className={styles.sectionIcon} /> Recent ATS Analyses ({analyses.length})
                                </h2>
                            </div>

                            <div className={styles.analysisList}>
                                {analyses.map((item) => (
                                    <div key={item._id} className={styles.analysisCard}>
                                        <div className={styles.analysisHeader}>
                                            <h3 className={styles.analysisTitle}>{item.title || "Untitled Resume Analysis"}</h3>
                                            <span className={styles.scoreBadge}>
                                                ATS Score: {getFormattedScore(item.analysisResults?.atsScore)}/100
                                            </span>
                                        </div>

                                        <p className={styles.analysisDate}>Analyzed on {new Date(item.createdAt).toLocaleDateString()}</p>

                                        <div className={styles.analysisActions}>
                                            <Link to={`/dashboard/analysis/${item._id}`} className={styles.viewAnalysisBtn}>
                                                <ExternalLink size={14} /> View Report
                                            </Link>
                                            <Link to={`/build/${item.resumeId || item._id}`} className={styles.buildFromAnalysisBtn}>
                                                <Edit3 size={14} /> Open Builder
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardPage;