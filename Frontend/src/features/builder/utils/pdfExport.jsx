import { pdf, Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { validateAndFormatURL } from '../../../utils/urlValidator';


const classicStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 11, color: '#000', lineHeight: 1.5 },
    section: { marginBottom: 15 },
    name: { fontFamily: 'Times-Bold', fontSize: 24, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' },
    contactWrapper: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16, borderBottom: '1pt solid #000', paddingBottom: 12 },
    contactItem: { fontSize: 10, marginHorizontal: 4 },
    linkItem: { fontSize: 10, marginHorizontal: 4, color: '#000', textDecoration: 'none' },
    sectionTitle: { fontFamily: 'Times-Bold', fontSize: 12, textTransform: 'uppercase', borderBottom: '1pt solid #000', marginBottom: 10, paddingBottom: 2 },
    rowBetween: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    bold: { fontFamily: 'Times-Bold' },
    italic: { fontFamily: 'Times-Italic' },
    bulletRow: { display: 'flex', flexDirection: 'row', marginBottom: 3, paddingLeft: 10 },
    bulletPoint: { width: 15, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 11 }
});

const modernStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#34495e', lineHeight: 1.4 },
    section: { marginBottom: 15 },
    name: { fontFamily: 'Helvetica-Bold', fontSize: 26, color: '#2c3e50', marginBottom: 4 },
    contactWrapper: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 20 },
    contactItem: { fontSize: 10, color: '#7f8c8d', marginRight: 8, marginBottom: 4 },
    linkItem: { fontSize: 10, color: '#2980b9', marginRight: 8, marginBottom: 4, textDecoration: 'none' },
    sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 14, color: '#2980b9', textTransform: 'uppercase', borderBottom: '2pt solid #ecf0f1', marginBottom: 10, paddingBottom: 4 },
    rowBetween: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    bold: { fontFamily: 'Helvetica-Bold', color: '#2c3e50' },
    italic: { fontFamily: 'Helvetica-Oblique' },
    bulletRow: { display: 'flex', flexDirection: 'row', marginBottom: 3, paddingLeft: 10 },
    bulletPoint: { width: 12, fontSize: 10, color: '#2980b9' },
    bulletText: { flex: 1, fontSize: 10 }
});

const minimalStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#444', lineHeight: 1.5 },
    section: { marginBottom: 20 },
    name: { fontSize: 22, color: '#111', marginBottom: 6, letterSpacing: 1 },
    contactWrapper: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 24 },
    contactItem: { fontSize: 9, color: '#666', marginRight: 12, marginBottom: 4 },
    linkItem: { fontSize: 9, color: '#666', marginRight: 12, marginBottom: 4, textDecoration: 'none' },
    sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#333', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
    flexRow: { display: 'flex', flexDirection: 'row', marginBottom: 10 },
    leftCol: { width: 100, color: '#666', fontSize: 9 },
    rightCol: { flex: 1 },
    bold: { fontFamily: 'Helvetica-Bold', color: '#111' },
    bulletRow: { display: 'flex', flexDirection: 'row', marginBottom: 2 },
    bulletPoint: { width: 10, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10 }
});

// --- SHARED COMPONENTS ---

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
                    <View key={`link-${i}`} style={{ display: 'flex', flexDirection: 'row' }}>
                        <Link src={validUrl} style={styles.linkItem}>{link.platform}</Link>
                        {i < personalInfo.links.length - 1 ? <Text style={styles.contactItem}>{` ${separator} `}</Text> : null}
                    </View>
                ) : null;
            })}
        </View>
    );
};

// --- TEMPLATES ---

const PDFClassic = ({ data }) => (
    <Page size="A4" style={classicStyles.page}>
        <Text style={classicStyles.name}>{data.personalInfo?.fullName}</Text>
        <ContactSection personalInfo={data.personalInfo} styles={classicStyles} templateId="classic" />

        {data.professionalSummary && (
            <View style={classicStyles.section}>
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
            <View style={classicStyles.section}>
                <Text style={classicStyles.sectionTitle}>Skills</Text>
                {data.skills.map((skillGroup, i) => (
                    <Text key={i} style={{ marginBottom: 4 }}>
                        <Text style={classicStyles.bold}>{skillGroup.category}: </Text>
                        {skillGroup.items?.join(', ')}
                    </Text>
                ))}
            </View>
        )}
        
        {data.additionalSections?.length > 0 && data.additionalSections.map((section, idx) => (
            <View key={idx} style={classicStyles.section} wrap={false}>
                <Text style={classicStyles.sectionTitle}>{section.sectionTitle}</Text>
                {section.items?.map((item, i) => (
                    <View key={i} style={{ marginBottom: 8 }}>
                        <View style={classicStyles.rowBetween}>
                            <Text style={classicStyles.bold}>{item.heading}</Text>
                            <Text style={classicStyles.bold}>{item.date}</Text>
                        </View>
                        <Text style={classicStyles.italic}>{item.subheading}</Text>
                        {item.description && <Text>{item.description}</Text>}
                    </View>
                ))}
            </View>
        ))}
    </Page>
);

const PDFModern = ({ data }) => (
    <Page size="A4" style={modernStyles.page}>
        <Text style={modernStyles.name}>{data.personalInfo?.fullName}</Text>
        <ContactSection personalInfo={data.personalInfo} styles={modernStyles} templateId="modern" />

        {data.professionalSummary && (
            <View style={modernStyles.section}>
                <Text style={modernStyles.sectionTitle}>Summary</Text>
                <Text>{data.professionalSummary}</Text>
            </View>
        )}

        {data.experience?.length > 0 && (
            <View style={modernStyles.section}>
                <Text style={modernStyles.sectionTitle}>Experience</Text>
                {data.experience.map((exp, i) => (
                    <View key={i} style={{ marginBottom: 12 }} wrap={false}>
                        <View style={modernStyles.rowBetween}>
                            <Text style={modernStyles.bold}>{exp.role}</Text>
                            <Text style={{ color: '#7f8c8d' }}>{exp.startDate} - {exp.endDate}</Text>
                        </View>
                        <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
                            {exp.organization} {exp.location ? `| ${exp.location}` : ''}
                        </Text>
                        {exp.achievements?.map((ach, j) => (
                            <View key={j} style={modernStyles.bulletRow}>
                                <Text style={modernStyles.bulletPoint}>▪</Text>
                                <Text style={modernStyles.bulletText}>{ach}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        )}

        {data.education?.length > 0 && (
            <View style={modernStyles.section}>
                <Text style={modernStyles.sectionTitle}>Education</Text>
                {data.education.map((edu, i) => (
                    <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                        <View style={modernStyles.rowBetween}>
                            <Text style={modernStyles.bold}>{edu.institution}</Text>
                            <Text style={{ color: '#7f8c8d' }}>{edu.startDate} - {edu.endDate}</Text>
                        </View>
                        <Text>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                    </View>
                ))}
            </View>
        )}

        {data.skills?.length > 0 && (
            <View style={modernStyles.section}>
                <Text style={modernStyles.sectionTitle}>Skills</Text>
                {data.skills.map((skillGroup, i) => (
                    <Text key={i} style={{ marginBottom: 4 }}>
                        <Text style={modernStyles.bold}>{skillGroup.category}: </Text>
                        {skillGroup.items?.join(', ')}
                    </Text>
                ))}
            </View>
        )}
        
        {data.additionalSections?.length > 0 && data.additionalSections.map((section, idx) => (
            <View key={idx} style={modernStyles.section} wrap={false}>
                <Text style={modernStyles.sectionTitle}>{section.sectionTitle}</Text>
                {section.items?.map((item, i) => (
                    <View key={i} style={{ marginBottom: 8 }}>
                        <View style={modernStyles.rowBetween}>
                            <Text style={modernStyles.bold}>{item.heading}</Text>
                            <Text style={{ color: '#7f8c8d' }}>{item.date}</Text>
                        </View>
                        <Text style={modernStyles.bold}>{item.subheading}</Text>
                        {item.description && <Text>{item.description}</Text>}
                    </View>
                ))}
            </View>
        ))}
    </Page>
);

const PDFMinimal = ({ data }) => (
    <Page size="A4" style={minimalStyles.page}>
        <Text style={minimalStyles.name}>{data.personalInfo?.fullName}</Text>
        <ContactSection personalInfo={data.personalInfo} styles={minimalStyles} templateId="minimal" />

        {data.professionalSummary && (
            <View style={minimalStyles.section}>
                <Text style={minimalStyles.sectionTitle}>About</Text>
                <Text>{data.professionalSummary}</Text>
            </View>
        )}

        {data.experience?.length > 0 && (
            <View style={minimalStyles.section}>
                <Text style={minimalStyles.sectionTitle}>Experience</Text>
                {data.experience.map((exp, i) => (
                    <View key={i} style={minimalStyles.flexRow} wrap={false}>
                        <View style={minimalStyles.leftCol}>
                            <Text>{exp.startDate}</Text>
                            <Text>{exp.endDate}</Text>
                        </View>
                        <View style={minimalStyles.rightCol}>
                            <Text style={minimalStyles.bold}>{exp.role}</Text>
                            <Text style={{ marginBottom: 4 }}>{exp.organization}</Text>
                            {exp.achievements?.map((ach, j) => (
                                <View key={j} style={minimalStyles.bulletRow}>
                                    <Text style={minimalStyles.bulletPoint}>-</Text>
                                    <Text style={minimalStyles.bulletText}>{ach}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        )}

        {data.education?.length > 0 && (
            <View style={minimalStyles.section}>
                <Text style={minimalStyles.sectionTitle}>Education</Text>
                {data.education.map((edu, i) => (
                    <View key={i} style={minimalStyles.flexRow} wrap={false}>
                        <View style={minimalStyles.leftCol}>
                            <Text>{edu.startDate}</Text>
                            <Text>{edu.endDate}</Text>
                        </View>
                        <View style={minimalStyles.rightCol}>
                            <Text style={minimalStyles.bold}>{edu.institution}</Text>
                            <Text>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}

        {data.skills?.length > 0 && (
            <View style={minimalStyles.section}>
                <Text style={minimalStyles.sectionTitle}>Expertise</Text>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    {data.skills.map((skillGroup, i) => (
                        <Text key={i} style={{ marginBottom: 4 }}>
                            <Text style={minimalStyles.bold}>{skillGroup.category} </Text> 
                            — {skillGroup.items?.join(', ')}
                        </Text>
                    ))}
                </View>
            </View>
        )}
        
        {data.additionalSections?.length > 0 && data.additionalSections.map((section, idx) => (
            <View key={idx} style={minimalStyles.section} wrap={false}>
                <Text style={minimalStyles.sectionTitle}>{section.sectionTitle}</Text>
                {section.items?.map((item, i) => (
                    <View key={i} style={minimalStyles.flexRow}>
                        <View style={minimalStyles.leftCol}>
                            <Text>{item.date}</Text>
                        </View>
                        <View style={minimalStyles.rightCol}>
                            <Text style={minimalStyles.bold}>{item.heading}</Text>
                            <Text>{item.subheading}</Text>
                            {item.description && <Text style={{ marginTop: 2 }}>{item.description}</Text>}
                        </View>
                    </View>
                ))}
            </View>
        ))}
    </Page>
);

// --- EXPORT FUNCTION ---

export const downloadPDF = async (resumeData, templateId) => {
    let SelectedTemplate;
    switch (templateId) {
        case 'modern':
            SelectedTemplate = <PDFModern data={resumeData} />;
            break;
        case 'minimal':
            SelectedTemplate = <PDFMinimal data={resumeData} />;
            break;
        case 'classic':
        default:
            SelectedTemplate = <PDFClassic data={resumeData} />;
            break;
    }

    const blob = await pdf(<Document>{SelectedTemplate}</Document>).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo?.fullName || 'Resume'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};