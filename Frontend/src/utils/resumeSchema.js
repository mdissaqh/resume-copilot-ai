import { z } from 'zod';

const safeString = z.string().catch('');

const LinkItemSchema = z.object({
    platform: safeString,
    url: safeString
}).catch({ platform: '', url: '' });

export const resumeSchema = z.object({
    metadata: z.object({
        persona: safeString.default('experienced'),
        targetRole: safeString,
        jdProvided: z.boolean().catch(false)
    }).catch({ persona: 'experienced', targetRole: '', jdProvided: false }),
    
    personalInfo: z.object({
        fullName: safeString,
        email: safeString,
        phone: safeString,
        location: safeString,
        links: z.array(LinkItemSchema).catch([])
    }).catch({ fullName: '', email: '', phone: '', location: '', links: [] }),
    
    professionalSummary: safeString,
    
    experience: z.array(z.object({
        organization: safeString,
        role: safeString,
        location: safeString,
        startDate: safeString,
        endDate: safeString,
        description: safeString,
        achievements: z.array(safeString).catch([])
    }).catch({ organization: '', role: '', achievements: [] })).catch([]),
    
    projects: z.array(z.object({
        title: safeString,
        technologies: z.array(safeString).catch([]),
        date: safeString,
        liveUrl: safeString,
        githubUrl: safeString,
        description: safeString,
        highlights: z.array(safeString).catch([])
    }).catch({ title: '', description: '', highlights: [] })).catch([]),
    
    education: z.array(z.object({
        institution: safeString,
        degree: safeString,
        fieldOfStudy: safeString,
        location: safeString,
        startDate: safeString,
        endDate: safeString
    }).catch({ institution: '', degree: '' })).catch([]),
    
    skills: z.array(z.object({
        category: safeString,
        items: z.array(safeString).catch([])
    }).catch({ category: '', items: [] })).catch([]),
    
    certifications: z.array(z.object({
        name: safeString,
        issuer: safeString,
        date: safeString
    }).catch({ name: '', issuer: '', date: '' })).catch([]),
    
    achievements: z.array(safeString).catch([]),
    
    additionalSections: z.array(z.object({
        sectionTitle: safeString,
        items: z.array(z.object({
            heading: safeString,
            subheading: safeString,
            date: safeString,
            description: safeString
        }).catch({ heading: '', description: '' })).catch([])
    }).catch({ sectionTitle: '', items: [] })).catch([])
}).catch({});