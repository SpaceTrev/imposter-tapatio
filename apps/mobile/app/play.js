import { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView, Card } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { CharacterSelector } from '../components/CharacterSelector';
import { PlayerList } from '../components/PlayerList';
import { useThemeColor } from '../hooks/useThemeColor';
import { useStorage } from '../hooks/useStorage';
import {
  CATEGORIES,
  getCategoryById,
  getRandomCategory,
  randomPairFromCategory,
  getAllowedPairs,
  getCharacterById,
  randomId,
  shuffle,
  buildRoleMessage,
  buildWhatsAppUrl,
} from '@imposter/shared';
import * as Haptics from 'expo-haptics';

const text = {
  es: {
    setup: {
      title: 'Configuración',
      players: 'Jugadores',
      playersMin: '(mínimo 3)',
      namePlaceholder: 'Nombre',
      phonePlaceholder: 'Teléfono (opcional)',
      character: 'Personaje (opcional)',
      addPlayer: 'Agregar Jugador',
      noPlayers: 'Aún no hay jugadores, agrega al menos 3.',
      category: 'Categoría',
      random: '🎲 Aleatoria',
      mixed: '🔀 Mezcladas',
      imposters: 'Número de impostores',
      sendHint: 'Enviar pista extra al impostor',
      hintPlaceholder: 'Ej: Es algo que comes',
      imposterWord: 'Dar pista al impostor (palabra diferente)',
      adultContent: 'Incluir contenido adulto',
      startRound: 'Iniciar Ronda',
    },
    round: {
      playerOf: 'Jugador {current} de {total}',
      turnOf: 'Turno de {name}',
      onlyPlayer: 'Solo {name} puede ver la pantalla',
      reveal: '👁️ Revelar mi rol',
      revealWarning: 'Solo presiona cuando nadie más esté viendo',
      isImposter: '🔥 Eres el puto impostor cabrón/a',
      notImposter: '✅ No eres el puto impostor cabrón/a',
      secretWord: 'Palabra Secreta',
      noHint: 'Sin pista - esperando revelación de palabra',
      hide: '🙈 Ocultar',
      whatsapp: '📱 WhatsApp',
      previous: '← Anterior',
      next: 'Siguiente →',
      finish: 'Finalizar',
    },
    summary: {
      gameStarted: 'El juego ha comenzado',
      gameStartedDesc: 'Todos ya tienen su palabra. Hablen, hagan preguntas y descubran quién está fingiendo.',
      startsLabel: 'Comienza:',
      categoryLabel: 'Categoría:',
      revealControls: 'Controles de Revelación',
      revealControlsDesc: 'Usa estos controles cuando terminen de discutir',
      revealImposters: '🎭 Revelar Impostores y Palabras',
      showImposterWord: '👁️ Mostrar Palabra al Impostor',
      impostersRevealed: '¡Impostores Revelados!',
      secretWord: 'Palabra Secreta',
      results: 'Resultados',
      imposter: '🔥 Impostor',
      banda: '✅ BANDA',
      newRound: '🎮 Nueva Ronda',
      config: 'Configuración',
    },
  },
  en: {
    setup: {
      title: 'Setup',
      players: 'Players',
      playersMin: '(minimum 3)',
      namePlaceholder: 'Name',
      phonePlaceholder: 'Phone (optional)',
      character: 'Character (optional)',
      addPlayer: 'Add Player',
      noPlayers: 'No players yet, add at least 3.',
      category: 'Category',
      random: '🎲 Random',
      mixed: '🔀 Mixed',
      imposters: 'Number of imposters',
      sendHint: 'Send extra hint to imposter',
      hintPlaceholder: 'E.g.: It\'s something you eat',
      imposterWord: 'Give imposter a hint (different word)',
      adultContent: 'Include adult content',
      startRound: 'Start Round',
    },
    round: {
      playerOf: 'Player {current} of {total}',
      turnOf: '{name}\'s turn',
      onlyPlayer: 'Only {name} can see the screen',
      reveal: '👁️ Reveal my role',
      revealWarning: 'Only press when no one else is watching',
      isImposter: '🔥 You are the f***ing imposter!',
      notImposter: '✅ You are NOT the imposter!',
      secretWord: 'Secret Word',
      noHint: 'No hint - waiting for word reveal',
      hide: '🙈 Hide',
      whatsapp: '📱 WhatsApp',
      previous: '← Previous',
      next: 'Next →',
      finish: 'Finish',
    },
    summary: {
      gameStarted: 'The game has begun',
      gameStartedDesc: 'Everyone has their word. Talk, ask questions and find out who\'s pretending.',
      startsLabel: 'Starts:',
      categoryLabel: 'Category:',
      revealControls: 'Reveal Controls',
      revealControlsDesc: 'Use these controls when you\'re done discussing',
      revealImposters: '🎭 Reveal Imposters and Words',
      showImposterWord: '👁️ Show Word to Imposter',
      impostersRevealed: 'Imposters Revealed!',
      secretWord: 'Secret Word',
      results: 'Results',
      imposter: '🔥 Imposter',
      banda: '✅ CREW',
      newRound: '🎮 New Round',
      config: 'Settings',
    },
  },
};

export default function PlayScreen() {
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
  const dangerColor = useThemeColor('danger');
  const imposterColor = useThemeColor('imposter');
  const successColor = useThemeColor('success');

  // Game state
  const [players, setPlayers] = useStorage('imposter_players_play', []);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Settings
  const [numImposters, setNumImposters] = useState(1);
  const [allowAdult, setAllowAdult] = useState(false);
  const [sendHintToImposter, setSendHintToImposter] = useState(false);
  const [useImposterWord, setUseImposterWord] = useState(false);
  const [categoryId, setCategoryId] = useState('random');
  const [hint, setHint] = useState('');

  // Game progress
  const [step, setStep] = useState('setup');
  const [round, setRound] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const currentPlayer = players?.[currentPlayerIndex];
  const currentRole = round?.roles.find((r) => r.playerId === currentPlayer?.id);
  const currentCharacter = currentPlayer?.character
    ? getCharacterById(currentPlayer.character)
    : null;

  const maxImposters = useMemo(
    () => Math.max(1, players?.length ? players.length - 1 : 1),
    [players?.length]
  );

  const addPlayer = () => {
    if (!nameInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newPlayer = {
      id: randomId(),
      name: nameInput.trim(),
      phone: phoneInput.trim() || '',
      character: selectedCharacter?.id || null,
    };

    setPlayers((prev) => [...(prev || []), newPlayer]);
    setNameInput('');
    setPhoneInput('');
    setSelectedCharacter(null);
  };

  const removePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const startRound = () => {
    if (!players || players.length < 3) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let imposters = numImposters;
    if (imposters < 1) imposters = 1;
    if (imposters >= players.length) imposters = players.length - 1;

    let pair;
    let categoryName;

    if (categoryId === 'random') {
      const category = getRandomCategory({ allowAdult });
      pair = randomPairFromCategory(category);
      categoryName = category.name;
    } else if (categoryId === 'mixed') {
      const allPairs = getAllowedPairs({ allowAdult, allowCustom: false });
      if (allPairs.length === 0) {
        return;
      }
      pair = allPairs[Math.floor(Math.random() * allPairs.length)];
      categoryName = language === 'es' ? 'Mezcladas (todas)' : 'Mixed (all)';
    } else {
      const category = getCategoryById(categoryId);
      pair = randomPairFromCategory(category);
      categoryName = category.name;
    }

    const playerIds = players.map((p) => p.id);
    const shuffledIds = shuffle(playerIds);
    const impSet = new Set(shuffledIds.slice(0, imposters));

    const roles = playerIds.map((id) => ({
      playerId: id,
      isImposter: impSet.has(id),
      word: impSet.has(id) ? (useImposterWord ? pair.imposter : null) : pair.common,
      revealedLocally: false,
    }));

    const startingPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

    setRound({
      categoryName,
      commonWord: pair.common,
      imposterWord: pair.imposter,
      roles,
      hint: hint.trim() || '',
      sendHintToImposter,
      useImposterWord,
      numImposters: imposters,
      startingPlayerId,
      impostersRevealed: false,
      imposterWordRevealed: false,
    });
    setNumImposters(imposters);
    setCurrentPlayerIndex(0);
    setStep('round');
  };

  const toggleRevealLocal = (playerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!round) return;
    setRound((prev) => ({
      ...prev,
      roles: prev.roles.map((r) =>
        r.playerId === playerId ? { ...r, revealedLocally: !r.revealedLocally } : r
      ),
    }));
  };

  const goToNextPlayer = () => {
    if (round && players[currentPlayerIndex]) {
      const currentPlayerId = players[currentPlayerIndex].id;
      const currentRoleData = round.roles.find((r) => r.playerId === currentPlayerId);
      if (currentRoleData?.revealedLocally) {
        toggleRevealLocal(currentPlayerId);
      }
    }

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      setStep('summary');
    }
  };

  const goToPreviousPlayer = () => {
    if (round && players[currentPlayerIndex]) {
      const currentPlayerId = players[currentPlayerIndex].id;
      const currentRoleData = round.roles.find((r) => r.playerId === currentPlayerId);
      if (currentRoleData?.revealedLocally) {
        toggleRevealLocal(currentPlayerId);
      }
    }

    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex((prev) => prev - 1);
    }
  };

  const toggleImpostersRevealed = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (!round) return;
    setRound((prev) => ({
      ...prev,
      impostersRevealed: !prev.impostersRevealed,
    }));
  };

  const showImposterWord = () => {
    if (!round || round.imposterWordRevealed) return;
    setRound((prev) => ({
      ...prev,
      imposterWordRevealed: true,
      roles: prev.roles.map((r) =>
        r.isImposter ? { ...r, word: prev.imposterWord } : r
      ),
    }));
  };

  const newRoundSameSetup = () => {
    startRound();
  };

  const resetToSetup = () => {
    setRound(null);
    setCurrentPlayerIndex(0);
    setStep('setup');
  };

  const sendRoleWhatsApp = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    const role = round?.roles.find((r) => r.playerId === playerId);
    if (!player || !role || !player.phone) return;

    const msg = buildRoleMessage({
      playerName: player.name,
      isImposter: role.isImposter,
      word: role.word,
      hint: round.sendHintToImposter && role.isImposter ? round.hint : '',
      useImposterWord: round.useImposterWord,
      language,
    });

    const url = buildWhatsAppUrl(player.phone, msg);
    Linking.openURL(url);
  };

  // Render Setup Step
  if (step === 'setup') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Card style={styles.card}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t.setup.players} {t.setup.playersMin}
              </ThemedText>

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t.setup.namePlaceholder}
                placeholderTextColor={borderColor}
                value={nameInput}
                onChangeText={setNameInput}
                onSubmitEditing={addPlayer}
              />

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: backgroundColor, borderColor, color: textColor },
                ]}
                placeholder={t.setup.phonePlaceholder}
                placeholderTextColor={borderColor}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
              />

              <ThemedText type="muted" style={styles.label}>
                {t.setup.character}
              </ThemedText>
              <CharacterSelector
                selectedId={selectedCharacter?.id}
                onSelect={setSelectedCharacter}
              />

              <Button
                title={t.setup.addPlayer}
                onPress={addPlayer}
                style={styles.addButton}
              />

              <View style={styles.playerListContainer}>
                <PlayerList
                  players={players || []}
                  onRemove={removePlayer}
                  emptyMessage={t.setup.noPlayers}
                />
              </View>
            </Card>

            <Card style={styles.card}>
              <ThemedText type="muted" style={styles.label}>
                {t.setup.imposters}
              </ThemedText>
              <View style={styles.imposterSelector}>
                <Button
                  title="-"
                  onPress={() => setNumImposters((n) => Math.max(1, n - 1))}
                  variant="ghost"
                  size="small"
                />
                <ThemedText type="large" style={styles.imposterCount}>
                  {numImposters}
                </ThemedText>
                <Button
                  title="+"
                  onPress={() => setNumImposters((n) => Math.min(maxImposters, n + 1))}
                  variant="ghost"
                  size="small"
                />
              </View>
            </Card>

            <Card style={styles.card}>
              <View style={styles.switchRow}>
                <ThemedText>{t.setup.sendHint}</ThemedText>
                <Switch
                  value={sendHintToImposter}
                  onValueChange={setSendHintToImposter}
                  trackColor={{ true: primaryColor }}
                />
              </View>

              {sendHintToImposter && (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: backgroundColor, borderColor, color: textColor },
                  ]}
                  placeholder={t.setup.hintPlaceholder}
                  placeholderTextColor={borderColor}
                  value={hint}
                  onChangeText={setHint}
                />
              )}

              <View style={styles.switchRow}>
                <ThemedText>{t.setup.imposterWord}</ThemedText>
                <Switch
                  value={useImposterWord}
                  onValueChange={setUseImposterWord}
                  trackColor={{ true: primaryColor }}
                />
              </View>

              <View style={styles.switchRow}>
                <ThemedText>{t.setup.adultContent}</ThemedText>
                <Switch
                  value={allowAdult}
                  onValueChange={setAllowAdult}
                  trackColor={{ true: primaryColor }}
                />
              </View>
            </Card>

            <Button
              title={t.setup.startRound}
              onPress={startRound}
              disabled={!players || players.length < 3}
              size="large"
              style={styles.startButton}
            />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Render Round Step
  if (step === 'round' && currentPlayer && currentRole) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.roundContainer}>
            <ThemedText type="muted" style={styles.playerProgress}>
              {t.round.playerOf
                .replace('{current}', currentPlayerIndex + 1)
                .replace('{total}', players.length)}
            </ThemedText>

            <ThemedText type="subtitle" style={styles.playerName}>
              {currentPlayer.name}
            </ThemedText>

            <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: primaryColor,
                    width: `${((currentPlayerIndex + 1) / players.length) * 100}%`,
                  },
                ]}
              />
            </View>

            {currentCharacter && (
              <ThemedText style={styles.characterEmoji}>
                {currentCharacter.emoji}
              </ThemedText>
            )}

            {!currentRole.revealedLocally ? (
              <Card style={styles.revealCard}>
                <ThemedText style={styles.maskEmoji}>🎭</ThemedText>
                <ThemedText type="subtitle">
                  {t.round.turnOf.replace('{name}', currentPlayer.name)}
                </ThemedText>
                <ThemedText type="muted" style={styles.revealHint}>
                  {t.round.onlyPlayer.replace('{name}', currentPlayer.name)}
                </ThemedText>

                <Button
                  title={t.round.reveal}
                  onPress={() => toggleRevealLocal(currentPlayer.id)}
                  size="large"
                  style={styles.revealButton}
                />
                <ThemedText type="muted" style={styles.revealWarning}>
                  {t.round.revealWarning}
                </ThemedText>
              </Card>
            ) : (
              <View style={styles.roleRevealContainer}>
                <View
                  style={[
                    styles.roleBox,
                    {
                      backgroundColor: currentRole.isImposter
                        ? imposterColor
                        : successColor,
                    },
                  ]}
                >
                  <ThemedText style={styles.roleText}>
                    {currentRole.isImposter ? t.round.isImposter : t.round.notImposter}
                  </ThemedText>
                </View>

                {currentRole.word && (
                  <Card style={styles.wordCard}>
                    <ThemedText type="muted">{t.round.secretWord}</ThemedText>
                    <ThemedText
                      style={[styles.secretWord, { color: primaryColor }]}
                    >
                      {currentRole.word}
                    </ThemedText>
                  </Card>
                )}

                {!currentRole.word && currentRole.isImposter && (
                  <ThemedText type="muted" style={styles.noHintText}>
                    {t.round.noHint}
                  </ThemedText>
                )}

                <Button
                  title={t.round.hide}
                  onPress={() => toggleRevealLocal(currentPlayer.id)}
                  variant="ghost"
                  style={styles.hideButton}
                />

                {currentPlayer.phone && (
                  <Button
                    title={t.round.whatsapp}
                    onPress={() => sendRoleWhatsApp(currentPlayer.id)}
                    variant="secondary"
                    style={styles.whatsappButton}
                  />
                )}
              </View>
            )}

            <View style={styles.navigationButtons}>
              <Button
                title={t.round.previous}
                onPress={goToPreviousPlayer}
                variant="ghost"
                disabled={currentPlayerIndex === 0}
              />
              <Button
                title={
                  currentPlayerIndex === players.length - 1
                    ? t.round.finish
                    : t.round.next
                }
                onPress={goToNextPlayer}
              />
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Render Summary Step
  if (step === 'summary' && round) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {!round.impostersRevealed ? (
              <>
                <Card style={styles.card}>
                  <ThemedText type="subtitle" style={styles.centered}>
                    {t.summary.gameStarted}
                  </ThemedText>
                  <ThemedText type="muted" style={styles.centered}>
                    {t.summary.gameStartedDesc}
                  </ThemedText>

                  <View
                    style={[styles.starterBox, { backgroundColor: successColor }]}
                  >
                    <ThemedText style={styles.starterEmoji}>🎯</ThemedText>
                    <ThemedText style={styles.starterLabel}>
                      {t.summary.startsLabel}
                    </ThemedText>
                    <ThemedText style={styles.starterName}>
                      {players.find((p) => p.id === round.startingPlayerId)?.name ||
                        '?'}
                    </ThemedText>
                  </View>

                  <ThemedText type="muted" style={styles.centered}>
                    {t.summary.categoryLabel} {round.categoryName}
                  </ThemedText>
                </Card>

                <Card style={styles.card}>
                  <ThemedText type="subtitle">{t.summary.revealControls}</ThemedText>
                  <ThemedText type="muted" style={styles.controlsDesc}>
                    {t.summary.revealControlsDesc}
                  </ThemedText>

                  <Button
                    title={t.summary.revealImposters}
                    onPress={toggleImpostersRevealed}
                    size="large"
                    style={styles.revealAllButton}
                  />

                  {!round.imposterWordRevealed && (
                    <Button
                      title={t.summary.showImposterWord}
                      onPress={showImposterWord}
                      variant="ghost"
                    />
                  )}
                </Card>
              </>
            ) : (
              <Card style={[styles.card, { borderColor: dangerColor, borderWidth: 2 }]}>
                <ThemedText
                  type="subtitle"
                  style={[styles.centered, { color: dangerColor }]}
                >
                  {t.summary.impostersRevealed}
                </ThemedText>

                <View style={[styles.wordRevealBox, { backgroundColor }]}>
                  <ThemedText type="muted">{t.summary.secretWord}</ThemedText>
                  <ThemedText style={[styles.revealedWord, { color: primaryColor }]}>
                    {round.commonWord}
                  </ThemedText>
                </View>

                <ThemedText type="subtitle" style={styles.resultsTitle}>
                  {t.summary.results}
                </ThemedText>

                {round.roles.map((role) => {
                  const player = players.find((p) => p.id === role.playerId);
                  const character = player?.character
                    ? getCharacterById(player.character)
                    : null;

                  return (
                    <View
                      key={role.playerId}
                      style={[
                        styles.resultItem,
                        {
                          backgroundColor: role.isImposter
                            ? dangerColor
                            : primaryColor,
                        },
                      ]}
                    >
                      <View style={styles.resultInfo}>
                        {character && (
                          <ThemedText style={styles.resultEmoji}>
                            {character.emoji}
                          </ThemedText>
                        )}
                        <ThemedText style={styles.resultName}>
                          {player?.name}
                        </ThemedText>
                      </View>
                      <View style={styles.resultBadge}>
                        <ThemedText style={styles.resultBadgeText}>
                          {role.isImposter ? t.summary.imposter : t.summary.banda}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}

                <View style={styles.endButtons}>
                  <Button
                    title={t.summary.newRound}
                    onPress={newRoundSameSetup}
                    size="large"
                    style={styles.newRoundButton}
                  />
                  <Button
                    title={t.summary.config}
                    onPress={resetToSetup}
                    variant="ghost"
                  />
                </View>
              </Card>
            )}
          </ScrollView>
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
  card: {
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: 16,
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
  addButton: {
    marginTop: 8,
  },
  playerListContainer: {
    marginTop: 16,
  },
  imposterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  imposterCount: {
    minWidth: 40,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  startButton: {
    marginTop: 8,
  },
  roundContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  playerProgress: {
    textAlign: 'center',
  },
  playerName: {
    textAlign: 'center',
    marginVertical: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  characterEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  revealCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  maskEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  revealHint: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  revealButton: {
    width: '100%',
  },
  revealWarning: {
    textAlign: 'center',
    marginTop: 12,
  },
  roleRevealContainer: {
    width: '100%',
    alignItems: 'center',
  },
  roleBox: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wordCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secretWord: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  noHintText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  hideButton: {
    width: '100%',
    marginBottom: 8,
  },
  whatsappButton: {
    width: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    gap: 16,
  },
  centered: {
    textAlign: 'center',
    marginBottom: 12,
  },
  starterBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  starterEmoji: {
    fontSize: 48,
    color: '#ffffff',
  },
  starterLabel: {
    color: '#ffffff',
    marginTop: 8,
  },
  starterName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controlsDesc: {
    marginBottom: 16,
  },
  revealAllButton: {
    marginBottom: 12,
  },
  wordRevealBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  revealedWord: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  resultsTitle: {
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultEmoji: {
    fontSize: 24,
    color: '#ffffff',
  },
  resultName: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  endButtons: {
    marginTop: 16,
    gap: 12,
  },
  newRoundButton: {
    marginBottom: 0,
  },
});
