import React, { useRef, useLayoutEffect, useState } from 'react';
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
    onBackspaceEmpty = null // Allows parents to know when to delete a bullet
}) => {
    const updateField = useResumeStore(state => state.updateField);
    const elementRef = useRef(null);

    // Auto-resize for multiline
    const adjustHeight = () => {
        if (type === 'multiline' && elementRef.current) {
            elementRef.current.style.height = 'auto';
            elementRef.current.style.height = `${elementRef.current.scrollHeight}px`;
        }
    };

    useLayoutEffect(() => {
        adjustHeight();
    }, [text, type]);

    const displayValue = Array.isArray(text) ? text.join(', ') : text;
    const handleChange = (e) => {
        const val = Array.isArray(text) ? e.target.value.split(',').map(s => s.trim()) : e.target.value;
        updateField(path, val);
        adjustHeight();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && text === '' && onBackspaceEmpty) {
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
    const calculatedSize = inline ? Math.max(String(displayValue || '').length, String(placeholder || '').length, 2) : undefined;

    return (
        <div className={wrapperClass}>
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
 */
export const SmartLinkEditable = ({ path, label, url, className }) => {
    const updateField = useResumeStore(state => state.updateField);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className={styles.inlineWrapper} style={{ position: 'relative' }}>
            <span
                className={className}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsEditing(true)}
            >
                {label || url || 'Add Link'}
            </span>

            {isEditing && (
                <div className={styles.linkPopover}>
                    <input
                        className={styles.linkInput}
                        placeholder="Label (e.g. LinkedIn)"
                        value={label}
                        onChange={(e) => updateField([...path, 'platform'], e.target.value)}
                    />
                    <input
                        className={styles.linkInput}
                        placeholder="URL (e.g. https://...)"
                        value={url}
                        onChange={(e) => updateField([...path, 'url'], e.target.value)}
                    />
                    <button className={styles.linkCloseBtn} onClick={() => setIsEditing(false)}>Done</button>
                </div>
            )}
        </div>
    );
};