import React, { useState } from "react";

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
  const [gameStarted, setGameStarted] = useState(false);
  const roomCode = "ABC123"; // TODO: Generate random code

  return (
    <div className="wifi-mode">
      <div className="app-header">
        <button className="btn ghost small" onClick={onBack}>
          ← Volver
        </button>
        <h1>Anfitrión - Sala {roomCode}</h1>
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
          <h3 className="section-title">Jugadores conectados (0)</h3>
          <p className="muted center">Esperando jugadores...</p>
        </div>

        {!gameStarted ? (
          <button
            className="btn primary full"
            style={{ marginTop: 24 }}
            onClick={() => setGameStarted(true)}
          >
            Iniciar Juego
          </button>
        ) : (
          <div style={{ marginTop: 24 }}>
            <h3 className="section-title">Controles de Revelación</h3>
            <button className="btn full" style={{ marginBottom: 8 }}>
              Revelar Impostores
            </button>
            <button className="btn ghost full">
              Mostrar Palabra al Impostor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerView({ roomCode, onBack }) {
  const [connected, setConnected] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  // Mock data for demonstration
  const mockData = {
    name: "Jugador 1",
    isImposter: false,
    word: "Torta ahogada",
    revealed: false,
  };

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
          
          <button
            className="btn primary full"
            style={{ marginTop: 24 }}
            onClick={() => {
              setConnected(true);
              setPlayerData(mockData);
            }}
          >
            Simular Conexión (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wifi-mode">
      <div className="app-header">
        <h1>Sala {roomCode}</h1>
        <p className="muted">Conectado como {playerData.name}</p>
      </div>

      <div className="card player-card-view" style={{ marginTop: 16 }}>
        <div className="player-role-display">
          <h2 className="section-title center">Tu Rol</h2>
          <div className="role-reveal-box">
            <h1 style={{ fontSize: "1.5rem", marginBottom: 16 }}>
              {playerData.isImposter
                ? "Eres el puto impostor cabrón/a"
                : "No eres el puto impostor cabrón/a"}
            </h1>
          </div>

          {(!playerData.isImposter || playerData.wordRevealed) && (
            <>
              <h2 className="section-title center" style={{ marginTop: 24 }}>
                Tu Palabra
              </h2>
              <div className="word-display-box">
                <h1 style={{ fontSize: "2.5rem", color: "var(--accent)" }}>
                  {playerData.word}
                </h1>
              </div>
            </>
          )}

          {playerData.isImposter && !playerData.wordRevealed && (
            <div style={{ marginTop: 24 }}>
              <p className="center muted">
                Esperando que el anfitrión revele tu palabra...
              </p>
            </div>
          )}
        </div>

        {playerData.revealed && (
          <div className="revelation-alert" style={{ marginTop: 24, padding: 16, background: "var(--danger)", borderRadius: "var(--radius-md)" }}>
            <h2 className="center">¡Impostores Revelados!</h2>
            <p className="center">El juego ha terminado</p>
          </div>
        )}
      </div>
    </div>
  );
}
