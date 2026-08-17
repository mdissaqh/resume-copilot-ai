import React, { useRef, useState, useLayoutEffect } from 'react';
import styles from './A4Canvas.module.css';
import { generateClassicBlocks } from './templates/ClassicHTMLTemplate';
import { PaginationEngine } from './PaginationEngine';

const getTemplateBlocks = (templateId, resumeData) => {
    switch (templateId) {
        case 'classic':
        default:
            return generateClassicBlocks(resumeData);
    }
};

export const A4Canvas = ({ resumeData, templateId = 'classic' }) => {
    const wrapperRef = useRef(null);
    const scaleContainerRef = useRef(null);
    
    const [scale, setScale] = useState(1);
    const [wrapperHeight, setWrapperHeight] = useState('auto');
    const [pageCount, setPageCount] = useState(1);

    const blocks = getTemplateBlocks(templateId, resumeData);

    // MOBILE SCALING ENGINE
    useLayoutEffect(() => {
        if (!wrapperRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            
            // A4 width (794px) + comfortable workspace padding (40px)
            const TARGET_WIDTH = 834; 

            if (width < TARGET_WIDTH) {
                // Shrink proportionally to fit viewport
                setScale(width / TARGET_WIDTH);
            } else {
                // Desktop: Render at natural 100% scale
                setScale(1);
            }
        });

        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    // WRAPPER HEIGHT CALCULATION
    // CSS `transform: scale()` changes visual size but the DOM still reserves the unscaled height.
    // We must manually adjust the wrapper's height to prevent giant blank spaces on mobile.
    useLayoutEffect(() => {
        const PAGE_HEIGHT = 1123;
        const PAGE_GAP = 30;
        // Total unscaled height of all physical pages + gaps + bottom workspace padding
        const unscaledHeight = (PAGE_HEIGHT * pageCount) + (PAGE_GAP * (pageCount - 1)) + 40;
        
        // The actual space needed on screen
        const scaledHeight = unscaledHeight * scale;
        
        setWrapperHeight(`${scaledHeight}px`);
    }, [scale, pageCount]);

    if (!resumeData) return null;

    return (
        <div 
            className={styles.canvasWrapper} 
            ref={wrapperRef} 
            style={{ minHeight: wrapperHeight }}
        >
            <div 
                ref={scaleContainerRef}
                className={styles.scalingContainer} 
                style={{ transform: `scale(${scale})` }}
            >
                <PaginationEngine 
                    blocks={blocks} 
                    onPageCountChange={(count) => setPageCount(count)} 
                />
            </div>
        </div>
    );
};