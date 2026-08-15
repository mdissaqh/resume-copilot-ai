import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ContactRow } from '../components/ContactRow';
import { LinkItem } from '../components/LinkItem';
import { SectionHeading } from '../components/SectionHeading';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#222222', lineHeight: 1.5 },
    header: { textAlign: 'left', marginBottom: 24 },
    name: { 
        fontSize: 22, 
        fontFamily: 'Helvetica', 
        color: '#111111', 
        letterSpacing: 1, 
        lineHeight: 1.2, 
        marginBottom: 6 
    },
    contact: { fontSize: 9.5, color: '#666666' },
    link: { color: '#666666', textDecoration: 'underline' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#333333', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
    flexRow: { flexDirection: 'row', marginBottom: 16 },
    leftCol: { width: 120, color: '#666666', fontSize: 9.5 },
    rightCol: { flex: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold: { fontFamily: 'Helvetica-Bold', color: '#111111' },
    orgText: { color: '#555555', marginBottom: 4 },
    bulletRow: { flexDirection: 'row', marginBottom: 3 },
    bulletText: { flex: 1, color: '#444444' }
});

const MinimalTemplate = ({ data }) => {
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
                        separator="   /   "
                    />
                </View>

                {professionalSummary && professionalSummary.trim() !== '' && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>ABOUT</SectionHeading>
                        <Text>{professionalSummary}</Text>
                    </View>
                )}

                {experience && experience.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>EXPERIENCE</SectionHeading>
                        {experience.map((exp, i) => (
                            <View key={i} style={styles.flexRow} wrap={false}>
                                <View style={styles.leftCol}>
                                    <Text>{exp.startDate}</Text>
                                    <Text>{exp.endDate}</Text>
                                </View>
                                <View style={styles.rightCol}>
                                    <Text style={styles.bold}>{exp.role}</Text>
                                    <Text style={styles.orgText}>{exp.organization} {exp.location ? `| ${exp.location}` : ''}</Text>
                                    {exp.achievements?.map((ach, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={{ width: 12 }}>-</Text>
                                            <Text style={styles.bulletText}>{ach}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {projects && projects.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>PROJECTS</SectionHeading>
                        {projects.map((proj, i) => (
                            <View key={i} style={styles.flexRow} wrap={false}>
                                <View style={styles.leftCol}>
                                    <Text>{proj.date}</Text>
                                </View>
                                <View style={styles.rightCol}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.bold}>{proj.title}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {proj.githubUrl && <LinkItem url={proj.githubUrl} label="GitHub" style={styles.link} />}
                                            {proj.liveUrl && <LinkItem url={proj.liveUrl} label="Live Demo" style={styles.link} />}
                                        </View>
                                    </View>
                                    {proj.description && <Text style={styles.orgText}>{proj.description}</Text>}
                                    {proj.highlights?.map((hl, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={{ width: 12 }}>-</Text>
                                            <Text style={styles.bulletText}>{hl}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {education && education.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>EDUCATION</SectionHeading>
                        {education.map((edu, i) => (
                            <View key={i} style={styles.flexRow} wrap={false}>
                                <View style={styles.leftCol}>
                                    <Text>{edu.startDate}</Text>
                                    <Text>{edu.endDate}</Text>
                                </View>
                                <View style={styles.rightCol}>
                                    <Text style={styles.bold}>{edu.institution} {edu.location ? `| ${edu.location}` : ''}</Text>
                                    <Text>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {skills && skills.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>EXPERTISE</SectionHeading>
                        {skills.map((skillGroup, i) => (
                            <Text key={i} style={{ marginBottom: 6 }}>
                                <Text style={styles.bold}>{skillGroup.category}</Text> — <Text>{skillGroup.items?.join(', ')}</Text>
                            </Text>
                        ))}
                    </View>
                )}

                {certifications && certifications.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>CERTIFICATIONS</SectionHeading>
                        {certifications.map((cert, i) => (
                            <View key={i} style={styles.flexRow}>
                                <View style={styles.leftCol}>
                                    <Text>{cert.date}</Text>
                                </View>
                                <View style={styles.rightCol}>
                                    <Text style={styles.bold}>{cert.name}</Text>
                                    {cert.issuer && <Text style={styles.orgText}>{cert.issuer}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {achievements && achievements.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>ACHIEVEMENTS</SectionHeading>
                        {achievements.map((ach, i) => (
                             <View key={i} style={styles.bulletRow}>
                                 <Text style={{ width: 12 }}>-</Text>
                                 <Text style={styles.bulletText}>{ach}</Text>
                             </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default MinimalTemplate;