import { Link, Text } from '@react-pdf/renderer';
import { validateAndFormatURL } from '../../../../utils/urlValidator';


export const LinkItem = ({ url, label, style }) => {
    const validUrl = validateAndFormatURL(url);
    if (!validUrl) return null;

    const displayString = label || url;
    const safeDisplayLabel = displayString.replace(/([./])/g, '$1\u200B');

    return (
        <Link src={validUrl} style={style}>
            <Text>{safeDisplayLabel}</Text>
        </Link>
    );
};