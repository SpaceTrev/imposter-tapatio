import React from "react";

const text = {
  es: {
    title: "Imposter Radar",
    badge: "Tapatío",
    subtitle: "Elige tu modo de juego favorito",
    whatsapp: {
      title: "Modo WhatsApp",
      description: "Manda roles por WhatsApp a cada jugador. Ideal para grupos que no están juntos.",
      button: "Jugar con WhatsApp"
    },
    screen: {
      title: "Modo Revelar en Pantalla",
      description: "Pasa el celular entre jugadores para que vean su rol. Perfecto para grupos juntos sin WiFi.",
      button: "Pasar el Celular"
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
    whatsapp: {
      title: "WhatsApp Mode",
      description: "Send roles via WhatsApp to each player. Ideal for groups not together.",
      button: "Play with WhatsApp"
    },
    screen: {
      title: "Pass the Phone Mode",
      description: "Pass the phone between players to see their role. Perfect for groups together without WiFi.",
      button: "Pass the Phone"
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
        <div className="mode-card" onClick={() => onSelectMode("whatsapp")}>
          <div className="mode-icon">📱</div>
          <h2>{t.whatsapp.title}</h2>
          <p>
            {t.whatsapp.description}
          </p>
          <button className="btn primary full">
            {t.whatsapp.button}
          </button>
        </div>

        <div className="mode-card" onClick={() => onSelectMode("screen")}>
          <div className="mode-icon">📲</div>
          <h2>{t.screen.title}</h2>
          <p>
            {t.screen.description}
          </p>
          <button className="btn primary full">
            {t.screen.button}
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
