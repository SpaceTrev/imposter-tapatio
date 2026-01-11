import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView, Card } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { useThemeColor } from '../hooks/useThemeColor';
import { useStorage } from '../hooks/useStorage';
import * as Haptics from 'expo-haptics';

const text = {
  es: {
    title: 'Imposter Radar',
    badge: 'Tapatío',
    subtitle: 'Elige tu modo de juego favorito',
    play: {
      title: 'Jugar',
      description: 'Revela roles en pantalla. Perfecto para grupos juntos.',
      button: 'Jugar Ahora',
    },
    wifi: {
      title: 'Modo WiFi Local',
      description: 'Cada quien ve su rol en su celular en tiempo real.',
      button: 'Jugar en WiFi',
    },
    footer: 'Hecho con 💚 en Guadalajara',
  },
  en: {
    title: 'Imposter Radar',
    badge: 'Game',
    subtitle: 'Choose your favorite game mode',
    play: {
      title: 'Play',
      description: 'Reveal roles on screen. Perfect for groups together.',
      button: 'Play Now',
    },
    wifi: {
      title: 'Local WiFi Mode',
      description: 'Each person sees their role on their own phone in real-time.',
      button: 'Play on WiFi',
    },
    footer: 'Made with 💚 in Guadalajara',
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const [settings, setSettings] = useStorage('imposter_settings', { language: 'es' });
  const language = settings?.language || 'es';
  const t = text[language];

  const primaryColor = useThemeColor('primary');
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');

  const toggleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({
      ...prev,
      language: prev?.language === 'es' ? 'en' : 'es',
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Language Toggle */}
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.langButton, { backgroundColor: cardColor, borderColor }]}
            onPress={toggleLanguage}
          >
            <ThemedText style={styles.langEmoji}>
              {language === 'es' ? '🇺🇸' : '🇲🇽'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.title}>
            {t.title}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.badgeText}>{t.badge}</ThemedText>
          </View>
          <ThemedText type="muted" style={styles.subtitle}>
            {t.subtitle}
          </ThemedText>
        </View>

        {/* Mode Selection */}
        <View style={styles.modes}>
          <Card style={styles.modeCard}>
            <ThemedText style={styles.modeIcon}>🎮</ThemedText>
            <ThemedText type="subtitle" style={styles.modeTitle}>
              {t.play.title}
            </ThemedText>
            <ThemedText type="muted" style={styles.modeDescription}>
              {t.play.description}
            </ThemedText>
            <Button
              title={t.play.button}
              onPress={() => router.push('/play')}
              style={styles.modeButton}
            />
          </Card>

          <Card style={styles.modeCard}>
            <ThemedText style={styles.modeIcon}>📡</ThemedText>
            <ThemedText type="subtitle" style={styles.modeTitle}>
              {t.wifi.title}
            </ThemedText>
            <ThemedText type="muted" style={styles.modeDescription}>
              {t.wifi.description}
            </ThemedText>
            <Button
              title={t.wifi.button}
              onPress={() => router.push('/wifi')}
              style={styles.modeButton}
            />
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText type="muted">{t.footer}</ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  langButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  langEmoji: {
    fontSize: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 12,
  },
  modes: {
    flex: 1,
    gap: 16,
  },
  modeCard: {
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  modeDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modeButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
