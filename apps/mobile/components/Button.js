import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '../hooks/useThemeColor';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) {
  const primaryColor = useThemeColor('primary');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return '#cccccc';
    switch (variant) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return cardColor;
      case 'ghost':
        return 'transparent';
      case 'danger':
        return '#ef4444';
      case 'success':
        return '#10b981';
      default:
        return primaryColor;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#888888';
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
        return '#ffffff';
      case 'secondary':
      case 'ghost':
        return textColor;
      default:
        return '#ffffff';
    }
  };

  const getBorderStyle = () => {
    if (variant === 'ghost' || variant === 'secondary') {
      return {
        borderWidth: 1,
        borderColor: variant === 'ghost' ? borderColor : borderColor,
      };
    }
    return {};
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyle(),
        getBorderStyle(),
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 18,
  },
});
