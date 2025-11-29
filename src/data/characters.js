// Character avatars with theme colors for WiFi mode
// Inspired by Mario Kart's player selection system

export const CHARACTERS = [
  {
    id: "taco",
    emoji: "🌮",
    name: "Taco",
    colors: {
      primary: "#f59e0b",    // Amber
      secondary: "#fbbf24",  // Light amber
      accent: "#d97706",     // Dark amber
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)"
    }
  },
  {
    id: "rockero",
    emoji: "🎸",
    name: "Rockero",
    colors: {
      primary: "#8b5cf6",    // Purple
      secondary: "#a78bfa",  // Light purple
      accent: "#7c3aed",     // Dark purple
      gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)"
    }
  },
  {
    id: "gamer",
    emoji: "👾",
    name: "Gamer",
    colors: {
      primary: "#06b6d4",    // Cyan
      secondary: "#22d3ee",  // Light cyan
      accent: "#0891b2",     // Dark cyan
      gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)"
    }
  },
  {
    id: "dino",
    emoji: "🦖",
    name: "Dino",
    colors: {
      primary: "#10b981",    // Green
      secondary: "#34d399",  // Light green
      accent: "#059669",     // Dark green
      gradient: "linear-gradient(135deg, #10b981, #34d399)"
    }
  },
  {
    id: "fuego",
    emoji: "🔥",
    name: "Fuego",
    colors: {
      primary: "#ef4444",    // Red
      secondary: "#f87171",  // Light red
      accent: "#dc2626",     // Dark red
      gradient: "linear-gradient(135deg, #ef4444, #f87171)"
    }
  },
  {
    id: "mariachi",
    emoji: "🎺",
    name: "Mariachi",
    colors: {
      primary: "#f97316",    // Orange
      secondary: "#fb923c",  // Light orange
      accent: "#ea580c",     // Dark orange
      gradient: "linear-gradient(135deg, #f97316, #fb923c)"
    }
  },
  {
    id: "luchador",
    emoji: "🤼",
    name: "Luchador",
    colors: {
      primary: "#ec4899",    // Pink
      secondary: "#f472b6",  // Light pink
      accent: "#db2777",     // Dark pink
      gradient: "linear-gradient(135deg, #ec4899, #f472b6)"
    }
  },
  {
    id: "zombie",
    emoji: "🧟",
    name: "Zombie",
    colors: {
      primary: "#6b7280",    // Gray
      secondary: "#9ca3af",  // Light gray
      accent: "#4b5563",     // Dark gray
      gradient: "linear-gradient(135deg, #6b7280, #9ca3af)"
    }
  },
  {
    id: "alien",
    emoji: "👽",
    name: "Alien",
    colors: {
      primary: "#84cc16",    // Lime
      secondary: "#a3e635",  // Light lime
      accent: "#65a30d",     // Dark lime
      gradient: "linear-gradient(135deg, #84cc16, #a3e635)"
    }
  },
  {
    id: "unicornio",
    emoji: "🦄",
    name: "Unicornio",
    colors: {
      primary: "#a855f7",    // Purple/magenta
      secondary: "#c084fc",  // Light purple
      accent: "#9333ea",     // Dark purple
      gradient: "linear-gradient(135deg, #a855f7, #c084fc)"
    }
  },
  {
    id: "ninja",
    emoji: "🥷",
    name: "Ninja",
    colors: {
      primary: "#1f2937",    // Dark gray/black
      secondary: "#374151",  // Light dark
      accent: "#111827",     // Very dark
      gradient: "linear-gradient(135deg, #1f2937, #374151)"
    }
  },
  {
    id: "pizza",
    emoji: "🍕",
    name: "Pizza",
    colors: {
      primary: "#eab308",    // Yellow
      secondary: "#facc15",  // Light yellow
      accent: "#ca8a04",     // Dark yellow
      gradient: "linear-gradient(135deg, #eab308, #facc15)"
    }
  }
];

export function getCharacterById(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

export function getRandomCharacter() {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}
