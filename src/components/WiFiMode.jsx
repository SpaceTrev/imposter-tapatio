import React, { useState, useEffect } from "react";
import { Peer } from "peerjs";
import {
  CATEGORIES,
  randomPairFromCategory,
} from "../data/categories";

const randomRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function WiFiMode({ onBack }) {
  const [role, setRole] = useState("select"); // select | host | player
  const [roomCode, setRoomCode] = useState("");

  if (role === "select") {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            ← Volver
          </button>
          <h1>Modo WiFi Local</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Elige tu rol</h2>
          
          <div className="wifi-role-selection">
            <div className="wifi-option-card" onClick={() => setRole("host")}>
              <div className="wifi-icon">👑</div>
              <h3>Ser Anfitrión</h3>
              <p className="muted">
                Crea la sala, configura el juego y controla las revelaciones
              </p>
            </div>

            <div className="wifi-option-card">
              <div className="wifi-icon">🎮</div>
              <h3>Unirse como Jugador</h3>
              <p className="muted">
                Entra con un código y juega en tu celular
              </p>
              <input
                type="text"
                placeholder="Código de sala (ej: ABC123)"
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
                Unirse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "host") {
    return <HostView onBack={() => setRole("select")} />;
  }

  if (role === "player") {
    return <PlayerView roomCode={roomCode} onBack={() => setRole("select")} />;
  }
}

function HostView({ onBack }) {
  const [roomCode] = useState(randomRoomCode());
  const [connections, setConnections] = useState(new Map()); // peerId -> { conn, name }
  const [players, setPlayers] = useState([]); // { id, name }
  const [hostName, setHostName] = useState("");
  const [hostNameSet, setHostNameSet] = useState(false);
  const [gameState, setGameState] = useState("setup"); // setup | playing
  const [categoryId, setCategoryId] = useState("");
  const [numImposters, setNumImposters] = useState(1);
  const [useImposterWord, setUseImposterWord] = useState(false);
  const [excludeAdult, setExcludeAdult] = useState(false);
  const [roles, setRoles] = useState([]); // { playerId, name, isImposter, word }
  const [hostRole, setHostRole] = useState(null); // Host's own role
  const [gameRevealed, setGameRevealed] = useState(false);

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
          
          console.log(`[Host] Player ${playerId} identified as "${playerName}"`);
          
          // Add to connections
          setConnections((prev) => {
            const newConns = new Map(prev);
            newConns.set(playerId, { conn, name: playerName });
            console.log(`[Host] Total connections: ${newConns.size}`);
            return newConns;
          });
          
          // Add to players list
          setPlayers((prev) => {
            if (prev.find(p => p.id === playerId)) {
              console.log(`[Host] Player ${playerId} already in list, skipping`);
              return prev;
            }
            const newPlayers = [...prev, { id: playerId, name: playerName }];
            console.log(`[Host] Total players: ${newPlayers.length}`);
            return newPlayers;
          });
          
          // Acknowledge
          conn.send({ type: "connected", playerId, name: playerName });
          console.log(`[Host] Sent acknowledgment to ${playerName}`);
        }
      });

      conn.on("close", () => {
        console.log(`[Host] Player disconnected: ${conn.peer}`);
        setConnections((prev) => {
          const newConns = new Map(prev);
          newConns.delete(conn.peer);
          return newConns;
        });
        setPlayers((prev) => prev.filter(p => p.id !== conn.peer));
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

  const startGame = () => {
    if (players.length < 2) {
      alert("Se necesitan al menos 2 jugadores más (además del anfitrión)");
      return;
    }

    // Select category
    const allowedCategories = CATEGORIES.filter(c => {
      if (excludeAdult && c.type === "adult") return false;
      return true;
    });
    
    let category;
    if (categoryId) {
      category = CATEGORIES.find(c => c.id === categoryId);
    } else {
      category = allowedCategories[Math.floor(Math.random() * allowedCategories.length)];
    }
    
    if (!category) {
      alert("Categoría inválida");
      return;
    }

    // Get word pair
    const { common, imposter } = randomPairFromCategory(category);
    
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
    
    // Separate host role
    const hostRoleData = gameRoles.find(r => r.playerId === 'host');
    const playerRoles = gameRoles.filter(r => r.playerId !== 'host');
    
    setHostRole(hostRoleData);
    setRoles(playerRoles);
    setGameState("playing");
    
    // Send roles to each remote player
    playerRoles.forEach((role) => {
      const connData = connections.get(role.playerId);
      if (connData) {
        connData.conn.send({
          type: "role-assignment",
          isImposter: role.isImposter,
          word: role.word,
          useImposterWord,
        });
      }
    });
  };

  const revealImposters = () => {
    setGameRevealed(true);
    
    // Include host in the revealed roles
    const allRoles = [hostRole, ...roles];
    
    connections.forEach((connData) => {
      connData.conn.send({ 
        type: "reveal-imposters",
        allRoles: allRoles.map(r => ({
          name: r.name,
          isImposter: r.isImposter,
          word: r.word
        }))
      });
    });
  };

  const showImposterWord = () => {
    // Find the imposter word from all roles (including host)
    const allRoles = [hostRole, ...roles];
    let imposterWord = allRoles.find(r => r.isImposter)?.word;
    
    // If no word found, get it from the category
    if (!imposterWord) {
      const category = CATEGORIES.find(c => c.id === categoryId);
      if (category && category.pairs.length > 0) {
        imposterWord = randomPairFromCategory(category).imposter;
      }
    }
    
    // Update host if they're the imposter
    if (hostRole && hostRole.isImposter && !hostRole.word) {
      setHostRole({
        ...hostRole,
        word: imposterWord
      });
    }
    
    // Send to remote players who are imposters
    roles.forEach((role) => {
      if (role.isImposter) {
        const connData = connections.get(role.playerId);
        if (connData) {
          connData.conn.send({
            type: "show-imposter-word",
            word: imposterWord,
          });
        }
      }
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
              if (e.key === "Enter" && hostName.trim()) {
                setHostNameSet(true);
              }
            }}
            autoFocus
            style={{ marginTop: 8 }}
          />
          <button
            className="btn primary full"
            style={{ marginTop: 16 }}
            onClick={() => {
              if (hostName.trim()) {
                setHostNameSet(true);
              }
            }}
            disabled={!hostName.trim()}
          >
            Crear Sala
          </button>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <span className="pill" style={{ background: "var(--accent)", color: "white" }}>
              👑 {hostName} (Tú)
            </span>
            {players.map((player) => (
              <span key={player.id} className="pill">
                {player.name}
              </span>
            ))}
          </div>
          {players.length === 0 && (
            <p className="muted center" style={{ marginTop: 8 }}>Esperando más jugadores...</p>
          )}
        </div>

        {gameState === "setup" ? (
          <>
            <div style={{ marginTop: 24 }}>
              <label>
                Categoría
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">🎲 Aleatoria</option>
                  {CATEGORIES.filter(c => {
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
                Número de impostores
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
                  checked={useImposterWord}
                  onChange={(e) => setUseImposterWord(e.target.checked)}
                />
                Dar pista al impostor (palabra diferente)
              </label>
            </div>

            <div style={{ marginTop: 8 }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={excludeAdult}
                  onChange={(e) => setExcludeAdult(e.target.checked)}
                />
                Excluir contenido adulto
              </label>
            </div>

            <button
              className="btn primary full"
              style={{ marginTop: 24 }}
              onClick={startGame}
              disabled={players.length < 2}
            >
              Iniciar Juego ({players.length + 1} jugadores)
            </button>
          </>
        ) : (
          <div style={{ marginTop: 24 }}>
            {/* Host's own role */}
            {hostRole && (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  padding: 24,
                  borderRadius: "var(--radius-lg)",
                  background: hostRole.isImposter ? "var(--danger)" : "var(--accent)",
                  color: "white",
                  textAlign: "center",
                }}>
                  <h2 style={{ margin: 0, marginBottom: 8 }}>Tu Rol</h2>
                  <h1 style={{ fontSize: "1.3rem", marginBottom: 16 }}>
                    {hostRole.isImposter
                      ? "🔥 Eres el puto impostor cabrón/a"
                      : "✅ No eres el puto impostor cabrón/a"}
                  </h1>
                  {hostRole.word && (
                    <div style={{
                      padding: 16,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(255,255,255,0.2)",
                      marginTop: 12,
                    }}>
                      <div style={{ fontSize: "0.9rem", marginBottom: 4 }}>Tu Palabra</div>
                      <h2 style={{ margin: 0, fontSize: "2rem" }}>{hostRole.word}</h2>
                    </div>
                  )}
                  {hostRole.isImposter && !hostRole.word && (
                    <p style={{ margin: "12px 0 0 0", opacity: 0.9 }}>
                      Sin pista - esperando revelación de palabra
                    </p>
                  )}
                </div>
              </div>
            )}

            <h3 className="section-title">Controles de Revelación</h3>
            <button className="btn full" style={{ marginBottom: 8 }} onClick={revealImposters}>
              Revelar Impostores a Todos
            </button>
            {!useImposterWord && (
              <button className="btn ghost full" onClick={showImposterWord}>
                Mostrar Palabra al Impostor
              </button>
            )}
            
            {/* Only show role list after game is revealed */}
            {gameRevealed && (
              <div style={{ marginTop: 16 }}>
                <h4 className="section-title">Roles Revelados</h4>
                <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <strong>👑 {hostRole.name} (Tú)</strong>
                  {hostRole.isImposter ? (
                    <span className="pill-danger" style={{ marginLeft: 8 }}>Impostor</span>
                  ) : (
                    <span className="pill" style={{ marginLeft: 8 }}>Tripulación</span>
                  )}
                  <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
                    Palabra: {hostRole.word || "(sin pista)"}
                  </div>
                </div>
                {roles.map((role) => (
                  <div key={role.playerId} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <strong>{role.name}</strong>
                    {role.isImposter ? (
                      <span className="pill-danger" style={{ marginLeft: 8 }}>Impostor</span>
                    ) : (
                      <span className="pill" style={{ marginLeft: 8 }}>Tripulación</span>
                    )}
                    <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
                      Palabra: {role.word || "(sin pista)"}
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

function PlayerView({ roomCode, onBack }) {
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [gameData, setGameData] = useState(null); // { isImposter, word, useImposterWord }
  const [revealed, setRevealed] = useState(false);
  const [revealedRoles, setRevealedRoles] = useState(null); // All roles when game ends

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
        
        // Send player name
        console.log(`[Player] Sending name: ${playerName}`);
        conn.send({ type: "player-name", name: playerName });
      });
      
      conn.on("data", (data) => {
        console.log("[Player] Received from host:", data);
        
        if (data.type === "connected") {
          console.log("[Player] Connection acknowledged by host");
          setConnected(true);
        }
        
        if (data.type === "role-assignment") {
          console.log("[Player] Role assigned:", data);
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
      });
      
      conn.on("close", () => {
        console.log("[Player] Disconnected from host");
        setConnected(false);
        alert("Desconectado del anfitrión");
      });
      
      conn.on("error", (err) => {
        console.error("[Player] Connection error:", err);
        alert(`Error al conectar: ${err.type || err.message}`);
      });
    });

    newPeer.on("error", (err) => {
      console.error("[Player] Peer error:", err);
      alert(`Error de conexión: ${err.type || err.message}\n\n¿El código de sala es correcto?`);
    });

    return () => {
      if (conn) conn.close();
      newPeer.destroy();
    };
  }, [nameSubmitted, roomCode, playerName]);

  if (!nameSubmitted) {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            ← Volver
          </button>
          <h1>Unirse a Sala {roomCode}</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Ingresa tu nombre</h2>
          <input
            type="text"
            placeholder="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && playerName.trim()) {
                setNameSubmitted(true);
              }
            }}
            autoFocus
            style={{ marginTop: 8 }}
          />
          <button
            className="btn primary full"
            style={{ marginTop: 16 }}
            onClick={() => {
              if (playerName.trim()) {
                setNameSubmitted(true);
              }
            }}
            disabled={!playerName.trim()}
          >
            Conectar
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="wifi-mode">
        <div className="app-header">
          <button className="btn ghost small" onClick={onBack}>
            ← Volver
          </button>
          <h1>Conectando...</h1>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title center">Sala {roomCode}</h2>
          <p className="center muted">Conectando al anfitrión...</p>
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
          <h1>Sala {roomCode}</h1>
          <p className="muted">Conectado como {playerName}</p>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title center">Esperando que inicie el juego...</h2>
          <p className="center muted" style={{ marginTop: 16 }}>
            El anfitrión configurará el juego y asignará los roles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wifi-mode">
      <div className="app-header">
        <h1>Sala {roomCode}</h1>
        <p className="muted">Conectado como {playerName}</p>
      </div>

      <div className="card player-card-view" style={{ marginTop: 16 }}>
        <div className="player-role-display">
          <h2 className="section-title center">Tu Rol</h2>
          <div className="role-reveal-box" style={{
            padding: 24,
            borderRadius: "var(--radius-lg)",
            background: gameData.isImposter ? "var(--danger)" : "var(--accent)",
            color: "white",
            textAlign: "center",
          }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>
              {gameData.isImposter
                ? "🔥 Eres el puto impostor cabrón/a"
                : "✅ No eres el puto impostor cabrón/a"}
            </h1>
          </div>

          {gameData.word ? (
            <>
              <h2 className="section-title center" style={{ marginTop: 24 }}>
                {gameData.isImposter && !gameData.useImposterWord ? "Tu Palabra" : "Palabra Secreta"}
              </h2>
              <div style={{
                padding: 32,
                borderRadius: "var(--radius-lg)",
                background: "var(--card)",
                border: "2px solid var(--accent)",
                textAlign: "center",
              }}>
                <h1 style={{ fontSize: "2.5rem", color: "var(--accent)", margin: 0 }}>
                  {gameData.word}
                </h1>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 24, padding: 16, background: "var(--bg)", borderRadius: "var(--radius-md)" }}>
              <p className="center muted">
                {gameData.isImposter
                  ? "No tienes pista. Esperando que el anfitrión revele tu palabra..."
                  : "Esperando palabra..."}
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
            <h2 style={{ textAlign: "center", color: "var(--danger)", marginTop: 0 }}>¡Impostores Revelados!</h2>
            <p className="center muted" style={{ marginBottom: 16 }}>El juego ha terminado</p>
            
            {revealedRoles && (
              <div>
                <h3 className="section-title">Resultados</h3>
                {revealedRoles.map((role, idx) => (
                  <div key={idx} style={{ 
                    padding: "12px", 
                    marginBottom: 8,
                    borderRadius: "var(--radius-md)",
                    background: role.isImposter ? "var(--danger)" : "var(--accent)",
                    color: "white"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{role.name}</strong>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.2)",
                        fontSize: "0.85rem"
                      }}>
                        {role.isImposter ? "🔥 Impostor" : "✅ Tripulación"}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: "0.9rem", opacity: 0.9 }}>
                      Palabra: {role.word || "(sin pista)"}
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
