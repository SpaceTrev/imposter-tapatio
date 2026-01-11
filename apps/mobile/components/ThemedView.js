import { View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export function ThemedView({ style, lightColor, darkColor, ...otherProps }) {
  const backgroundColor = useThemeColor('background', { light: lightColor, dark: darkColor });

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Card({ style, ...otherProps }) {
  const backgroundColor = useThemeColor('card');
  const borderColor = useThemeColor('border');

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
