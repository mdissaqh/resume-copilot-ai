import React from 'react';
import { A4Canvas } from '../A4Canvas/A4Canvas';
import styles from '../../styles/Preview.module.css';

const Preview = ({ resumeData, templateId }) => {
    // Replaced @react-pdf/renderer with the new HTML/CSS A4Canvas
    if (!resumeData) return null;

    return (
        <div className={styles.previewWrapper}>
            <A4Canvas resumeData={resumeData} templateId={templateId} />
        </div>
    );
};

export default Preview;