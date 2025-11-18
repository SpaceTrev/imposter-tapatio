// Categorías en español mexicano con sabor Jalisco / GDL.

export const CATEGORIES = [
  // 0) Aleatoria se arma a partir de las demás (menos blank_custom)
  // Se genera dinámicamente en getRandomCategory.

  {
    id: "comida_tapatia",
    name: "Comida Callejera Tapatía",
    type: "family",
    description: "Tacos, lonches y antojos de la calle.",
    pairs: [
      { common: "Taco de asada", imposter: "Taco de adobada" },
      { common: "Torta ahogada", imposter: "Lonche bañao" },
      { common: "Carne en su jugo", imposter: "Birria" },
      { common: "Jericalla", imposter: "Flan" },
      { common: "Vampiro", imposter: "Carreta" },
      { common: "Pozole", imposter: "Menudo" },
      { common: "Agua de jamaica", imposter: "Agua de horchata" },
      { common: "Chocobanana", imposter: "Paleta de limón" },
      { common: "Quesadilla", imposter: "Sincronizada" },
      { common: "Elote", imposter: "Esquite" },
    ],
  },
  {
    id: "lugares_gdl",
    name: "Lugares de Guadalajara",
    type: "family",
    description: "Barrios, plazas y lugares de la ZMG.",
    pairs: [
      { common: "Chapalita", imposter: "Providencia" },
      { common: "Zapopan Centro", imposter: "Tlaquepaque Centro" },
      { common: "Andares", imposter: "Galerías" },
      { common: "Colomos", imposter: "Parque Metropolitano" },
      { common: "Plaza del Sol", imposter: "Gran Plaza" },
      { common: "Avenida Patria", imposter: "Avenida Vallarta" },
      { common: "La Minerva", imposter: "Glorieta Chapalita" },
      { common: "Tonalá", imposter: "Tlajomulco" },
      { common: "Tequila", imposter: "Amatitán" },
      { common: "Chapala", imposter: "Ajijic" },
    ],
  },
  {
    id: "peda",
    name: "La Peda / Antro",
    type: "adult",
    description: "Noche de fiesta, pero apto para app store.",
    pairs: [
      { common: "Cubetazo", imposter: "Litro" },
      { common: "Perreo", imposter: "Reggaetón tranqui" },
      { common: "After", imposter: "Pre" },
      { common: "Chupitos", imposter: "Carajillos" },
      { common: "Antro", imposter: "Bar" },
      { common: "Mesa VIP", imposter: "Pista" },
      { common: "DJ", imposter: "Banda" },
      { common: "Cruda", imposter: "Amanecido" },
      { common: "Uber", imposter: "Didi" },
      { common: "Fiestón loco", imposter: "Reunión tranqui" },
    ],
  },
  {
    id: "relaciones",
    name: "Relaciones y Tóxicos",
    type: "adult",
    description: "Amor, drama y crushes sin ser explícito.",
    pairs: [
      { common: "La tóxica", imposter: "La intensa" },
      { common: "El tóxico", imposter: "El celoso" },
      { common: "Crush", imposter: "Amor platónico" },
      { common: "Ex tóxica", imposter: "Ex tranqui" },
      { common: "Situationship", imposter: "Amigos con derechos" },
      { common: "Cita", imposter: "Salida casual" },
      { common: "Mensaje doble check", imposter: "Mensaje dejado en visto" },
      { common: "Besito", imposter: "Abrazo" },
      { common: "Coqueteo", imposter: "Plática normal" },
      { common: "Tarde romántica", imposter: "Plan tranqui" },
    ],
  },
  {
    id: "humor_mexicano",
    name: "Humor Mexicano / Albures Light",
    type: "mixed",
    description: "Frases mexicanas y carrilla sin pasarse.",
    pairs: [
      { common: "Eres bien barbero", imposter: "Eres bien lambiscón" },
      { common: "Agüitado", imposter: "Sacado de onda" },
      { common: "Bien chido", imposter: "Bien perrón" },
      { common: "No mames", imposter: "No inventes" },
      { common: "¡Aguas!", imposter: "¡Ojo!" },
      { common: "Chale", imposter: "Qué gacho" },
      { common: "Qué rollo", imposter: "Qué show" },
      { common: "Ya valió", imposter: "Ni modo" },
      { common: "Te la bañaste", imposter: "Te pasaste" },
      { common: "Bien fresa", imposter: "Bien mamón" },
    ],
  },
  {
    id: "vida_diaria",
    name: "Vida Diaria Tapatía",
    type: "family",
    description: "Cosas del día a día con sabor local.",
    pairs: [
      { common: "Tamal oaxaqueño", imposter: "Tamal de elote" },
      { common: "Camión", imposter: "Macro" },
      { common: "Oxxo", imposter: "Kiosko" },
      { common: "Pan dulce", imposter: "Concha" },
      { common: "Chamarra", imposter: "Suéter" },
      { common: "Bolillo", imposter: "Telera" },
      { common: "Gasolinera", imposter: "Servi" },
      { common: "Mandado", imposter: "Super" },
      { common: "Combi", imposter: "Mototaxi" },
      { common: "Refresco", imposter: "Agua mineral" },
    ],
  },
  {
    id: "goofy",
    name: "Goofy / Memera",
    type: "mixed",
    description: "Frases de memes, TikTok y cotorreo.",
    pairs: [
      { common: "Ñero", imposter: "Cholo" },
      { common: "Fierro pariente", imposter: "Échele mi viejo" },
      { common: "Está bien cringe", imposter: "Está bien raro" },
      { common: "No pues wow", imposter: "Qué ofertón" },
      { common: "Gaspi", imposter: "Skibidi" },
      { common: "Ando modo diablo", imposter: "Ando modo fresa" },
      { common: "Tilín", imposter: "Papulince" },
      { common: "Chipi chapa", imposter: "Qué rollo plebes" },
      { common: "Buenas buenas", imposter: "Qué milagro" },
      { common: "Ta weno", imposter: "Ta chido" },
    ],
  },
  {
    id: "blank_custom",
    name: "Modo Personalizable",
    type: "mixed",
    customBlank: true,
    description: "Palabras en '???' para que las inventen ustedes.",
    pairs: [],
  },
];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export function getRandomCategory({ allowAdult }) {
  const allowedTypes = allowAdult ? ["family", "adult", "mixed"] : ["family", "mixed"];
  const filtered = CATEGORIES.filter((c) => allowedTypes.includes(c.type));
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getAllowedPairs({ allowAdult, allowCustom }) {
  const allowedTypes = allowAdult ? ["family", "adult", "mixed"] : ["family", "mixed"];
  const allPairs = [];
  
  for (const cat of CATEGORIES) {
    if (cat.customBlank && !allowCustom) continue;
    if (!allowedTypes.includes(cat.type)) continue;
    allPairs.push(...cat.pairs);
  }
  
  return allPairs;
}

export function randomPairFromCategory(cat) {
  if (cat.customBlank) return { common: "???", imposter: "???" };
  if (!cat.pairs.length) throw new Error("La categoría no tiene palabras.");
  return cat.pairs[Math.floor(Math.random() * cat.pairs.length)];
}
