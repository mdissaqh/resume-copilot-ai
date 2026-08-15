import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ContactRow } from '../components/ContactRow';
import { LinkItem } from '../components/LinkItem';
import { SectionHeading } from '../components/SectionHeading';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 11, color: '#000000', lineHeight: 1.4 },
    header: { textAlign: 'center', marginBottom: 16 },
    name: { 
        fontSize: 24, 
        fontFamily: 'Times-Bold', 
        textTransform: 'uppercase', 
        lineHeight: 1.2,
        marginBottom: 6 
    },
    contact: { fontSize: 10, color: '#000000' },
    link: { color: '#000000', textDecoration: 'none' }, 
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 12, fontFamily: 'Times-Bold', textTransform: 'uppercase', borderBottom: '1pt solid #000', paddingBottom: 2, marginBottom: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold: { fontFamily: 'Times-Bold' },
    italic: { fontFamily: 'Times-Italic' },
    bulletRow: { flexDirection: 'row', marginBottom: 3, paddingLeft: 12, paddingRight: 12 },
    bulletText: { flex: 1 },
    skillCategory: { fontFamily: 'Times-Bold' }
});

const ClassicTemplate = ({ data }) => {
    if (!data) return null;
    
    const { personalInfo, professionalSummary, experience, projects, education, skills, certifications, achievements } = data;

    // Safely map contact fields to objects required by the updated ContactRow
    const contactItems = [
        { text: personalInfo?.email, url: null },
        { text: personalInfo?.phone, url: null },
        { text: personalInfo?.location, url: null },
        ...(personalInfo?.links?.map(link => ({
            // Strip https://www. for cleaner display, but keep the raw url for the href annotation
            text: link.url ? link.url.replace(/^https?:\/\/(www\.)?/, '') : '',
            url: link.url
        })) || [])
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* PERSONAL INFO */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo?.fullName || ' '}</Text>
                    <ContactRow 
                        items={contactItems} 
                        style={styles.contact} 
                        linkStyle={styles.link}
                    />
                </View>

                {/* SUMMARY */}
                {professionalSummary && professionalSummary.trim() !== '' && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Professional Summary</SectionHeading>
                        <Text>{professionalSummary}</Text>
                    </View>
                )}

                {/* EXPERIENCE */}
                {experience && experience.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Experience</SectionHeading>
                        {experience.map((exp, i) => (
                            <View key={i} style={{ marginBottom: 10 }}>
                                <View wrap={false}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.bold}>{exp.role}</Text>
                                        <Text style={styles.bold}>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</Text>
                                    </View>
                                    <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                                        <Text style={styles.italic}>{exp.organization}</Text>
                                        <Text style={styles.italic}>{exp.location}</Text>
                                    </View>
                                </View>
                                {exp.achievements?.map((ach, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={{ width: 15 }}>•</Text>
                                        <Text style={styles.bulletText}>{ach}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* PROJECTS */}
                {projects && projects.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Projects</SectionHeading>
                        {projects.map((proj, i) => (
                            <View key={i} style={{ marginBottom: 10 }}>
                                <View wrap={false}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.bold}>{proj.title}</Text>
                                        <Text style={styles.bold}>{proj.date}</Text>
                                    </View>
                                    <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                                        <Text style={styles.italic}>{proj.description}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {proj.githubUrl && <LinkItem url={proj.githubUrl} label="GitHub" style={styles.link} />}
                                            {proj.liveUrl && <LinkItem url={proj.liveUrl} label="Live Demo" style={styles.link} />}
                                        </View>
                                    </View>
                                </View>
                                {proj.highlights?.map((hl, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={{ width: 15 }}>•</Text>
                                        <Text style={styles.bulletText}>{hl}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* EDUCATION */}
                {education && education.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeading style={styles.sectionTitle}>Education</SectionHeading>
                        {education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.bold}>{edu.institution}</Text>
                                    <Text style={styles.bold}>{edu.location}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                                    <Text>{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ''}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* SKILLS */}
                {skills && skills.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>Skills</SectionHeading>
                        {skills.map((skillGroup, i) => (
                            <Text key={i} style={{ marginBottom: 4 }}>
                                <Text style={styles.skillCategory}>{skillGroup.category}: </Text>
                                {skillGroup.items?.join(', ')}
                            </Text>
                        ))}
                    </View>
                )}

                {/* CERTIFICATIONS */}
                {certifications && certifications.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>Certifications</SectionHeading>
                        {certifications.map((cert, i) => (
                            <Text key={i} style={{ marginBottom: 4 }}>
                                <Text style={styles.bold}>{cert.name}</Text>
                                {cert.issuer ? ` - ${cert.issuer}` : ''} {cert.date ? ` (${cert.date})` : ''}
                            </Text>
                        ))}
                    </View>
                )}

                {/* ACHIEVEMENTS */}
                {achievements && achievements.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <SectionHeading style={styles.sectionTitle}>Achievements</SectionHeading>
                        {achievements.map((ach, i) => (
                             <View key={i} style={styles.bulletRow}>
                                 <Text style={{ width: 15 }}>•</Text>
                                 <Text style={styles.bulletText}>{ach}</Text>
                             </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default ClassicTemplate;