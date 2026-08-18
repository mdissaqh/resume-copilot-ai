import React from 'react';
import { Briefcase, GraduationCap, FolderGit2, Wrench, Award, Link as LinkIcon, Layers } from 'lucide-react';
import { useResumeStore } from '../../../../store/useResumeStore';
import { generateId } from '../../../../utils/idGenerator';
import styles from './FloatingToolbar.module.css';

export const FloatingToolbar = () => {
    const { addArrayItem } = useResumeStore();

    const handleAddExperience = () => {
        addArrayItem(['experience'], {
            _id: generateId(),
            role: '',
            organization: '',
            location: '',
            startDate: '',
            endDate: '',
            achievements: ['']
        });
    };

    const handleAddProject = () => {
        addArrayItem(['projects'], {
            _id: generateId(),
            title: '',
            description: '',
            date: '',
            githubUrl: '',
            liveUrl: '',
            highlights: ['']
        });
    };

    const handleAddEducation = () => {
        addArrayItem(['education'], {
            _id: generateId(),
            institution: '',
            degree: '',
            fieldOfStudy: '',
            location: '',
            startDate: '',
            endDate: ''
        });
    };

    const handleAddSkill = () => {
        addArrayItem(['skills'], {
            _id: generateId(),
            category: 'Core Skills',
            items: []
        });
    };

    const handleAddCertification = () => {
        addArrayItem(['certifications'], {
            _id: generateId(),
            name: '',
            issuer: '',
            date: ''
        });
    };

    const handleAddLink = () => {
        addArrayItem(['personalInfo', 'links'], {
            platform: 'LinkedIn',
            url: ''
        });
    };

    const handleAddSection = () => {
        addArrayItem(['additionalSections'], {
            _id: generateId(),
            sectionTitle: 'Additional Section',
            items: [{ _id: generateId(), heading: '', description: '' }]
        });
    };

    return (
        <aside className={styles.floatingDock} aria-label="Resume builder controls">
            <span className={styles.dockTitle}>+ Add Content</span>
            <div className={styles.buttonGrid}>
                <button className={styles.dockBtn} onClick={handleAddExperience} title="Add Professional Experience">
                    <Briefcase size={14} />
                    <span>Experience</span>
                </button>
                <button className={styles.dockBtn} onClick={handleAddProject} title="Add Project">
                    <FolderGit2 size={14} />
                    <span>Project</span>
                </button>
                <button className={styles.dockBtn} onClick={handleAddEducation} title="Add Education">
                    <GraduationCap size={14} />
                    <span>Education</span>
                </button>
                <button className={styles.dockBtn} onClick={handleAddSkill} title="Add Skill Category">
                    <Wrench size={14} />
                    <span>Skill</span>
                </button>
                <button className={styles.dockBtn} onClick={handleAddCertification} title="Add Certification">
                    <Award size={14} />
                    <span>Certificate</span>
                </button>
                <button className={styles.dockBtn} onClick={handleAddLink} title="Add Contact Link">
                    <LinkIcon size={14} />
                    <span>Link</span>
                </button>
                <button className={styles.dockBtn} onClick={handleAddSection} title="Add Custom Section">
                    <Layers size={14} />
                    <span>Custom</span>
                </button>
            </div>
        </aside>
    );
};
