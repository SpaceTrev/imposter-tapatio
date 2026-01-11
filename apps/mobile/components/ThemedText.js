import { Text, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }) {
  const color = useThemeColor('text', { light: lightColor, dark: darkColor });

  return (
    <Text
      style={[
        { color },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'muted' && styles.muted,
        type === 'large' && styles.large,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#8b5687',
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  large: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
});
