import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Trash2, ChevronsUp, ChevronsDown } from 'lucide-react';
import { useResumeStore } from '../../../../store/useResumeStore';
import styles from './SectionWrapper.module.css';

export const SectionWrapper = ({
    sectionKey,
    title,
    onMoveUp,
    onMoveDown,
    onDelete,
    children,
    isEmpty = false
}) => {
    const [focused, setFocused] = useState(false);
    const containerRef = useRef(null);

    const {
        moveSectionUp,
        moveSectionDown,
        moveSectionToTop,
        moveSectionToBottom,
        deleteSection
    } = useResumeStore();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <section
            ref={containerRef}
            className={`${styles.sectionContainer} ${focused ? styles.focused : ''}`}
            data-section-key={sectionKey}
            onClick={() => setFocused(true)}
        >
            {/* Heading Contextual Controls (Hidden on Print) */}
            <div className={styles.sectionControls}>
                <span className={styles.sectionLabel}>{title}</span>
                
                <button
                    className={styles.controlBtn}
                    onClick={(e) => { e.stopPropagation(); moveSectionToTop(sectionKey); }}
                    title="Move to Top"
                    type="button"
                >
                    <ChevronsUp size={12} /> Top
                </button>

                <button
                    className={styles.controlBtn}
                    onClick={(e) => { e.stopPropagation(); moveSectionUp(sectionKey); }}
                    title="Move Up"
                    type="button"
                >
                    <ArrowUp size={12} /> Up
                </button>

                <button
                    className={styles.controlBtn}
                    onClick={(e) => { e.stopPropagation(); moveSectionDown(sectionKey); }}
                    title="Move Down"
                    type="button"
                >
                    <ArrowDown size={12} /> Down
                </button>

                <button
                    className={styles.controlBtn}
                    onClick={(e) => { e.stopPropagation(); moveSectionToBottom(sectionKey); }}
                    title="Move to Bottom"
                    type="button"
                >
                    <ChevronsDown size={12} /> Bottom
                </button>

                <button
                    className={`${styles.controlBtn} ${styles.dangerBtn}`}
                    onClick={(e) => { e.stopPropagation(); deleteSection(sectionKey); }}
                    title="Delete Section"
                    type="button"
                >
                    <Trash2 size={12} /> Delete
                </button>
            </div>

            {/* Section Content */}
            <div className={styles.sectionBody}>
                {children}
            </div>
        </section>
    );
};
