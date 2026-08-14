import React, { useState, useEffect } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { ResumeDocument } from '../../utils/pdfExport';
import { normalizeResumeData } from '../../../../utils/resumeNormalizer';
import { templateConfig } from '../../../../utils/templateConfig';
import { Loader2 } from 'lucide-react';
import styles from '../../styles/Preview.module.css';

const Preview = ({ resumeData, templateId }) => {
    const [debouncedData, setDebouncedData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Debounce the PDF rendering to prevent UI freezing during typing
    useEffect(() => {
        setIsUpdating(true);
        const handler = setTimeout(() => {
            setDebouncedData(normalizeResumeData(resumeData));
            setIsUpdating(false);
        }, 800);
        return () => clearTimeout(handler);
    }, [resumeData]);

    if (!debouncedData) return <div className={styles.loadingState}><Loader2 className={styles.spinner}/> Preparing Document Canvas...</div>;

    const config = templateConfig[templateId] || templateConfig.classic;

    return (
        <div className={styles.previewWrapper}>
            {isUpdating && <div className={styles.updatingBadge}>Generating preview...</div>}
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} className={styles.pdfViewer}>
                <ResumeDocument data={debouncedData} config={config} />
            </PDFViewer>
        </div>
    );
};

export default Preview;