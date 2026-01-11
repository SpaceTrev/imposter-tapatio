import { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView, Card } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { CharacterSelector } from '../components/CharacterSelector';
import { useThemeColor } from '../hooks/useThemeColor';
import { useStorage } from '../hooks/useStorage';
import { CHARACTERS, getCharacterById, randomRoomCode, randomId } from '@imposter/shared';
import * as Haptics from 'expo-haptics';

const text = {
  es: {
    title: 'Modo WiFi Local',
    subtitle: 'Juega con amigos en la misma red WiFi',
    host: {
      title: 'Crear Sala',
      description: 'Crea una sala y comparte el código con tus amigos',
      button: 'Crear Sala',
    },
    join: {
      title: 'Unirse a Sala',
      description: 'Ingresa el código de la sala para unirte',
      codePlaceholder: 'Código de sala',
      namePlaceholder: 'Tu nombre',
      button: 'Unirse',
    },
    lobby: {
      roomCode: 'Código de Sala',
      shareCode: 'Comparte este código con tus amigos',
      players: 'Jugadores',
      waiting: 'Esperando jugadores...',
      startGame: 'Iniciar Juego',
      leave: 'Salir',
      minPlayers: 'Necesitas al menos 3 jugadores para comenzar',
    },
    player: {
      connected: 'Conectado a la sala',
      waitingHost: 'Esperando que el host inicie el juego...',
      yourRole: 'Tu Rol',
      isImposter: '🔥 Eres el impostor!',
      notImposter: '✅ No eres el impostor',
      secretWord: 'Palabra Secreta',
      noWord: 'Sin palabra (eres impostor)',
      disconnect: 'Desconectar',
    },
    errors: {
      noName: 'Por favor ingresa tu nombre',
      noCode: 'Por favor ingresa el código de la sala',
      invalidCode: 'Código de sala inválido',
    },
  },
  en: {
    title: 'Local WiFi Mode',
    subtitle: 'Play with friends on the same WiFi network',
    host: {
      title: 'Create Room',
      description: 'Create a room and share the code with your friends',
      button: 'Create Room',
    },
    join: {
      title: 'Join Room',
      description: 'Enter the room code to join',
      codePlaceholder: 'Room code',
      namePlaceholder: 'Your name',
      button: 'Join',
    },
    lobby: {
      roomCode: 'Room Code',
      shareCode: 'Share this code with your friends',
      players: 'Players',
      waiting: 'Waiting for players...',
      startGame: 'Start Game',
      leave: 'Leave',
      minPlayers: 'You need at least 3 players to start',
    },
    player: {
      connected: 'Connected to room',
      waitingHost: 'Waiting for host to start the game...',
      yourRole: 'Your Role',
      isImposter: '🔥 You are the imposter!',
      notImposter: '✅ You are NOT the imposter',
      secretWord: 'Secret Word',
      noWord: 'No word (you are the imposter)',
      disconnect: 'Disconnect',
    },
    errors: {
      noName: 'Please enter your name',
      noCode: 'Please enter the room code',
      invalidCode: 'Invalid room code',
    },
  },
};

export default function WiFiScreen() {
  const router = useRouter();
  const [settings] = useStorage('imposter_settings', { language: 'es' });
  const language = settings?.language || 'es';
  const t = text[language];

  // Theme colors
  const primaryColor = useThemeColor('primary');
  const cardColor = useThemeColor('card');
  const borderColor = useThemeColor('border');
  const textColor = useThemeColor('text');
  const backgroundColor = useThemeColor('background');
  const successColor = useThemeColor('success');
  const imposterColor = useThemeColor('imposter');

  // State
  const [mode, setMode] = useState(null); // null, 'host', 'player'
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu, lobby, playing
  const [players, setPlayers] = useState([]);
  const [myRole, setMyRole] = useState(null);

  const createRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const code = randomRoomCode();
    setRoomCode(code);
    setMode('host');
    setGameState('lobby');
    setPlayers([{
      id: randomId(),
      name: language === 'es' ? 'Host (Tú)' : 'Host (You)',
      character: selectedCharacter?.id || null,
      isHost: true,
    }]);
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', t.errors.noName);
      return;
    }
    if (!roomCode.trim() || roomCode.length < 4) {
      Alert.alert('Error', t.errors.noCode);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode('player');
    setGameState('lobby');
    // In a real implementation, this would connect to the host via PeerJS
    // For now, we show a waiting state
  };

  const leaveRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(null);
    setGameState('menu');
    setRoomCode('');
    setPlayerName('');
    setPlayers([]);
    setMyRole(null);
  };

  // Menu state - choose to host or join
  if (gameState === 'menu') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                {t.title}
              </ThemedText>
              <ThemedText type="muted" style={styles.subtitle}>
                {t.subtitle}
              </ThemedText>
            </View>

            {/* Create Room */}
            <Card style={styles.card}>
              <ThemedText style={styles.cardIcon}>🏠</ThemedText>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {t.host.title}
              </ThemedText>
              <ThemedText type="muted" style={styles.cardDescription}>
                {t.host.description}
              </ThemedText>

              <ThemedText type="muted" style={styles.label}>
                {language === 'es' ? 'Tu personaje' : 'Your character'}
              </ThemedText>
              <CharacterSelector
                selectedId={selectedCharacter?.id}
                onSelect={setSelectedCharacter}
              />

              <Button
                title={t.host.button}
                onPress={createRoom}
                style={styles.cardButton}
              />
            </Card>

            {/* Join Room */}
            <Card style={styles.card}>
              <ThemedText style={styles.cardIcon}>🎮</ThemedText>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {t.join.title}
              </ThemedText>
              <ThemedText type="muted" style={styles.cardDescription}>
                {t.join.description}
              </ThemedText>

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t.join.codePlaceholder}
                placeholderTextColor={borderColor}
                value={roomCode}
                onChangeText={(text) => setRoomCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t.join.namePlaceholder}
                placeholderTextColor={borderColor}
                value={playerName}
                onChangeText={setPlayerName}
              />

              <ThemedText type="muted" style={styles.label}>
                {language === 'es' ? 'Tu personaje' : 'Your character'}
              </ThemedText>
              <CharacterSelector
                selectedId={selectedCharacter?.id}
                onSelect={setSelectedCharacter}
              />

              <Button
                title={t.join.button}
                onPress={joinRoom}
                style={styles.cardButton}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Host Lobby state
  if (gameState === 'lobby' && mode === 'host') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Card style={[styles.card, styles.codeCard]}>
              <ThemedText type="muted">{t.lobby.roomCode}</ThemedText>
              <ThemedText style={[styles.roomCode, { color: primaryColor }]}>
                {roomCode}
              </ThemedText>
              <ThemedText type="muted" style={styles.shareHint}>
                {t.lobby.shareCode}
              </ThemedText>
            </Card>

            <Card style={styles.card}>
              <ThemedText type="subtitle">{t.lobby.players}</ThemedText>

              {players.length === 0 ? (
                <ThemedText type="muted" style={styles.waiting}>
                  {t.lobby.waiting}
                </ThemedText>
              ) : (
                <View style={styles.playersList}>
                  {players.map((player) => {
                    const character = player.character
                      ? getCharacterById(player.character)
                      : null;
                    return (
                      <View
                        key={player.id}
                        style={[styles.playerItem, { borderColor }]}
                      >
                        {character && (
                          <ThemedText style={styles.playerEmoji}>
                            {character.emoji}
                          </ThemedText>
                        )}
                        <ThemedText style={styles.playerName}>
                          {player.name}
                          {player.isHost && ' 👑'}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              )}

              {players.length < 3 && (
                <ThemedText type="muted" style={styles.minPlayersHint}>
                  {t.lobby.minPlayers}
                </ThemedText>
              )}

              <Button
                title={t.lobby.startGame}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert(
                    language === 'es' ? 'Próximamente' : 'Coming Soon',
                    language === 'es'
                      ? 'El modo WiFi peer-to-peer está en desarrollo. Por ahora, usa el modo "Jugar" para jugar juntos.'
                      : 'WiFi peer-to-peer mode is under development. For now, use "Play" mode to play together.'
                  );
                }}
                disabled={players.length < 3}
                style={styles.startButton}
              />

              <Button
                title={t.lobby.leave}
                onPress={leaveRoom}
                variant="ghost"
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Player Lobby/Waiting state
  if (gameState === 'lobby' && mode === 'player') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.waitingContainer}>
            <Card style={styles.card}>
              <ThemedText style={styles.connectedIcon}>📡</ThemedText>
              <ThemedText type="subtitle" style={styles.centered}>
                {t.player.connected}
              </ThemedText>
              <ThemedText style={[styles.roomCode, { color: primaryColor }]}>
                {roomCode}
              </ThemedText>

              {selectedCharacter && (
                <ThemedText style={styles.myCharacter}>
                  {selectedCharacter.emoji}
                </ThemedText>
              )}

              <ThemedText type="muted" style={styles.centered}>
                {t.player.waitingHost}
              </ThemedText>

              <View style={styles.loadingDots}>
                <ThemedText style={styles.dot}>●</ThemedText>
                <ThemedText style={[styles.dot, styles.dotDelay1]}>●</ThemedText>
                <ThemedText style={[styles.dot, styles.dotDelay2]}>●</ThemedText>
              </View>

              <Button
                title={t.player.disconnect}
                onPress={leaveRoom}
                variant="ghost"
                style={styles.disconnectButton}
              />
            </Card>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Playing state - show role
  if (gameState === 'playing' && myRole) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.roleContainer}>
            <Card style={styles.card}>
              <ThemedText type="subtitle">{t.player.yourRole}</ThemedText>

              <View
                style={[
                  styles.roleBox,
                  {
                    backgroundColor: myRole.isImposter
                      ? imposterColor
                      : successColor,
                  },
                ]}
              >
                <ThemedText style={styles.roleText}>
                  {myRole.isImposter
                    ? t.player.isImposter
                    : t.player.notImposter}
                </ThemedText>
              </View>

              {myRole.word ? (
                <View style={styles.wordSection}>
                  <ThemedText type="muted">{t.player.secretWord}</ThemedText>
                  <ThemedText style={[styles.secretWord, { color: primaryColor }]}>
                    {myRole.word}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText type="muted" style={styles.noWord}>
                  {t.player.noWord}
                </ThemedText>
              )}

              <Button
                title={t.player.disconnect}
                onPress={leaveRoom}
                variant="ghost"
                style={styles.disconnectButton}
              />
            </Card>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    marginBottom: 0,
  },
  cardIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
  cardButton: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  codeCard: {
    alignItems: 'center',
  },
  roomCode: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginVertical: 12,
  },
  shareHint: {
    textAlign: 'center',
  },
  playersList: {
    marginTop: 12,
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  playerEmoji: {
    fontSize: 24,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  waiting: {
    textAlign: 'center',
    marginVertical: 20,
  },
  minPlayersHint: {
    textAlign: 'center',
    marginTop: 12,
  },
  startButton: {
    marginTop: 20,
    marginBottom: 12,
  },
  waitingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  connectedIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  centered: {
    textAlign: 'center',
    marginBottom: 12,
  },
  myCharacter: {
    fontSize: 64,
    textAlign: 'center',
    marginVertical: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    fontSize: 20,
    opacity: 0.3,
  },
  dotDelay1: {
    opacity: 0.6,
  },
  dotDelay2: {
    opacity: 1,
  },
  disconnectButton: {
    marginTop: 24,
  },
  roleContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  roleBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wordSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  secretWord: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  noWord: {
    textAlign: 'center',
    marginTop: 16,
  },
});
