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
      { common: "Tejuino", imposter: "Tepache" },
      { common: "Bionicos", imposter: "Cóctel de frutas" },
      { common: "Tostada de pata", imposter: "Tostada de cueritos" },
      { common: "Droga", imposter: "Salsa botanera" },
      { common: "Pan birote", imposter: "Bolillo" },
      { common: "Tostilocos", imposter: "Dorilocos" },
      { common: "Duros preparados", imposter: "Chicharrón preparado" },
      { common: "Camote enmielado", imposter: "Calabaza en tacha" },
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
      { common: "Cabañas", imposter: "Degollado" },
      { common: "El Parián", imposter: "El Refugio" },
      { common: "Camichines", imposter: "Lomas del Valle" },
      { common: "Midtown", imposter: "Punto Sur" },
      { common: "Estadio Akron", imposter: "Estadio Jalisco" },
      { common: "Expo GDL", imposter: "Palomar" },
      { common: "La Vía RecreActiva", imposter: "Vía RecreActiva" },
      { common: "Mercado Libertad", imposter: "San Juan de Dios" },
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
      { common: "Estás bien meco", imposter: "Estás bien pendejo" },
      { common: "Que te vaya bonito", imposter: "Que te vaya chido" },
      { common: "Está cañón", imposter: "Está brígido" },
      { common: "Qué pedo", imposter: "Qué onda" },
      { common: "Me vale gorro", imposter: "Me vale madre" },
      { common: "Está bien vergas", imposter: "Está bien chingón" },
      { common: "No manches", imposter: "No mames güey" },
      { common: "Ponte trucha", imposter: "Ponte verga" },
      { common: "Ando bien crudo", imposter: "Ando valiendo verga" },
      { common: "Qué poca", imposter: "Qué bajeza" },
      { common: "Se me chispoteó", imposter: "Se me olvidó" },
      { common: "Está bien ñero", imposter: "Está bien cholo" },
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
    id: "slang_tapatia",
    name: "Slang Tapatío Puro",
    type: "mixed",
    description: "Palabras y frases que solo los tapatíos entienden.",
    pairs: [
      { common: "Órale pues", imposter: "Sale vale" },
      { common: "Quiúbole", imposter: "Qué hay" },
      { common: "Ámonos recio", imposter: "Vámonos yendo" },
      { common: "Me cae gordo", imposter: "Me cae mal" },
      { common: "Está cabrón", imposter: "Está difícil" },
      { common: "Ándele pues", imposter: "Va que va" },
      { common: "Ni madres", imposter: "Nel pastel" },
      { common: "Qué cura", imposter: "Qué risa" },
      { common: "Está machin", imposter: "Está pesado" },
      { common: "Bien jetón", imposter: "Bien dormilón" },
      { common: "Ya merito", imposter: "Casi casi" },
      { common: "Al ratón", imposter: "Al rato" },
      { common: "Simón que sí", imposter: "Arre que sí" },
      { common: "Nel", imposter: "No" },
      { common: "Tas grueso", imposter: "Estás pasado" },
    ],
  },
  {
    id: "albures_clasicos",
    name: "Albures Clásicos (Suaves)",
    type: "adult",
    description: "Doble sentido mexicano, pero no tan explícito.",
    pairs: [
      { common: "Échame aguas", imposter: "Échame la mano" },
      { common: "Me la pelas", imposter: "Me vale" },
      { common: "Como te veo te trato", imposter: "Como te ves te tratan" },
      { common: "Ahí te va", imposter: "Ahí te dejo" },
      { common: "Échate para acá", imposter: "Ven para acá" },
      { common: "Dame chance", imposter: "Dame tiempo" },
      { common: "Me late", imposter: "Me gusta" },
      { common: "Agárrala suave", imposter: "Tómalo con calma" },
      { common: "Métele duro", imposter: "Échale ganas" },
      { common: "Ahí te encargo", imposter: "Cuídamelo" },
      { common: "Por atrás no", imposter: "De frente mejor" },
      { common: "Bien parado", imposter: "Bien plantado" },
    ],
  },
  {
    id: "chivas_atlas",
    name: "Chivas vs Atlas",
    type: "family",
    description: "Fútbol tapatío y la rivalidad.",
    pairs: [
      { common: "Chivas", imposter: "Atlas" },
      { common: "Akron", imposter: "Jalisco" },
      { common: "Rebaño Sagrado", imposter: "Rojinegros" },
      { common: "Chicharito", imposter: "Julián Quiñones" },
      { common: "Clásico Tapatío", imposter: "Derby tapatío" },
      { common: "Puros mexicanos", imposter: "Con refuerzos" },
      { common: "12 títulos", imposter: "3 títulos" },
      { common: "Omnilife", imposter: "La Volpe" },
      { common: "Peláez", imposter: "Orlegi" },
      { common: "La Irreverente", imposter: "La Fiel" },
    ],
  },
  {
    id: "mariachi_cultura",
    name: "Mariachi y Tradición",
    type: "family",
    description: "La cultura jaliscience y su música.",
    pairs: [
      { common: "Mariachi", imposter: "Banda sinaloense" },
      { common: "El Rey", imposter: "Volver Volver" },
      { common: "Trompeta", imposter: "Violín" },
      { common: "Charro", imposter: "Huaso" },
      { common: "Sombrero de charro", imposter: "Sombrero de ala ancha" },
      { common: "Plaza de los Mariachis", imposter: "Garibaldi" },
      { common: "Vicente Fernández", imposter: "Pedro Infante" },
      { common: "Ranchera", imposter: "Corrido" },
      { common: "Tequila añejo", imposter: "Tequila reposado" },
      { common: "Destiladora", imposter: "Fábrica" },
      { common: "Agave azul", imposter: "Maguey" },
      { common: "Mezcal", imposter: "Raicilla" },
    ],
  },
  {
    id: "transporte_gdl",
    name: "Transporte en GDL",
    type: "family",
    description: "Moverse por la ciudad.",
    pairs: [
      { common: "Macrobús", imposter: "Línea 3" },
      { common: "Tren Ligero", imposter: "Metro" },
      { common: "Periférico", imposter: "Anillo Periférico" },
      { common: "López Mateos", imposter: "Lázaro Cárdenas" },
      { common: "Camión TUR", imposter: "Camión rojo" },
      { common: "Pecera", imposter: "Microbús" },
      { common: "Rutera", imposter: "Combi" },
      { common: "MiBici", imposter: "Bici pública" },
      { common: "Uber", imposter: "InDrive" },
      { common: "DiDi", imposter: "Cabify" },
      { common: "Calzada Independencia", imposter: "Av. Federalismo" },
    ],
  },
  {
    id: "apodos_mexicanos",
    name: "Apodos Mexicanos",
    type: "mixed",
    description: "Sobrenombres típicos.",
    pairs: [
      { common: "El Güero", imposter: "El Moreno" },
      { common: "El Gordo", imposter: "El Flaco" },
      { common: "El Chino", imposter: "El Japo" },
      { common: "La Güera", imposter: "La Morena" },
      { common: "El Pelón", imposter: "El Greñudo" },
      { common: "El Chaparrito", imposter: "El Enano" },
      { common: "El Burro", imposter: "El Mula" },
      { common: "La Chiquis", imposter: "La Chaparra" },
      { common: "El Cuate", imposter: "El Compa" },
      { common: "La Nena", imposter: "La Chava" },
      { common: "El Profe", imposter: "El Maestro" },
      { common: "La Doctora", imposter: "La Doc" },
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
