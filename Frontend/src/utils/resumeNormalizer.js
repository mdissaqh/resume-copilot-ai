export const normalizeResumeData = (data) => {
    if (!data) return {};
    
    return {
        personalInfo: {
            fullName: data.personalInfo?.fullName || '',
            email: data.personalInfo?.email || '',
            phone: data.personalInfo?.phone || '',
            location: data.personalInfo?.location || '',
            links: Array.isArray(data.personalInfo?.links) ? data.personalInfo.links : []
        },
        professionalSummary: data.professionalSummary || '',
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        education: Array.isArray(data.education) ? data.education : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        additionalSections: Array.isArray(data.additionalSections) ? data.additionalSections : []
    };
};