import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import styles from "../styles/DropZoneArea.module.css";
import { analyzeResumeApi } from "../api/upload.api";
import { AnalysisResults } from './AnalysisResults';

export const DropzoneArea = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [hasJobDescription, setHasJobDescription] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
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
        if (isDragActive) return `${styles.dropzone} ${styles.dropzoneActive}`
        return styles.dropzone;
    };

    const handleProceed = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await analyzeResumeApi(selectedFile, jobDescription);
            console.log("Success! AI Results:", response);
            setAnalysisResult(response.analysis);
        } catch (err) {
            console.error("Failed to analyze resume:", err);
            setError("An error occurred while analyzing your resume. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    const handleReset = () => {
        setSelectedFile(null);
        setHasJobDescription(null);
        setJobDescription("");
        setError(null);
        setAnalysisResult(null);
    };

    if (analysisResult) {
        return <AnalysisResults analysis={analysisResult} onReset={handleReset} />;
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
            {selectedFile && (
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
                            {isAnalyzing ? "Analyzing Document..." :
                                (hasJobDescription ? "Analyze with Job Description →" : "Run Generic Analysis →")}
                        </button>
                    )}
                </>
            )}
        </div>
    )
}