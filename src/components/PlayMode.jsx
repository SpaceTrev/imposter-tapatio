import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CATEGORIES,
  getCategoryById,
  getRandomCategory,
  randomPairFromCategory,
  getAllowedPairs,
} from "../data/categories";
import { CHARACTERS, getCharacterById } from "../data/characters";
import { buildRoleMessage, openWhatsApp, formatPhoneDisplay } from "../utils/whatsapp";

const randomId = () => Math.random().toString(36).slice(2);
const randomRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const STORAGE_KEY = "imposter_players_play";

// Session storage helpers with sala support
function getSessionKey(salaCode) {
  return salaCode ? `imposter_sala_${salaCode}_session` : "imposter_play_session";
}

function getPlayerTokenKey(salaCode) {
  return salaCode ? `imposter_player_token_${salaCode}` : null;
}

function loadPlayers() {
  try {
    // Try new key first
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Migrate from old keys
      const oldWhatsApp = localStorage.getItem("imposter_players_whatsapp");
      const oldScreen = localStorage.getItem("imposter_players");
      saved = oldWhatsApp || oldScreen;
      if (saved) {
        localStorage.setItem(STORAGE_KEY, saved);
      }
    }
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (err) {
    console.warn("No se pudo guardar en localStorage:", err);
  }
}

function loadSession(salaCode = null) {
  try {
    const sessionKey = getSessionKey(salaCode);
    const saved = sessionStorage.getItem(sessionKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveSession(data, salaCode = null) {
  try {
    const sessionKey = getSessionKey(salaCode);
    sessionStorage.setItem(sessionKey, JSON.stringify(data));
  } catch (err) {
    console.warn("No se pudo guardar la sesión:", err);
  }
}

function clearSession(salaCode = null) {
  try {
    const sessionKey = getSessionKey(salaCode);
    sessionStorage.removeItem(sessionKey);
  } catch (err) {
    console.warn("No se pudo limpiar la sesión:", err);
  }
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PlayMode({ onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salaCode = searchParams.get("sala");
  
  const [players, setPlayers] = useState(loadPlayers);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  // Check for previous session and show banner if exists
  const [showSessionBanner, setShowSessionBanner] = useState(() => {
    const session = loadSession(salaCode);
    return session && session.step !== 'setup';
  });

  useEffect(() => {
    savePlayers(players);
  }, [players]);

  const [numImposters, setNumImposters] = useState(1);
  const [allowAdult, setAllowAdult] = useState(false);
  const [allowCustom, setAllowCustom] = useState(false);
  const [sendHintToImposter, setSendHintToImposter] = useState(false);
  const [useImposterWord, setUseImposterWord] = useState(false);
  const [categoryId, setCategoryId] = useState("random");
  const [hint, setHint] = useState("");

  const [step, setStep] = useState("setup");
  const [round, setRound] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Derived values needed in effects
  const currentPlayer = players[currentPlayerIndex];
  const currentRole = round?.roles.find((r) => r.playerId === currentPlayer?.id);
  const currentCharacter = currentPlayer?.character ? getCharacterById(currentPlayer.character) : null;

  const maxImposters = useMemo(
    () => Math.max(1, players.length ? players.length - 1 : 1),
    [players.length]
  );

  function restoreSession() {
    const session = loadSession(salaCode);
    if (session) {
      setStep(session.step);
      setRound(session.round);
      setCurrentPlayerIndex(session.currentPlayerIndex);
      setNumImposters(session.numImposters);
      setAllowAdult(session.allowAdult);
      setAllowCustom(session.allowCustom);
      setSendHintToImposter(session.sendHintToImposter);
      setUseImposterWord(session.useImposterWord);
      setCategoryId(session.categoryId);
      setHint(session.hint);
      if (session.players) {
        setPlayers(session.players);
      }
      setShowSessionBanner(false);
    }
  }

  // Save session whenever game state changes
  useEffect(() => {
    if (step !== 'setup' && round) {
      saveSession({
        step,
        round,
        currentPlayerIndex,
        numImposters,
        allowAdult,
        allowCustom,
        sendHintToImposter,
        useImposterWord,
        categoryId,
        hint,
        players,
        salaCode,
      }, salaCode);
    }
  }, [step, round, currentPlayerIndex, numImposters, allowAdult, allowCustom, sendHintToImposter, useImposterWord, categoryId, hint, players, salaCode]);

  // Handle player token detection and auto-reconnect for sala mode
  useEffect(() => {
    if (salaCode && step === 'round' && round && currentPlayer) {
      const tokenKey = getPlayerTokenKey(salaCode);
      if (tokenKey) {
        const storedToken = sessionStorage.getItem(tokenKey);
        
        if (!storedToken && currentRole) {
          // First time viewing role - store the token
          sessionStorage.setItem(tokenKey, currentRole.playerToken);
        } else if (storedToken && step === 'setup') {
          // Page reload with token - find and restore player's role
          const session = loadSession(salaCode);
          if (session?.round) {
            const playerRole = session.round.roles.find(r => r.playerToken === storedToken);
            if (playerRole) {
              // Auto-navigate to this player's role
              const playerIndex = players.findIndex(p => p.id === playerRole.playerId);
              if (playerIndex >= 0) {
                restoreSession();
                setCurrentPlayerIndex(playerIndex);
              }
            }
          }
        }
      }
    }
  }, [salaCode, step, round, currentPlayer, currentRole, players]);

  function dismissSessionBanner() {
    clearSession();
    setShowSessionBanner(false);
  }

  function addPlayer() {
    if (!nameInput.trim()) return;
    
    const newPlayer = {
      id: randomId(),
      name: nameInput.trim(),
      phone: phoneInput.trim() || "",
      character: selectedCharacter?.id || null,
    };
    
    setPlayers((prev) => [...prev, newPlayer]);
    setNameInput("");
    setPhoneInput("");
    setSelectedCharacter(null);
  }

  function removePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function startRound() {
    if (players.length < 3) {
      alert("Necesitas al menos 3 jugadores.");
      return;
    }

    // Generate sala code if not already in sala mode
    if (!salaCode) {
      const newSalaCode = randomRoomCode();
      navigate(`?sala=${newSalaCode}`, { replace: true });
      // The URL change will trigger a re-render with the new salaCode
      // We'll continue with the current execution since state hasn't updated yet
    }

    let imposters = numImposters;
    if (imposters < 1) imposters = 1;
    if (imposters >= players.length) imposters = players.length - 1;

    let pair;
    let categoryName;

    if (categoryId === "random") {
      const category = getRandomCategory({ allowAdult });
      pair = randomPairFromCategory(category);
      categoryName = category.name;
    } else if (categoryId === "mixed") {
      const allPairs = getAllowedPairs({ allowAdult, allowCustom });
      if (allPairs.length === 0) {
        alert("No hay pares disponibles con los filtros actuales.");
        return;
      }
      pair = allPairs[Math.floor(Math.random() * allPairs.length)];
      categoryName = "Mezcladas (todas)";
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
      playerToken: crypto.randomUUID(), // Generate unique token for each player
    }));

    const startingPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

    setRound({
      categoryId: categoryId === "mixed" ? "mixed" : categoryId === "random" ? getCategoryById(categoryId).id : categoryId,
      categoryName,
      commonWord: pair.common,
      imposterWord: pair.imposter,
      roles,
      hint: hint.trim() || "",
      sendHintToImposter,
      useImposterWord,
      numImposters: imposters,
      startingPlayerId,
      impostersRevealed: false,
      imposterWordRevealed: false,
    });
    setNumImposters(imposters);
    setCurrentPlayerIndex(0);
    setStep("round");
  }

  function toggleImpostersRevealed() {
    if (!round) return;
    setRound((prev) => ({
      ...prev,
      impostersRevealed: !prev.impostersRevealed,
    }));
  }

  function toggleRevealLocal(playerId) {
    if (!round) return;
    setRound((prev) => ({
      ...prev,
      roles: prev.roles.map((r) =>
        r.playerId === playerId
          ? { ...r, revealedLocally: !r.revealedLocally }
          : r
      ),
    }));
  }

  function showImposterWord() {
    if (!round || round.imposterWordRevealed) return;
    
    // Use the stored imposter word from round start
    setRound((prev) => ({
      ...prev,
      imposterWordRevealed: true,
      roles: prev.roles.map(r => 
        r.isImposter ? { ...r, word: prev.imposterWord } : r
      ),
    }));
  }

  function goToSummary() {
    setStep("summary");
  }

  function newRoundSameSetup() {
    startRound();
  }

  function resetToSetup() {
    setRound(null);
    setCurrentPlayerIndex(0);
    setStep("setup");
    clearSession(salaCode);
  }

  function goToNextPlayer() {
    // Auto-hide current player's role before moving to next
    if (round && players[currentPlayerIndex]) {
      const currentPlayerId = players[currentPlayerIndex].id;
      const currentRole = round.roles.find(r => r.playerId === currentPlayerId);
      if (currentRole?.revealedLocally) {
        toggleRevealLocal(currentPlayerId);
      }
    }
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      goToSummary();
    }
  }

  function goToPreviousPlayer() {
    // Auto-hide current player's role before moving to previous
    if (round && players[currentPlayerIndex]) {
      const currentPlayerId = players[currentPlayerIndex].id;
      const currentRole = round.roles.find(r => r.playerId === currentPlayerId);
      if (currentRole?.revealedLocally) {
        toggleRevealLocal(currentPlayerId);
      }
    }
    
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(prev => prev - 1);
    }
  }

  function sendRoleWhatsApp(playerId) {
    const player = players.find((p) => p.id === playerId);
    const role = round?.roles.find((r) => r.playerId === playerId);
    if (!player || !role) return;

    if (!player.phone) {
      alert(`${player.name} no tiene número de teléfono registrado.`);
      return;
    }

    const msg = buildRoleMessage({
      name: player.name,
      isImposter: role.isImposter,
      word: role.word,
      hint: round.sendHintToImposter && role.isImposter ? round.hint : "",
      useImposterWord: round.useImposterWord,
    });

    openWhatsApp(player.phone, msg);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn ghost small" onClick={onBack}>
            ← Volver
          </button>
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>
            Jugar
          </h1>
          <div style={{ width: "60px" }}></div>
        </div>
        <p style={{ marginTop: 8 }}>
          Revela roles en pantalla y opcionalmente envía recordatorios por WhatsApp
        </p>
      </header>

      <main className="app-main">
        {showSessionBanner && (
          <div className="card" style={{ 
            background: "var(--accent)", 
            color: "white", 
            marginBottom: 16,
            border: "none" 
          }}>
            <h3 style={{ marginTop: 0 }}>Continuar partida anterior</h3>
            <p style={{ marginBottom: 16 }}>Tienes una sesión guardada. ¿Quieres continuar donde lo dejaste?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ background: "white", color: "var(--accent)" }} onClick={restoreSession}>
                Continuar
              </button>
              <button className="btn ghost" style={{ borderColor: "white", color: "white" }} onClick={dismissSessionBanner}>
                Nueva partida
              </button>
            </div>
          </div>
        )}

        {step === "setup" && (
          <section className="card">
            <h2 className="section-title">Configuración</h2>

            <div className="field-group">
              <div className="field-label">
                Jugadores <span>(mínimo 3)</span>
              </div>
              <div className="player-input-row">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && nameInput.trim()) {
                      addPlayer();
                    }
                  }}
                />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && nameInput.trim()) {
                      addPlayer();
                    }
                  }}
                />
              </div>
              
              <div style={{ marginTop: 12 }}>
                <div className="field-label">Personaje (opcional)</div>
                <div className="character-grid" style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", 
                  gap: 8,
                  marginTop: 8 
                }}>
                  {CHARACTERS.map((char) => (
                    <div
                      key={char.id}
                      className={`character-card ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                      onClick={() => setSelectedCharacter(selectedCharacter?.id === char.id ? null : char)}
                      style={{
                        padding: 8,
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${selectedCharacter?.id === char.id ? char.colors.primary : 'var(--border)'}`,
                        background: selectedCharacter?.id === char.id ? `${char.colors.primary}10` : 'var(--card)',
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "2rem" }}>{char.emoji}</div>
                      <div style={{ fontSize: "0.7rem", marginTop: 4 }}>{char.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="btn primary" style={{ marginTop: 12, width: "100%" }} onClick={addPlayer}>
                Agregar Jugador
              </button>

              <ul className="player-list" style={{ marginTop: 16 }}>
                {players.map((p) => {
                  const char = p.character ? getCharacterById(p.character) : null;
                  return (
                    <li key={p.id}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {char && <span style={{ fontSize: "1.5rem" }}>{char.emoji}</span>}
                        <span>
                          {p.name}{" "}
                          {p.phone && (
                            <span className="muted">({formatPhoneDisplay(p.phone)})</span>
                          )}
                        </span>
                      </span>
                      <button
                        className="pill pill-danger"
                        onClick={() => removePlayer(p.id)}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
                {players.length === 0 && (
                  <li className="muted">
                    Aún no hay jugadores, agrega al menos 3.
                  </li>
                )}
              </ul>
            </div>

            <div className="field-group">
              <label>
                Categoría
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="random">🎲 Aleatoria</option>
                  <option value="mixed">🔀 Mezcladas (todas)</option>
                  {CATEGORIES.filter(c => allowAdult || c.type !== "adult").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field-group">
              <label>
                Número de impostores
                <input
                  type="number"
                  min="1"
                  max={maxImposters}
                  value={numImposters}
                  onChange={(e) => {
                    let val = parseInt(e.target.value, 10) || 1;
                    if (val > maxImposters) val = maxImposters;
                    if (val < 1) val = 1;
                    setNumImposters(val);
                  }}
                />
              </label>
            </div>

            <div className="field-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sendHintToImposter}
                  onChange={(e) => setSendHintToImposter(e.target.checked)}
                />
                Enviar pista extra al impostor
              </label>
              {sendHintToImposter && (
                <input
                  type="text"
                  placeholder="Ej: Es algo que comes"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>

            <div className="field-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useImposterWord}
                  onChange={(e) => setUseImposterWord(e.target.checked)}
                />
                Dar pista al impostor (palabra diferente)
              </label>
            </div>

            <div className="field-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowAdult}
                  onChange={(e) => setAllowAdult(e.target.checked)}
                />
                Incluir contenido adulto
              </label>
            </div>

            <button
              className="btn primary full"
              onClick={startRound}
              disabled={players.length < 3}
            >
              Iniciar Ronda
            </button>
          </section>
        )}

        {step === "round" && currentPlayer && currentRole && (
          <section className="card">
            <div style={{ marginBottom: 16 }}>
              <div className="muted center">Jugador {currentPlayerIndex + 1} de {players.length}</div>
              <h2 className="center" style={{ margin: "8px 0", fontSize: "1.5rem" }}>
                {currentPlayer.name}
              </h2>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
                />
              </div>
            </div>

            {currentCharacter && (
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: "5rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
                  {currentCharacter.emoji}
                </div>
              </div>
            )}

            {!currentRole.revealedLocally ? (
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ 
                  background: "var(--card)", 
                  border: "2px dashed var(--border)", 
                  borderRadius: "var(--radius-lg)",
                  padding: "48px 24px",
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎭</div>
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Turno de {currentPlayer.name}</h3>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Asegúrate de que solo <strong>{currentPlayer.name}</strong> pueda ver la pantalla
                  </p>
                </div>
                <button
                  className="btn primary"
                  onClick={() => toggleRevealLocal(currentPlayer.id)}
                  style={{ fontSize: "1.1rem", padding: "16px 32px" }}
                >
                  👁️ Revelar mi rol
                </button>
                <p className="muted" style={{ fontSize: "0.85rem", marginTop: 12 }}>
                  Solo presiona cuando nadie más esté viendo
                </p>
              </div>
            ) : (
              <>
                <div className="player-role-display">
                  <h2 className="section-title center">Tu Rol</h2>
                  <div 
                    className="role-reveal-box" 
                    style={{
                      padding: 24,
                      borderRadius: "var(--radius-lg)",
                      background: currentRole.isImposter 
                        ? "linear-gradient(135deg, #a855f7, #c084fc)" 
                        : (currentCharacter?.colors.gradient || "linear-gradient(135deg, #10b981, #059669)"),
                      color: "white",
                      textAlign: "center",
                      marginBottom: 24,
                      boxShadow: currentCharacter 
                        ? `0 8px 32px ${currentRole.isImposter ? '#a855f7' : currentCharacter.colors.primary}40` 
                        : undefined,
                    }}
                  >
                    <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>
                      {currentRole.isImposter
                        ? "🔥 Eres el puto impostor cabrón/a"
                        : "✅ No eres el puto impostor cabrón/a"}
                    </h1>
                  </div>

                  {currentRole.word && (
                    <>
                      <h2 className="section-title center" style={{ marginBottom: 16 }}>
                        Palabra Secreta
                      </h2>
                      <div style={{
                        padding: 32,
                        borderRadius: "var(--radius-lg)",
                        background: "var(--card)",
                        border: `3px solid ${currentCharacter?.colors.primary || "var(--accent)"}`,
                        textAlign: "center",
                        marginBottom: 24,
                        boxShadow: currentCharacter ? `0 4px 20px ${currentCharacter.colors.primary}40` : undefined,
                      }}>
                        <h1 style={{ 
                          fontSize: "2.5rem", 
                          color: currentCharacter?.colors.primary || "var(--accent)", 
                          margin: 0,
                          textShadow: currentCharacter ? `0 0 20px ${currentCharacter.colors.primary}60` : undefined,
                        }}>
                          {currentRole.word}
                        </h1>
                      </div>
                    </>
                  )}

                  {!currentRole.word && currentRole.isImposter && (
                    <div style={{ 
                      padding: 16, 
                      background: "var(--bg)", 
                      borderRadius: "var(--radius-md)",
                      marginBottom: 24 
                    }}>
                      <p className="center muted">
                        Sin pista - esperando revelación de palabra
                      </p>
                    </div>
                  )}

                  <button
                    className="btn ghost"
                    onClick={() => toggleRevealLocal(currentPlayer.id)}
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    🙈 Ocultar rol
                  </button>

                  {currentPlayer.phone && (
                    <button
                      className="btn full"
                      style={{ marginBottom: 8 }}
                      onClick={() => sendRoleWhatsApp(currentPlayer.id)}
                    >
                      📱 Recordatorio por WhatsApp
                    </button>
                  )}
                </div>
              </>
            )}

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: 24,
              gap: 8 
            }}>
              <button
                className="btn ghost"
                onClick={goToPreviousPlayer}
                disabled={currentPlayerIndex === 0}
              >
                ← Anterior
              </button>
              <button
                className="btn primary"
                onClick={goToNextPlayer}
              >
                {currentPlayerIndex === players.length - 1 ? "Finalizar" : "Siguiente →"}
              </button>
            </div>
          </section>
        )}

        {step === "summary" && (
          <section>
            {!round?.impostersRevealed && (
              <>
                <div className="card" style={{ marginBottom: 16, textAlign: "center" }}>
                  <h2 className="section-title center">Palabra Secreta</h2>
                  <div style={{
                    padding: 32,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--card)",
                    border: "3px solid #8b5687",
                    marginTop: 16,
                  }}>
                    <h1 style={{ 
                      fontSize: "2.5rem", 
                      color: "#8b5687", 
                      margin: 0 
                    }}>
                      {round.commonWord}
                    </h1>
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title">Controles de Revelación</h3>
                  <button 
                    className="btn primary full" 
                    style={{ marginBottom: 8 }} 
                    onClick={toggleImpostersRevealed}
                  >
                    Revelar Impostores
                  </button>
                  {!round.imposterWordRevealed && (
                    <button 
                      className="btn ghost full" 
                      onClick={showImposterWord}
                    >
                      Mostrar Palabra al Impostor
                    </button>
                  )}
                </div>
              </>
            )}

            {round?.impostersRevealed && (
              <div className="card" style={{ 
                border: "3px solid #ef4444",
                padding: 24 
              }}>
                <h2 style={{ 
                  textAlign: "center", 
                  color: "#ef4444", 
                  fontSize: "2rem",
                  marginTop: 0,
                  marginBottom: 8 
                }}>
                  ¡Impostores Revelados!
                </h2>
                <p className="center muted" style={{ marginBottom: 24 }}>
                  El juego ha terminado
                </p>

                <h3 className="section-title" style={{ 
                  textTransform: "uppercase",
                  fontSize: "1rem",
                  letterSpacing: "0.05em",
                  marginBottom: 16 
                }}>
                  Resultados
                </h3>

                {round.roles.map((role) => {
                  const player = players.find((p) => p.id === role.playerId);
                  const character = player?.character ? getCharacterById(player.character) : null;
                  
                  return (
                    <div 
                      key={role.playerId} 
                      style={{ 
                        padding: 20,
                        marginBottom: 12,
                        borderRadius: "var(--radius-lg)",
                        background: role.isImposter ? "#ef4444" : "#8b5687",
                        color: "white",
                      }}
                    >
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: 12 
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {character && <span style={{ fontSize: "1.5rem" }}>{character.emoji}</span>}
                          <strong style={{ fontSize: "1.1rem" }}>{player?.name}</strong>
                        </div>
                        <span 
                          className={role.isImposter ? "pill-danger" : "pill"} 
                          style={{ 
                            background: role.isImposter ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.3)",
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "999px",
                            padding: "6px 14px"
                          }}
                        >
                          {role.isImposter ? "🔥 Impostor" : "✅ BANDA"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                        Palabra: {role.isImposter ? (role.word || round.commonWord) : (role.word || "(sin pista)")}
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 24 }}>
                  <button
                    className="btn primary full"
                    onClick={newRoundSameSetup}
                    style={{ marginBottom: 8 }}
                  >
                    🎮 Nueva Ronda
                  </button>
                  <button
                    className="btn ghost full"
                    onClick={resetToSetup}
                  >
                    Volver a Configuración
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
