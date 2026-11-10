export const AI_INFLUENCERS = [
  {
    id: "sofia-lifestyle",
    name: "Sofía Morales",
    niche: "Lifestyle, Belleza & E-commerce",
    badge: "Top Conversión",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    visualPrompt:
      "Young charismatic Latina female UGC creator in her mid-20s, natural glowing skin, warm expressive smile, casual chic outfit in a sunlit modern apartment, speaking directly to the camera in a handheld smartphone selfie style, natural hand gestures, high-converting TikTok/Reels UGC aesthetic",
    tone: "Cercana, entusiasta y auténtica",
  },
  {
    id: "mateo-tech",
    name: "Mateo Rivera",
    niche: "Tech, Apps, SaaS & Negocios",
    badge: "B2B & Apps",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    visualPrompt:
      "Confident male tech creator in his late 20s, smart casual shirt, modern studio workspace with subtle warm LED background lighting, speaking clearly to camera with engaging energy and professional credibility, realistic UGC creator style",
    tone: "Experto, dinámico y convincente",
  },
  {
    id: "valentina-fitness",
    name: "Valentina Cruz",
    niche: "Fitness, Salud & Bienestar",
    badge: "Energía Alta",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    visualPrompt:
      "Energetic young female fitness and wellness influencer, athletic wear, bright airy lifestyle setting, vibrant expression, speaking enthusiastically to the camera with authentic creator charisma, vertical UGC video style",
    tone: "Motivadora, fresca y enérgica",
  },
  {
    id: "lucas-unboxing",
    name: "Lucas Herrera",
    niche: "Productos Virales & Reviews",
    badge: "TikTok Viral",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    visualPrompt:
      "Relatable male UGC creator in his 20s, casual streetwear hoodie, cozy home room background, expressive facial reactions, holding and showcasing item to camera, authentic viral TikTok review style",
    tone: "Directo, espontáneo y persuasivo",
  },
  {
    id: "camila-pro",
    name: "Camila Vargas",
    niche: "Servicios, Finanzas & Consultoría",
    badge: "Ejecutiva",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    visualPrompt:
      "Polished professional female creator in her early 30s, elegant blazer, bright modern office background, trustworthy and articulate delivery to camera, premium brand spokesperson UGC style",
    tone: "Profesional, clara y confiable",
  },
  {
    id: "diego-media",
    name: "Diego Mendoza",
    niche: "Promoción de Videos, Cursos & Eventos",
    badge: "Storyteller",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    visualPrompt:
      "Charismatic male content creator in a creative studio setup with microphone and warm cinematic lighting, expressive storytelling gestures, pointing and reacting to camera, high-retention social video style",
    tone: "Carismático, intrigante y viral",
  },
];

export const PROMO_CATEGORIES = [
  {
    id: "product",
    label: "Promocionar Producto",
    namePlaceholder: "Ej: Sérum Facial Vitamina C / Smartwatch Pro",
    benefitPlaceholder:
      "Ej: Resultados visibles en 7 días, resistente al agua, 30% OFF hoy",
    ctaPlaceholder: "Ej: Pídelo ahora en el link de mi perfil",
    styles: [
      { id: "showcase", label: "Mostrando y usando el producto en cámara" },
      { id: "unboxing", label: "Unboxing y primera impresión honesta" },
      { id: "problem-solution", label: "Problema → Solución con el producto" },
    ],
  },
  {
    id: "service",
    label: "Promocionar Servicio",
    namePlaceholder:
      "Ej: Agencia de Marketing / Clínica Dental / Asesoría Legal",
    benefitPlaceholder:
      "Ej: Duplica tus clientes en 30 días con atención personalizada",
    ctaPlaceholder: "Ej: Agenda tu consulta gratis hoy mismo",
    styles: [
      { id: "testimonial", label: "Recomendación / Caso de éxito real" },
      { id: "explainer", label: "Explicación experta de cómo funciona" },
      { id: "urgency", label: "Oferta especial por tiempo limitado" },
    ],
  },
  {
    id: "video",
    label: "Promocionar un Video / Contenido",
    namePlaceholder:
      "Ej: Nuevo video en YouTube / Masterclass gratuita / Lanzamiento",
    benefitPlaceholder:
      "Ej: Revelamos el paso a paso exacto que nadie cuenta en el minuto 3",
    ctaPlaceholder: "Ej: Ve a ver el video completo ahora, link en bio",
    styles: [
      { id: "hook-invite", label: "Hook de intriga + Invitación a ver el video" },
      { id: "reaction", label: "Reacción sorprendida + Comentario del video" },
      { id: "summary", label: "Resumen de 3 puntos clave + Llamado a verlo" },
    ],
  },
];

export function buildInfluencerScript({
  influencer,
  promoType = "product",
  name = "",
  benefit = "",
  cta = "",
  style = "showcase",
  extraNotes = "",
  useInfluencerAvatar = true,
  hasUploadedAsset = false,
}) {
  const cleanName = name.trim() || (promoType === "product" ? "este producto increíble" : promoType === "service" ? "este servicio" : "este nuevo video");
  const cleanBenefit =
    benefit.trim() ||
    "cambia por completo tus resultados desde el primer día";
  const cleanCta =
    cta.trim() || "Haz clic en el enlace ahora mismo para aprovecharlo";

  const actorDescription = influencer
    ? `${influencer.visualPrompt}.`
    : "Realistic charismatic UGC creator speaking directly to the camera in a vertical 9:16 social media video.";

  const imageRefs = [];
  if (useInfluencerAvatar && influencer) {
    imageRefs.push("@image1 as the AI influencer character speaking to camera");
  }
  if (hasUploadedAsset) {
    const assetIdx = useInfluencerAvatar && influencer ? "@image2" : "@image1";
    imageRefs.push(
      promoType === "product"
        ? `featuring and holding the product from ${assetIdx}`
        : `showcasing the visual reference from ${assetIdx}`
    );
  }
  const refPrefix = imageRefs.length > 0 ? `${imageRefs.join(", ")}. ` : "";

  let actionDirection = "";
  let spokenLines = [];

  if (promoType === "product") {
    if (style === "unboxing") {
      actionDirection = `The influencer unboxes and holds up "${cleanName}" close to the camera with an impressed, excited expression, demonstrating its quality.`;
    } else if (style === "problem-solution") {
      actionDirection = `The influencer starts with a relatable frustrated look, then smiles brightly while holding up "${cleanName}" as the ultimate solution.`;
    } else {
      actionDirection = `The influencer holds "${cleanName}" naturally in hand, showing it to the camera and demonstrating how it works while speaking enthusiastically.`;
    }

    spokenLines = [
      `¡Tienes que ver esto! Desde que probé ${cleanName}, noté la diferencia de inmediato.`,
      `Lo mejor es que ${cleanBenefit}.`,
      `${cleanCta}.`,
    ];
  } else if (promoType === "service") {
    if (style === "explainer") {
      actionDirection = `The influencer explains clearly with confident hand gestures how the service "${cleanName}" works and why it stands out.`;
    } else if (style === "urgency") {
      actionDirection = `The influencer leans in closer to the camera with high energy, sharing an exclusive opportunity with "${cleanName}".`;
    } else {
      actionDirection = `The influencer shares a genuine, trustworthy recommendation for the service "${cleanName}" with a warm smile.`;
    }

    spokenLines = [
      `Si estás buscando resultados de verdad, necesitas conocer ${cleanName}.`,
      `Te ayudan a lograr que ${cleanBenefit} sin complicaciones.`,
      `${cleanCta}.`,
    ];
  } else {
    // promoType === "video"
    if (style === "reaction") {
      actionDirection = `The influencer reacts with genuine surprise and excitement while pointing toward the screen/video topic "${cleanName}" and talking to the viewer.`;
    } else if (style === "summary") {
      actionDirection = `The influencer counts key takeaways on their fingers with dynamic energy, promoting the video "${cleanName}".`;
    } else {
      actionDirection = `The influencer hooks the viewer immediately with an intrigued expression, inviting them to watch the video "${cleanName}".`;
    }

    spokenLines = [
      `¡Para todo y mira esto! Acaba de salir ${cleanName} y está dando muchísimo de qué hablar.`,
      `Ahí explican exactamente cómo ${cleanBenefit}.`,
      `${cleanCta}.`,
    ];
  }

  const extra = extraNotes.trim() ? ` ${extraNotes.trim()}.` : "";

  const singleScript = `${refPrefix}${actorDescription} ${actionDirection}${extra} Speaking in Spanish with natural lip-sync: "${spokenLines.join(" ")}"`;

  const multiScenes = [
    {
      label: "Escena 1 (Hook con Influencer)",
      prompt: `${refPrefix}${actorDescription} Opening hook, looking directly into the lens with expressive energy. ${actionDirection} Speaking in Spanish: "${spokenLines[0]}"`,
    },
    {
      label: "Escena 2 (Demostración y Beneficio)",
      prompt: `${refPrefix}${actorDescription} Close-up and medium shot showcasing "${cleanName}" and highlighting its value.${extra} Speaking in Spanish: "${spokenLines[1]}"`,
    },
    {
      label: "Escena 3 (Prueba y Llamado a la Acción)",
      prompt: `${refPrefix}${actorDescription} Smiling confidently at the camera, pointing down to the link with a clear call to action. Speaking in Spanish: "${spokenLines[2]}"`,
    },
  ];

  return {
    singleScript,
    multiScenes,
  };
}
