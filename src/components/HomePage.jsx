import React from "react";

export default function HomePage({ onSelectMode }) {
  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">
          Imposter Radar <span className="badge">Tapatío</span>
        </h1>
        <p className="home-subtitle">
          Elige tu modo de juego favorito
        </p>
      </div>

      <div className="mode-selection">
        <div className="mode-card" onClick={() => onSelectMode("whatsapp")}>
          <div className="mode-icon">📱</div>
          <h2>Modo WhatsApp</h2>
          <p>
            Manda roles por WhatsApp o pasa el cel entre los jugadores.
            Perfecto para grupos que no están en el mismo lugar.
          </p>
          <button className="btn primary full">
            Jugar con WhatsApp
          </button>
        </div>

        <div className="mode-card" onClick={() => onSelectMode("wifi")}>
          <div className="mode-icon">📡</div>
          <h2>Modo WiFi Local</h2>
          <p>
            Todos se conectan al mismo juego en su celular.
            Cada quien ve su rol y palabra en tiempo real.
          </p>
          <button className="btn primary full">
            Jugar en WiFi
          </button>
        </div>
      </div>

      <div className="home-footer">
        <p className="muted">
          Hecho con 💚 en Guadalajara
        </p>
      </div>
    </div>
  );
}
