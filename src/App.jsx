import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import HomePage from "./components/HomePage";
import PlayMode from "./components/PlayMode";
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

function WiFiHostRoute({ language }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  
  return (
    <WiFiMode 
      mode="host" 
      initialRoomCode={roomCode}
      onBack={() => navigate("/")} 
      language={language} 
    />
  );
}

function WiFiPlayerRoute({ language }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  
  return (
    <WiFiMode 
      mode="player" 
      initialRoomCode={roomCode}
      onBack={() => navigate("/")} 
      language={language} 
    />
  );
}

function AppContent({ theme, language, toggleTheme, toggleLanguage }) {
  const navigate = useNavigate();
  
  const handleSelectMode = (mode) => {
    if (mode === "wifi") {
      navigate("/wifi");
    } else if (mode === "play") {
      navigate("/play");
    } else {
      navigate(`/${mode}`);
    }
  };

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

      <Routes>
        <Route path="/" element={<HomePage onSelectMode={handleSelectMode} language={language} />} />
        <Route path="/play" element={<PlayMode onBack={() => navigate("/")} language={language} />} />
        <Route path="/wifi" element={<WiFiMode onBack={() => navigate("/")} language={language} />} />
        <Route path="/wifi/host/:roomCode" element={<WiFiHostRoute language={language} />} />
        <Route path="/wifi/player/:roomCode" element={<WiFiPlayerRoute language={language} />} />
      </Routes>
    </div>
  );
}

export default function App() {
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
    <BrowserRouter>
      <AppContent 
        theme={theme} 
        language={language} 
        toggleTheme={toggleTheme} 
        toggleLanguage={toggleLanguage} 
      />
    </BrowserRouter>
  );
}
