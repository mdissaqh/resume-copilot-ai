import React from 'react';
import { SmartEditable } from '../SmartEditable/SmartEditable';
import styles from './SmartDateRange.module.css';

export const SmartDateRange = ({ startDate, endDate, startPath, endPath, className = '' }) => {
    const hasEnd = endDate && endDate.trim().length > 0;

    return (
        <div className={`${styles.dateRange} ${className}`}>
            <SmartEditable
                inline
                path={startPath}
                text={startDate}
                placeholder="Dates"
            />
            {hasEnd && <span> – </span>}
            {hasEnd && (
                <SmartEditable
                    inline
                    path={endPath}
                    text={endDate}
                    placeholder="End Date"
                />
            )}
        </div>
    );
};
