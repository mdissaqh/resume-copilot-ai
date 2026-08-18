import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DropZoneArea.module.css";
import { analyzeResumeApi } from "../api/upload.api";
import { AnalysisResults } from './AnalysisResults';
import { useAuth } from "../../auth/hooks/useAuth";

export const DropzoneArea = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [hasJobDescription, setHasJobDescription] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setError(null);
            setErrorCode(null);
        }
    }, []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject
    } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const getDropzoneClassName = () => {
        if (isDragReject) return `${styles.dropzone} ${styles.dropzoneReject}`;
        if (isDragActive) return `${styles.dropzone} ${styles.dropzoneActive}`;
        return styles.dropzone;
    };

    const [activeResumeId, setActiveResumeId] = useState(null);

    const handleProceed = async () => {
        setIsAnalyzing(true);
        setError(null);
        setErrorCode(null);

        try {
            const response = await analyzeResumeApi(selectedFile, jobDescription);
            setAnalysisResult(response.analysis);

            if (response.resumeId) {
                setActiveResumeId(response.resumeId);
            } else if (!isAuthenticated) {
                const guestData = {
                    extractedText: response.parsedText,
                    jobDescription: jobDescription,
                    analysisResult: response.analysis,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem("guest_analysis", JSON.stringify(guestData));
            }
        } catch (err) {
            console.error("Failed to analyze resume:", err);
            const msg = err.response?.data?.message || "An error occurred while analyzing your resume. Please try again.";
            const code = err.response?.data?.code || "UNKNOWN";
            setError(msg);
            setErrorCode(code);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setHasJobDescription(null);
        setJobDescription("");
        setError(null);
        setErrorCode(null);
        setAnalysisResult(null);
        setActiveResumeId(null);
    };

    if (analysisResult) {
        return <AnalysisResults
            analysis={analysisResult}
            onReset={handleReset}
            onNavigateToBuilder={(section) => {
                if (activeResumeId) {
                    navigate(`/build/${activeResumeId}?focus=${section}`);
                } else {
                    navigate(`/build?focus=${section}`);
                }
            }}
        />;
    }

    if (errorCode === "INVALID_RESUME") {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff0f0', borderRadius: '12px', border: '1px solid #facdcd' }}>
                    <h2 style={{ color: '#d93025', marginBottom: '16px' }}>Invalid Document Detected</h2>
                    <p style={{ color: '#3c4043', marginBottom: '24px', fontSize: '1.1rem' }}>{error}</p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button onClick={handleReset} style={{ padding: '12px 24px', background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Try Again
                        </button>
                        <button onClick={() => navigate('/build')} style={{ padding: '12px 24px', background: '#0066ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Create Resume From Scratch
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}> Upload Your Resume</h1>
            <p className={styles.subtitle}>We accept PDF and DOCX files up to 5MB.</p>
            <div {...getRootProps({ className: getDropzoneClassName() })}>
                <input {...getInputProps()} />
                <svg className={styles.icon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.36 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM14 13V17H10V13H7L12 8L17 13H14Z" />
                </svg>
                {isDragActive ? (
                    <p className={styles.uploadText}>Drop your resume here...</p>
                ) : (
                    <p className={styles.uploadText}>
                        <span className={styles.uploadHighlight}>Click to upload</span> or drag and drop
                    </p>
                )}
                <p className={styles.fileTypes}>PDF or DOCX only</p>
            </div>

            {error && !errorCode && (
                <div style={{ marginTop: '20px', color: '#d93025', background: '#fff0f0', padding: '12px', borderRadius: '8px', border: '1px solid #facdcd', width: '100%', maxWidth: '500px', textAlign: 'left' }}>
                    {error}
                </div>
            )}

            {selectedFile && !errorCode && (
                <>
                    <div className={styles.filePreview}>
                        <span className={styles.fileName}>📄 {selectedFile.name}</span>
                        <button
                            onClick={handleReset}
                            disabled={isAnalyzing}
                            style={{ background: 'none', border: 'none', color: '#d93025', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Remove
                        </button>
                    </div>

                    <div className={styles.jdSection}>
                        <label className={styles.jdLabel}>Do you have a target Job Description?</label>
                        <div className={styles.toggleGroup}>
                            <button
                                className={`${styles.toggleBtn} ${hasJobDescription === true ? styles.toggleBtnActive : ''}`}
                                onClick={() => setHasJobDescription(true)}
                                disabled={isAnalyzing}
                            >
                                Yes, I have one
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${hasJobDescription === false ? styles.toggleBtnActive : ''}`}
                                onClick={() => {
                                    setHasJobDescription(false);
                                    setJobDescription("");
                                }}
                                disabled={isAnalyzing}
                            >
                                No, skip this
                            </button>
                        </div>
                        {hasJobDescription && (
                            <textarea
                                className={styles.textarea}
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                disabled={isAnalyzing}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        )}
                    </div>
                    {hasJobDescription !== null && (
                        <button className={styles.proceedBtn} onClick={handleProceed}
                            style={{
                                opacity: isAnalyzing ? 0.7 : 1,
                                cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isAnalyzing ? "Analyzing & Transforming Document..." :
                                (hasJobDescription ? "Analyze with Job Description →" : "Run Generic Analysis →")}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};