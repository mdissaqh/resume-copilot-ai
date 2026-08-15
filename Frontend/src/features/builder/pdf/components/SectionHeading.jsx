import { Text } from '@react-pdf/renderer';

export const SectionHeading = ({ children, style }) => {
    if (!children || children.toString().trim() === '') return null;
    return (
        <Text style={style} minPresenceAhead={40}>
            {children}
        </Text>
    );
};