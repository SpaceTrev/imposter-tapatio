import React from "react";

const text = {
  es: {
    title: "Imposter Radar",
    badge: "Tapatío",
    subtitle: "Elige tu modo de juego favorito",
    play: {
      title: "Jugar",
      description: "Revela roles en pantalla y opcionalmente envía recordatorios por WhatsApp. Perfecto para grupos juntos.",
      button: "Jugar Ahora"
    },
    wifi: {
      title: "Modo WiFi Local",
      description: "Todos se conectan al mismo juego en su celular. Cada quien ve su rol y palabra en tiempo real.",
      button: "Jugar en WiFi"
    },
    footer: "Hecho con 💚 en Guadalajara"
  },
  en: {
    title: "Imposter Radar",
    badge: "Game",
    subtitle: "Choose your favorite game mode",
    play: {
      title: "Play",
      description: "Reveal roles on screen and optionally send WhatsApp reminders. Perfect for groups together.",
      button: "Play Now"
    },
    wifi: {
      title: "Local WiFi Mode",
      description: "Everyone connects to the same game on their phone. Each person sees their role and word in real-time.",
      button: "Play on WiFi"
    },
    footer: "Made with 💚 in Guadalajara"
  }
};

export default function HomePage({ onSelectMode, language = "es" }) {
  const t = text[language];
  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">
          {t.title} <span className="badge">{t.badge}</span>
        </h1>
        <p className="home-subtitle">
          {t.subtitle}
        </p>
      </div>

      <div className="mode-selection">
        <div className="mode-card" onClick={() => onSelectMode("play")}>
          <div className="mode-icon">🎮</div>
          <h2>{t.play.title}</h2>
          <p>
            {t.play.description}
          </p>
          <button className="btn primary full">
            {t.play.button}
          </button>
        </div>

        <div className="mode-card" onClick={() => onSelectMode("wifi")}>
          <div className="mode-icon">📡</div>
          <h2>{t.wifi.title}</h2>
          <p>
            {t.wifi.description}
          </p>
          <button className="btn primary full">
            {t.wifi.button}
          </button>
        </div>
      </div>

      <div className="home-footer">
        <p className="muted">
          {t.footer}
        </p>
      </div>
    </div>
  );
}
