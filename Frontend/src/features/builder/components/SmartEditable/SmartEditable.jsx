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
    const isFocusedRef = useRef(false);

    const storeValue = Array.isArray(text) ? text.join(', ') : (text ?? '');
    const [localValue, setLocalValue] = useState(storeValue);

    // Sync storeValue -> localValue only when NOT actively typing/focused
    useEffect(() => {
        if (!isFocusedRef.current) {
            setLocalValue(storeValue);
        }
    }, [storeValue]);

    const adjustHeight = () => {
        if (type === 'multiline' && elementRef.current) {
            elementRef.current.style.height = 'auto';
            elementRef.current.style.height = `${elementRef.current.scrollHeight}px`;
        }
    };

    useLayoutEffect(() => {
        adjustHeight();
    }, [localValue, type]);

    const commitChange = (valStr) => {
        const val = Array.isArray(text) ? valStr.split(',').map(s => s.trim()) : valStr;
        updateField(path, val);
    };

    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        adjustHeight();
        commitChange(newVal);
    };

    const handleFocus = () => {
        isFocusedRef.current = true;
    };

    const handleBlur = () => {
        isFocusedRef.current = false;
        commitChange(localValue);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && (localValue === '' || localValue === null || localValue === undefined) && onBackspaceEmpty) {
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
    const contentLen = (localValue !== undefined && localValue !== null && String(localValue).length > 0)
        ? String(localValue).length
        : Math.max(String(placeholder || '').length, 2);
    const calculatedSize = inline ? Math.max(contentLen, 2) : undefined;
    const dynamicStyle = inline ? { width: `${Math.max(contentLen, 1)}ch`, maxWidth: '100%' } : undefined;

    return (
        <div className={wrapperClass} style={inline ? { width: 'auto', display: 'inline-flex' } : undefined}>
            {type === 'multiline' ? (
                <textarea
                    ref={elementRef}
                    className={combinedClassName}
                    value={localValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
                    value={localValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
    title = 'Edit Link Details',
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

    // Infer platform label from URL if label is generic or empty
    let inferredLabel = defaultLabel;
    if (url && typeof url === 'string') {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('linkedin.com')) inferredLabel = 'LinkedIn';
        else if (lowerUrl.includes('github.com')) inferredLabel = 'GitHub';
        else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) inferredLabel = 'Twitter';
        else if (lowerUrl.includes('leetcode.com')) inferredLabel = 'LeetCode';
    }

    const effectiveLabel = (label !== undefined && label !== null && String(label).trim() !== '') 
        ? label 
        : inferredLabel;

    const validHref = (url && String(url).trim())
        ? (String(url).startsWith('http://') || String(url).startsWith('https://') ? url : `https://${url}`)
        : '#';

    const setQuickTag = (tag) => {
        if (labelPath) updateField(labelPath, tag);
    };

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
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                        {['LinkedIn', 'GitHub', 'Portfolio', 'Website', 'LeetCode'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #bfdbfe',
                                    background: effectiveLabel === tag ? '#2563eb' : '#eff6ff',
                                    color: effectiveLabel === tag ? '#fff' : '#2563eb',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                                onClick={() => setQuickTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <input
                        className={styles.linkInput}
                        placeholder={`Showcase Name (e.g. ${defaultLabel})`}
                        value={label !== undefined && label !== null && label !== '' ? label : effectiveLabel}
                        onChange={(e) => labelPath && updateField(labelPath, e.target.value)}
                    />
                    <input
                        className={styles.linkInput}
                        placeholder="URL (e.g. https://linkedin.com/in/...)"
                        value={url ?? ''}
                        onChange={(e) => urlPath && updateField(urlPath, e.target.value)}
                    />
                    <button className={styles.linkCloseBtn} onClick={() => setIsEditing(false)}>Done</button>
                </div>
            )}
        </div>
    );
};