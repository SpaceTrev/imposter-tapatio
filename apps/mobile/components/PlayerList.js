import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { getCharacterById, formatPhoneDisplay } from '@imposter/shared';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

export function PlayerList({ players, onRemove, emptyMessage }) {
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  const dangerColor = useThemeColor('danger');

  const handleRemove = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove(id);
  };

  if (players.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: cardColor, borderColor }]}>
        <ThemedText type="muted" style={styles.emptyText}>
          {emptyMessage || 'No hay jugadores aún'}
        </ThemedText>
      </View>
    );
  }

  const renderPlayer = ({ item: player }) => {
    const character = player.character ? getCharacterById(player.character) : null;

    return (
      <View style={[styles.playerItem, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.playerInfo}>
          {character && (
            <ThemedText style={styles.playerEmoji}>{character.emoji}</ThemedText>
          )}
          <View style={styles.playerDetails}>
            <ThemedText style={styles.playerName}>{player.name}</ThemedText>
            {player.phone && (
              <ThemedText type="muted" style={styles.playerPhone}>
                {formatPhoneDisplay(player.phone)}
              </ThemedText>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: `${dangerColor}20` }]}
          onPress={() => handleRemove(player.id)}
        >
          <ThemedText style={[styles.removeText, { color: dangerColor }]}>X</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={renderPlayer}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  playerEmoji: {
    fontSize: 28,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerPhone: {
    fontSize: 12,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
