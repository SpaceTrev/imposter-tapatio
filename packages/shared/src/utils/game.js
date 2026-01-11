// Game utilities shared between web and mobile

/**
 * Generate a random ID
 */
export const randomId = () => Math.random().toString(36).slice(2);

/**
 * Generate a random room code
 */
export const randomRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Assign roles to players for a game round
 * @param {Object} options
 * @param {Array} options.players - Array of player objects with id
 * @param {number} options.numImposters - Number of imposters
 * @param {Object} options.wordPair - Object with common and imposter words
 * @param {boolean} options.useImposterWord - Whether to give imposters a word
 * @returns {Array} Array of role assignments
 */
export function assignRoles({ players, numImposters, wordPair, useImposterWord }) {
  const playerIds = players.map((p) => p.id);
  const shuffledIds = shuffle(playerIds);
  const impSet = new Set(shuffledIds.slice(0, numImposters));

  return playerIds.map((id) => ({
    playerId: id,
    isImposter: impSet.has(id),
    word: impSet.has(id) ? (useImposterWord ? wordPair.imposter : null) : wordPair.common,
    revealedLocally: false,
    playerToken: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : randomId() + randomId(),
  }));
}

/**
 * Get a random starting player
 * @param {Array} players - Array of player objects with id
 * @returns {string} Player ID of the starting player
 */
export function getRandomStartingPlayer(players) {
  const idx = Math.floor(Math.random() * players.length);
  return players[idx].id;
}

/**
 * Build a role message for WhatsApp or in-app notification
 */
export function buildRoleMessage({ playerName, word, isImposter, hint, useImposterWord, language = 'es' }) {
  if (language === 'en') {
    if (isImposter) {
      const lines = [
        `Hey ${playerName},`,
        "",
        "You are the IMPOSTER!",
      ];

      if (useImposterWord && word) {
        lines.push("", `Your word: "${word}"`);
      }

      if (hint) {
        lines.push("", `Hint: '${hint}'`);
      }

      lines.push("", "Don't show this message to anyone.");

      return lines.join("\n");
    } else {
      return [
        `Hey ${playerName},`,
        "",
        "You are NOT the imposter!",
        "",
        `The secret word: "${word}"`,
        "",
        "Don't show this message to anyone.",
      ].join("\n");
    }
  }

  // Spanish (default)
  if (isImposter) {
    const lines = [
      `Hey ${playerName},`,
      "",
      "Eres el puto imposter cabron/a",
    ];

    if (useImposterWord && word) {
      lines.push("", `Tu palabra: "${word}"`);
    }

    if (hint) {
      lines.push("", `Hint: '${hint}'`);
    }

    lines.push("", "No le enseñes este mensaje a nadie.");

    return lines.join("\n");
  } else {
    return [
      `Hey ${playerName},`,
      "",
      "No eres el imposter!",
      "",
      `La palabra secreta: "${word}"`,
      "",
      "No le enseñes este mensaje a nadie.",
    ].join("\n");
  }
}
