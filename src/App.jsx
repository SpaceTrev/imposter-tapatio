import React, { useEffect, useState } from "react";
import HomePage from "./components/HomePage";
import WhatsAppMode from "./components/WhatsAppMode";
import WiFiMode from "./components/WiFiMode";

const THEME_STORAGE_KEY = "imposter_theme";

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || "light";
  } catch {
    return "light";
  }
}

export default function App() {
  const [mode, setMode] = useState("home"); // home | whatsapp | wifi
  const [theme, setTheme] = useState(loadTheme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === "light" ? "dark" : "light");
  }

  return (
    <div className="app">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Cambiar tema"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {mode === "home" && <HomePage onSelectMode={setMode} />}
      {mode === "whatsapp" && <WhatsAppMode onBack={() => setMode("home")} />}
      {mode === "wifi" && <WiFiMode onBack={() => setMode("home")} />}
    </div>
  );
}
