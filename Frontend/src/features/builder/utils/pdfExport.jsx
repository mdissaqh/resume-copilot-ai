import React from 'react';
import { pdf, Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { validateAndFormatURL } from '../../../utils/urlValidator';
import { normalizeResumeData } from '../../../utils/resumeNormalizer';
import { templateConfig } from '../../../utils/templateConfig';

// Dynamic StyleSheet Generator mirroring TemplateConfig constraints for absolute WYSIWYG
const getStyles = (config) => StyleSheet.create({
    page: { padding: 40, fontFamily: config.fontFamily, fontSize: 10, color: config.primaryColor, lineHeight: 1.4 },
    section: { marginBottom: config.id === 'minimal' ? 20 : 15 },
    name: { 
        fontFamily: config.fontFamily === 'Helvetica' ? 'Helvetica-Bold' : 'Times-Bold', 
        fontSize: config.headingSize, 
        textAlign: config.headerAlign, 
        marginBottom: 6, 
        textTransform: config.uppercaseHeaders ? 'uppercase' : 'none',
        color: config.primaryColor
    },
    contactWrapper: { 
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap', 
        justifyContent: config.headerAlign === 'center' ? 'center' : 'flex-start', 
        marginBottom: config.id === 'minimal' ? 24 : 16, 
        borderBottom: config.showBorders ? `1pt solid ${config.primaryColor}` : 'none', 
        paddingBottom: config.showBorders ? 12 : 0 
    },
    contactItem: { fontSize: 9.5, marginHorizontal: config.headerAlign === 'center' ? 4 : 0, marginRight: config.headerAlign === 'left' ? 12 : 4, marginBottom: 4, color: config.secondaryColor },
    linkItem: { fontSize: 9.5, color: config.id === 'modern' ? '#2980b9' : config.secondaryColor, textDecoration: 'none' },
    sectionTitle: { 
        fontFamily: config.fontFamily === 'Helvetica' ? 'Helvetica-Bold' : 'Times-Bold', 
        fontSize: config.id === 'minimal' ? 11 : 12, 
        textTransform: 'uppercase', 
        borderBottom: config.showBorders ? `1pt solid ${config.id === 'modern' ? '#ecf0f1' : config.primaryColor}` : 'none', 
        marginBottom: 10, paddingBottom: 2, color: config.primaryColor 
    },
    rowBetween: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    flexRow: { display: 'flex', flexDirection: 'row', marginBottom: 10 },
    leftCol: { width: 100, color: config.secondaryColor, fontSize: 9.5 },
    rightCol: { flex: 1 },
    bold: { fontFamily: config.fontFamily === 'Helvetica' ? 'Helvetica-Bold' : 'Times-Bold', color: config.primaryColor },
    italic: { fontFamily: config.fontFamily === 'Helvetica' ? 'Helvetica-Oblique' : 'Times-Italic', color: config.primaryColor },
    bulletRow: { display: 'flex', flexDirection: 'row', marginBottom: 3, paddingLeft: config.id === 'minimal' ? 0 : 10 },
    bulletPoint: { width: 12, fontSize: 10, color: config.id === 'modern' ? '#2980b9' : config.primaryColor },
    bulletText: { flex: 1, fontSize: 10, color: config.primaryColor }
});

const ContactSection = ({ personalInfo, styles, config }) => {
    if (!personalInfo) return null;
    const items = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
    const separator = config.id === 'modern' ? '•' : config.id === 'minimal' ? '/' : '|';
    
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

// This master document component is exported for use by BOTH the PDF downloader AND the live Preview viewer.
export const ResumeDocument = ({ data, config }) => {
    const styles = getStyles(config);
    const isMinimal = config.id === 'minimal';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.name}>{data.personalInfo.fullName}</Text>
                <ContactSection personalInfo={data.personalInfo} styles={styles} config={config} />

                {data.professionalSummary && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>{isMinimal ? "ABOUT" : "Professional Summary"}</Text>
                        <Text>{data.professionalSummary}</Text>
                    </View>
                )}

                {data.experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {data.experience.map((exp, i) => (
                            <View key={i} style={isMinimal ? styles.flexRow : { marginBottom: 10 }} wrap={false}>
                                {isMinimal && (
                                    <View style={styles.leftCol}>
                                        <Text>{exp.startDate}</Text><Text>{exp.endDate}</Text>
                                    </View>
                                )}
                                <View style={isMinimal ? styles.rightCol : {}}>
                                    <View style={isMinimal ? {} : styles.rowBetween}>
                                        <Text style={styles.bold}>{exp.role}</Text>
                                        {!isMinimal && <Text style={styles.bold}>{exp.startDate} - {exp.endDate}</Text>}
                                    </View>
                                    <View style={isMinimal ? { marginBottom: 4 } : styles.rowBetween}>
                                        <Text style={styles.italic}>{exp.organization}</Text>
                                        {!isMinimal && <Text style={styles.italic}>{exp.location}</Text>}
                                    </View>
                                    {exp.achievements?.map((ach, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={styles.bulletPoint}>{isMinimal ? '-' : '•'}</Text>
                                            <Text style={styles.bulletText}>{ach}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {data.projects.map((proj, i) => (
                            <View key={i} style={isMinimal ? styles.flexRow : { marginBottom: 10 }} wrap={false}>
                                {isMinimal && (
                                    <View style={styles.leftCol}><Text>{proj.date}</Text></View>
                                )}
                                <View style={isMinimal ? styles.rightCol : {}}>
                                    <View style={isMinimal ? {} : styles.rowBetween}>
                                        <Text style={styles.bold}>{proj.title}</Text>
                                        {!isMinimal && <Text style={styles.bold}>{proj.date}</Text>}
                                    </View>
                                    <View style={isMinimal ? { marginBottom: 4 } : styles.rowBetween}>
                                        <Text style={styles.italic}>{proj.description}</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                                            {validateAndFormatURL(proj.githubUrl) && <Link src={validateAndFormatURL(proj.githubUrl)} style={styles.linkItem}>GitHub</Link>}
                                            {validateAndFormatURL(proj.githubUrl) && validateAndFormatURL(proj.liveUrl) && <Text style={styles.contactItem}> | </Text>}
                                            {validateAndFormatURL(proj.liveUrl) && <Link src={validateAndFormatURL(proj.liveUrl)} style={styles.linkItem}>Live Demo</Link>}
                                        </View>
                                    </View>
                                    {proj.highlights?.map((ach, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={styles.bulletPoint}>{isMinimal ? '-' : '•'}</Text>
                                            <Text style={styles.bulletText}>{ach}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((edu, i) => (
                            <View key={i} style={isMinimal ? styles.flexRow : { marginBottom: 8 }} wrap={false}>
                                 {isMinimal && (
                                    <View style={styles.leftCol}><Text>{edu.startDate}</Text><Text>{edu.endDate}</Text></View>
                                )}
                                <View style={isMinimal ? styles.rightCol : {}}>
                                    <View style={isMinimal ? {} : styles.rowBetween}>
                                        <Text style={styles.bold}>{edu.institution}</Text>
                                        {!isMinimal && <Text style={styles.bold}>{edu.location}</Text>}
                                    </View>
                                    <View style={isMinimal ? {} : styles.rowBetween}>
                                        <Text>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                                        {!isMinimal && <Text>{edu.startDate} - {edu.endDate}</Text>}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.skills.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>{isMinimal ? "EXPERTISE" : "Skills"}</Text>
                        {data.skills.map((skillGroup, i) => (
                            <Text key={i} style={{ marginBottom: 4 }}>
                                <Text style={styles.bold}>{skillGroup.category}: </Text>
                                {skillGroup.items?.join(', ')}
                            </Text>
                        ))}
                    </View>
                )}
                
                {data.certifications.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {data.certifications.map((cert, i) => (
                            <Text key={i} style={{ marginBottom: 4 }}>
                                <Text style={styles.bold}>{cert.name}</Text>
                                {cert.issuer ? ` - ${cert.issuer}` : ''} {cert.date ? ` (${cert.date})` : ''}
                            </Text>
                        ))}
                    </View>
                )}
                
                {data.achievements.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        {data.achievements.map((ach, i) => (
                            <View key={i} style={styles.bulletRow}>
                                <Text style={styles.bulletPoint}>{isMinimal ? '-' : '•'}</Text>
                                <Text style={styles.bulletText}>{ach}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

export const downloadPDF = async (rawResumeData, templateId) => {
    try {
        const normalizedData = normalizeResumeData(rawResumeData);
        const config = templateConfig[templateId] || templateConfig.classic;
        const blob = await pdf(<ResumeDocument data={normalizedData} config={config} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${normalizedData.personalInfo.fullName || 'Resume'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("PDF Generation Error", e);
        throw new Error("Failed to generate PDF");
    }
};