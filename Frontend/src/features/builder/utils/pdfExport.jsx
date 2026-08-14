import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#000' },
    section: { marginBottom: 15 },
    name: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, textTransform: 'uppercase' },
    contact: { fontSize: 10, textAlign: 'center', marginBottom: 15, borderBottom: '1pt solid #000', paddingBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1pt solid #000', marginBottom: 8, paddingBottom: 3 },
    rowBetween: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    bold: { fontWeight: 'bold' },
    italic: { fontStyle: 'italic' },
    bulletRow: { display: 'flex', flexDirection: 'row', marginBottom: 3, paddingLeft: 10 },
    bulletPoint: { width: 10, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 11, lineHeight: 1.4 },
    summary: { fontSize: 11, lineHeight: 1.5 }
});

const ResumePDF = ({ data, templateId }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.name}>{data.personalInfo?.fullName}</Text>
            <Text style={styles.contact}>
                {[data.personalInfo?.email, data.personalInfo?.phone, data.personalInfo?.location].filter(Boolean).join('  |  ')}
            </Text>

            {data.professionalSummary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={styles.summary}>{data.professionalSummary}</Text>
                </View>
            )}

            {data.experience?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp, i) => (
                        <View key={i} style={{ marginBottom: 10, wrap: false }}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.bold}>{exp.role}</Text>
                                <Text>{exp.startDate} - {exp.endDate}</Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.italic}>{exp.organization}</Text>
                                <Text style={styles.italic}>{exp.location}</Text>
                            </View>
                            {exp.achievements?.map((ach, j) => (
                                <View key={j} style={styles.bulletRow}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletText}>{ach}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {data.education?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {data.education.map((edu, i) => (
                        <View key={i} style={{ marginBottom: 8, wrap: false }}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.bold}>{edu.institution}</Text>
                                <Text>{edu.location}</Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                                <Text>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {data.skills?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    {data.skills.map((skillGroup, i) => (
                        <Text key={i} style={{ marginBottom: 4 }}>
                            <Text style={styles.bold}>{skillGroup.category}: </Text>
                            {skillGroup.items?.join(', ')}
                        </Text>
                    ))}
                </View>
            )}
        </Page>
    </Document>
);

export const downloadPDF = async (resumeData, templateId) => {
    const blob = await pdf(<ResumePDF data={resumeData} templateId={templateId} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo?.fullName || 'Resume'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};