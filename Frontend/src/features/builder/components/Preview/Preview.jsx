import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from '../../styles/Preview.module.css';
import TemplateClassic from '../Templates/TemplateClassic';
import TemplateModern from '../Templates/TemplateModern';
import TemplateMinimal from '../Templates/TemplateMinimal';
import { normalizeResumeData } from '../../../../utils/resumeNormalizer';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const Preview = ({ resumeData, templateId }) => {
    if (!resumeData) return null;
    const normalizedData = normalizeResumeData(resumeData);

    const renderTemplate = () => {
        switch (templateId) {
            case 'modern': return <TemplateModern data={normalizedData} />;
            case 'minimal': return <TemplateMinimal data={normalizedData} />;
            case 'classic': default: return <TemplateClassic data={normalizedData} />;
        }
    };

    return (
        <div className={styles.previewWrapper}>
            <TransformWrapper
                initialScale={1}
                minScale={0.3}
                maxScale={3}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <div className={styles.toolbar}>
                            <button className={styles.toolbarBtn} onClick={() => zoomOut()} title="Zoom Out"><ZoomOut size={16}/> Zoom Out</button>
                            <button className={styles.toolbarBtn} onClick={() => resetTransform()} title="Fit Page"><Maximize size={16}/> Fit Page</button>
                            <button className={styles.toolbarBtn} onClick={() => zoomIn()} title="Zoom In"><ZoomIn size={16}/> Zoom In</button>
                        </div>
                        <div className={styles.canvasContainer}>
                            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                                <div className={styles.paper}>
                                    {renderTemplate()}
                                </div>
                            </TransformComponent>
                        </div>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

export default Preview;