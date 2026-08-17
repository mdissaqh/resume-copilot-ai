import React, { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import styles from './A4Canvas.module.css';

/**
 * Tracks the exact physical height of an individual resume block.
 */
const MeasureBlock = ({ id, onMeasure, children }) => {
    const blockRef = useRef(null);

    useLayoutEffect(() => {
        if (!blockRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // borderBoxSize guarantees the most robust pixel measurement including padding
                const height = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
                onMeasure(id, height);
            }
        });
        
        observer.observe(blockRef.current);
        return () => observer.disconnect();
    }, [id, onMeasure]);

    return (
        <div ref={blockRef} className={styles.measureBlock} data-block-id={id}>
            {children}
        </div>
    );
};

/**
 * Renders the allocated blocks for a single physical A4 page.
 * Responsibilities:
 * 1. Output the blocks.
 * 2. Group sequential 'bullet' types into an ATS-friendly semantic <ul>.
 */
const PageRenderer = ({ blocks, onMeasure, pageIndex }) => {
    const elements = [];
    let currentList = [];

    blocks.forEach((block, i) => {
        const el = (
            <MeasureBlock key={`${pageIndex}-${block.id}`} id={block.id} onMeasure={onMeasure}>
                {block.content}
            </MeasureBlock>
        );
        
        if (block.type === 'bullet') {
            currentList.push(el);
            // If the next block is NOT a bullet, or this is the last block, flush the <ul>
            if (!blocks[i+1] || blocks[i+1].type !== 'bullet') {
                elements.push(
                    <ul key={`ul-${block.id}`} className={styles.bulletList}>
                        {currentList}
                    </ul>
                );
                currentList = []; // Reset for the next list
            }
        } else {
            elements.push(el);
        }
    });

    return <>{elements}</>;
};

/**
 * The Core React Pagination Engine.
 */
export const PaginationEngine = ({ blocks, onPageCountChange }) => {
    const [heights, setHeights] = useState({});

    const handleMeasure = useCallback((id, height) => {
        setHeights(prev => {
            // ANTI-LOOP GUARD: Ignore sub-pixel changes (< 1.5px) caused by browser rounding.
            // This prevents infinite React render loops while typing.
            if (Math.abs((prev[id] || 0) - height) < 1.5) return prev;
            return { ...prev, [id]: height };
        });
    }, []);

    // A4 Dimensions: 297mm height = ~1123px. 
    // Margins: 75px top + 75px bottom = 150px.
    // Safe content area = 1123 - 150 = 973px. We use 960px to leave a safe buffer.
    const SAFE_PAGE_HEIGHT = 960; 

    // ALLOCATION ALGORITHM
    const pages = useMemo(() => {
        const allocatedPages = [];
        let currentPage = [];
        let currentHeight = 0;

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const blockHeight = heights[block.id] || 0; 
            
            // Orphan Control: Do not leave a Section Title at the bottom of a page without its content
            const nextBlock = blocks[i+1];
            const nextBlockHeight = nextBlock ? (heights[nextBlock.id] || 0) : 0;
            
            let pushToNextPage = false;
            
            if (currentHeight + blockHeight > SAFE_PAGE_HEIGHT && currentPage.length > 0) {
                pushToNextPage = true;
            } else if (block.type === 'section-title' && (currentHeight + blockHeight + nextBlockHeight > SAFE_PAGE_HEIGHT)) {
                pushToNextPage = true;
            }

            if (pushToNextPage) {
                allocatedPages.push(currentPage);
                currentPage = [block];
                currentHeight = blockHeight;
            } else {
                currentPage.push(block);
                currentHeight += blockHeight;
            }
        }
        
        if (currentPage.length > 0) {
            allocatedPages.push(currentPage);
        }
        
        return allocatedPages;
    }, [blocks, heights]);

    // Report page count back up to A4Canvas to calculate accurate container heights
    useLayoutEffect(() => {
        if (onPageCountChange) {
            onPageCountChange(pages.length);
        }
    }, [pages.length, onPageCountChange]);

    return (
        <>
            {pages.map((pageBlocks, index) => (
                <div key={`page-wrapper-${index}`} className={styles.a4Page} data-page-number={index + 1}>
                    <PageRenderer blocks={pageBlocks} onMeasure={handleMeasure} pageIndex={index} />
                </div>
            ))}
        </>
    );
};