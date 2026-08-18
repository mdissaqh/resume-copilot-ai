import React, { useState, useRef, useEffect } from 'react';
import { Plus, Briefcase, GraduationCap, FolderGit2, Wrench, Award, FileText, Link as LinkIcon, Layers } from 'lucide-react';
import { useResumeStore } from '../../../../store/useResumeStore';
import { generateId } from '../../../../utils/idGenerator';
import styles from './AddSectionMenu.module.css';

export const AddSectionMenu = () => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const {
        resumeData,
        addArrayItem,
        updateField,
        getSectionOrder
    } = useResumeStore();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const ensureSectionInOrder = (sectionKey) => {
        const currentOrder = getSectionOrder();
        if (!currentOrder.includes(sectionKey)) {
            updateField(['metadata', 'sectionOrder'], [...currentOrder, sectionKey]);
        }
    };

    const hasSummary = Boolean(resumeData?.professionalSummary && resumeData.professionalSummary.trim().length > 0);
    const hasExperience = Array.isArray(resumeData?.experience) && resumeData.experience.length > 0;
    const hasProject = Array.isArray(resumeData?.projects) && resumeData.projects.length > 0;
    const hasEducation = Array.isArray(resumeData?.education) && resumeData.education.length > 0;
    const hasSkill = Array.isArray(resumeData?.skills) && resumeData.skills.length > 0;
    const hasCertification = Array.isArray(resumeData?.certifications) && resumeData.certifications.length > 0;

    const handleAddSummary = () => {
        updateField(['professionalSummary'], 'Add a compelling professional summary highlighting your key strengths...');
        ensureSectionInOrder('summary');
        setOpen(false);
    };

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
        ensureSectionInOrder('experience');
        setOpen(false);
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
        ensureSectionInOrder('projects');
        setOpen(false);
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
        ensureSectionInOrder('education');
        setOpen(false);
    };

    const handleAddSkill = () => {
        addArrayItem(['skills'], {
            _id: generateId(),
            category: 'Core Skills',
            items: []
        });
        ensureSectionInOrder('skills');
        setOpen(false);
    };

    const handleAddCertification = () => {
        addArrayItem(['certifications'], {
            _id: generateId(),
            name: '',
            issuer: '',
            date: ''
        });
        ensureSectionInOrder('certifications');
        setOpen(false);
    };

    const handleAddLink = () => {
        addArrayItem(['personalInfo', 'links'], {
            platform: 'LinkedIn',
            url: ''
        });
        setOpen(false);
    };

    const handleAddCustom = () => {
        addArrayItem(['additionalSections'], {
            _id: generateId(),
            sectionTitle: 'Additional Section',
            items: [{ _id: generateId(), heading: '', description: '' }]
        });
        ensureSectionInOrder('additionalSections');
        setOpen(false);
    };

    return (
        <div className={styles.container} ref={menuRef}>
            <button
                type="button"
                className={styles.addSectionBtn}
                onClick={() => setOpen(!open)}
                title="Add new section to document"
            >
                <Plus size={16} />
                <span>Add Section</span>
            </button>

            {open && (
                <div className={styles.popoverMenu}>
                    <div className={styles.menuHeader}>Available Sections</div>
                    {!hasSummary && (
                        <button className={styles.menuItem} onClick={handleAddSummary}>
                            <FileText size={14} /> Professional Summary
                        </button>
                    )}
                    {!hasExperience && (
                        <button className={styles.menuItem} onClick={handleAddExperience}>
                            <Briefcase size={14} /> Experience
                        </button>
                    )}
                    {!hasProject && (
                        <button className={styles.menuItem} onClick={handleAddProject}>
                            <FolderGit2 size={14} /> Project
                        </button>
                    )}
                    {!hasEducation && (
                        <button className={styles.menuItem} onClick={handleAddEducation}>
                            <GraduationCap size={14} /> Education
                        </button>
                    )}
                    {!hasSkill && (
                        <button className={styles.menuItem} onClick={handleAddSkill}>
                            <Wrench size={14} /> Skills Category
                        </button>
                    )}
                    {!hasCertification && (
                        <button className={styles.menuItem} onClick={handleAddCertification}>
                            <Award size={14} /> Certification
                        </button>
                    )}
                    <button className={styles.menuItem} onClick={handleAddLink}>
                        <LinkIcon size={14} /> Contact Link
                    </button>
                    <button className={styles.menuItem} onClick={handleAddCustom}>
                        <Layers size={14} /> Custom Section
                    </button>
                </div>
            )}
        </div>
    );
};
