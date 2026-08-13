import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from '../../styles/Preview.module.css';
import TemplateClassic from '../Templates/TemplateClassic';
import TemplateModern from '../Templates/TemplateModern';
import TemplateMinimal from '../Templates/TemplateMinimal';

const Preview = ({ resumeData, templateId }) => {
    if (!resumeData) return null;

    const renderTemplate = () => {
        switch (templateId) {
            case 'modern': return <TemplateModern data={resumeData} />;
            case 'minimal': return <TemplateMinimal data={resumeData} />;
            case 'classic':
            default:
                return <TemplateClassic data={resumeData} />;
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
                            <button className={styles.toolbarBtn} onClick={() => zoomOut()}>- Zoom Out</button>
                            <button className={styles.toolbarBtn} onClick={() => resetTransform()}>Fit Screen</button>
                            <button className={styles.toolbarBtn} onClick={() => zoomIn()}>+ Zoom In</button>
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