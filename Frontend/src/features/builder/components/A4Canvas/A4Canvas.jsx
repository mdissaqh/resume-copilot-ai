import React, { useRef, useState, useLayoutEffect } from 'react';
import styles from './A4Canvas.module.css';
import { generateEvergreenBlocks } from './templates/EvergreenResumeRenderer';
import { PaginationEngine } from './PaginationEngine';

export const A4Canvas = ({ resumeData }) => {
    const wrapperRef = useRef(null);
    const scaleContainerRef = useRef(null);

    const [scale, setScale] = useState(1);
    const [wrapperHeight, setWrapperHeight] = useState('auto');
    const [pageCount, setPageCount] = useState(1);

    const blocks = generateEvergreenBlocks(resumeData);

    // RESPONSIVE MOBILE SCALING ENGINE
    useLayoutEffect(() => {
        if (!wrapperRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            const TARGET_WIDTH = 834; // A4 width (794px) + comfortable workspace padding (40px)

            if (width < TARGET_WIDTH) {
                setScale(width / TARGET_WIDTH);
            } else {
                setScale(1);
            }
        });

        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        const PAGE_HEIGHT = 1123;
        const PAGE_GAP = 30;
        const unscaledHeight = (PAGE_HEIGHT * pageCount) + (PAGE_GAP * (pageCount - 1)) + 40;
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