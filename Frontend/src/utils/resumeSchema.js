import { z } from 'zod';

const safeString = z.string().catch('');
const safeBoolean = z.boolean().catch(false);

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const LinkItemSchema = z.object({
    _id:      safeString,
    platform: safeString,
    url:      safeString
}).passthrough().catch({ platform: '', url: '' });

const ExperienceItemSchema = z.object({
    _id:          safeString,
    organization: safeString,
    role:         safeString,
    location:     safeString,
    startDate:    safeString,
    endDate:      safeString,
    description:  safeString,
    achievements: z.array(safeString).catch([])
}).passthrough().catch({ organization: '', role: '', achievements: [] });

const ProjectItemSchema = z.object({
    _id:          safeString,
    title:        safeString,
    technologies: z.array(safeString).catch([]),
    date:         safeString,
    liveUrl:      safeString,
    githubUrl:    safeString,
    description:  safeString,
    highlights:   z.array(safeString).catch([])
}).passthrough().catch({ title: '', description: '', highlights: [] });

const EducationItemSchema = z.object({
    _id:         safeString,
    institution: safeString,
    degree:      safeString,
    fieldOfStudy: safeString,
    score:       safeString,   // ← CRITICAL: was missing, caused CGPA loss
    location:    safeString,
    startDate:   safeString,
    endDate:     safeString
}).passthrough().catch({ institution: '', degree: '' });

const SkillGroupSchema = z.object({
    _id:      safeString,
    category: safeString,
    items:    z.array(safeString).catch([])
}).passthrough().catch({ category: '', items: [] });

const CertificationItemSchema = z.object({
    _id:      safeString,
    name:     safeString,
    issuer:   safeString,
    date:     safeString,
    url:      safeString,       // ← CRITICAL: was missing, caused cert links loss
    platform: safeString
}).passthrough().catch({ name: '', issuer: '', date: '' });

const CustomSectionItemSchema = z.object({
    _id:         safeString,
    heading:     safeString,    // canonical field (not "title")
    subheading:  safeString,
    date:        safeString,
    description: safeString
}).passthrough().catch({ heading: '', description: '' });

const AdditionalSectionSchema = z.object({
    _id:          safeString,
    id:           safeString,
    sectionTitle: safeString,
    items: z.array(CustomSectionItemSchema).catch([])
}).passthrough().catch({ sectionTitle: '', items: [] });

const MetadataSchema = z.object({
    persona:        safeString.default('experienced'),
    targetRole:     safeString,
    candidateLevel: safeString.default('mid'),
    jobType:        safeString.default('technical'),
    jdProvided:     safeBoolean,
    jobDescription: safeString,                  // ← persisted JD context
    sectionOrder:   z.array(safeString).nullable().catch(null)
}).passthrough().catch({
    persona: 'experienced',
    targetRole: '',
    candidateLevel: 'mid',
    jobType: 'technical',
    jdProvided: false,
    jobDescription: '',
    sectionOrder: null
});

// ─── Root schema ─────────────────────────────────────────────────────────────

export const resumeSchema = z.object({
    schemaVersion:       z.number().catch(3),
    metadata:            MetadataSchema,
    personalInfo: z.object({
        fullName: safeString,
        email:    safeString,
        phone:    safeString,
        location: safeString,
        links:    z.array(LinkItemSchema).catch([])
    }).passthrough().catch({ fullName: '', email: '', phone: '', location: '', links: [] }),
    professionalSummary: safeString,
    experience:          z.array(ExperienceItemSchema).catch([]),
    projects:            z.array(ProjectItemSchema).catch([]),
    education:           z.array(EducationItemSchema).catch([]),
    skills:              z.array(SkillGroupSchema).catch([]),
    certifications:      z.array(CertificationItemSchema).catch([]),
    achievements:        z.array(safeString).catch([]),
    additionalSections:  z.array(AdditionalSectionSchema).catch([])
}).passthrough().catch({});