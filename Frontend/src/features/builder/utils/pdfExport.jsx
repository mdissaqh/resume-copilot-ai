import { pdf, Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { validateAndFormatURL } from '../../../utils/urlValidator';

const classicStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 11, color: '#000', lineHeight: 1.5 },
    section: { marginBottom: 15 },
    name: { fontFamily: 'Times-Bold', fontSize: 24, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' },
    contactWrapper: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16, borderBottom: '1pt solid #000', paddingBottom: 12 },
    contactItem: { fontSize: 10, marginHorizontal: 4, marginBottom: 4 },
    linkItem: { fontSize: 10, color: '#000', textDecoration: 'none' },
    sectionTitle: { fontFamily: 'Times-Bold', fontSize: 12, textTransform: 'uppercase', borderBottom: '1pt solid #000', marginBottom: 10, paddingBottom: 2 },
    rowBetween: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    bold: { fontFamily: 'Times-Bold' },
    italic: { fontFamily: 'Times-Italic' },
    bulletRow: { display: 'flex', flexDirection: 'row', marginBottom: 3, paddingLeft: 10 },
    bulletPoint: { width: 15, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 11 }
});

const ContactSection = ({ personalInfo, styles, templateId }) => {
    if (!personalInfo) return null;
    const items = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
    const separator = templateId === 'modern' ? '•' : templateId === 'minimal' ? '/' : '|';
    
    return (
        <View style={styles.contactWrapper}>
            {items.map((item, i) => (
                <Text key={i} style={styles.contactItem}>
                    {item} {i < items.length - 1 || (personalInfo.links && personalInfo.links.length > 0) ? ` ${separator} ` : ''}
                </Text>
            ))}
            {personalInfo.links && personalInfo.links.map((link, i) => {
                const validUrl = validateAndFormatURL(link.url);
                return validUrl ? (
                    <Text key={`link-${i}`} style={styles.contactItem}>
                        <Link src={validUrl} style={styles.linkItem}>{link.platform}</Link>
                        {i < personalInfo.links.length - 1 ? ` ${separator} ` : ''}
                    </Text>
                ) : null;
            })}
        </View>
    );
};

const PDFClassic = ({ data }) => (
    <Page size="A4" style={classicStyles.page}>
        <Text style={classicStyles.name}>{data.personalInfo?.fullName}</Text>
        <ContactSection personalInfo={data.personalInfo} styles={classicStyles} templateId="classic" />

        {data.professionalSummary && (
            <View style={classicStyles.section} wrap={false}>
                <Text style={classicStyles.sectionTitle}>Professional Summary</Text>
                <Text>{data.professionalSummary}</Text>
            </View>
        )}

        {data.experience?.length > 0 && (
            <View style={classicStyles.section}>
                <Text style={classicStyles.sectionTitle}>Experience</Text>
                {data.experience.map((exp, i) => (
                    <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                        <View style={classicStyles.rowBetween}>
                            <Text style={classicStyles.bold}>{exp.role}</Text>
                            <Text style={classicStyles.bold}>{exp.startDate} - {exp.endDate}</Text>
                        </View>
                        <View style={classicStyles.rowBetween}>
                            <Text style={classicStyles.italic}>{exp.organization}</Text>
                            <Text style={classicStyles.italic}>{exp.location}</Text>
                        </View>
                        {exp.achievements?.map((ach, j) => (
                            <View key={j} style={classicStyles.bulletRow}>
                                <Text style={classicStyles.bulletPoint}>•</Text>
                                <Text style={classicStyles.bulletText}>{ach}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        )}

        {data.projects?.length > 0 && (
            <View style={classicStyles.section}>
                <Text style={classicStyles.sectionTitle}>Projects</Text>
                {data.projects.map((proj, i) => (
                    <View key={i} style={{ marginBottom: 10 }} wrap={false}>
                        <View style={classicStyles.rowBetween}>
                            <Text style={classicStyles.bold}>{proj.title}</Text>
                            <Text style={classicStyles.bold}>{proj.date}</Text>
                        </View>
                        {proj.description && <Text style={{ marginBottom: 4 }}>{proj.description}</Text>}
                        {proj.highlights?.map((ach, j) => (
                            <View key={j} style={classicStyles.bulletRow}>
                                <Text style={classicStyles.bulletPoint}>•</Text>
                                <Text style={classicStyles.bulletText}>{ach}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        )}

        {data.education?.length > 0 && (
            <View style={classicStyles.section}>
                <Text style={classicStyles.sectionTitle}>Education</Text>
                {data.education.map((edu, i) => (
                    <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                        <View style={classicStyles.rowBetween}>
                            <Text style={classicStyles.bold}>{edu.institution}</Text>
                            <Text style={classicStyles.bold}>{edu.location}</Text>
                        </View>
                        <View style={classicStyles.rowBetween}>
                            <Text style={classicStyles.italic}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                            <Text style={classicStyles.italic}>{edu.startDate} - {edu.endDate}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}

        {data.skills?.length > 0 && (
            <View style={classicStyles.section} wrap={false}>
                <Text style={classicStyles.sectionTitle}>Skills</Text>
                {data.skills.map((skillGroup, i) => (
                    <Text key={i} style={{ marginBottom: 4 }}>
                        <Text style={classicStyles.bold}>{skillGroup.category}: </Text>
                        {skillGroup.items?.join(', ')}
                    </Text>
                ))}
            </View>
        )}
    </Page>
);

export const downloadPDF = async (resumeData, templateId) => {
    try {
        let SelectedTemplate = <PDFClassic data={resumeData} />;
        const blob = await pdf(<Document>{SelectedTemplate}</Document>).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.personalInfo?.fullName || 'Resume'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("PDF Generation Error", e);
        throw new Error("Failed to generate PDF");
    }
};