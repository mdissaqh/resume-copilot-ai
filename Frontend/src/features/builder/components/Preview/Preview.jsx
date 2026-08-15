import { PDFViewer } from '@react-pdf/renderer';
import { getTemplate } from '../../pdf/TemplateRegistry';
import styles from '../../styles/Preview.module.css';

const Preview = ({ resumeData, templateId }) => {
    if (!resumeData) return null;

    return (
        <div className={styles.previewWrapper}>
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} className={styles.pdfViewer}>
                {getTemplate(templateId, resumeData)}
            </PDFViewer>
        </div>
    );
};

export default Preview;