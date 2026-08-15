import { Text, Link } from '@react-pdf/renderer';
import { validateAndFormatURL } from '../../../../utils/urlValidator';

export const ContactRow = ({ items, style, linkStyle, separator = '  |  ' }) => {
    // items expected format: [{ text: "Email", url: null }, { text: "LinkedIn", url: "https://..." }]
    const validItems = items.filter(item => item && item.text && item.text.toString().trim() !== '');

    if (validItems.length === 0) return null;

    return (
        <Text style={style}>
            {validItems.map((item, index) => {
                const isLast = index === validItems.length - 1;
                
                const validUrl = item.url ? validateAndFormatURL(item.url) : null;
                
                const displayText = item.text.toString().replace(/([./])/g, '$1\u200B');

                return (
                    <Text key={index}>
                        {validUrl ? (
                            <Link src={validUrl} style={linkStyle || style}>
                                {displayText}
                            </Link>
                        ) : (
                            <Text>{displayText}</Text>
                        )}
                        {!isLast && <Text>{separator}</Text>}
                    </Text>
                );
            })}
        </Text>
    );
};