import React from 'react';
import styles from './A4Canvas.module.css';
import ClassicHTMLTemplate from './templates/ClassicHTMLTemplate';

// Registry for future templates
const getTemplate = (templateId, resumeData) => {
    switch (templateId) {
        // Modern and Minimal templates will be added in future
        case 'classic':
        default:
            return <ClassicHTMLTemplate data={resumeData} />;
    }
};

export const A4Canvas = ({ resumeData, templateId = 'classic' }) => {
    if (!resumeData) return null;

    return (
        <div className={styles.canvasWrapper}>
            <div className={styles.a4Page} id="resume-a4-document">
                {getTemplate(templateId, resumeData)}
            </div>
        </div>
    );
};