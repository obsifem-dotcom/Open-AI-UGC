export const ADMIN_INITIAL_CREDITS = 999999;

export const PRICING_CONFIG = {
  currency: "USD",
  billing_cycle: "monthly",
};

export const CREDIT_PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    originalPrice: 39,
    priceUsd: 29,
    priceLabel: "$29 USD",
    originalPriceLabel: "$39 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $29 USD/mes",
    costPerCreditLabel: "$0.0145 / CR",
    credits: 2000,
    videoEstimate: "10 - 15 videos cortos o carruseles al mes",
    videoCapacityLabel: "10 - 15 videos cortos o carruseles al mes",
    targetAudience: "Creadores independientes y emprendedores que inician",
    popular: false,
    badge: "Para Emprendedores",
    description:
      "Diseñado para creadores independientes y emprendedores que inician su presencia en redes y anuncios.",
    features: [
      "10 - 15 videos cortos o carruseles al mes (2,000 Créditos)",
      "Generación estándar con plantillas prediseñadas",
      "Voces sintéticas básicas",
      "Exportación en alta calidad",
      "15 Avatares de Stock / Estudio (7 idiomas)",
      "Entorno Virtual #8B5CF6 & Blanco + Croma Key",
    ],
    entitlements: [
      "10 - 15 videos cortos o carruseles al mes",
      "Generación estándar con plantillas prediseñadas",
      "Voces sintéticas básicas",
      "Exportación en alta calidad",
      "Uso comercial incluido",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 79,
    originalPrice: 99,
    priceUsd: 79,
    priceLabel: "$79 USD",
    originalPriceLabel: "$99 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $79 USD/mes",
    costPerCreditLabel: "$0.0131 / CR",
    credits: 6000,
    videoEstimate: "30 - 40 videos al mes (ritmo diario)",
    videoCapacityLabel: "30 - 40 videos al mes (ritmo diario)",
    targetAudience: "Pequeños negocios, marcas locales y creadores de contenido",
    popular: false,
    badge: "Marcas & Negocios",
    description:
      "Ideal para pequeños negocios, marcas locales y creadores que publican contenido a diario.",
    features: [
      "30 - 40 videos al mes (ritmo diario • 6,000 Créditos)",
      "Subtitulado automático y transiciones dinámicas",
      "Selección de avatares estándar de alta fidelidad",
      "Soporte para bloques de capítulos y videos más largos",
      "Ingesta E-Commerce por URL (Shopify / Amazon / ML)",
      "6 Estudios Virtuales HeyGen + Croma Key Pro",
    ],
    entitlements: [
      "30 - 40 videos al mes (ritmo diario)",
      "Subtitulado automático y transiciones dinámicas",
      "Selección de avatares estándar de alta fidelidad",
      "Soporte para bloques de capítulos y videos más largos",
      "Ingesta por URL E-Commerce + Text-To-Timeline",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 199,
    originalPrice: 249,
    priceUsd: 199,
    priceLabel: "$199 USD",
    originalPriceLabel: "$249 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $199 USD/mes",
    costPerCreditLabel: "$0.0099 / CR",
    credits: 20000,
    videoEstimate: "100 - 150 videos al mes o créditos expandidos",
    videoCapacityLabel: "100 - 150 videos al mes o créditos expandidos",
    targetAudience: "Agencias de marketing y creadores con pauta publicitaria",
    popular: true,
    badge: "⭐ El Más Elegido",
    description:
      "Para agencias de marketing y creadores con pauta publicitaria que necesitan escala y gemelos digitales.",
    features: [
      "100 - 150 videos al mes o créditos expandidos (20,000 Créditos)",
      "Clonación de voz y gemelos digitales básicos (Video 2-5m • #8B5CF6)",
      "Creación de Agentes de Ventas virtuales con guiones de venta",
      "Variantes automáticas de ganchos (hooks) y CTAs para anuncios",
      "10 Estudios Virtuales HeyGen + Fondos Personalizados",
      "Pipeline Universal YouTube Largo (4 Capítulos × 5 min + B-Roll 25s)",
    ],
    entitlements: [
      "100 - 150 videos al mes o créditos expandidos",
      "Clonación de voz y gemelos digitales básicos",
      "Creación de Agentes de Ventas virtuales con guiones de venta",
      "Variantes automáticas de ganchos (hooks) y CTAs para anuncios",
      "Pipeline YouTube Largo (4×5m) + 10 Estudios HeyGen",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 499,
    originalPrice: 599,
    priceUsd: 499,
    priceLabel: "$499 USD",
    originalPriceLabel: "$599 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $499 USD/mes",
    costPerCreditLabel: "$0.0083 / CR",
    credits: 60000,
    videoEstimate: "Volumen alto de generación de video con procesamiento prioritario",
    videoCapacityLabel: "Volumen alto de generación con procesamiento prioritario",
    targetAudience: "Empresas medianas, clínicas y equipos de alto rendimiento",
    popular: false,
    badge: "Empresarial & Equipos",
    description:
      "Potencia empresarial para empresas medianas, clínicas y equipos de alto rendimiento.",
    features: [
      "Volumen alto de generación de video con procesamiento prioritario (60,000 Créditos)",
      "Múltiples asientos de equipo y workspaces colaborativos",
      "Clonación avanzada de rostros y voces con ultra-realismo",
      "Automatización mediante flujos avanzados por lotes y multicanal",
      "Todos los motores en 1080p y 4K sin colas de espera",
      "Licencia comercial empresarial completa y soporte dedicado",
    ],
    entitlements: [
      "Volumen alto de generación con procesamiento prioritario",
      "Múltiples asientos de equipo y workspaces colaborativos",
      "Clonación avanzada de rostros y voces con ultra-realismo",
      "Automatización mediante flujos avanzados por lotes y multicanal",
      "Render 4K prioritario + Licencia Comercial Transferible",
    ],
  },
];

export const FREE_DEMO_PACKAGE = {
  id: "demo",
  name: "Demo Gratuito",
  price: 0,
  originalPrice: 0,
  priceUsd: 0,
  priceLabel: "GRATIS",
  originalPriceLabel: "",
  billingCycle: "once",
  billingNote: "Sin tarjeta • 1 demo por correo",
  costPerCreditLabel: "$0",
  credits: 300,
  videoEstimate: "1 - 3 videos cortos de prueba (hasta 300 CR)",
  videoCapacityLabel: "1 - 3 videos cortos de prueba (Seedance 2, Happy Horse o Grok)",
  targetAudience: "Quienes quieren probar la aplicación antes de comprar",
  popular: false,
  badge: "Prueba Gratis",
  description:
    "Prueba UGCore Studio sin costo: genera tus primeros videos y conoce los avatares, estudios virtuales y el selector de hooks.",
  features: [
    "300 créditos de cortesía (suficiente para Seedance 2, Happy Horse o Grok)",
    "Acceso a los 15 avatares de stock",
    "Entorno virtual #8B5CF6 & Blanco",
    "Selector de hooks virales y tendencias",
    "Sin tarjeta de crédito",
  ],
  entitlements: [
    "300 créditos únicos de prueba",
    "Videos cortos de hasta 10s",
    "15 avatares de stock y 1 entorno virtual",
    "Mejora a un plan de pago cuando quieras",
  ],
};

export function getPackageById(planId) {
  if (planId === "demo") return FREE_DEMO_PACKAGE;
  const normalizedId = planId === "pro" ? "professional" : planId;
  return (
    CREDIT_PACKAGES.find((p) => p.id === normalizedId || p.id === planId) ||
    CREDIT_PACKAGES[2] // default professional
  );
}
