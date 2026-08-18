import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useResumeStore } from '../../../../store/useResumeStore';
import styles from './SmartEditable.module.css';

/**
 * Core WYSIWYG Editor Component.
 * Binds directly to the A4 Canvas, mapping clicks directly to Zustand paths.
 */
export const SmartEditable = ({
    path,
    text = '',
    type = 'single',
    placeholder = 'Add text...',
    className = '',
    inline = false,
    onBackspaceEmpty = null
}) => {
    const updateField = useResumeStore(state => state.updateField);
    const elementRef = useRef(null);

    const adjustHeight = () => {
        if (type === 'multiline' && elementRef.current) {
            elementRef.current.style.height = 'auto';
            elementRef.current.style.height = `${elementRef.current.scrollHeight}px`;
        }
    };

    useLayoutEffect(() => {
        adjustHeight();
    }, [text, type]);

    const displayValue = Array.isArray(text) ? text.join(', ') : (text ?? '');
    const handleChange = (e) => {
        const val = Array.isArray(text) ? e.target.value.split(',').map(s => s.trim()) : e.target.value;
        updateField(path, val);
        adjustHeight();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && (text === '' || text === null || text === undefined) && onBackspaceEmpty) {
            e.preventDefault();
            onBackspaceEmpty();
        }
        if (e.key === 'Enter' && type === 'single') {
            e.preventDefault();
            elementRef.current?.blur();
        }
    };

    const wrapperClass = inline ? styles.inlineWrapper : styles.editableWrapper;
    const combinedClassName = `${type === 'multiline' ? styles.textarea : styles.input} ${className}`;
    
    // Dynamic width calculation for inline single inputs (e.g. Project Title, Dates)
    const contentLen = (displayValue !== undefined && displayValue !== null && String(displayValue).length > 0)
        ? String(displayValue).length
        : Math.max(String(placeholder || '').length, 2);
    const calculatedSize = inline ? Math.max(contentLen, 2) : undefined;
    const dynamicStyle = inline ? { width: `${Math.max(contentLen, 1)}ch`, maxWidth: '100%' } : undefined;

    return (
        <div className={wrapperClass} style={inline ? { width: 'auto', display: 'inline-flex' } : undefined}>
            {type === 'multiline' ? (
                <textarea
                    ref={elementRef}
                    className={combinedClassName}
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                />
            ) : (
                <input
                    ref={elementRef}
                    type="text"
                    size={calculatedSize}
                    style={dynamicStyle}
                    className={combinedClassName}
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

/**
 * Specialized component for editing URLs without breaking the canvas hyperlink flow.
 * Pre-fills input label text box and renders real <a> tags for 100% clickable PDF export hyperlinks.
 */
export const SmartLinkEditable = ({
    title = 'Edit Link',
    labelPath,
    urlPath,
    label,
    url = '',
    defaultLabel = 'Link',
    className = ''
}) => {
    const updateField = useResumeStore(state => state.updateField);
    const [isEditing, setIsEditing] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isEditing) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsEditing(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing]);

    const effectiveLabel = (label !== undefined && label !== null && String(label).trim() !== '') 
        ? label 
        : defaultLabel;

    const validHref = (url && String(url).trim())
        ? (String(url).startsWith('http://') || String(url).startsWith('https://') ? url : `https://${url}`)
        : '#';

    return (
        <div className={styles.inlineWrapper} ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
            <a
                href={validHref}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(!isEditing);
                }}
            >
                {effectiveLabel}
            </a>

            {isEditing && (
                <div className={styles.linkPopover}>
                    <div className={styles.linkPopoverHeader}>{title}</div>
                    <input
                        className={styles.linkInput}
                        placeholder={`Label (e.g. ${defaultLabel})`}
                        value={label !== undefined && label !== null && label !== '' ? label : defaultLabel}
                        onChange={(e) => updateField(labelPath, e.target.value)}
                    />
                    <input
                        className={styles.linkInput}
                        placeholder="URL (e.g. https://...)"
                        value={url ?? ''}
                        onChange={(e) => updateField(urlPath, e.target.value)}
                    />
                    <button className={styles.linkCloseBtn} onClick={() => setIsEditing(false)}>Done</button>
                </div>
            )}
        </div>
    );
};