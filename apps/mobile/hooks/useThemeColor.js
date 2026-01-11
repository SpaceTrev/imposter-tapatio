import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(colorName, props) {
  const theme = useColorScheme();
  const colorFromProps = props?.[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName];
}
