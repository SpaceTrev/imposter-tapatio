import React, { useState, useEffect } from "react";
import { Peer } from "peerjs";
import {
  CATEGORIES,
  randomPairFromCategory,
} from "../data/categories";
import {
  CATEGORIES_EN,
  randomPairFromCategory_EN,
} from "../data/categories-en";
import { CHARACTERS, getCharacterById, getRandomCharacter } from "../data/characters";

const randomRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const selectText = {
  es: {
    back: "← Volver",
    title: "Modo WiFi Local",
    subtitle: "Elige tu rol",
    host: {
      title: "Ser Anfitrión",
      description: "Crea la sala, configura el juego y controla las revelaciones"
    },
    player: {
      title: "Unirse como Jugador",
      description: "Entra con un código y juega en tu celular",
      placeholder: "Código de sala (ej: ABC123)",
      button: "Unirse"
    }
  },
  en: {
    back: "← Back",
    title: "Local WiFi Mode",
    subtitle: "Choose your role",
    host: {
      title: "Be Host",
      description: "Create the room, configure the game and control revelations"
    },
    player: {
      title: "Join as Player",
      description: "Enter a code and play on your phone",
      placeholder: "Room code (e.g. ABC123)",
      button: "Join"
    }
  }
};

const playerText = {
  es: {
    back: "← Volver",
    joinRoom: "Unirse a Sala",
    enterName: "Ingresa tu nombre",
    namePlaceholder: "Tu nombre",
    connect: "Conectar",
    connecting: "Conectando...",
    room: "Sala",
    connectingToHost: "Conectando al anfitrión...",
    connectedAs: "Conectado como",
    waitingForGame: "Esperando que inicie el juego...",
    hostWillConfigure: "El anfitrión configurará el juego y asignará los roles",
    yourRole: "Tu Rol",
    youAreImposter: "🔥 Eres el puto impostor cabrón/a",
    youAreNotImposter: "✅ No eres el puto impostor cabrón/a",
    yourWord: "Tu Palabra",
    secretWord: "Palabra Secreta",
    noClueImposter: "No tienes pista. Esperando que el anfitrión revele tu palabra...",
    waitingWord: "Esperando palabra...",
    impostersRevealed: "¡Impostores Revelados!",
    gameOver: "El juego ha terminado",
    results: "Resultados",
    imposter: "impostor",
    crew: "BANDA",
    word: "Palabra",
    noClue: "(sin pista)",
    disconnectedAlert: "Desconectado del anfitrión",
    connectionError: "Error al conectar",
    peerError: "Error de conexión",
    codeCorrect: "¿El código de sala es correcto?"
  },
  en: {
    back: "← Back",
    joinRoom: "Join Room",
    enterName: "Enter your name",
    namePlaceholder: "Your name",
    connect: "Connect",
    connecting: "Connecting...",
    room: "Room",
    connectingToHost: "Connecting to host...",
    connectedAs: "Connected as",
    waitingForGame: "Waiting for game to start...",
    hostWillConfigure: "Host will configure the game and assign roles",
    yourRole: "Your Role",
    youAreImposter: "🔥 You're the fucking imposter",
    youAreNotImposter: "✅ You're NOT the fucking imposter",
    yourWord: "Your Word",
    secretWord: "Secret Word",
    noClueImposter: "No clue. Waiting for host to reveal your word...",
    waitingWord: "Waiting for word...",
    impostersRevealed: "Imposters Revealed!",
    gameOver: "Game is over",
    results: "Results",
    imposter: "imposter",
    crew: "CREW",
    word: "Word",
    noClue: "(no clue)",
    disconnectedAlert: "Disconnected from host",
    connectionError: "Connection error",
    peerError: "Connection error",
    codeCorrect: "Is the room code correct?"
  }
};

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function WiFiMode({ onBack, language = "es", mode, initialRoomCode }) {
  const [role, setRole] = useState(mode || "select"); // select | host | player
  const [roomCode, setRoomCode] = useState(initialRoomCode || "");
  const t = selectText[language];

  // If mode and roomCode are provided via route, skip selection
  useEffect(() => {
    if (mode && initialRoomCode) {
      setRole(mode);
      setRoomCode(initialRoomCode);
    }
  }, [mode, initialRoomCode]);

  if (role === "select") {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            {t.back}
          </button>
          <h1>{t.title}</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">{t.subtitle}</h2>
          
          <div className="wifi-role-selection">
            <div className="wifi-option-card" onClick={() => setRole("host")}>
              <div className="wifi-icon">👑</div>
              <h3>{t.host.title}</h3>
              <p className="muted">
                {t.host.description}
              </p>
            </div>

            <div className="wifi-option-card">
              <div className="wifi-icon">🎮</div>
              <h3>{t.player.title}</h3>
              <p className="muted">
                {t.player.description}
              </p>
              <input
                type="text"
                placeholder={t.player.placeholder}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: 8 }}
              />
              <button
                className="btn primary full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (roomCode.length >= 4) setRole("player");
                }}
                style={{ marginTop: 8 }}
              >
                {t.player.button}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "host") {
    return <HostView onBack={() => setRole("select")} language={language} />;
  }

  if (role === "player") {
    return <PlayerView roomCode={roomCode} onBack={() => setRole("select")} language={language} />;
  }
}

function HostView({ onBack, language }) {
  const [roomCode] = useState(randomRoomCode());
  const [connections, setConnections] = useState(new Map()); // peerId -> { conn, name }
  const [players, setPlayers] = useState([]); // { id, name }
  const [hostName, setHostName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [hostNameSet, setHostNameSet] = useState(false);
  const [gameState, setGameState] = useState("setup"); // setup | playing
  const [categoryId, setCategoryId] = useState("");
  const [currentCategoryId, setCurrentCategoryId] = useState(""); // Persist category for showImposterWord
  const [storedImposterWord, setStoredImposterWord] = useState(null); // Store imposter word from game start
  const [numImposters, setNumImposters] = useState(1);
  const [useImposterWord, setUseImposterWord] = useState(false);
  const [excludeAdult, setExcludeAdult] = useState(false);
  const [sendHintToImposter, setSendHintToImposter] = useState(false);
  const [hint, setHint] = useState("");
  const [roles, setRoles] = useState([]); // { playerId, name, isImposter, word }
  const [hostRole, setHostRole] = useState(null); // Host's own role
  const [gameRevealed, setGameRevealed] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState(new Map()); // peerId -> role data, persists across disconnects
  const t = playerText[language];

  // Initialize PeerJS host
  useEffect(() => {
    const hostId = `imposter-${roomCode}`;
    console.log(`[Host] Creating peer with ID: ${hostId}`);
    
    const newPeer = new Peer(hostId, {
      debug: 3, // Maximum debug logging
    });

    newPeer.on("open", (id) => {
      console.log(`[Host] Peer opened successfully with ID: ${id}`);
      console.log(`[Host] Players can join with room code: ${roomCode}`);
    });

    newPeer.on("connection", (conn) => {
      console.log(`[Host] New player connecting: ${conn.peer}`);
      
      conn.on("open", () => {
        console.log(`[Host] Connection established with: ${conn.peer}`);
        
        // Request player name
        conn.send({ type: "request-name" });
      });

      conn.on("data", (data) => {
        console.log(`[Host] Received from ${conn.peer}:`, data);
        
        if (data.type === "player-name") {
          const playerName = data.name;
          const playerId = conn.peer;
          const reconnectId = data.reconnectId; // Old playerId they're trying to reclaim
          const characterId = data.character; // Character selection
          
          console.log(`[Host] Player ${playerId} identified as "${playerName}" with character: ${characterId}`);
          if (reconnectId) {
            console.log(`[Host] Player attempting to reconnect with ID: ${reconnectId}`);
          }
          
          // Check if this is a reconnection attempt
          if (reconnectId && assignedRoles.has(reconnectId)) {
            const existingRole = assignedRoles.get(reconnectId);
            console.log(`[Host] Reconnection successful! Restoring role for ${playerName}`);
            
            // Update the role's playerId to the new peer ID
            const updatedRole = { ...existingRole, playerId };
            assignedRoles.set(playerId, updatedRole);
            assignedRoles.delete(reconnectId);
            setAssignedRoles(new Map(assignedRoles));
            
            // Update connections
            setConnections((prev) => {
              const newConns = new Map(prev);
              newConns.set(playerId, { conn, name: playerName, character: characterId });
              return newConns;
            });
            
            // Update players list
            setPlayers((prev) => {
              const filtered = prev.filter(p => p.id !== reconnectId);
              return [...filtered, { id: playerId, name: playerName, character: characterId }];
            });
            
            // Update roles list if in playing state
            if (gameState === "playing") {
              setRoles((prev) => 
                prev.map(r => r.playerId === reconnectId ? updatedRole : r)
              );
            }
            
            // Send acknowledgment with existing role
            conn.send({ 
              type: "connected", 
              playerId, 
              name: playerName,
              reconnected: true 
            });
            
            // If game is already playing, send their role back
            if (gameState === "playing") {
              conn.send({
                type: "role-assignment",
                playerId: playerId,
                isImposter: updatedRole.isImposter,
                word: updatedRole.word,
                useImposterWord,
              });
            }
            
            // If game was revealed, send that info too
            if (gameRevealed) {
              const allRoles = [hostRole, ...roles].map(r => ({
                name: r.name,
                isImposter: r.isImposter,
                word: (!r.isImposter || r.word) ? r.word : null
              }));
              
              conn.send({ 
                type: "reveal-imposters",
                allRoles
              });
            }
            
            return;
          }
          
          // Normal new player connection
          // Add to connections
          setConnections((prev) => {
            const newConns = new Map(prev);
            newConns.set(playerId, { conn, name: playerName, character: characterId });
            console.log(`[Host] Total connections: ${newConns.size}`);
            return newConns;
          });
          
          // Add to players list
          setPlayers((prev) => {
            if (prev.find(p => p.id === playerId)) {
              console.log(`[Host] Player ${playerId} already in list, skipping`);
              return prev;
            }
            const newPlayers = [...prev, { id: playerId, name: playerName, character: characterId }];
            console.log(`[Host] Total players: ${newPlayers.length}`);
            return newPlayers;
          });
          
          // Acknowledge with playerId so player can store it
          conn.send({ type: "connected", playerId, name: playerName });
          console.log(`[Host] Sent acknowledgment to ${playerName} with playerId: ${playerId}`);
        }
      });

      conn.on("close", () => {
        console.log(`[Host] Player disconnected: ${conn.peer}`);
        
        // Don't remove from players list or assignedRoles to allow reconnection
        // Only remove from active connections
        setConnections((prev) => {
          const newConns = new Map(prev);
          newConns.delete(conn.peer);
          console.log(`[Host] Removed connection ${conn.peer}, remaining: ${newConns.size}`);
          return newConns;
        });
        
        // Only remove from players list if game hasn't started (no roles assigned yet)
        if (gameState === "setup") {
          setPlayers((prev) => prev.filter(p => p.id !== conn.peer));
        }
      });

      conn.on("error", (err) => {
        console.error(`[Host] Connection error with ${conn.peer}:`, err);
      });
    });

    newPeer.on("error", (err) => {
      console.error("[Host] Peer error:", err);
      alert(`Error del anfitrión: ${err.type || err.message}`);
    });

    return () => {
      console.log("[Host] Destroying peer");
      newPeer.destroy();
    };
  }, [roomCode]);

  // Warn before leaving/reloading
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Si sales, se cerrará la sala y todos los jugadores serán desconectados.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const startGame = () => {
    if (players.length < 2) {
      alert(language === "es" ? "Se necesitan al menos 2 jugadores más (además del anfitrión)" : "Need at least 2 more players (besides the host)");
      return;
    }

    // Select category based on language
    const categoriesPool = language === "es" ? CATEGORIES : CATEGORIES_EN;
    const randomPairFn = language === "es" ? randomPairFromCategory : randomPairFromCategory_EN;
    
    const allowedCategories = categoriesPool.filter(c => {
      if (excludeAdult && c.type === "adult") return false;
      return true;
    });
    
    let category;
    if (categoryId) {
      category = categoriesPool.find(c => c.id === categoryId);
    } else {
      category = allowedCategories[Math.floor(Math.random() * allowedCategories.length)];
    }
    
    if (!category) {
      alert(language === "es" ? "Categoría inválida" : "Invalid category");
      return;
    }

    // Store category ID for later use (e.g., showImposterWord)
    setCurrentCategoryId(category.id);

    // Get word pair
    const { common, imposter } = randomPairFn(category);
    
    // Store common word for later reveal to imposters (they need to see the secret word)
    setStoredImposterWord(common);
    
    // Include host in player pool
    const allPlayers = [{ id: 'host', name: hostName }, ...players];
    
    // Assign roles
    const shuffledIds = shuffle(allPlayers.map(p => p.id));
    const actualNumImposters = Math.min(numImposters, allPlayers.length - 1);
    const imposterIds = new Set(shuffledIds.slice(0, actualNumImposters));
    
    const gameRoles = allPlayers.map((player) => {
      const isImposter = imposterIds.has(player.id);
      let word;
      
      if (isImposter) {
        word = useImposterWord ? imposter : null;
      } else {
        word = common;
      }
      
      return {
        playerId: player.id,
        name: player.name,
        isImposter,
        word,
      };
    });
    
    // Store roles in assignedRoles Map for reconnection
    const newAssignedRoles = new Map();
    gameRoles.forEach(role => {
      newAssignedRoles.set(role.playerId, {
        isImposter: role.isImposter,
        word: role.word,
        name: role.name
      });
    });
    setAssignedRoles(newAssignedRoles);
    
    // Separate host role
    const hostRoleData = gameRoles.find(r => r.playerId === 'host');
    const playerRoles = gameRoles.filter(r => r.playerId !== 'host');
    
    setHostRole(hostRoleData);
    setRoles(playerRoles);
    setGameState("playing");
    
    // Send roles to each remote player (including playerId for reconnection)
    playerRoles.forEach((role) => {
      const connData = connections.get(role.playerId);
      if (connData) {
        connData.conn.send({
          type: "role-assignment",
          playerId: role.playerId, // Include playerId for localStorage
          isImposter: role.isImposter,
          word: role.word,
          useImposterWord,
        });
      }
    });
  };

  const revealImposters = () => {
    setGameRevealed(true);
    
    // Include host in the revealed roles, show the common word for everyone in results
    const allRoles = [hostRole, ...roles].map(r => ({
      name: r.name,
      isImposter: r.isImposter,
      word: r.isImposter ? (r.word || roles.find(role => !role.isImposter)?.word) : r.word // Show crew word for imposters
    }));
    
    connections.forEach((connData) => {
      connData.conn.send({ 
        type: "reveal-imposters",
        allRoles
      });
    });
  };

  const showImposterWord = () => {
    if (!storedImposterWord) return;
    
    // Use the stored common word (the secret word that crew has)
    const secretWord = storedImposterWord;
    
    // Update host if they're the imposter - ALWAYS update, replacing their hint word
    if (hostRole && hostRole.isImposter) {
      setHostRole({
        ...hostRole,
        word: secretWord
      });
    }
    
    // Update roles state for remote imposters - ALWAYS update
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.isImposter ? { ...role, word: secretWord } : role
      )
    );
    
    // Send to remote players who are imposters
    roles.forEach((role) => {
      if (role.isImposter) {
        const connData = connections.get(role.playerId);
        if (connData && connData.conn.open) {
          connData.conn.send({
            type: "show-imposter-word",
            word: secretWord,
          });
        }
      }
    });
    
    setUseImposterWord(true);
  };

  const resetForNewGame = () => {
    // Reset all game state
    setGameState("setup");
    setGameRevealed(false);
    setRoles([]);
    setHostRole(null);
    setAssignedRoles(new Map());
    setStoredImposterWord(null);
    setCurrentCategoryId("");
    
    // Reset configuration to defaults
    setCategoryId("");
    setNumImposters(1);
    setExcludeAdult(false);
    // Keep useImposterWord as-is - it's a user preference, not game state
    // Keep sendHintToImposter as-is - it's a user preference, not game state
    // Keep hint as-is - it's a user preference, not game state
    
    // Notify all players
    connections.forEach((connData) => {
      connData.conn.send({ type: "game-reset" });
    });
  };

  // Host name input first
  if (!hostNameSet) {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            ← Volver
          </button>
          <h1>Modo WiFi - Anfitrión</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Ingresa tu nombre</h2>
          <p className="muted">Tú también jugarás y recibirás un rol</p>
          <input
            type="text"
            placeholder="Tu nombre"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && hostName.trim() && selectedCharacter) {
                setHostNameSet(true);
              }
            }}
            autoFocus
            style={{ marginTop: 8 }}
          />
          
          <h2 className="section-title" style={{ marginTop: 24 }}>
            {language === "es" ? "Elige tu personaje" : "Choose your character"}
          </h2>
          <div className="character-grid">
            {CHARACTERS.map((char) => (
              <div
                key={char.id}
                className={`character-card ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                onClick={() => setSelectedCharacter(char)}
                style={{
                  borderColor: selectedCharacter?.id === char.id ? char.colors.primary : undefined,
                  boxShadow: selectedCharacter?.id === char.id ? `0 0 20px ${char.colors.primary}` : undefined,
                }}
              >
                <div 
                  style={{
                    background: char.colors.gradient,
                    position: 'absolute',
                    inset: 0,
                    opacity: selectedCharacter?.id === char.id ? 0.15 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}
                />
                <div className="emoji" style={{ position: 'relative', zIndex: 1 }}>{char.emoji}</div>
                <div className="name" style={{ position: 'relative', zIndex: 1 }}>{char.name}</div>
              </div>
            ))}
          </div>
          
          <button
            className="btn primary full"
            style={{ marginTop: 16 }}
            onClick={() => {
              if (hostName.trim() && selectedCharacter) {
                setHostNameSet(true);
              }
            }}
            disabled={!hostName.trim() || !selectedCharacter}
          >
            Crear Sala
          </button>
          {!selectedCharacter && hostName.trim() && (
            <p className="center muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
              {language === "es" ? "Selecciona un personaje para continuar" : "Select a character to continue"}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wifi-mode">
      <div className="app-header">
        <button className="btn ghost small" onClick={onBack}>
          ← Volver
        </button>
        <h1>Anfitrión: {hostName} - Sala {roomCode}</h1>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title center">Código de Sala</h2>
        <div className="room-code-display">
          <h1 style={{ fontSize: "3rem", margin: "16px 0", textAlign: "center", letterSpacing: "0.2em" }}>
            {roomCode}
          </h1>
        </div>
        <p className="center muted">
          Los jugadores deben ingresar este código para unirse
        </p>

        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">Jugadores conectados ({players.length + 1})</h3>
          <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, marginTop: 8, overflowX: "auto", scrollbarWidth: "thin" }}>
            <span 
              className="player-avatar"
              style={{
                borderColor: selectedCharacter?.colors.primary || "var(--accent)",
                background: selectedCharacter?.colors.gradient || "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                whiteSpace: "nowrap",
              }}
            >
              {selectedCharacter && <span className="emoji">{selectedCharacter.emoji}</span>}
              {hostName} (Tú)
            </span>
            {players.map((player) => {
              const character = player.character ? getCharacterById(player.character) : null;
              return (
                <span 
                  key={player.id} 
                  className="player-avatar"
                  style={{
                    borderColor: character?.colors.primary || "var(--accent)",
                    background: character?.colors.gradient || "var(--card)",
                    color: character ? "white" : "var(--text)",
                  }}
                >
                  {character && <span className="emoji">{character.emoji}</span>}
                  {player.name}
                </span>
              );
            })}
          </div>
          {players.length === 0 && (
            <p className="muted center" style={{ marginTop: 8 }}>Esperando más jugadores...</p>
          )}
        </div>

        {gameState === "setup" ? (
          <>
            <div style={{ marginTop: 16 }}>
              <label>
                {language === "es" ? "Categoría" : "Category"}
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">{language === "es" ? "🎲 Aleatoria" : "🎲 Random"}</option>
                  {(language === "es" ? CATEGORIES : CATEGORIES_EN).filter(c => {
                    if (excludeAdult && c.type === "adult") return false;
                    return true;
                  }).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginTop: 16 }}>
              <label>
                {language === "es" ? "Número de impostores" : "Number of imposters"}
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, players.length)}
                  value={numImposters}
                  onChange={(e) => setNumImposters(parseInt(e.target.value) || 1)}
                />
              </label>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sendHintToImposter}
                  onChange={(e) => setSendHintToImposter(e.target.checked)}
                />
                {language === "es" ? "Enviar pista extra al impostor" : "Send extra hint to imposter"}
              </label>
            </div>

            {sendHintToImposter && (
              <div style={{ marginTop: 8 }}>
                <label>
                  {language === "es" ? "Pista personalizada" : "Custom hint"}
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder={language === "es" ? "Ej: Es algo que comes" : "E.g.: It's something you eat"}
                  />
                </label>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useImposterWord}
                  onChange={(e) => setUseImposterWord(e.target.checked)}
                />
                {language === "es" ? "Dar pista al impostor (palabra diferente)" : "Give hint to imposter (different word)"}
              </label>
            </div>

            <div style={{ marginTop: 8 }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={excludeAdult}
                  onChange={(e) => setExcludeAdult(e.target.checked)}
                />
                {language === "es" ? "Excluir contenido adulto" : "Exclude adult content"}
              </label>
            </div>

            <button
              className="btn primary full"
              style={{ marginTop: 24 }}
              onClick={startGame}
              disabled={players.length < 2}
            >
              {language === "es" ? `Iniciar Juego (${players.length + 1} jugadores)` : `Start Game (${players.length + 1} players)`}
            </button>
          </>
        ) : (
          <div style={{ marginTop: 24 }}>
            {/* Host's own role */}
            {hostRole && (
              <div style={{ marginBottom: 24 }}>
                <div className="player-role-display">
                  {selectedCharacter && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: "4rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
                        {selectedCharacter.emoji}
                      </div>
                    </div>
                  )}
                  
                  <h2 className="section-title center">Tu Rol</h2>
                  <div className="role-reveal-box" style={{
                    padding: 24,
                    borderRadius: "var(--radius-lg)",
                    background: hostRole.isImposter 
                      ? "linear-gradient(135deg, #a855f7, #c084fc)" 
                      : (selectedCharacter?.colors.gradient || "linear-gradient(135deg, #10b981, #059669)"),
                    color: "white",
                    textAlign: "center",
                    boxShadow: selectedCharacter 
                      ? `0 8px 32px ${hostRole.isImposter ? '#a855f7' : selectedCharacter.colors.primary}40` 
                      : undefined,
                  }}>
                    <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>
                      {hostRole.isImposter
                        ? "🔥 Eres el puto impostor cabrón/a"
                        : "✅ No eres el puto impostor cabrón/a"}
                    </h1>
                  </div>

                  {hostRole.word ? (
                    <>
                      <h2 className="section-title center" style={{ marginTop: 24 }}>
                        Tu Palabra
                      </h2>
                      <div style={{
                        padding: 32,
                        borderRadius: "var(--radius-lg)",
                        background: "var(--card)",
                        border: `3px solid ${selectedCharacter?.colors.primary || "var(--accent)"}`,
                        textAlign: "center",
                        boxShadow: selectedCharacter ? `0 4px 20px ${selectedCharacter.colors.primary}40` : undefined,
                      }}>
                        <h1 style={{ 
                          fontSize: "2.5rem", 
                          color: selectedCharacter?.colors.primary || "var(--accent)", 
                          margin: 0,
                          textShadow: selectedCharacter ? `0 0 20px ${selectedCharacter.colors.primary}60` : undefined,
                        }}>
                          {hostRole.word}
                        </h1>
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: 24, padding: 16, background: "var(--bg)", borderRadius: "var(--radius-md)" }}>
                      <p className="center muted">
                        {hostRole.isImposter
                          ? "Sin pista - esperando revelación de palabra"
                          : "Esperando palabra..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <h3 className="section-title">Controles de Revelación</h3>
            {!gameRevealed ? (
              <>
                <button className="btn full" style={{ marginBottom: 8 }} onClick={revealImposters}>
                  Revelar Impostores a Todos
                </button>
                {!useImposterWord && (
                  <button className="btn ghost full" onClick={showImposterWord}>
                    Mostrar Palabra al Impostor
                  </button>
                )}
              </>
            ) : (
              <button className="btn primary full" onClick={resetForNewGame}>
                🎮 Nueva Ronda
              </button>
            )}
            
            {/* Only show role list after game is revealed */}
            {gameRevealed && (
              <div style={{ marginTop: 16 }}>
                <h4 className="section-title" style={{ 
                  textTransform: "uppercase",
                  fontSize: "1rem",
                  letterSpacing: "0.05em",
                  marginBottom: 16 
                }}>Resultados</h4>
                <div style={{ 
                  padding: 20,
                  marginBottom: 12,
                  borderRadius: "var(--radius-lg)",
                  background: hostRole.isImposter ? "#ef4444" : "#8b5687",
                  color: "white",
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: 12 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {selectedCharacter && <span style={{ fontSize: "1.5rem" }}>{selectedCharacter.emoji}</span>}
                      <strong style={{ fontSize: "1.1rem" }}>{hostRole.name} (Tú)</strong>
                    </div>
                    <span 
                      className={hostRole.isImposter ? "pill-danger" : "pill"} 
                      style={{ 
                        background: "rgba(255,255,255,0.3)",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "999px",
                        padding: "6px 14px"
                      }}
                    >
                      {hostRole.isImposter ? "🔥 Impostor" : "✅ BANDA"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                    Palabra: {hostRole.word || "(sin pista)"}
                  </div>
                </div>
                {roles.map((role) => {
                  const player = players.find(p => p.id === role.playerId);
                  const character = player?.character ? getCharacterById(player.character) : null;
                  return (
                    <div key={role.playerId} style={{ 
                      padding: 20,
                      marginBottom: 12,
                      borderRadius: "var(--radius-lg)",
                      background: role.isImposter ? "#ef4444" : "#8b5687",
                      color: "white",
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: 12 
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {character && <span style={{ fontSize: "1.5rem" }}>{character.emoji}</span>}
                          <strong style={{ fontSize: "1.1rem" }}>{role.name}</strong>
                        </div>
                        <span 
                          className={role.isImposter ? "pill-danger" : "pill"} 
                          style={{ 
                            background: "rgba(255,255,255,0.3)",
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
                        Palabra: {role.word || "(sin pista)"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerView({ roomCode, onBack, language }) {
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [gameData, setGameData] = useState(null); // { isImposter, word, useImposterWord }
  const [revealed, setRevealed] = useState(false);
  const [revealedRoles, setRevealedRoles] = useState(null); // All roles when game ends
  const [playerId, setPlayerId] = useState(null); // Store for reconnection
  const t = playerText[language];

  // Restore player info on mount (for reconnection after reload)
  useEffect(() => {
    const storedName = sessionStorage.getItem(`playerName_${roomCode}`);
    const storedId = sessionStorage.getItem(`playerId_${roomCode}`);
    const storedChar = sessionStorage.getItem(`playerChar_${roomCode}`);
    
    if (storedName && storedId) {
      console.log(`[Player] Restoring session: ${storedName} (${storedId})`);
      setPlayerName(storedName);
      setPlayerId(storedId);
      if (storedChar) {
        setSelectedCharacter(getCharacterById(storedChar));
      }
      setNameSubmitted(true);
    }
  }, [roomCode]);

  // Warn before leaving/reloading
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (connected || nameSubmitted) {
        e.preventDefault();
        e.returnValue = 'Si sales, perderás tu conexión con la sala.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [connected, nameSubmitted]);

  // Initialize player peer
  useEffect(() => {
    if (!nameSubmitted) return;

    console.log(`[Player] Creating peer to connect to room: ${roomCode}`);
    const newPeer = new Peer({
      debug: 3, // Maximum debug logging
    });
    
    let conn = null;

    newPeer.on("open", (myId) => {
      console.log(`[Player] My peer ID: ${myId}`);
      
      // Connect to host
      const hostId = `imposter-${roomCode}`;
      console.log(`[Player] Attempting to connect to host: ${hostId}`);
      conn = newPeer.connect(hostId, {
        reliable: true,
      });
      
      conn.on("open", () => {
        console.log("[Player] Connection established with host");
        
        // Check for reconnection ID in sessionStorage
        const reconnectId = sessionStorage.getItem(`playerId_${roomCode}`);
        
        if (reconnectId) {
          console.log(`[Player] Attempting reconnection with ID: ${reconnectId}`);
          conn.send({ 
            type: "player-name", 
            name: playerName,
            character: selectedCharacter?.id,
            reconnectId
          });
        } else {
          // Fresh connection
          console.log(`[Player] Fresh connection, sending name: ${playerName}`);
          conn.send({ 
            type: "player-name", 
            name: playerName,
            character: selectedCharacter?.id
          });
        }
      });
      
      conn.on("data", (data) => {
        console.log("[Player] Received from host:", data);
        
        if (data.type === "connected") {
          console.log("[Player] Connection acknowledged by host");
          setConnected(true);
          
          // If host sends playerId, store it for reconnection
          if (data.playerId) {
            setPlayerId(data.playerId);
            sessionStorage.setItem(`playerId_${roomCode}`, data.playerId);
            sessionStorage.setItem(`playerName_${roomCode}`, playerName);
            if (selectedCharacter) {
              sessionStorage.setItem(`playerChar_${roomCode}`, selectedCharacter.id);
            }
            console.log(`[Player] Stored playerId: ${data.playerId}`);
          }
        }
        
        if (data.type === "role-assignment") {
          console.log("[Player] Role assigned:", data);
          
          // Store playerId if sent with role assignment
          if (data.playerId) {
            setPlayerId(data.playerId);
            sessionStorage.setItem(`playerId_${roomCode}`, data.playerId);
            sessionStorage.setItem(`playerName_${roomCode}`, playerName);
            if (selectedCharacter) {
              sessionStorage.setItem(`playerChar_${roomCode}`, selectedCharacter.id);
            }
            console.log(`[Player] Stored playerId from role assignment: ${data.playerId}`);
          }
          
          setGameData({
            isImposter: data.isImposter,
            word: data.word,
            useImposterWord: data.useImposterWord,
          });
        }
        
        if (data.type === "reveal-imposters") {
          console.log("[Player] Imposters revealed!");
          setRevealed(true);
          if (data.allRoles) {
            setRevealedRoles(data.allRoles);
          }
        }
        
        if (data.type === "show-imposter-word") {
          console.log("[Player] Imposter word shown:", data.word);
          setGameData((prev) => ({
            ...prev,
            word: data.word,
          }));
        }
        
        if (data.type === "game-reset") {
          console.log("[Player] Game reset by host");
          setGameData(null);
          setRevealed(false);
          setRevealedRoles(null);
          sessionStorage.removeItem(`playerId_${roomCode}`);
          sessionStorage.removeItem(`playerName_${roomCode}`);
          sessionStorage.removeItem(`playerChar_${roomCode}`);
        }
      });
      
      conn.on("close", () => {
        console.log("[Player] Disconnected from host");
        setConnected(false);
        alert(t.disconnectedAlert);
      });
      
      conn.on("error", (err) => {
        console.error("[Player] Connection error:", err);
        alert(`${t.connectionError}: ${err.type || err.message}`);
      });
    });

    newPeer.on("error", (err) => {
      console.error("[Player] Peer error:", err);
      alert(`${t.peerError}: ${err.type || err.message}\n\n${t.codeCorrect}`);
    });

    return () => {
      if (conn) conn.close();
      newPeer.destroy();
    };
  }, [nameSubmitted, roomCode, playerName, t]);

  if (!nameSubmitted) {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            {t.back}
          </button>
          <h1>{t.joinRoom} {roomCode}</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">{t.enterName}</h2>
          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && playerName.trim() && selectedCharacter) {
                setNameSubmitted(true);
              }
            }}
            autoFocus
            style={{ marginTop: 8 }}
          />
          
          <h2 className="section-title" style={{ marginTop: 24 }}>
            {language === "es" ? "Elige tu personaje" : "Choose your character"}
          </h2>
          <div className="character-grid">
            {CHARACTERS.map((char) => (
              <div
                key={char.id}
                className={`character-card ${selectedCharacter?.id === char.id ? 'selected' : ''}`}
                onClick={() => setSelectedCharacter(char)}
                style={{
                  borderColor: selectedCharacter?.id === char.id ? char.colors.primary : undefined,
                  boxShadow: selectedCharacter?.id === char.id ? `0 0 20px ${char.colors.primary}` : undefined,
                }}
              >
                <div 
                  style={{
                    background: char.colors.gradient,
                    position: 'absolute',
                    inset: 0,
                    opacity: selectedCharacter?.id === char.id ? 0.15 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}
                />
                <div className="emoji" style={{ position: 'relative', zIndex: 1 }}>{char.emoji}</div>
                <div className="name" style={{ position: 'relative', zIndex: 1 }}>{char.name}</div>
              </div>
            ))}
          </div>
          
          <button
            className="btn primary full"
            style={{ marginTop: 16 }}
            onClick={() => {
              if (playerName.trim() && selectedCharacter) {
                setNameSubmitted(true);
              }
            }}
            disabled={!playerName.trim() || !selectedCharacter}
          >
            {t.connect}
          </button>
          {!selectedCharacter && playerName.trim() && (
            <p className="center muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
              {language === "es" ? "Selecciona un personaje para continuar" : "Select a character to continue"}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            {t.back}
          </button>
          <h1>{t.connecting}</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title center">{t.room} {roomCode}</h2>
          <p className="center muted">{t.connectingToHost}</p>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <h1>{t.room} {roomCode}</h1>
          <p className="muted">{t.connectedAs} {playerName}</p>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title center">{t.waitingForGame}</h2>
          <p className="center muted" style={{ marginTop: 16 }}>
            {t.hostWillConfigure}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wifi-mode">
      <div className="app-header">
        <h1>{t.room} {roomCode}</h1>
        <p className="muted">{t.connectedAs} {playerName}</p>
      </div>

      <div className="card player-card-view" style={{ marginTop: 16 }}>
        <div className="player-role-display">
          {selectedCharacter && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: "4rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
                {selectedCharacter.emoji}
              </div>
            </div>
          )}
          
          <h2 className="section-title center">{t.yourRole}</h2>
          <div className="role-reveal-box" style={{
            padding: 24,
            borderRadius: "var(--radius-lg)",
            background: gameData.isImposter 
              ? "linear-gradient(135deg, #a855f7, #c084fc)" 
              : (selectedCharacter?.colors.gradient || "linear-gradient(135deg, #10b981, #059669)"),
            color: "white",
            textAlign: "center",
            boxShadow: selectedCharacter 
              ? `0 8px 32px ${gameData.isImposter ? '#a855f7' : selectedCharacter.colors.primary}40` 
              : undefined,
          }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>
              {gameData.isImposter
                ? t.youAreImposter
                : t.youAreNotImposter}
            </h1>
          </div>

          {gameData.word ? (
            <>
              <h2 className="section-title center" style={{ marginTop: 24 }}>
                {gameData.isImposter && !gameData.useImposterWord ? t.yourWord : t.secretWord}
              </h2>
              <div style={{
                padding: 32,
                borderRadius: "var(--radius-lg)",
                background: "var(--card)",
                border: `3px solid ${selectedCharacter?.colors.primary || "var(--accent)"}`,
                textAlign: "center",
                boxShadow: selectedCharacter ? `0 4px 20px ${selectedCharacter.colors.primary}40` : undefined,
              }}>
                <h1 style={{ 
                  fontSize: "2.5rem", 
                  color: selectedCharacter?.colors.primary || "var(--accent)", 
                  margin: 0,
                  textShadow: selectedCharacter ? `0 0 20px ${selectedCharacter.colors.primary}60` : undefined,
                }}>
                  {gameData.word}
                </h1>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 24, padding: 16, background: "var(--bg)", borderRadius: "var(--radius-md)" }}>
              <p className="center muted">
                {gameData.isImposter
                  ? t.noClueImposter
                  : t.waitingWord}
              </p>
            </div>
          )}
        </div>

        {revealed && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: "var(--card)",
            border: "2px solid var(--danger)",
            borderRadius: "var(--radius-md)",
          }}>
            <h2 style={{ textAlign: "center", color: "var(--danger)", marginTop: 0 }}>{t.impostersRevealed}</h2>
            <p className="center muted" style={{ marginBottom: 16 }}>{t.gameOver}</p>
            
            {revealedRoles && (
              <div>
                <h3 className="section-title" style={{ 
                  textTransform: "uppercase",
                  fontSize: "1rem",
                  letterSpacing: "0.05em",
                  marginBottom: 16 
                }}>{t.results}</h3>
                {revealedRoles.map((role, idx) => (
                  <div key={idx} style={{ 
                    padding: 20,
                    marginBottom: 12,
                    borderRadius: "var(--radius-lg)",
                    background: role.isImposter ? "#ef4444" : "#8b5687",
                    color: "white",
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: 12 
                    }}>
                      <strong style={{ fontSize: "1.1rem" }}>{role.name}</strong>
                      <span 
                        className={role.isImposter ? "pill-danger" : "pill"} 
                        style={{ 
                          background: "rgba(255,255,255,0.3)",
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
                      {t.word}: {role.word || t.noClue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
