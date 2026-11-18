// UGCora Studio - Cinematic Environments & Faceless Video Generation Framework
// Specially tuned for Google Veo 3.1, Grok Video, and Happy Horse engines

export const CINEMATIC_THEMES = [
  {
    id: "luxury-wellness-violet",
    name: "Estudio de Lujo #8B5CF6 & Blanco",
    badge: "Identidad UGCore",
    accentColor: "#8B5CF6",
    emoji: "✨",
    previewImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description:
      "Arquitectura minimalista en curvas blancas puras, mármol italiano y LED violeta eléctrico.",
    environmentPrompt:
      "inside a high-end luxury architectural wellness sanctuary designed with pure white curved walls (#FFFFFF), polished Calacatta marble surfaces, and soft electric violet (#8B5CF6) LED cove lighting. Minimalist botanical bonsai accents, tranquil water reflections, and immaculate modern aesthetic",
    recommendedIdeas: [
      "Espacio de spa con gotas de rocío sobre piedra de mármol blanco",
      "Interior minimalista de villa de lujo con luz violeta tenue al atardecer",
      "Exhibidor de cosmética premium sobre pedestal de agua iluminada",
    ],
  },
  {
    id: "epic-nature",
    name: "Naturaleza & Paisajes Épicos",
    badge: "Estilo Gemini",
    accentColor: "#10B981",
    emoji: "🏔️",
    previewImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description:
      "Montañas con niebla, cascadas cristalinas, playas al atardecer y bosques exuberantes.",
    environmentPrompt:
      "breathtaking hyper-realistic nature landscape with dramatic mountain ridges rising through rolling morning mist, pristine turquoise glacial water, lush emerald pine forests, and atmospheric depth",
    recommendedIdeas: [
      "Playa virgen al atardecer con olas espumosas rompiendo sobre arena negra",
      "Bosque milenario con niebla espesa y rayos de sol atravesando las copas",
      "Cascada tropical cristalina cayendo sobre rocas cubiertas de musgo",
    ],
  },
  {
    id: "urban-cyberpunk",
    name: "Urbano & Cyberpunk Neón",
    badge: "Futurista",
    accentColor: "#EC4899",
    emoji: "🏙️",
    previewImage:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    description:
      "Calles mojadas por la lluvia, letreros de neón, Tokio nocturno y rascacielos iluminados.",
    environmentPrompt:
      "cinematic futuristic cityscape at night, rain-slicked asphalt reflecting vivid cyan, magenta, and amber neon billboards, towering architectural skyscrapers, subtle steam rising from street vents, blade-runner noir atmosphere",
    recommendedIdeas: [
      "Callejón de Tokio de noche con lluvia fina y reflejos de neón rosa y azul",
      "Panorámica de rascacielos futuristas con nubes bajas y tráfico de luces",
      "Coche deportivo clásico detenido bajo un letrero de neón bajo la lluvia",
    ],
  },
  {
    id: "cozy-lifestyle",
    name: "Cafetería Nórdica & Lifestyle",
    badge: "Acogedor",
    accentColor: "#F59E0B",
    emoji: "☕",
    previewImage:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    description:
      "Café caliente, lluvia en la ventana, madera cálida, chimenea y estética minimalista.",
    environmentPrompt:
      "warm, cozy Scandinavian coffee house and reading sanctuary, natural light oak wood finishes, ceramic mugs emitting delicate rising steam, gentle rain droplets trickling down large glass panoramic windows, soft woolen throws, warm ambient aesthetic",
    recommendedIdeas: [
      "Taza de capuchino artesanal con vapor saliendo junto a una ventana con lluvia",
      "Rincón de lectura nórdico con libros, manta de lana y chimenea de leña",
      "Mesa de roble con granos de café tostados y filtro de goteo en cámara lenta",
    ],
  },
  {
    id: "product-luxury-broll",
    name: "Comercial de Producto B-Roll",
    badge: "Comercial 4K",
    accentColor: "#6366F1",
    emoji: "🛍️",
    previewImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    description:
      "Tomas de producto de alta gama: cosmética, joyería, fragancias, tecnología y lujo.",
    environmentPrompt:
      "ultra-premium commercial product studio presentation, elegant pedestal elevated over shallow rippling water, silky organic fabric draped in background with soft physics, macro texture fidelity, luxury aesthetic",
    recommendedIdeas: [
      "Frasco de perfume de cristal sobre pedestal de piedra negra con agua ondulando",
      "Reloj de titanio con engranajes expuestos y destellos de luz sobre fibra de carbono",
      "Teléfono inteligente de última generación flotando entre ondas de seda violeta",
    ],
  },
  {
    id: "tech-future-datacenter",
    name: "Tecnología, IA & Espacio Cuántico",
    badge: "High Tech",
    accentColor: "#06B6D4",
    emoji: "🧬",
    previewImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    description:
      "Líneas de datos cuánticos, circuitos iluminados, servidores IA y partículas de luz.",
    environmentPrompt:
      "futuristic quantum computing facility and optical neural data center, endless rows of dark glass server racks with pulsing cobalt-blue and electric-white optical fiber traces, subtle volumetric cooling haze, cinematic technological wonder",
    recommendedIdeas: [
      "Centro de servidores de IA con cables de fibra óptica pulsando con luz azul",
      "Chip procesador cuántico con circuitos dorados iluminándose secuencialmente",
      "Nube de partículas holográficas 3D flotando en una sala oscura de cristal",
    ],
  },
  {
    id: "cinematic-space",
    name: "Cosmos, Galaxias & Vista Orbital",
    badge: "Espacial",
    accentColor: "#A855F7",
    emoji: "🌌",
    previewImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    description:
      "Planeta Tierra desde la órbita, nebulosas multicolores, auroras boreales y estrellas.",
    environmentPrompt:
      "awe-inspiring cinematic view of planet Earth from low orbit, luminous atmospheric glow, dancing green and violet aurora borealis ribbons over city lights below, deep cosmic starfield and distant colorful nebula gas clouds",
    recommendedIdeas: [
      "Vista de la Tierra desde el espacio con una aurora boreal resplandeciente",
      "Nebulosa interestelar púrpura y dorada con cúmulos de estrellas jóvenes",
      "Estación orbital pasando suavemente sobre los continentes iluminados de noche",
    ],
  },
  {
    id: "modern-minimalist-architecture",
    name: "Arquitectura Minimalista & Mármol",
    badge: "Diseño & Interior",
    accentColor: "#64748B",
    emoji: "🏛️",
    previewImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
    description:
      "Mansión moderna de cristal, piscina infinita, concreto pulido y diseño vanguardista.",
    environmentPrompt:
      "contemporary architectural masterpiece villa, floor-to-ceiling glass walls overlooking an infinity pool, exposed polished micro-cement, warm teak timber accents, designer cantilevered staircase, immaculate interior styling",
    recommendedIdeas: [
      "Piscina infinita reflejando el atardecer junto a una sala moderna de cristal",
      "Escalera flotante de roble en una casa moderna con luz cenital natural",
      "Terraza minimalista con vistas a la bahía y brisa suave moviendo cortinas de lino",
    ],
  },
];

export const CINEMATIC_CAMERA_EFFECTS = [
  {
    id: "dolly-in",
    name: "Dolly In Cinemático (Acercamiento Lento)",
    shortLabel: "🎥 Dolly In Lento",
    icon: "🎥",
    cameraPrompt:
      "slow, ultra-smooth cinematic dolly-in push camera movement tracking forward with continuous precision and shallow depth of field",
  },
  {
    id: "aerial-drone",
    name: "Drone Aéreo Panorámico (Vuelo Majestuoso)",
    shortLabel: "🛸 Drone Panorámico",
    icon: "🛸",
    cameraPrompt:
      "sweeping cinematic aerial drone shot, smooth high-altitude forward gliding motion capturing vast panoramic scale and breathtaking horizons",
  },
  {
    id: "macro-closeup",
    name: "Macro Detalle 4K (Primer Plano Extremo)",
    shortLabel: "🔍 Macro Detalle 4K",
    icon: "🔍",
    cameraPrompt:
      "extreme macro 100mm lens close-up with razor-sharp micro-texture focus, buttery smooth background blur (bokeh), and subtle micro-drifting camera motion",
  },
  {
    id: "orbital-360",
    name: "Órbita 360° Circular (Giro Envolvente)",
    shortLabel: "🔄 Órbita 360°",
    icon: "🔄",
    cameraPrompt:
      "360-degree rotational circular orbital camera movement gliding smoothly around the central focal element at an elegant, hypnotic pace",
  },
  {
    id: "slow-motion-120fps",
    name: "Cámara Lenta 120fps (Fluidos & Partículas)",
    shortLabel: "⏱️ Cámara Lenta 120fps",
    icon: "⏱️",
    cameraPrompt:
      "filmed in ultra-slow motion at 120 frames per second, mesmerizing fluid movement, suspended droplets, gentle kinetic momentum",
  },
  {
    id: "dutch-angle-hyperlapse",
    name: "Hyperlapse Dinámico (Luz & Movimiento)",
    shortLabel: "⚡ Hyperlapse Dinámico",
    icon: "⚡",
    cameraPrompt:
      "dynamic cinematic hyperlapse camera pass, elegant motion blur trails, accelerated natural lighting progression, high production value",
  },
];

export const CINEMATIC_LIGHTING_STYLES = [
  {
    id: "golden-hour",
    name: "Hora Dorada (Golden Hour • Atardecer Cálido)",
    shortLabel: "🌅 Golden Hour",
    lightingPrompt:
      "bathed in magnificent golden hour sunset lighting, warm amber and apricot light rays, soft lens flares, glowing rim highlights, and long gentle shadows",
  },
  {
    id: "moody-neon",
    name: "Nocturno & Neón Moody (Cyberpunk / Nocturno)",
    shortLabel: "🌙 Neón Moody",
    lightingPrompt:
      "atmospheric nocturnal lighting with rich high-contrast cyan and magenta neon specular reflections, soft volumetric haze, deep cinematic blacks",
  },
  {
    id: "soft-scandinavian-daylight",
    name: "Luz de Día Nórdica (5600K Pura & Difusa)",
    shortLabel: "☁️ Luz Nórdica Suave",
    lightingPrompt:
      "clean, soft diffused 5600K natural daylight cascading through large windows, pristine even tonal roll-off, crisp white balances, organic natural ambience",
  },
  {
    id: "volumetric-godrays",
    name: "Rayos de Sol Volumétricos (God Rays & Niebla)",
    shortLabel: "🌫️ Rayos de Sol (God Rays)",
    lightingPrompt:
      "dramatic volumetric god rays of celestial sunlight piercing through atmospheric morning haze and fine dust particles, high cinematic poetry",
  },
  {
    id: "violet-electric-luxury",
    name: "Violeta Eléctrico #8B5CF6 & Blanco Puro",
    shortLabel: "✨ Violeta #8B5CF6 & Blanco",
    lightingPrompt:
      "custom signature studio lighting pairing pure 6000K key light with subtle electric violet (#8B5CF6) and soft lavender rim glows, immaculate premium editorial finish",
  },
];

export function buildCinematicPrompt({
  themeId = "luxury-wellness-violet",
  cameraEffectId = "dolly-in",
  lightingStyleId = "golden-hour",
  userIdea = "",
  aspectRatio = "9:16",
  resolution = "720p",
}) {
  const theme =
    CINEMATIC_THEMES.find((t) => t.id === themeId) || CINEMATIC_THEMES[0];
  const camera =
    CINEMATIC_CAMERA_EFFECTS.find((c) => c.id === cameraEffectId) ||
    CINEMATIC_CAMERA_EFFECTS[0];
  const lighting =
    CINEMATIC_LIGHTING_STYLES.find((l) => l.id === lightingStyleId) ||
    CINEMATIC_LIGHTING_STYLES[0];

  const cleanIdea = typeof userIdea === "string" ? userIdea.trim() : "";
  const mainSubject = cleanIdea || theme.recommendedIdeas[0] || theme.description;

  const promptParts = [
    `Cinematic, photorealistic ${aspectRatio} ambient sequence.`,
    `Subject: ${mainSubject}.`,
    `Environment: ${theme.environmentPrompt}.`,
    `Camera Movement: ${camera.cameraPrompt}.`,
    `Lighting & Atmosphere: ${lighting.lightingPrompt}.`,
    "Rendered with masterclass cinematic color grading, 35mm anamorphic prime lens, razor-sharp textures, perfectly fluid natural motion, hyper-detailed, award-winning film quality, no human face talking, pure atmospheric visual world.",
  ];

  return promptParts.join(" ");
}
