import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { CHARACTERS } from '@imposter/shared';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

export function CharacterSelector({ selectedId, onSelect }) {
  const borderColor = useThemeColor('border');
  const cardColor = useThemeColor('card');

  const handleSelect = (character) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(selectedId === character.id ? null : character);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHARACTERS.map((character) => {
        const isSelected = selectedId === character.id;
        return (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.character,
              {
                backgroundColor: isSelected ? `${character.colors.primary}20` : cardColor,
                borderColor: isSelected ? character.colors.primary : borderColor,
              },
            ]}
            onPress={() => handleSelect(character)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.emoji}>{character.emoji}</ThemedText>
            <ThemedText style={styles.name}>{character.name}</ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 12,
  },
  character: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    fontSize: 12,
    marginTop: 4,
  },
});
