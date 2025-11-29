import React, { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  getCategoryById,
  getRandomCategory,
  randomPairFromCategory,
  getAllowedPairs,
} from "../data/categories";
// TODO: Add English support like WiFiMode
// import { CATEGORIES_EN, getCategoryById_EN, getRandomCategory_EN, randomPairFromCategory_EN } from "../data/categories-en";
import { buildRoleMessage, openWhatsApp, formatPhoneDisplay } from "../utils/whatsapp";

const randomId = () => Math.random().toString(36).slice(2);

const STORAGE_KEY = "imposter_players";
const THEME_STORAGE_KEY = "imposter_theme";

function loadPlayers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || "light";
  } catch {
    return "light";
  }
}

function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (err) {
    console.warn("No se pudo guardar en localStorage:", err);
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

export default function WhatsAppMode({ onBack }) {
  const [players, setPlayers] = useState(loadPlayers);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [theme, setTheme] = useState(loadTheme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Persist players to localStorage whenever they change
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

  const [step, setStep] = useState("setup"); // setup | round | summary
  const [round, setRound] = useState(null); // {categoryName, commonWord, imposterWord, roles[]}
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const maxImposters = useMemo(
    () => Math.max(1, players.length ? players.length - 1 : 1),
    [players.length]
  );

  function addPlayer() {
    if (!nameInput.trim()) return;
    setPlayers((prev) => [
      ...prev,
      {
        id: randomId(),
        name: nameInput.trim(),
        phone: phoneInput.trim() || "",
      },
    ]);
    setNameInput("");
    setPhoneInput("");
  }

  function removePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function startRound() {
    if (players.length < 3) {
      alert("Necesitas al menos 3 jugadores.");
      return;
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

    // Create roles in original player order for stepper, but with randomized imposters
    const roles = playerIds.map((id) => ({
      playerId: id,
      isImposter: impSet.has(id),
      word: impSet.has(id) ? pair.imposter : pair.common,
      revealedLocally: false,
    }));

    // Randomly select starting player
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
    });
    setNumImposters(imposters);
    setCurrentPlayerIndex(0);
    setStep("round");
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

  function toggleImpostersRevealed() {
    if (!round) return;
    setRound((prev) => ({
      ...prev,
      impostersRevealed: !prev.impostersRevealed,
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
  }

  function goToNextPlayer() {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      goToSummary();
    }
  }

  function goToPreviousPlayer() {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(prev => prev - 1);
    }
  }

  function toggleTheme() {
    setTheme(prev => prev === "light" ? "dark" : "light");
  }

  const CurrentCategoryResolved = useMemo(() => {
    if (!round) return null;
    return getCategoryById(round.categoryId);
  }, [round]);

  return (
    <div className="app">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Cambiar tema"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      
      <header className="app-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn ghost small" onClick={onBack}>
            ← Volver
          </button>
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>
            Modo WhatsApp
          </h1>
          <div style={{ width: "60px" }}></div>
        </div>
        <p style={{ marginTop: 8 }}>
          Registra jugadores, arranca la ronda y mándales su rol secreto por
          WhatsApp o en modo pasa-el-cel.
        </p>
      </header>

      <main className="app-main">
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
                />
                <input
                  type="tel"
                  placeholder="Teléfono (10 dígitos, +52 o +1)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
                <button className="btn small" onClick={addPlayer}>
                  Agregar
                </button>
              </div>
              <ul className="player-list">
                {players.map((p) => (
                  <li key={p.id}>
                    <span>
                      {p.name}{" "}
                      {p.phone && (
                        <span className="muted">({formatPhoneDisplay(p.phone)})</span>
                      )}
                    </span>
                    <button
                      className="pill pill-danger"
                      onClick={() => removePlayer(p.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {players.length === 0 && (
                  <li className="muted">
                    Aún no hay jugadores, agrega al menos 3.
                  </li>
                )}
              </ul>
            </div>

            <div className="field-group">
              <div className="field-label">
                Impostores{" "}
                <span>
                  1–{maxImposters} (se ajusta si te pasas)
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={maxImposters}
                value={numImposters}
                onChange={(e) =>
                  setNumImposters(Number(e.target.value) || 1)
                }
              />
            </div>

            <div className="field-group">
              <div className="field-label">
                Categoría <span>con opción contenido adulto</span>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="random">🎲 Aleatoria (según filtro)</option>
                <option value="mixed">🌈 Mezcladas (todas las categorías)</option>
                {CATEGORIES.filter(c => !c.customBlank || allowCustom).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={allowAdult}
                  onChange={(e) => setAllowAdult(e.target.checked)}
                />
                <span>Permitir categorías adultas en aleatoria</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={allowCustom}
                  onChange={(e) => setAllowCustom(e.target.checked)}
                />
                <span>Permitir modo personalizable (???)</span>
              </label>
            </div>

            <div className="field-group">
              <div className="field-label">
                Pista opcional <span>sale en cada mensaje</span>
              </div>
              <textarea
                rows={2}
                placeholder="Algo sutil para guiarlos... (opcional)"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={sendHintToImposter}
                  onChange={(e) => setSendHintToImposter(e.target.checked)}
                />
                <span>Enviar pista también al impostor</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={useImposterWord}
                  onChange={(e) => setUseImposterWord(e.target.checked)}
                />
                <span>Dar palabra diferente al impostor (palabra impostor)</span>
              </label>
            </div>

            <button className="btn primary full" onClick={startRound}>
              Iniciar ronda
            </button>
            <p className="hint">
              Esto es sólo web: cada botón abrirá WhatsApp con el mensaje
              escrito y tú sólo confirmas enviar.
            </p>
          </section>
        )}

        {step === "round" && round && (() => {
          const r = round.roles[currentPlayerIndex];
          const player = players.find((p) => p.id === r.playerId);
          if (!player) return null;
          
          const msg = buildRoleMessage({
            playerName: player.name,
            word: r.word,
            isImposter: r.isImposter,
            hint: r.isImposter && !round.sendHintToImposter ? "" : round.hint,
            useImposterWord: round.useImposterWord,
          });

          const isLastPlayer = currentPlayerIndex === players.length - 1;

          return (
            <section className="card">
              <div className="stepper-container">
                <div className="stepper-header">
                  Jugador {currentPlayerIndex + 1} de {players.length}
                </div>
                <div className="stepper-title">
                  Turno de {player.name}
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
                  />
                </div>
              </div>

              <p className="center" style={{ fontSize: "0.95rem", marginBottom: 24 }}>
                Pasa el celular a <strong>{player.name}</strong> para que vea su rol
              </p>

              <div className="role-card" style={{ marginBottom: 24 }}>
                <div className="role-header">
                  <strong>{player.name}</strong>
                  <span className="pill">
                    {player.phone ? "Con número" : "Sin número"}
                  </span>
                </div>
                <div className="role-actions">
                  <button
                    className="btn small"
                    onClick={() => {
                      if (!player.phone) {
                        alert(
                          "Este jugador no tiene teléfono registrado."
                        );
                        return;
                      }
                      openWhatsApp(player.phone, msg);
                    }}
                  >
                    Enviar por WhatsApp
                  </button>
                  <button
                    className="btn small secondary"
                    onClick={() => toggleRevealLocal(player.id)}
                  >
                    {r.revealedLocally
                      ? "Ocultar rol"
                      : "Revelar en pantalla"}
                  </button>
                </div>
                {r.revealedLocally && (
                  <div className={`local-reveal ${r.isImposter ? 'imposter' : 'crew'}`}>
                    <div className="role-text">
                      {r.isImposter ? "🔥 Eres el puto impostor cabrón/a" : "✅ No eres el puto impostor cabrón/a"}
                    </div>
                    {(!r.isImposter || round.useImposterWord) && r.word && (
                      <div className="word-text">
                        {r.word}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
                {currentPlayerIndex > 0 && (
                  <button
                    className="btn ghost"
                    onClick={goToPreviousPlayer}
                    style={{ flex: 1 }}
                  >
                    ← Anterior
                  </button>
                )}
                <button
                  className="btn primary"
                  onClick={goToNextPlayer}
                  style={{ flex: 2 }}
                >
                  {isLastPlayer ? "Iniciar juego →" : "Siguiente jugador →"}
                </button>
              </div>

              <button
                className="btn ghost full"
                onClick={resetToSetup}
              >
                Cancelar ronda
              </button>
            </section>
          );
        })()}

        {step === "summary" && round && (
          <section className="card">
            <h2 className="section-title center">Fase de discusión</h2>
            <p className="center muted">
              Todos ya tienen su palabra. Hablen, hagan preguntas y descubran
              quién está fingiendo.
            </p>

            <p className="muted" style={{ marginTop: 12 }}>
              Categoría: <strong>{round.categoryName}</strong> ·{" "}
              {players.length} jugadores · {round.numImposters}{" "}
              {round.numImposters === 1 ? "impostor" : "impostores"}
            </p>
            {round.hint && (
              <p className="muted">
                Pista: <em>{round.hint}</em>
              </p>
            )}
            <p className="muted" style={{ fontStyle: "italic", marginTop: 8 }}>
              PS: eres un foto
            </p>

            {round.startingPlayerId && (() => {
              const startingPlayer = players.find(p => p.id === round.startingPlayerId);
              return startingPlayer ? (
                <div style={{ marginTop: 24, marginBottom: 24 }}>
                  <h3 className="section-title center" style={{ fontSize: "1.1rem", marginBottom: 8 }}>¿Quién empieza?</h3>
                  <p className="center" style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                    {startingPlayer.name}
                  </p>
                </div>
              ) : null;
            })()}

            <button className="btn full" onClick={newRoundSameSetup}>
              Nueva ronda (misma configuración)
            </button>
            <button
              className="btn ghost full"
              onClick={resetToSetup}
              style={{ marginTop: 8 }}
            >
              Cambiar jugadores / categorías
            </button>

            <button
              className="btn full"
              onClick={toggleImpostersRevealed}
              style={{ marginTop: 16, backgroundColor: round.impostersRevealed ? "#dc2626" : "#eab308" }}
            >
              {round.impostersRevealed ? "Ocultar impostores" : "Revelar impostor"}
            </button>

            {round.impostersRevealed && (
              <div style={{ marginTop: 16, padding: 16, backgroundColor: "var(--card)", borderRadius: "var(--radius-lg)", border: "2px solid #dc2626" }}>
                <h3 className="section-title center" style={{ color: "#dc2626", marginBottom: 12 }}>Los impostores eran:</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {round.roles
                    .filter(r => r.isImposter)
                    .map(r => {
                      const player = players.find(p => p.id === r.playerId);
                      return player ? (
                        <li key={r.playerId} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "1.1rem" }}>
                          <strong>{player.name}</strong>
                        </li>
                      ) : null;
                    })}
                </ul>
                <div style={{ marginTop: 16, padding: 12, backgroundColor: "rgba(220, 38, 38, 0.1)", borderRadius: "8px" }}>
                  <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: 8 }}>
                    Palabra secreta: <span style={{ color: "#10b981" }}>{round.commonWord}</span>
                  </p>
                  {round.useImposterWord && (
                    <p style={{ textAlign: "center", fontWeight: "bold" }}>
                      Palabra impostor: <span style={{ color: "#dc2626" }}>{round.imposterWord}</span>
                    </p>
                  )}
                  {round.hint && round.sendHintToImposter && (
                    <p style={{ textAlign: "center", fontWeight: "bold", marginTop: 8 }}>
                      Pista impostor: <span style={{ color: "#eab308" }}>{round.hint}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <span>
          Tip: agrega más palabras y categorías en{" "}
          <code>src/data/categories.js</code>.
        </span>
      </footer>
    </div>
  );
}
