import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ContactRow } from '../components/ContactRow';
import { LinkItem } from '../components/LinkItem';
import { SectionHeading } from '../components/SectionHeading';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#34495e', lineHeight: 1.5 },
    header: { textAlign: 'left', marginBottom: 20 },
    name: { 
        fontSize: 26, 
        fontFamily: 'Helvetica-Bold', 
        color: '#2c3e50', 
        lineHeight: 1.2, 
        marginBottom: 6 
    },
    contact: { fontSize: 9.5, color: '#7f8c8d' },
    link: { color: '#2980b9', textDecoration: 'underline' },
    section: { marginBottom: 18 },
    sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#2980b9', textTransform: 'uppercase', borderBottom: '2pt solid #ecf0f1', paddingBottom: 4, marginBottom: 10 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold: { fontFamily: 'Helvetica-Bold', color: '#2c3e50' },
    dateText: { color: '#7f8c8d' },
    orgText: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    bulletRow: { flexDirection: 'row', marginBottom: 4, paddingLeft: 12, paddingRight: 12 },
    bulletPoint: { width: 12, color: '#2980b9' },
    bulletText: { flex: 1, color: '#34495e' },
    skillCategory: { fontFamily: 'Helvetica-Bold', color: '#2c3e50' }
});

const ModernTemplate = ({ data }) => {
    if (!data) return null;

    const { personalInfo, professionalSummary, experience, projects, education, skills, certifications, achievements } = data;

    const contactItems = [
        { text: personalInfo?.email, url: null },
        { text: personalInfo?.phone, url: null },
        { text: personalInfo?.location, url: null },
        ...(personalInfo?.links?.map(link => ({
            text: link.url ? link.url.replace(/^https?:\/\/(www\.)?/, '') : '',
            url: link.url
        })) || [])
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo?.fullName || ' '}</Text>
                    <ContactRow 
                        items={contactItems} 
                        style={styles.contact} 
                        linkStyle={styles.link}
                        separator="  •  "
                    />
                </View>

                {professionalSummary && professionalSummary.trim() !== '' && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Professional Summary</SectionHeading>
                        <Text>{professionalSummary}</Text>
                    </View>
                )}

                {experience && experience.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Experience</SectionHeading>
                        {experience.map((exp, i) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <View wrap={false}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.bold}>{exp.role}</Text>
                                        <Text style={styles.dateText}>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</Text>
                                    </View>
                                    <Text style={styles.orgText}>
                                        {exp.organization} {exp.location ? ` | ${exp.location}` : ''}
                                    </Text>
                                </View>
                                {exp.achievements?.map((ach, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={styles.bulletPoint}>■</Text>
                                        <Text style={styles.bulletText}>{ach}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {projects && projects.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Projects</SectionHeading>
                        {projects.map((proj, i) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <View wrap={false}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.bold}>{proj.title}</Text>
                                        <Text style={styles.dateText}>{proj.date}</Text>
                                    </View>
                                    <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                                        <Text style={styles.orgText}>{proj.description}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {proj.githubUrl && <LinkItem url={proj.githubUrl} label="GitHub" style={styles.link} />}
                                            {proj.liveUrl && <LinkItem url={proj.liveUrl} label="Live Demo" style={styles.link} />}
                                        </View>
                                    </View>
                                </View>
                                {proj.highlights?.map((hl, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={styles.bulletPoint}>■</Text>
                                        <Text style={styles.bulletText}>{hl}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {education && education.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Education</SectionHeading>
                        {education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.bold}>{edu.institution}</Text>
                                    <Text style={styles.dateText}>{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ''}</Text>
                                </View>
                                <Text>
                                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                                    {edu.location ? ` | ${edu.location}` : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {skills && skills.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>Skills</SectionHeading>
                        {skills.map((skillGroup, i) => (
                            <Text key={i} style={{ marginBottom: 6 }}>
                                <Text style={styles.skillCategory}>{skillGroup.category}: </Text>
                                {skillGroup.items?.join(', ')}
                            </Text>
                        ))}
                    </View>
                )}

                {certifications && certifications.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>Certifications</SectionHeading>
                        {certifications.map((cert, i) => (
                            <Text key={i} style={{ marginBottom: 6 }}>
                                <Text style={styles.bold}>{cert.name}</Text>
                                {cert.issuer ? ` - ${cert.issuer}` : ''} {cert.date ? ` (${cert.date})` : ''}
                            </Text>
                        ))}
                    </View>
                )}

                {achievements && achievements.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>Achievements</SectionHeading>
                        {achievements.map((ach, i) => (
                             <View key={i} style={styles.bulletRow}>
                                 <Text style={styles.bulletPoint}>■</Text>
                                 <Text style={styles.bulletText}>{ach}</Text>
                             </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default ModernTemplate;