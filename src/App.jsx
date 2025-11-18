import React, { useEffect, useState } from "react";
import HomePage from "./components/HomePage";
import WhatsAppMode from "./components/WhatsAppMode";
import ScreenMode from "./components/ScreenMode";
import WiFiMode from "./components/WiFiMode";

const THEME_STORAGE_KEY = "imposter_theme";
const LANGUAGE_STORAGE_KEY = "imposter_language";

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || "light";
  } catch {
    return "light";
  }
}

function loadLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved || "es";
  } catch {
    return "es";
  }
}

export default function App() {
  const [mode, setMode] = useState("home"); // home | whatsapp | screen | wifi
  const [theme, setTheme] = useState(loadTheme);
  const [language, setLanguage] = useState(loadLanguage);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  function toggleTheme() {
    setTheme(prev => prev === "light" ? "dark" : "light");
  }

  function toggleLanguage() {
    setLanguage(prev => prev === "es" ? "en" : "es");
  }

  return (
    <div className="app">
      <div className="app-controls">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={language === "es" ? "Cambiar tema" : "Toggle theme"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button 
          className="language-toggle" 
          onClick={toggleLanguage}
          aria-label={language === "es" ? "Cambiar idioma" : "Change language"}
        >
          {language === "es" ? "🇺🇸" : "🇲🇽"}
        </button>
      </div>

      {mode === "home" && <HomePage onSelectMode={setMode} language={language} />}
      {mode === "whatsapp" && <WhatsAppMode onBack={() => setMode("home")} language={language} />}
      {mode === "screen" && <ScreenMode onBack={() => setMode("home")} language={language} />}
      {mode === "wifi" && <WiFiMode onBack={() => setMode("home")} language={language} />}
    </div>
  );
}
