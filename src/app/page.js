"use client";

import { useSession } from "next-auth/react";
import {
  FiArrowUp,
  FiVideo,
  FiX,
  FiSearch,
  FiChevronDown,
  FiZap,
  FiImage,
  FiPlus,
  FiLoader,
  FiTrash2,
  FiAlertCircle,
  FiFilm,
  FiList,
  FiUserCheck,
  FiShoppingBag,
  FiBriefcase,
  FiPlayCircle,
  FiCheck,
  FiTrendingUp,
  FiLink,
  FiLayers,
  FiCpu,
} from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCoins } from "react-icons/fa";
import SeamlessVideoPlayer from "@/components/SeamlessVideoPlayer";
import { getPackageById } from "@/lib/runtime-store";
import {
  AI_INFLUENCERS,
  INFLUENCER_LANGUAGES,
  INFLUENCER_FACE_PRESETS,
  INFLUENCER_PERSONA_STYLES,
  INFLUENCER_WARDROBE_OPTIONS,
  INFLUENCER_VIRTUAL_ENVIRONMENTS,
  INFLUENCER_COMPOSITING_MODES,
  DIGITAL_TWIN_SPEC,
  PROMO_CATEGORIES,
  buildDigitalTwinProfile,
  buildInfluencerScript,
} from "@/lib/influencers";
import {
  SOCIAL_PLATFORMS,
  EMOTION_PROFILES,
  MICRO_EXPRESSIONS,
  TIMELINE_TRANSITIONS,
  COMMERCIAL_VOICE_PROFILES,
  YOUTUBE_LONGFORM_CONFIG,
  generatePredictiveHooks,
  buildCharacterConsistencyLock,
  buildYouTubeLongFormBlueprint,
} from "@/lib/ugcore-v3";

const MODELS = [
  {
    id: "grok-video",
    name: "Grok Video",
    type: "MODEL",
    icon: FiVideo,
    description:
      "xAI's Grok video generation model with text-to-video and image-to-video modes.",
    supportsTextToVideo: true,
    maxClipDuration: 30,
    minClipDuration: 6,
    params: {
      aspect_ratio: {
        options: ["9:16", "16:9", "2:3", "3:2", "1:1"],
        default: "9:16",
      },
      mode: { options: ["fun", "normal", "spicy"], default: "normal" },
      resolution: { options: ["480p", "720p"], default: "720p" },
      duration: { min: 6, max: 30, default: 6 },
    },
  },
  {
    id: "veo-3-1",
    name: "Veo 3.1",
    type: "MODEL",
    icon: FiVideo,
    description:
      "Google's high-fidelity video generation model with realistic movement.",
    supportsTextToVideo: true,
    maxClipDuration: 8,
    minClipDuration: 8,
    fixedClipDuration: 8,
    params: {
      aspect_ratio: { options: ["16:9", "9:16"], default: "9:16" },
      duration: { options: [8], default: 8 },
      resolution: { options: ["720p", "1080p", "4k"], default: "720p" },
    },
  },
  {
    id: "happy-horse",
    name: "Happy Horse 1",
    type: "MODEL",
    icon: FiZap,
    description: "Fast and expressive animation model for lifelike motion.",
    supportsTextToVideo: true,
    maxClipDuration: 15,
    minClipDuration: 3,
    params: {
      aspect_ratio: {
        options: ["16:9", "9:16", "1:1", "4:3", "3:4"],
        default: "9:16",
      },
      duration: { min: 3, max: 15, default: 5 },
    },
  },
  {
    id: "seedance-2",
    name: "Seedance 2",
    type: "MODEL",
    icon: FiVideo,
    description: "Advanced video animation with character reference support.",
    supportsTextToVideo: false,
    maxClipDuration: 15,
    minClipDuration: 4,
    params: {
      aspect_ratio: {
        options: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
        default: "9:16",
      },
      duration: { min: 4, max: 15, default: 5 },
    },
  },
];

const LONG_VIDEO_PRESETS = [30, 45, 60, 90, 120, 180];

const getModelDefaults = (model) =>
  Object.fromEntries(
    Object.entries(model.params || {}).map(([key, parameter]) => [
      key,
      parameter.default,
    ])
  );

function CustomDropdown({ label, value, options, onChange, unit = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        if (!containerRef.current.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all hover:bg-slate-100 ${isOpen ? "bg-slate-100" : ""}`}
      >
        <span className="text-xs font-medium text-slate-600 capitalize">
          {label}
        </span>
        <span className="text-xs font-medium text-slate-900">
          {value}
          {unit}
        </span>
        <FiChevronDown
          className={`text-xs text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-300 rounded shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[10000]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-100 transition-colors ${opt === value ? "text-slate-900 bg-slate-50" : "text-slate-500"}`}
            >
              {opt}
              {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeParameter({
  label,
  value,
  min,
  max,
  step = 1,
  presets = [],
  unit = "",
  helperText = "",
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        if (!containerRef.current.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all hover:bg-slate-100 ${isOpen ? "bg-slate-100" : ""}`}
      >
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-medium text-slate-900">
          {value}
          {unit}
        </span>
        <FiChevronDown
          className={`text-xs text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-slate-300 rounded shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 z-[10000]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">{label}</span>
            <span className="text-xs font-bold text-slate-900">
              {value}
              {unit}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
          />
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(preset)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                    value === preset
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset}
                  {unit}
                </button>
              ))}
            </div>
          )}
          {helperText && (
            <p className="mt-2.5 text-[10px] font-semibold text-indigo-600 leading-snug">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: session, status, update: updateSession } = useSession();
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);

  const isAdminUser = Boolean(
    session?.user?.isAdmin ||
      session?.user?.role === "admin" ||
      session?.user?.email === "obsifem@gmail.com"
  );
  const availableCredits =
    typeof session?.user?.credits === "number"
      ? session.user.credits
      : isAdminUser
      ? 999999
      : 1500;
  const assignedCredits =
    typeof session?.user?.assignedCredits === "number"
      ? session.user.assignedCredits
      : availableCredits;

  const activeBuyerPackage = getPackageById(
    session?.user?.planId ||
      (assignedCredits >= 25000
        ? "business"
        : assignedCredits >= 10000
        ? "pro"
        : assignedCredits >= 4000
        ? "standard"
        : "basic")
  );
  const [showEntitlementsBanner, setShowEntitlementsBanner] = useState(false);

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [modelSettings, setModelSettings] = useState(() =>
    getModelDefaults(MODELS[0])
  );

  // Video length mode: "short" vs "long"
  const [videoMode, setVideoMode] = useState("short");
  // Inside "long" mode: "auto" vs "scenes"
  const [longSubMode, setLongSubMode] = useState("auto");
  const [longTotalDuration, setLongTotalDuration] = useState(60);
  const [scenes, setScenes] = useState([
    { id: "s1", label: "Escena 1 (Hook)", prompt: "", duration: 15, transition: "zoom-in" },
    { id: "s2", label: "Escena 2 (Producto / Demo)", prompt: "", duration: 15, transition: "cut" },
    { id: "s3", label: "Escena 3 (Beneficios y CTA)", prompt: "", duration: 15, transition: "cut" },
  ]);

  // AI Influencer & Promotion Studio state (15 Influencers with Minimal Config presets)
  const [isInfluencerMode, setIsInfluencerMode] = useState(false);
  const [isMinimalInfluencerConfig, setIsMinimalInfluencerConfig] =
    useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState(
    AI_INFLUENCERS[0]
  );
  const [useInfluencerReferenceImage, setUseInfluencerReferenceImage] =
    useState(true);
  const [promoType, setPromoType] = useState(
    AI_INFLUENCERS[0]?.defaultPromoType || "product"
  ); // "product" | "service" | "video"
  const [promoName, setPromoName] = useState("");
  const [promoBenefit, setPromoBenefit] = useState("");
  const [promoCta, setPromoCta] = useState("");
  const [promoStyle, setPromoStyle] = useState(
    AI_INFLUENCERS[0]?.defaultStyle || "showcase"
  );
  const [influencerLanguage, setInfluencerLanguage] = useState("es-latam");
  const [influencerFacePresetId, setInfluencerFacePresetId] =
    useState("preset");
  const [customFaceUrl, setCustomFaceUrl] = useState("");
  const [isUploadingCustomFace, setIsUploadingCustomFace] = useState(false);
  const [customFaceTrait, setCustomFaceTrait] = useState("");
  const [influencerPersonaStyleId, setInfluencerPersonaStyleId] =
    useState("preset");
  const [influencerWardrobeId, setInfluencerWardrobeId] = useState("preset");
  const [customWardrobeText, setCustomWardrobeText] = useState("");
  const faceInputRef = useRef(null);

  // HeyGen-Style Virtual Environments & Chroma / Realistic Compositing state
  const [influencerVirtualEnvId, setInfluencerVirtualEnvId] = useState(
    "wellness-violet-white"
  );
  const [influencerCompositingModeId, setInfluencerCompositingModeId] =
    useState("realistic-relight");
  const [customEnvText, setCustomEnvText] = useState("");
  const [customEnvImageUrl, setCustomEnvImageUrl] = useState("");
  const [isUploadingCustomEnv, setIsUploadingCustomEnv] = useState(false);
  const [useVirtualEnvImageRef, setUseVirtualEnvImageRef] = useState(true);
  const envInputRef = useRef(null);

  // Dual Avatar Selector: (1) Stock / Studio Avatars vs (2) Digital Twin / Custom Avatar (2-5m + Consent • #8B5CF6)
  const [avatarSourceType, setAvatarSourceType] = useState("stock"); // "stock" | "digital-twin"
  const [customDigitalTwins, setCustomDigitalTwins] = useState([]);
  const [twinName, setTwinName] = useState("Mi Gemelo Digital IA");
  const [twinUcid, setTwinUcid] = useState("UCID-TWIN-01");
  const [twinVideoFileName, setTwinVideoFileName] = useState("");
  const [twinVideoDurationMinutes, setTwinVideoDurationMinutes] = useState(3.0);
  const [twinVideoPreviewUrl, setTwinVideoPreviewUrl] = useState("");
  const [twinFaceImageUrl, setTwinFaceImageUrl] = useState("");
  const [isUploadingTwinMedia, setIsUploadingTwinMedia] = useState(false);
  const [twinVoiceLanguageId, setTwinVoiceLanguageId] = useState("es-latam");
  const [twinConsentAccepted, setTwinConsentAccepted] = useState(false);
  const [twinConsentSignerName, setTwinConsentSignerName] = useState("");
  const [isProcessingTwin, setIsProcessingTwin] = useState(false);
  const twinVideoInputRef = useRef(null);
  const twinFaceInputRef = useRef(null);

  // UGCore Studio v3.0 — Active Architectural Module Tab
  // null | "intelligence" | "ecommerce" | "timeline" | "consistency"
  const [activeV3Module, setActiveV3Module] = useState(null);

  // Module 1: Pre-Production Intelligence Engine state
  const [targetPlatform, setTargetPlatform] = useState("tiktok");
  const [predictiveHooks, setPredictiveHooks] = useState(() =>
    generatePredictiveHooks({ platform: "tiktok" })
  );
  const [isLoadingHooks, setIsLoadingHooks] = useState(false);

  // Module 2: Instant E-Commerce URL-to-Video state
  const [ecommerceUrl, setEcommerceUrl] = useState("");
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [extractedProduct, setExtractedProduct] = useState(null);

  // Module 3: Text-Based Hybrid Timeline & Multilayer Overlays state
  const [overlaySubtitle, setOverlaySubtitle] = useState("");
  const [overlayLowerThird, setOverlayLowerThird] = useState("");
  const [overlayCtaBadge, setOverlayCtaBadge] = useState("");

  // Module 4: Advanced Character Consistency (UCID) & Micro-Expression Engine state
  const [ucidLockEnabled, setUcidLockEnabled] = useState(true);
  const [ucidCode, setUcidCode] = useState("UCID-SOFIA-01");
  const [wardrobeLock, setWardrobeLock] = useState(true);
  const [lightingLock, setLightingLock] = useState(true);
  const [emotionId, setEmotionId] = useState("euphoric-viral");
  const [voiceProfileId, setVoiceProfileId] = useState("es-latam-commercial");
  const [microExpressionIds, setMicroExpressionIds] = useState([
    "eye-contact-lock",
    "natural-breathing",
    "hand-gestures",
  ]);

  // Module 5: Universal YouTube Long-Form Pipeline (4 Chapters × 5 Min • B-Roll every 25s • #8B5CF6 & #FFFFFF)
  const [ytTopic, setYtTopic] = useState(
    "Estrategias de Automatización e Inteligencia Artificial para Escalar Negocios Digitales"
  );
  const [ytBlueprint, setYtBlueprint] = useState(() =>
    buildYouTubeLongFormBlueprint({
      topic:
        "Estrategias de Automatización e Inteligencia Artificial para Escalar Negocios Digitales",
      influencerName: AI_INFLUENCERS[0]?.name || "Presentador IA",
      bRollIntervalSeconds: 25,
      primaryHex: "#8B5CF6",
      secondaryHex: "#FFFFFF",
    })
  );
  const [selectedYtChapter, setSelectedYtChapter] = useState(1);
  const [copiedYtMeta, setCopiedYtMeta] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [lastGeneration, setLastGeneration] = useState(null);
  const fileInputRef = useRef(null);

  const currentPromoCategory =
    PROMO_CATEGORIES.find((c) => c.id === promoType) || PROMO_CATEGORIES[0];

  const syncCreationToLocalArchive = (creationObj) => {
    if (!creationObj || !creationObj.id || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("ugcore_creations_archive_v1");
      const list = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(list) ? list : [];
      const existingIdx = arr.findIndex((c) => c.id === creationObj.id);
      const mergedItem =
        existingIdx >= 0
          ? { ...arr[existingIdx], ...creationObj }
          : {
              createdAt: new Date().toISOString(),
              ...creationObj,
            };
      const nextList =
        existingIdx >= 0
          ? arr.map((c, idx) => (idx === existingIdx ? mergedItem : c))
          : [mergedItem, ...arr].slice(0, 60);
      window.localStorage.setItem(
        "ugcore_creations_archive_v1",
        JSON.stringify(nextList)
      );
    } catch {
      // ignore storage errors
    }
  };

  // Load reused prompt from Gallery if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPrompt = window.sessionStorage.getItem("ugcore_reuse_prompt");
    if (savedPrompt) {
      window.sessionStorage.removeItem("ugcore_reuse_prompt");
      setTimeout(() => setPrompt(savedPrompt), 0);
    }
  }, []);

  // Polling for last generation status
  useEffect(() => {
    let interval;
    const activeStatuses = ["processing", "pending", "starting", "queued"];
    if (lastGeneration && activeStatuses.includes(lastGeneration.status)) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/creations/${lastGeneration.id}`);
          if (res.ok) {
            const data = await res.json();
            setLastGeneration(data);
            syncCreationToLocalArchive(data);
            if (!activeStatuses.includes(data.status)) {
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [lastGeneration]);

  const toggleV3Module = (modName) => {
    setActiveV3Module((prev) => (prev === modName ? null : modName));
  };

  // Module 5 handler: Universal YouTube Long-Form Blueprint (4 Chapters × 5 Min • B-Roll every 25s • #8B5CF6 & #FFFFFF)
  const handleGenerateYouTubeBlueprint = (customTopic = ytTopic) => {
    const bp = buildYouTubeLongFormBlueprint({
      topic: customTopic,
      influencerName: selectedInfluencer?.name || "Presentador IA",
      bRollIntervalSeconds: 25,
      primaryHex: "#8B5CF6",
      secondaryHex: "#FFFFFF",
    });
    setYtBlueprint(bp);
    return bp;
  };

  const handleApplyYouTubeToTimeline = () => {
    const bp = handleGenerateYouTubeBlueprint(ytTopic);
    setVideoMode("long");
    setLongSubMode("scenes");
    if (selectedModel?.params?.aspect_ratio?.options?.includes("16:9")) {
      setModelSettings((prev) => ({ ...prev, aspect_ratio: "16:9" }));
    }
    const defaultDur =
      selectedModel.fixedClipDuration ||
      Math.min(30, selectedModel.maxClipDuration || 15);
    setScenes(
      bp.chapters.map((ch, idx) => ({
        id: `yt-ch-${ch.chapterNumber}`,
        label: `Cap. ${ch.chapterNumber} (${ch.startTimestamp}-${ch.endTimestamp} • 5m • ${ch.bRollCount} B-Rolls)`,
        prompt: ch.scenePrompt,
        duration: defaultDur,
        transition: idx === 0 ? "zoom-in" : "whip-pan",
      }))
    );
    setOverlayCtaBadge("IDENTIDAD #8B5CF6 & #FFFFFF • B-ROLL 25S");
    setOverlayLowerThird(bp.seoMetadata.title.slice(0, 68));
    setOverlaySubtitle(`00:00 Cap.1 | 05:00 Cap.2 | 10:00 Cap.3 | 15:00 Cap.4`);
  };

  const handleCopyYouTubeMetadata = async () => {
    const bp = ytBlueprint || handleGenerateYouTubeBlueprint(ytTopic);
    const exportPayload = [
      `=== METADATOS YOUTUBE FORMATO LARGO (UGCORE STUDIO) ===`,
      `TÍTULO SEO: ${bp.seoMetadata.title}`,
      `IDENTIDAD VISUAL: #8B5CF6 (Violeta) & #FFFFFF (Blanco) | B-Roll cada 25s (48 inserciones)`,
      ``,
      `DESCRIPCIÓN + MARCAS DE TIEMPO AUTOMÁTICAS:`,
      bp.seoMetadata.description,
      ``,
      `TAGS: ${bp.seoMetadata.tags.join(", ")}`,
      `PROMPT MINIATURA (16:9): ${bp.seoMetadata.thumbnailPrompt}`,
      ``,
      `=== MATRIZ DE INSERCIÓN DE B-ROLL (CADA 25 SEGUNDOS) ===`,
      bp.seoMetadata.bRollScheduleText,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(exportPayload);
      setCopiedYtMeta(true);
      setTimeout(() => setCopiedYtMeta(false), 2500);
    } catch (e) {
      console.error("Clipboard error:", e);
    }
  };

  const handleDownloadYouTubeMetadata = () => {
    const bp = ytBlueprint || handleGenerateYouTubeBlueprint(ytTopic);
    const jsonString = JSON.stringify(bp, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ugcore-youtube-longform-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Module 1 handler: analyze trends & predictive hooks
  const handleAnalyzeHooks = async (plat = targetPlatform) => {
    setTargetPlatform(plat);
    setIsLoadingHooks(true);
    try {
      const res = await fetch("/api/intelligence/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: promoName || prompt.slice(0, 60),
          benefit: promoBenefit,
          platform: plat,
          promoType,
        }),
      });
      const data = await res.json();
      if (data.hooks) {
        setPredictiveHooks(data.hooks);
      }
    } catch (err) {
      console.error("Failed to fetch predictive hooks:", err);
    } finally {
      setIsLoadingHooks(false);
    }
  };

  const applyViralHook = (hookItem, asMultiScene = false) => {
    if (asMultiScene && Array.isArray(hookItem.scenes)) {
      setVideoMode("long");
      setLongSubMode("scenes");
      const defaultDur =
        selectedModel.fixedClipDuration ||
        Math.min(15, selectedModel.maxClipDuration || 15);
      setScenes(
        hookItem.scenes.map((sc, idx) => ({
          id: `viral-sc-${idx + 1}`,
          label: sc.label || `Escena ${idx + 1}`,
          prompt: sc.prompt,
          duration: defaultDur,
          transition: sc.transition || "cut",
        }))
      );
    } else {
      setPrompt(hookItem.hookText);
    }
    setOverlaySubtitle(hookItem.hookText.slice(0, 50));
  };

  // Module 2 handler: Instant E-Commerce URL-to-Video extraction
  const handleExtractEcommerceUrl = async (e) => {
    if (e) e.preventDefault();
    if (!ecommerceUrl.trim()) return;
    setIsExtractingUrl(true);
    try {
      const res = await fetch("/api/ecommerce/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ecommerceUrl.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const prod = data.product;
      setExtractedProduct(prod);
      setIsInfluencerMode(true);
      setPromoType("product");
      setPromoName(prod.title || "");
      setPromoBenefit(prod.benefit || "");
      setPromoCta(prod.cta || "");

      if (prod.price) {
        setOverlayCtaBadge(`OFERTA ${prod.price}`);
      } else {
        setOverlayCtaBadge("ENVÍO HOY • LINK EN BIO");
      }
      setOverlayLowerThird(prod.title || "");

      // Import extracted product images into uploadedImages
      if (Array.isArray(prod.images) && prod.images.length > 0) {
        const importedImgs = prod.images.map((imgUrl, idx) => ({
          id: `ecom-${Date.now()}-${idx}`,
          preview: imgUrl,
          url: imgUrl,
          status: "ready",
        }));
        setUploadedImages((prev) => [...prev, ...importedImgs].slice(0, 7));
      }

      if (data.hooks && data.hooks.length > 0) {
        setPredictiveHooks(data.hooks);
      }

      const activeVoiceObj =
        COMMERCIAL_VOICE_PROFILES.find((v) => v.id === voiceProfileId) ||
        COMMERCIAL_VOICE_PROFILES[0];

      // Build complete script automatically
      const { singleScript, multiScenes } = buildInfluencerScript({
        influencer: selectedInfluencer,
        promoType: "product",
        name: prod.title,
        benefit: prod.benefit,
        cta: prod.cta,
        style: "showcase",
        language: influencerLanguage,
        facePresetId: influencerFacePresetId,
        customFaceTrait,
        personaStyleId: influencerPersonaStyleId,
        wardrobeId: influencerWardrobeId,
        customWardrobeText,
        voiceDirective: activeVoiceObj.directive,
        useInfluencerAvatar:
          useInfluencerReferenceImage &&
          Boolean(getEffectiveInfluencerAvatar()),
        hasUploadedAsset: (prod.images?.length || 0) > 0,
      });

      if (videoMode === "long" && longSubMode === "scenes") {
        const defaultDur =
          selectedModel.fixedClipDuration ||
          Math.min(15, selectedModel.maxClipDuration || 15);
        setScenes(
          multiScenes.map((ms, idx) => ({
            id: `ecom-sc-${idx + 1}`,
            label: ms.label,
            prompt: ms.prompt,
            duration: defaultDur,
            transition: idx === 0 ? "zoom-in" : "cut",
          }))
        );
      } else {
        setPrompt(singleScript);
      }
    } catch (err) {
      alert(err.message || "No se pudo extraer la URL");
    } finally {
      setIsExtractingUrl(false);
    }
  };

  // Module 4 helper: toggle micro-expression
  const toggleMicroExpression = (id) => {
    setMicroExpressionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getEffectiveInfluencerAvatar = (inf = selectedInfluencer) => {
    if (influencerFacePresetId === "custom-upload" && customFaceUrl) {
      return customFaceUrl;
    }
    const facePreset = INFLUENCER_FACE_PRESETS.find(
      (f) => f.id === influencerFacePresetId
    );
    if (facePreset?.avatar) {
      return facePreset.avatar;
    }
    return inf?.avatar || null;
  };

  const getEffectiveVirtualEnvUrl = () => {
    if (influencerCompositingModeId === "pure-chroma-green") return null;
    if (
      influencerVirtualEnvId === "custom-environment" &&
      customEnvImageUrl
    ) {
      return customEnvImageUrl;
    }
    const envObj = INFLUENCER_VIRTUAL_ENVIRONMENTS.find(
      (env) => env.id === influencerVirtualEnvId
    );
    return envObj?.previewUrl || null;
  };

  const handleCustomEnvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCustomEnv(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("No se pudo subir el fondo virtual");
      const data = await response.json();
      setCustomEnvImageUrl(data.url);
      setInfluencerVirtualEnvId("custom-environment");
      setUseVirtualEnvImageRef(true);
    } catch (error) {
      console.error("Custom environment upload error:", error);
      alert("Error al subir la imagen de entorno virtual personalizado.");
    } finally {
      setIsUploadingCustomEnv(false);
      if (envInputRef.current) envInputRef.current.value = "";
    }
  };

  const handleCustomFaceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCustomFace(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("No se pudo subir la foto de rostro");
      const data = await response.json();
      setCustomFaceUrl(data.url);
      setInfluencerFacePresetId("custom-upload");
      setUseInfluencerReferenceImage(true);
    } catch (error) {
      console.error("Custom face upload error:", error);
      alert("Error al subir la foto de rostro personalizada.");
    } finally {
      setIsUploadingCustomFace(false);
      if (faceInputRef.current) faceInputRef.current.value = "";
    }
  };

  // Digital Twin / Custom Avatar (2 to 5 min training video + Biometric Consent • #8B5CF6) handlers
  const handleTwinVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingTwinMedia(true);
    try {
      setTwinVideoFileName(file.name);
      const localUrl = URL.createObjectURL(file);
      setTwinVideoPreviewUrl(localUrl);

      // Inspect video duration & extract a reference keyframe for @image1 face lock
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.src = localUrl;

      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 1800);
        videoEl.onloadedmetadata = () => {
          clearTimeout(timeout);
          if (videoEl.duration && Number.isFinite(videoEl.duration)) {
            const mins = Number((videoEl.duration / 60).toFixed(1));
            // Keep within 2.0 - 5.0 min spec or default to 3.0 min calibration
            setTwinVideoDurationMinutes(
              Math.min(5.0, Math.max(2.0, mins >= 0.1 ? mins : 3.0))
            );
          }
          resolve();
        };
        videoEl.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
      });
    } catch (err) {
      console.error("Error reading training video:", err);
    } finally {
      setIsUploadingTwinMedia(false);
      if (twinVideoInputRef.current) twinVideoInputRef.current.value = "";
    }
  };

  const handleTwinFaceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingTwinMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("No se pudo subir el fotograma facial");
      const data = await response.json();
      setTwinFaceImageUrl(data.url);
      setCustomFaceUrl(data.url);
    } catch (err) {
      console.error("Twin face upload error:", err);
      alert("Error al subir el fotograma facial del Gemelo Digital.");
    } finally {
      setIsUploadingTwinMedia(false);
      if (twinFaceInputRef.current) twinFaceInputRef.current.value = "";
    }
  };

  const handleCloneAndActivateDigitalTwin = () => {
    if (!twinConsentAccepted) {
      alert(
        "Debes marcar la casilla de Consentimiento Biométrico Expreso (2 a 5 min) para clonar el rostro y voz del Gemelo Digital."
      );
      return;
    }
    setIsProcessingTwin(true);
    setTimeout(() => {
      const langObj =
        INFLUENCER_LANGUAGES.find((l) => l.id === twinVoiceLanguageId) ||
        INFLUENCER_LANGUAGES[0];

      const newTwin = buildDigitalTwinProfile({
        name: twinName.trim() || "Mi Gemelo Digital IA",
        ucid:
          twinUcid.trim() ||
          `UCID-TWIN-${String(customDigitalTwins.length + 1).padStart(2, "0")}`,
        avatarUrl:
          twinFaceImageUrl ||
          customFaceUrl ||
          selectedInfluencer?.avatar ||
          AI_INFLUENCERS[0].avatar,
        trainingVideoName:
          twinVideoFileName ||
          `entrenamiento_gemelo_${twinVideoDurationMinutes}min.mp4`,
        trainingDurationMinutes: twinVideoDurationMinutes,
        consentVerified: true,
        voiceProfileLabel: `Voz Clonada Neural (${langObj.label})`,
        customTraits:
          customFaceTrait.trim() ||
          `Clonación facial y vocal de alta fidelidad (${twinVideoDurationMinutes} min) con identidad visual #8B5CF6 y blanco #FFFFFF`,
      });

      setCustomDigitalTwins((prev) => [
        newTwin,
        ...prev.filter((t) => t.id !== newTwin.id),
      ]);
      setSelectedInfluencer(newTwin);
      setUcidCode(newTwin.ucid);
      setInfluencerLanguage(twinVoiceLanguageId);
      if (langObj?.voiceProfileId) {
        setVoiceProfileId(langObj.voiceProfileId);
      }
      if (twinFaceImageUrl) {
        setCustomFaceUrl(twinFaceImageUrl);
        setInfluencerFacePresetId("custom-upload");
      } else {
        setInfluencerFacePresetId("preset");
      }
      setUseInfluencerReferenceImage(true);
      setInfluencerVirtualEnvId("wellness-violet-white");
      setIsProcessingTwin(false);
      applyInfluencerPromoToScript(newTwin);
    }, 350);
  };

  const handlePromoTypeChange = (newType) => {
    setPromoType(newType);
    const cat = PROMO_CATEGORIES.find((c) => c.id === newType);
    if (cat && cat.styles.length > 0) {
      setPromoStyle(cat.styles[0].id);
    }
  };

  const handleInfluencerLanguageChange = (newLangId) => {
    setInfluencerLanguage(newLangId);
    const langObj = INFLUENCER_LANGUAGES.find((l) => l.id === newLangId);
    if (langObj?.voiceProfileId) {
      setVoiceProfileId(langObj.voiceProfileId);
    }
  };

  const handleSelectInfluencer = (inf) => {
    setSelectedInfluencer(inf);
    setUcidCode(
      inf.ucid || `UCID-${inf.id.split("-")[0].toUpperCase()}-01`
    );
    if (inf.defaultPromoType) {
      setPromoType(inf.defaultPromoType);
    }
    if (inf.defaultStyle) {
      setPromoStyle(inf.defaultStyle);
    }
  };

  const applyInfluencerPromoToScript = (overrideInfluencer = null) => {
    const activeInf = overrideInfluencer || selectedInfluencer;
    const readyUploads = uploadedImages.filter((img) => img.status === "ready");
    const activeVoiceObj =
      COMMERCIAL_VOICE_PROFILES.find((v) => v.id === voiceProfileId) ||
      COMMERCIAL_VOICE_PROFILES[0];
    const effectiveAvatar = getEffectiveInfluencerAvatar(activeInf);
    const effectiveEnvUrl = getEffectiveVirtualEnvUrl();
    const hasAvatarRef =
      useInfluencerReferenceImage && Boolean(effectiveAvatar);
    const envImageTag =
      useVirtualEnvImageRef && effectiveEnvUrl
        ? `@image${
            (hasAvatarRef ? 1 : 0) + (readyUploads.length > 0 ? 1 : 0) + 1
          }`
        : "";

    const { singleScript, multiScenes } = buildInfluencerScript({
      influencer: activeInf,
      promoType: overrideInfluencer
        ? activeInf?.defaultPromoType || promoType
        : promoType,
      name: promoName,
      benefit: promoBenefit,
      cta: promoCta,
      style: overrideInfluencer
        ? activeInf?.defaultStyle || promoStyle
        : promoStyle,
      language: influencerLanguage,
      facePresetId: influencerFacePresetId,
      customFaceTrait,
      personaStyleId: influencerPersonaStyleId,
      wardrobeId: influencerWardrobeId,
      customWardrobeText,
      virtualEnvironmentId: influencerVirtualEnvId,
      compositingModeId: influencerCompositingModeId,
      customEnvironmentText: customEnvText,
      customEnvironmentImageTag: envImageTag,
      voiceDirective: activeVoiceObj.directive,
      useInfluencerAvatar: hasAvatarRef,
      hasUploadedAsset: readyUploads.length > 0,
    });

    if (videoMode === "long" && longSubMode === "scenes") {
      const defaultDur =
        selectedModel.fixedClipDuration ||
        Math.min(15, selectedModel.maxClipDuration || 15);
      setScenes(
        multiScenes.map((ms, idx) => ({
          id: `inf-scene-${idx + 1}`,
          label: ms.label,
          prompt: ms.prompt,
          duration: defaultDur,
          transition: idx === 0 ? "zoom-in" : "cut",
        }))
      );
    } else {
      setPrompt(singleScript);
    }
  };

  const getEffectiveTotalDuration = () => {
    if (videoMode === "short") {
      return typeof modelSettings.duration === "number"
        ? modelSettings.duration
        : selectedModel.minClipDuration || 6;
    }
    if (longSubMode === "scenes") {
      return scenes.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
    }
    return longTotalDuration;
  };

  const getEstimatedSceneCount = () => {
    const maxClip = selectedModel.maxClipDuration || 15;
    if (videoMode === "short") return 1;
    if (longSubMode === "scenes") {
      return scenes.reduce(
        (sum, s) =>
          sum + Math.max(1, Math.ceil((Number(s.duration) || maxClip) / maxClip)),
        0
      );
    }
    return Math.max(2, Math.ceil(longTotalDuration / maxClip));
  };

  const getRequiredCredits = () => {
    const duration = getEffectiveTotalDuration();
    const resolution = modelSettings.resolution || "";

    if (selectedModel.id === "grok-video") {
      const rate = resolution === "720p" ? 10 : 5;
      return duration * rate;
    }

    if (selectedModel.id === "veo-3-1") {
      let rate = 500;
      if (resolution === "1080p") rate = 650;
      else if (resolution === "4k") rate = 740;
      return duration * rate;
    }

    if (selectedModel.id === "happy-horse") {
      return duration * 36;
    }

    if (selectedModel.id === "seedance-2") {
      return duration * 50;
    }

    return 10;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 7) {
      alert("Maximum 7 reference images allowed.");
      return;
    }

    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: "uploading",
    }));

    setUploadedImages((prev) => [...prev, newImages].flat());

    for (const img of newImages) {
      try {
        const formData = new FormData();
        formData.append("file", img.file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();

        setUploadedImages((prev) =>
          prev.map((p) =>
            p.id === img.id ? { ...p, status: "ready", url: data.url } : p
          )
        );
      } catch (error) {
        console.error("Upload error:", error);
        setUploadedImages((prev) =>
          prev.map((p) => (p.id === img.id ? { ...p, status: "error" } : p))
        );
      }
    }
  };

  const removeImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const addScene = () => {
    const nextNum = scenes.length + 1;
    const defaultDur =
      selectedModel.fixedClipDuration ||
      Math.min(15, selectedModel.maxClipDuration || 15);
    setScenes((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}-${nextNum}`,
        label: `Escena ${nextNum}`,
        prompt: "",
        duration: defaultDur,
        transition: "cut",
      },
    ]);
  };

  const updateScene = (id, field, value) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeScene = (id) => {
    if (scenes.length <= 2) return;
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  const hasEffectiveInput = () => {
    if (videoMode === "long" && longSubMode === "scenes") {
      if (scenes.some((s) => s.prompt.trim().length > 0)) return true;
    } else if (prompt.trim().length > 0) {
      return true;
    }
    if (isInfluencerMode && selectedInfluencer) {
      return true;
    }
    return false;
  };

  const hasEffectiveReferenceImage = () => {
    const readyUploads = uploadedImages.filter((img) => img.status === "ready");
    if (readyUploads.length > 0) return true;
    if (
      isInfluencerMode &&
      useInfluencerReferenceImage &&
      getEffectiveInfluencerAvatar()
    ) {
      return true;
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!hasEffectiveInput()) return;
    if (uploadedImages.some((img) => img.status !== "ready")) {
      alert("Wait for image uploads to finish or remove any failed uploads.");
      return;
    }
    if (!hasEffectiveReferenceImage() && !selectedModel.supportsTextToVideo) {
      alert(
        "Seedance 2 requiere al menos una imagen de referencia (o activar el rostro del Influencer IA)."
      );
      return;
    }

    setIsGenerating(true);

    try {
      const effectiveDuration = getEffectiveTotalDuration();
      const requestSettings = {
        ...modelSettings,
        duration: effectiveDuration,
      };

      const readyUserUrls = uploadedImages
        .filter((img) => img.status === "ready")
        .map((img) => img.url);

      const effectiveAvatar = getEffectiveInfluencerAvatar();
      const effectiveEnvUrl = getEffectiveVirtualEnvUrl();
      const hasAvatarRef =
        isInfluencerMode &&
        useInfluencerReferenceImage &&
        Boolean(effectiveAvatar);
      const hasEnvRef =
        isInfluencerMode &&
        useVirtualEnvImageRef &&
        Boolean(effectiveEnvUrl);

      const combinedImageUrls = [
        ...(hasAvatarRef ? [effectiveAvatar] : []),
        ...readyUserUrls,
        ...(hasEnvRef ? [effectiveEnvUrl] : []),
      ].slice(0, 7);

      const envImageTag = hasEnvRef
        ? `@image${
            (hasAvatarRef ? 1 : 0) + readyUserUrls.length + 1
          }`
        : "";

      // Module 4 + v3.5 Commercial Audio Synthesizer directive
      const voiceObj =
        COMMERCIAL_VOICE_PROFILES.find((v) => v.id === voiceProfileId) ||
        COMMERCIAL_VOICE_PROFILES[0];

      const autoBuilt = isInfluencerMode
        ? buildInfluencerScript({
            influencer: selectedInfluencer,
            promoType,
            name: promoName,
            benefit: promoBenefit,
            cta: promoCta,
            style: promoStyle,
            language: influencerLanguage,
            facePresetId: influencerFacePresetId,
            customFaceTrait,
            personaStyleId: influencerPersonaStyleId,
            wardrobeId: influencerWardrobeId,
            customWardrobeText,
            virtualEnvironmentId: influencerVirtualEnvId,
            compositingModeId: influencerCompositingModeId,
            customEnvironmentText: customEnvText,
            customEnvironmentImageTag: envImageTag,
            voiceDirective: voiceObj.directive,
            useInfluencerAvatar: hasAvatarRef,
            hasUploadedAsset: readyUserUrls.length > 0,
          })
        : null;

      const selectedEnvObj = INFLUENCER_VIRTUAL_ENVIRONMENTS.find(
        (env) => env.id === influencerVirtualEnvId
      );
      const selectedCompObj =
        INFLUENCER_COMPOSITING_MODES.find(
          (cm) => cm.id === influencerCompositingModeId
        ) || INFLUENCER_COMPOSITING_MODES[0];
      const virtualStudioDirective = isInfluencerMode
        ? influencerCompositingModeId === "pure-chroma-green"
          ? ` Virtual Studio: ${selectedCompObj.directive}.`
          : selectedEnvObj && selectedEnvObj.id !== "preset"
          ? ` Virtual Studio (${selectedEnvObj.name}): ${
              influencerVirtualEnvId === "custom-environment" &&
              customEnvText.trim()
                ? customEnvText.trim()
                : selectedEnvObj.environmentPrompt
            }. Compositing: ${selectedCompObj.directive}.`
          : ""
        : "";

      const consistencyDirective = ucidLockEnabled
        ? `${buildCharacterConsistencyLock({
            ucid: ucidCode,
            influencer: isInfluencerMode ? selectedInfluencer : null,
            wardrobeLock,
            lightingLock,
            emotionId,
            microExpressionIds,
          })} Audio Synthesizer: ${voiceObj.directive}.${virtualStudioDirective}`
        : `Audio Synthesizer: ${voiceObj.directive}.${virtualStudioDirective}`;

      let activeScenes = [];
      let finalPrompt = prompt.trim();

      if (videoMode === "long" && longSubMode === "scenes") {
        const userScenes = scenes.filter((s) => s.prompt.trim().length > 0);
        if (userScenes.length > 0) {
          activeScenes = userScenes.map((s) => ({
            prompt: s.prompt.trim(),
            duration:
              Number(s.duration) || selectedModel.minClipDuration || 8,
            transition: s.transition || "cut",
          }));
        } else if (autoBuilt) {
          const defaultDur =
            selectedModel.fixedClipDuration ||
            Math.min(15, selectedModel.maxClipDuration || 15);
          activeScenes = autoBuilt.multiScenes.map((ms, idx) => ({
            prompt: ms.prompt,
            duration: defaultDur,
            transition: idx === 0 ? "zoom-in" : "cut",
          }));
        }
        finalPrompt = activeScenes
          .map((s, i) => `[Escena ${i + 1}] ${s.prompt}`)
          .join("\n");
      } else {
        if (!finalPrompt && autoBuilt) {
          finalPrompt = autoBuilt.singleScript;
        }
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel.id,
          prompt: finalPrompt,
          settings: requestSettings,
          scenes: activeScenes,
          videoMode,
          consistencyDirective,
          images: combinedImageUrls,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (
        typeof data.remainingCredits === "number" &&
        status === "authenticated"
      ) {
        updateSession({ credits: data.remainingCredits }).catch(() => {});
      }

      const initialGenRecord = {
        id: data.creationId,
        status: "processing",
        title: (finalPrompt || "Video UGCore Studio").slice(0, 60),
        prompt: finalPrompt,
        modelId: selectedModel.id,
        aspectRatio: requestSettings.aspect_ratio || "9:16",
        resolution: requestSettings.resolution || "720p",
        segmentsTotal: data.segmentsTotal || 1,
        segmentsCompleted: 0,
        duration: data.totalDuration || effectiveDuration,
        inputImages: combinedImageUrls,
        environmentName: isInfluencerMode ? selectedEnvObj?.shortLabel : null,
        influencerName: isInfluencerMode
          ? `${selectedInfluencer?.name} (${selectedInfluencer?.ucid})`
          : null,
        createdAt: new Date().toISOString(),
      };
      setLastGeneration(initialGenRecord);
      syncCreationToLocalArchive(initialGenRecord);

      if (videoMode === "long" && longSubMode === "scenes") {
        setScenes((prev) => prev.map((s) => ({ ...s, prompt: "" })));
      } else {
        setPrompt("");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-solid-bg">
        <FiLoader className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setModelSettings(getModelDefaults(model));
    if (model.fixedClipDuration) {
      setLongTotalDuration(48);
      setScenes((prev) =>
        prev.map((s) => ({ ...s, duration: model.fixedClipDuration }))
      );
    }
    setIsModelsModalOpen(false);
  };

  const updateSetting = (key, value) => {
    setModelSettings((prev) => ({ ...prev, [key]: value }));
  };

  const activeOverlays = {
    subtitle: overlaySubtitle.trim() || null,
    lowerThird: overlayLowerThird.trim() || null,
    ctaBadge: overlayCtaBadge.trim() || null,
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <main className="flex-1 flex flex-col relative min-h-0">
        {/* Content Canvas */}
        <div className="flex-1 p-4 md:p-6 relative flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {!lastGeneration ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-2.5 pointer-events-none"
              >
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-glass-bg border border-glass-border text-[11px] font-bold text-foreground">
                  <FiFilm className="text-primary" />
                  <span>
                    {videoMode === "long"
                      ? `UGCore v3.0 • Video Largo (${getEffectiveTotalDuration()}s • ${getEstimatedSceneCount()} escenas)`
                      : "UGCore v3.0 • Video Corto"}
                  </span>
                  {isInfluencerMode && selectedInfluencer && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px]">
                      • Influencer IA: {selectedInfluencer.name}
                    </span>
                  )}
                  {ucidLockEnabled && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px]">
                      • Lock: {ucidCode}
                    </span>
                  )}
                </div>
                <p className="text-muted text-xs font-bold max-w-[380px] leading-relaxed">
                  Usa los módulos v3.0 abajo: Inteligencias de Hooks Virales,
                  URL E-Commerce a Video, Editor Híbrido de Línea de Tiempo y
                  Consistencia UCID con Micro-Expresiones.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={lastGeneration.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg aspect-[9/16] max-h-[50vh] bg-glass-bg rounded border border-glass-border shadow-2xl overflow-hidden flex flex-col items-center justify-center"
              >
                {["processing", "pending", "starting", "queued"].includes(
                  lastGeneration.status
                ) ? (
                  <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.25em] animate-pulse">
                      {lastGeneration.segmentsTotal > 1
                        ? `Generando Video Largo (${lastGeneration.segmentsCompleted || 0}/${lastGeneration.segmentsTotal} escenas listas)...`
                        : `Generando (${lastGeneration.status})...`}
                    </span>
                    {lastGeneration.urls?.length > 0 && (
                      <p className="text-[11px] font-bold text-primary">
                        ¡{lastGeneration.urls.length} escena(s) completada(s)!
                        Esperando el resto para unir...
                      </p>
                    )}
                  </div>
                ) : lastGeneration.status === "failed" ? (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <FiAlertCircle className="text-rose-500 text-4xl" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                        Failed
                      </h3>
                      <p className="text-[10px] text-muted">
                        {lastGeneration.error || "An unknown error occurred."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <SeamlessVideoPlayer
                    url={lastGeneration.url}
                    urls={lastGeneration.urls}
                    showSceneBar={true}
                    showDownloadButton={true}
                    overlays={activeOverlays}
                    title={`ugcore-${lastGeneration.id}`}
                  />
                )}

                <div className="absolute top-4 right-4 z-30">
                  <button
                    onClick={() => setLastGeneration(null)}
                    className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white pointer-events-none">
                  <p className="text-[10px] font-medium leading-relaxed truncate opacity-80 uppercase tracking-widest">
                    {lastGeneration.segmentsTotal > 1
                      ? `Video Largo (${lastGeneration.duration || ""}s • ${lastGeneration.segmentsTotal} escenas)`
                      : "Resultado"}
                  </p>
                  <p className="text-xs font-bold truncate">
                    {lastGeneration.prompt}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interaction Bar */}
        <div className="p-3 md:p-4 flex-shrink-0 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl bg-glass-bg rounded border border-glass-border shadow-2xl relative backdrop-blur-3xl">
            {/* Row 1: Primary Mode Bar (Short Video | Long Video | AI Influencer) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-glass-border bg-glass-bg/60">
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setVideoMode("short")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    videoMode === "short"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-glass-hover"
                  }`}
                >
                  <FiVideo className="text-xs" />
                  <span>Video Corto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode("long")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    videoMode === "long"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-glass-hover"
                  }`}
                >
                  <FiFilm className="text-xs" />
                  <span>Video Largo (Multi-Escena)</span>
                </button>

                <div className="w-px h-4 bg-glass-border mx-1" />

                <button
                  type="button"
                  onClick={() => setIsInfluencerMode(!isInfluencerMode)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isInfluencerMode
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
                >
                  <FiUserCheck className="text-xs" />
                  <span>
                    {isInfluencerMode
                      ? `Influencer #${selectedInfluencer?.number || 1}: ${selectedInfluencer?.name || "Activo"}`
                      : `🧑‍🎤 ${AI_INFLUENCERS.length} Influencers IA (Config. Mínima 1-Click)`}
                  </span>
                </button>
              </div>

              {videoMode === "long" && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLongSubMode("auto")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      longSubMode === "auto"
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Guion Único Automático
                  </button>
                  <button
                    type="button"
                    onClick={() => setLongSubMode("scenes")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      longSubMode === "scenes"
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <FiList className="text-xs" />
                    <span>Armar por Escenas ({scenes.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: UGCore v3.5 Commercial Pipeline & Architecture Modules Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 px-4 py-2 border-b border-glass-border bg-bg-card/30">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mr-1">
                  v3.5 Commercial Pipeline:
                </span>
                <button
                  type="button"
                  onClick={() => toggleV3Module("intelligence")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                    activeV3Module === "intelligence"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
                  }`}
                >
                  <FiTrendingUp size={12} />
                  <span>1. Hooks & Tendencias</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleV3Module("ecommerce")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                    activeV3Module === "ecommerce"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
                  }`}
                >
                  <FiLink size={12} />
                  <span>2. Ingesta URL Comercial</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleV3Module("timeline")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                    activeV3Module === "timeline"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
                  }`}
                >
                  <FiLayers size={12} />
                  <span>3. Text-To-Timeline Core</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleV3Module("consistency")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                    activeV3Module === "consistency"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
                  }`}
                >
                  <FiCpu size={12} />
                  <span>4. Avatar & Audio Synthesizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleV3Module("youtube-longform")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                    activeV3Module === "youtube-longform"
                      ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm"
                      : "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/20"
                  }`}
                >
                  <FiFilm size={12} />
                  <span>5. YouTube Largo (4×5m • B-Roll 25s • #8B5CF6)</span>
                </button>
              </div>

              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-black text-emerald-500 uppercase tracking-wider">
                ✓ MIT • Apache 2.0 • BSD-3 • Royalty-Free
              </span>
            </div>

            {/* UGCore v3.0 Module Panels */}
            <AnimatePresence>
              {activeV3Module === "intelligence" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-glass-border bg-bg-card/70 p-4 space-y-3 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <FiTrendingUp className="text-indigo-500" />
                        <span>
                          Módulo 1: Pre-Production Intelligence Engine (Hooks
                          Predictivos)
                        </span>
                      </h4>
                      <p className="text-[10px] text-muted">
                        Ganchos de alta retención basados en métricas de los
                        primeros 3 segundos en TikTok, Reels y Shorts.
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {SOCIAL_PLATFORMS.map((plat) => (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => handleAnalyzeHooks(plat.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            targetPlatform === plat.id
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-glass-bg text-muted border-glass-border hover:text-foreground"
                          }`}
                        >
                          {plat.name} ({plat.avgRetentionTarget})
                        </button>
                      ))}
                    </div>
                  </div>

                  {isLoadingHooks ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-xs text-muted">
                      <FiLoader className="animate-spin" />
                      <span>Calculando hooks predictivos...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {predictiveHooks.map((hk) => (
                        <div
                          key={hk.id}
                          className="p-3 rounded-lg border border-glass-border bg-bg-card flex flex-col justify-between space-y-2"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-indigo-400">
                                {hk.framework}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-bold">
                                Retención 3s: {hk.retention3s}% • CTR{" "}
                                {hk.estimatedCtr}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-foreground leading-snug">
                              &ldquo;{hk.hookText}&rdquo;
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => applyViralHook(hk, false)}
                              className="flex-1 py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Usar en Guion
                            </button>
                            <button
                              type="button"
                              onClick={() => applyViralHook(hk, true)}
                              className="flex-1 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Armar 3 Escenas
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeV3Module === "ecommerce" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-glass-border bg-bg-card/70 p-4 space-y-3 overflow-hidden"
                >
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                      <FiLink className="text-indigo-500" />
                      <span>
                        Módulo 2: Instant E-Commerce URL-to-Video Pipeline
                      </span>
                    </h4>
                    <p className="text-[10px] text-muted">
                      Pega el link de Shopify, Amazon, Mercado Libre o tu web
                      para extraer imágenes, beneficios, oferta y guion UGC en
                      segundos.
                    </p>
                  </div>

                  <form
                    onSubmit={handleExtractEcommerceUrl}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                  >
                    <input
                      type="text"
                      value={ecommerceUrl}
                      onChange={(e) => setEcommerceUrl(e.target.value)}
                      placeholder="https://mitienda.myshopify.com/products/... o link de Amazon / Mercado Libre"
                      className="flex-1 px-3 py-2 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isExtractingUrl || !ecommerceUrl.trim()}
                      className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isExtractingUrl ? (
                        <>
                          <FiLoader className="animate-spin" />
                          <span>Extrayendo producto...</span>
                        </>
                      ) : (
                        <>
                          <FiZap />
                          <span>Extraer URL y Generar Anuncio</span>
                        </>
                      )}
                    </button>
                  </form>

                  {extractedProduct && (
                    <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="font-black text-emerald-500 mr-1.5">
                          ✓ Extraído ({extractedProduct.marketplace}):
                        </span>
                        <span className="font-bold text-foreground">
                          {extractedProduct.title}
                        </span>
                        {extractedProduct.price && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                            {extractedProduct.price}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold whitespace-nowrap">
                        Guion e imágenes cargados
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {activeV3Module === "timeline" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-glass-border bg-bg-card/70 p-4 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <FiLayers className="text-indigo-500" />
                        <span>
                          Módulo 3: Text-Based Hybrid Timeline & Capas Gráficas
                        </span>
                      </h4>
                      <p className="text-[10px] text-muted">
                        Superposición multicapa en tiempo real (Subtítulos
                        dinámicos, Lower-Thirds, Badge de oferta y transiciones
                        por corte).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoMode("long");
                        setLongSubMode("scenes");
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold cursor-pointer"
                    >
                      Abrir Cortes por Escena
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={overlaySubtitle}
                      onChange={(e) => setOverlaySubtitle(e.target.value)}
                      placeholder="Subtítulo Dinámico Central (ej: ¡30% OFF Solo Hoy!)"
                      className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={overlayLowerThird}
                      onChange={(e) => setOverlayLowerThird(e.target.value)}
                      placeholder="Lower-Third Inferior (ej: Sofía Morales • Especialista)"
                      className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={overlayCtaBadge}
                      onChange={(e) => setOverlayCtaBadge(e.target.value)}
                      placeholder="Badge Superior (ej: ENVÍO GRATIS • LINK EN BIO)"
                      className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-indigo-500"
                    />
                  </div>
                </motion.div>
              )}

              {activeV3Module === "consistency" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-glass-border bg-bg-card/70 p-4 space-y-3 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <FiCpu className="text-indigo-500" />
                        <span>
                          Módulo 4: Advanced Character Consistency (UCID) &
                          Micro-Expression Engine
                        </span>
                      </h4>
                      <p className="text-[10px] text-muted">
                        Persistencia de rasgos faciales, vestimenta e
                        iluminación entre escenas con sincronización emocional y
                        micro-gestos orgánicos.
                      </p>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ucidLockEnabled}
                        onChange={(e) => setUcidLockEnabled(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Activar Candado Universal ({ucidCode})</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">
                        Universal Character ID (UCID)
                      </label>
                      <input
                        type="text"
                        value={ucidCode}
                        onChange={(e) => setUcidCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-xs font-bold text-foreground outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">
                        Sincronización Emocional
                      </label>
                      <select
                        value={emotionId}
                        onChange={(e) => setEmotionId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-xs font-bold text-foreground outline-none"
                      >
                        {EMOTION_PROFILES.map((em) => (
                          <option key={em.id} value={em.id}>
                            {em.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">
                        Sintetizador de Audio Comercial & Sincronía
                      </label>
                      <select
                        value={voiceProfileId}
                        onChange={(e) => setVoiceProfileId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-xs font-bold text-foreground outline-none"
                      >
                        {COMMERCIAL_VOICE_PROFILES.map((vp) => (
                          <option key={vp.id} value={vp.id}>
                            {vp.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-1 text-[10px] font-semibold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={wardrobeLock}
                            onChange={(e) => setWardrobeLock(e.target.checked)}
                            className="rounded accent-indigo-500"
                          />
                          <span>Fijar Vestimenta</span>
                        </label>
                        <label className="flex items-center gap-1 text-[10px] font-semibold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lightingLock}
                            onChange={(e) => setLightingLock(e.target.checked)}
                            className="rounded accent-indigo-500"
                          />
                          <span>Fijar Luz 5600K</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-muted mr-1">
                      Micro-gestos orgánicos:
                    </span>
                    {MICRO_EXPRESSIONS.map((me) => {
                      const active = microExpressionIds.includes(me.id);
                      return (
                        <button
                          key={me.id}
                          type="button"
                          onClick={() => toggleMicroExpression(me.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            active
                              ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40"
                              : "bg-glass-bg text-muted border-glass-border"
                          }`}
                        >
                          {active ? "✓ " : "+ "}
                          {me.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeV3Module === "youtube-longform" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-[#8B5CF6]/40 bg-bg-card/85 p-4 space-y-3.5 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] ring-2 ring-white inline-block" />
                        <span>
                          Pipeline Universal YouTube Formato Largo (4 Capítulos ×
                          5 Min = 20:00)
                        </span>
                      </h4>
                      <p className="text-[10px] text-muted">
                        Inserción automática de B-Roll cada{" "}
                        {YOUTUBE_LONGFORM_CONFIG.bRollIntervalSeconds} segundos
                        (12 cortes por capítulo / 48 totales) • Identidad visual{" "}
                        <span className="font-bold text-[#8B5CF6]">
                          #8B5CF6 (Violeta)
                        </span>{" "}
                        y{" "}
                        <span className="font-bold text-foreground">
                          #FFFFFF (Blanco)
                        </span>{" "}
                        • Exportación de metadatos con marcas de tiempo.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#8B5CF6] text-white text-[9px] font-black uppercase tracking-wider">
                        Identidad #8B5CF6 + #FFFFFF
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[9px] font-black uppercase">
                        48 B-Rolls (c/25s)
                      </span>
                    </div>
                  </div>

                  {/* Topic Input & Action Bar */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    <input
                      type="text"
                      value={ytTopic}
                      onChange={(e) => {
                        setYtTopic(e.target.value);
                        handleGenerateYouTubeBlueprint(e.target.value);
                      }}
                      placeholder="Escribe aquí el tema de tu video largo de YouTube (ej: Cómo automatizar ventas con IA en 2026)..."
                      className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-[#8B5CF6]/50 text-xs font-semibold text-foreground placeholder-muted outline-none focus:border-[#8B5CF6]"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateYouTubeBlueprint(ytTopic)}
                      className="px-3 py-2 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#8B5CF6] text-xs font-black whitespace-nowrap cursor-pointer transition-all"
                    >
                      🔄 Estructurar 4 Capítulos
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyYouTubeToTimeline}
                      className="px-3.5 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-black whitespace-nowrap cursor-pointer transition-all shadow-sm"
                    >
                      ⚡ Cargar 4 Capítulos al Timeline (16:9)
                    </button>
                  </div>

                  {/* 4 Chapters Modular Grid */}
                  {ytBlueprint && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {ytBlueprint.chapters.map((ch) => {
                          const isSelected =
                            selectedYtChapter === ch.chapterNumber;
                          return (
                            <div
                              key={ch.chapterNumber}
                              onClick={() =>
                                setSelectedYtChapter(ch.chapterNumber)
                              }
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                                isSelected
                                  ? "border-[#8B5CF6] bg-[#8B5CF6]/10 ring-1 ring-[#8B5CF6]"
                                  : "border-glass-border bg-bg-card hover:border-[#8B5CF6]/40"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6] text-white text-[9px] font-black">
                                    CAPÍTULO {ch.chapterNumber} (5 MIN)
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-[#8B5CF6]">
                                    {ch.startTimestamp} - {ch.endTimestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-snug">
                                  {ch.title}
                                </p>
                                <p className="text-[9px] text-muted line-clamp-2">
                                  {ch.objective}
                                </p>
                              </div>
                              <div className="pt-1 border-t border-glass-border/60 flex items-center justify-between text-[9px] font-bold">
                                <span className="text-[#8B5CF6]">
                                  🎬 {ch.bRollCount} B-Rolls (cada 25s)
                                </span>
                                <span className="text-muted">
                                  Ver matriz →
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Selected Chapter B-Roll Matrix (Every 25s) & Metadata Export */}
                      {(() => {
                        const activeCh =
                          ytBlueprint.chapters.find(
                            (c) => c.chapterNumber === selectedYtChapter
                          ) || ytBlueprint.chapters[0];
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                            {/* B-Roll Every 25s Inspector */}
                            <div className="p-3 rounded-xl border border-glass-border bg-bg-card space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-[#8B5CF6]">
                                  Matriz B-Roll Cada 25s • Cap.{" "}
                                  {activeCh.chapterNumber} (
                                  {activeCh.startTimestamp} -{" "}
                                  {activeCh.endTimestamp})
                                </span>
                                <span className="text-[9px] font-bold text-muted">
                                  Tonos #8B5CF6 & #FFFFFF
                                </span>
                              </div>
                              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                                {activeCh.bRollCues.map((cue) => (
                                  <div
                                    key={cue.cueNumber}
                                    className="flex items-start gap-2 text-[10px] p-1.5 rounded bg-glass-bg border border-glass-border/60"
                                  >
                                    <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6] text-white font-mono font-bold text-[9px] flex-shrink-0">
                                      {cue.timestamp}
                                    </span>
                                    <span className="text-foreground font-medium leading-tight">
                                      <strong className="text-[#8B5CF6]">
                                        B-Roll #{cue.cueNumber} (+
                                        {cue.relativeSecond}s):
                                      </strong>{" "}
                                      {cue.visualDirection}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Automatic Timestamps & Metadata Exporter */}
                            <div className="p-3 rounded-xl border border-glass-border bg-bg-card flex flex-col justify-between space-y-2">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase text-foreground">
                                    ⏱️ Exportación de Metadatos + Marcas de
                                    Tiempo Automáticas
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={handleCopyYouTubeMetadata}
                                      className="px-2.5 py-1 rounded bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[10px] font-bold cursor-pointer transition-all"
                                    >
                                      {copiedYtMeta
                                        ? "✓ ¡Copiado!"
                                        : "📋 Copiar Metadatos + Timestamps"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleDownloadYouTubeMetadata}
                                      className="px-2 py-1 rounded bg-glass-bg hover:bg-white/10 border border-glass-border text-foreground text-[10px] font-bold cursor-pointer"
                                    >
                                      ⬇️ JSON
                                    </button>
                                  </div>
                                </div>
                                <pre className="p-2 rounded bg-glass-bg border border-glass-border text-[10px] font-mono text-secondary-text whitespace-pre-wrap max-h-28 overflow-y-auto">
                                  {ytBlueprint.seoMetadata.description}
                                </pre>
                              </div>
                              <p className="text-[9px] text-muted">
                                Incluye: Título SEO, Capítulos de YouTube (00:00,
                                05:00, 10:00, 15:00), Prompt de Miniatura en{" "}
                                <span className="text-[#8B5CF6] font-bold">
                                  #8B5CF6
                                </span>{" "}
                                y{" "}
                                <span className="font-bold text-foreground">
                                  #FFFFFF
                                </span>{" "}
                                + escaleta de 48 B-Rolls.
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Influencer & Promotion Studio Panel (15 Influencers • Minimal Config) */}
            <AnimatePresence>
              {isInfluencerMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-glass-border bg-bg-card/50 p-4 space-y-3 overflow-hidden"
                >
                  {/* Row 1: 15 AI Influencers Roster */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted">
                          1. Catálogo de {AI_INFLUENCERS.length} Influencers IA
                          (Configuración Mínima 1-Click):
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-black uppercase">
                          Preset #{selectedInfluencer?.number || 1} •{" "}
                          {selectedInfluencer?.ucid || "UCID-01"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary-text cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useInfluencerReferenceImage}
                            onChange={(e) =>
                              setUseInfluencerReferenceImage(e.target.checked)
                            }
                            className="rounded accent-emerald-500"
                          />
                          <span>Rostro @image1 activo</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setIsMinimalInfluencerConfig(
                              !isMinimalInfluencerConfig
                            )
                          }
                          className="px-2 py-0.5 rounded border border-glass-border bg-glass-bg text-[10px] font-bold text-secondary-text hover:text-foreground cursor-pointer"
                        >
                          {isMinimalInfluencerConfig
                            ? "⚙️ Ver campos opcionales"
                            : "⚡ Volver a Config. Mínima"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-44 overflow-y-auto pr-1">
                      {AI_INFLUENCERS.map((inf) => {
                        const isSelected = selectedInfluencer?.id === inf.id;
                        return (
                          <button
                            key={inf.id}
                            type="button"
                            onClick={() => handleSelectInfluencer(inf)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                                : "border-glass-border bg-bg-card hover:border-primary/40"
                            }`}
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={inf.avatar}
                                alt={inf.name}
                                className="w-9 h-9 rounded-full object-cover border border-white/20"
                              />
                              <span className="absolute -top-1 -left-1 px-1 rounded-full bg-black/80 text-white text-[8px] font-black">
                                #{inf.number}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-foreground truncate">
                                  {inf.name}
                                </span>
                              </div>
                              <p className="text-[9px] text-emerald-500 font-bold truncate">
                                {inf.badge}
                              </p>
                              <p className="text-[9px] text-muted truncate">
                                {inf.niche}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 2: Rostro, Estilo, Ropa, Voz & Idioma Customization */}
                  <div className="space-y-2 pt-2 border-t border-glass-border/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {/* 1. Elegir Rostro */}
                      <div className="flex items-center gap-1.5">
                        {getEffectiveInfluencerAvatar() && (
                          <img
                            src={getEffectiveInfluencerAvatar()}
                            alt="Rostro activo"
                            className="w-7 h-7 rounded-full object-cover border border-emerald-500 flex-shrink-0"
                          />
                        )}
                        <select
                          value={influencerFacePresetId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInfluencerFacePresetId(val);
                            if (val === "custom-upload" && !customFaceUrl) {
                              faceInputRef.current?.click();
                            }
                          }}
                          title="Elegir el rostro del Influencer o subir uno propio"
                          className="flex-1 min-w-0 px-2 py-1.5 rounded bg-bg-card border border-glass-border text-[10px] font-bold text-foreground outline-none cursor-pointer focus:border-emerald-500"
                        >
                          {INFLUENCER_FACE_PRESETS.map((fp) => (
                            <option key={fp.id} value={fp.id}>
                              {fp.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="file"
                          ref={faceInputRef}
                          onChange={handleCustomFaceUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => faceInputRef.current?.click()}
                          disabled={isUploadingCustomFace}
                          title="Subir tu propia foto de rostro para el Influencer (@image1)"
                          className="px-2 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold whitespace-nowrap cursor-pointer flex items-center gap-1"
                        >
                          {isUploadingCustomFace ? (
                            <FiLoader className="animate-spin" size={11} />
                          ) : (
                            <FiImage size={11} />
                          )}
                          <span>Subir Rostro</span>
                        </button>
                      </div>

                      {/* 2. Elegir Estilo del Influencer */}
                      <select
                        value={influencerPersonaStyleId}
                        onChange={(e) =>
                          setInfluencerPersonaStyleId(e.target.value)
                        }
                        title="Elegir el estilo visual y escenario del Influencer"
                        className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-[10px] font-bold text-foreground outline-none cursor-pointer focus:border-emerald-500"
                      >
                        {INFLUENCER_PERSONA_STYLES.map((ps) => (
                          <option key={ps.id} value={ps.id}>
                            Estilo: {ps.label}
                          </option>
                        ))}
                      </select>

                      {/* 3. Elegir Ropa / Vestimenta */}
                      <select
                        value={influencerWardrobeId}
                        onChange={(e) =>
                          setInfluencerWardrobeId(e.target.value)
                        }
                        title="Elegir la ropa o vestimenta del Influencer"
                        className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-[10px] font-bold text-foreground outline-none cursor-pointer focus:border-emerald-500"
                      >
                        {INFLUENCER_WARDROBE_OPTIONS.map((w) => (
                          <option key={w.id} value={w.id}>
                            Ropa: {w.label}
                          </option>
                        ))}
                      </select>

                      {/* 4. Elegir Voz Comercial */}
                      <select
                        value={voiceProfileId}
                        onChange={(e) => setVoiceProfileId(e.target.value)}
                        title="Elegir el timbre y estilo de voz del Influencer"
                        className="w-full px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-[10px] font-bold text-foreground outline-none cursor-pointer focus:border-emerald-500"
                      >
                        {COMMERCIAL_VOICE_PROFILES.map((vp) => (
                          <option key={vp.id} value={vp.id}>
                            Voz: {vp.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {influencerWardrobeId === "custom" && (
                      <input
                        type="text"
                        value={customWardrobeText}
                        onChange={(e) => setCustomWardrobeText(e.target.value)}
                        placeholder="Describe la ropa exacta (ej: chaqueta de cuero negra con camiseta blanca minimalista)"
                        className="w-full px-3 py-1.5 rounded bg-bg-card border border-emerald-500/40 text-xs text-foreground placeholder-muted outline-none focus:border-emerald-500"
                      />
                    )}

                    {/* Row 2.5: HeyGen-Style Virtual Environments & Chroma / Realistic Compositing */}
                    <div className="p-2.5 rounded-xl border border-[#8B5CF6]/35 bg-[#8B5CF6]/5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] ring-2 ring-white inline-block" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
                            Estudios & Entornos Virtuales (Estilo HeyGen • Croma
                            & Integración Realista):
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={influencerCompositingModeId}
                            onChange={(e) =>
                              setInfluencerCompositingModeId(e.target.value)
                            }
                            title="Modo de integración de croma o relighting realista del avatar sobre el entorno"
                            className="px-2.5 py-1 rounded bg-bg-card border border-[#8B5CF6]/40 text-[10px] font-bold text-foreground outline-none cursor-pointer focus:border-[#8B5CF6]"
                          >
                            {INFLUENCER_COMPOSITING_MODES.map((cm) => (
                              <option key={cm.id} value={cm.id}>
                                {cm.label}
                              </option>
                            ))}
                          </select>

                          <label className="flex items-center gap-1 text-[10px] font-semibold text-secondary-text cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useVirtualEnvImageRef}
                              onChange={(e) =>
                                setUseVirtualEnvImageRef(e.target.checked)
                              }
                              className="rounded accent-[#8B5CF6]"
                            />
                            <span>Inyectar referencia visual de estudio</span>
                          </label>

                          <input
                            type="file"
                            ref={envInputRef}
                            onChange={handleCustomEnvUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => envInputRef.current?.click()}
                            disabled={isUploadingCustomEnv}
                            className="px-2.5 py-1 rounded bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {isUploadingCustomEnv ? (
                              <FiLoader className="animate-spin" size={11} />
                            ) : (
                              <FiImage size={11} />
                            )}
                            <span>Subir Fondo Propio</span>
                          </button>
                        </div>
                      </div>

                      {/* Virtual Environments Carousel / Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                        {INFLUENCER_VIRTUAL_ENVIRONMENTS.map((env) => {
                          const isSelected = influencerVirtualEnvId === env.id;
                          const thumbUrl =
                            env.id === "custom-environment" && customEnvImageUrl
                              ? customEnvImageUrl
                              : env.previewUrl;
                          return (
                            <button
                              key={env.id}
                              type="button"
                              onClick={() => {
                                setInfluencerVirtualEnvId(env.id);
                                if (env.id === "chroma-green-studio") {
                                  setInfluencerCompositingModeId(
                                    "pure-chroma-green"
                                  );
                                } else if (
                                  influencerCompositingModeId ===
                                  "pure-chroma-green"
                                ) {
                                  setInfluencerCompositingModeId(
                                    "realistic-relight"
                                  );
                                }
                                if (
                                  env.id === "custom-environment" &&
                                  !customEnvImageUrl &&
                                  !customEnvText
                                ) {
                                  envInputRef.current?.click();
                                }
                              }}
                              className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-[#8B5CF6] bg-[#8B5CF6]/15 ring-1 ring-[#8B5CF6]"
                                  : "border-glass-border bg-bg-card hover:border-[#8B5CF6]/40"
                              }`}
                            >
                              <div className="relative w-10 h-7 rounded overflow-hidden flex-shrink-0 border border-white/20 flex items-center justify-center bg-slate-900">
                                {thumbUrl ? (
                                  <img
                                    src={thumbUrl}
                                    alt={env.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : env.isChromaScreen ? (
                                  <div className="w-full h-full bg-[#00FF00] flex items-center justify-center text-[8px] font-black text-black">
                                    CROMA
                                  </div>
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center text-[9px] font-black text-white"
                                    style={{
                                      background:
                                        env.id === "wellness-violet-white"
                                          ? "linear-gradient(135deg, #8B5CF6 0%, #FFFFFF 100%)"
                                          : "#334155",
                                    }}
                                  >
                                    SET
                                  </div>
                                )}
                                {getEffectiveInfluencerAvatar() && (
                                  <img
                                    src={getEffectiveInfluencerAvatar()}
                                    alt="Avatar en set"
                                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full object-cover border border-white shadow"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-foreground truncate">
                                  {env.shortLabel}
                                </p>
                                <p className="text-[8px] font-black text-[#8B5CF6] uppercase truncate">
                                  {env.badge}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {influencerVirtualEnvId === "custom-environment" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={customEnvText}
                            onChange={(e) => setCustomEnvText(e.target.value)}
                            placeholder="Describe tu escenario virtual personalizado (ej: Estudio de bienestar minimalista con arcos blancos y luces #8B5CF6)..."
                            className="flex-1 px-3 py-1.5 rounded bg-bg-card border border-[#8B5CF6]/50 text-xs text-foreground placeholder-muted outline-none focus:border-[#8B5CF6]"
                          />
                          {customEnvImageUrl && (
                            <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-500 text-[10px] font-bold whitespace-nowrap">
                              ✓ Imagen de fondo subida lista para composición
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Row 3: Modo (Producto / Servicio / Video), Idioma & 1-Click Script */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted mr-1">
                          2. Modo:
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePromoTypeChange("product")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            promoType === "product"
                              ? "bg-primary text-white"
                              : "bg-glass-bg text-muted hover:text-foreground border border-glass-border"
                          }`}
                        >
                          <FiShoppingBag size={11} />
                          <span>Producto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromoTypeChange("service")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            promoType === "service"
                              ? "bg-primary text-white"
                              : "bg-glass-bg text-muted hover:text-foreground border border-glass-border"
                          }`}
                        >
                          <FiBriefcase size={11} />
                          <span>Servicio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromoTypeChange("video")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            promoType === "video"
                              ? "bg-primary text-white"
                              : "bg-glass-bg text-muted hover:text-foreground border border-glass-border"
                          }`}
                        >
                          <FiPlayCircle size={11} />
                          <span>Video</span>
                        </button>

                        <select
                          value={influencerLanguage}
                          onChange={(e) =>
                            handleInfluencerLanguageChange(e.target.value)
                          }
                          title="Elegir el idioma en el que hablará el Influencer IA"
                          className="px-2.5 py-1 rounded bg-bg-card border border-emerald-500/40 text-[10px] font-bold text-foreground outline-none cursor-pointer focus:border-emerald-500"
                        >
                          {INFLUENCER_LANGUAGES.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                              Idioma: {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-xl">
                        <input
                          type="text"
                          value={promoName}
                          onChange={(e) => setPromoName(e.target.value)}
                          placeholder={`Opcional: Nombre (Preset activo: "${selectedInfluencer?.defaultName || "Automático"}")`}
                          className="flex-1 px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => applyInfluencerPromoToScript()}
                          className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shadow-sm"
                          title="Generar guion inmediato con configuración mínima"
                        >
                          <FiCheck size={13} />
                          <span>⚡ Armar Guion 1-Click</span>
                        </button>
                      </div>
                    </div>

                    {!isMinimalInfluencerConfig && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1">
                        <select
                          value={promoStyle}
                          onChange={(e) => setPromoStyle(e.target.value)}
                          className="px-2.5 py-1.5 rounded bg-bg-card border border-glass-border text-xs font-bold text-foreground outline-none"
                        >
                          {currentPromoCategory.styles.map((st) => (
                            <option key={st.id} value={st.id}>
                              Acción: {st.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={customFaceTrait}
                          onChange={(e) => setCustomFaceTrait(e.target.value)}
                          placeholder="Rasgos faciales extra (ej: gafas, pecas, barba)"
                          className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={promoBenefit}
                          onChange={(e) => setPromoBenefit(e.target.value)}
                          placeholder={`Beneficio (Preset: "${selectedInfluencer?.defaultBenefit || ""}")`}
                          className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={promoCta}
                          onChange={(e) => setPromoCta(e.target.value)}
                          placeholder={`CTA (Preset: "${selectedInfluencer?.defaultCta || ""}")`}
                          className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Preview List */}
            <AnimatePresence>
              {uploadedImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 p-4 border-b border-glass-border overflow-x-auto no-scrollbar"
                >
                  {uploadedImages.map((img, index) => (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative group flex-shrink-0"
                    >
                      <img
                        src={img.preview}
                        className={`w-8 h-8 rounded object-cover border border-glass-border shadow-sm transition-opacity ${img.status === "uploading" ? "opacity-40" : "opacity-100"}`}
                        alt={`Upload ${index + 1}`}
                      />
                      {img.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FiLoader className="text-primary animate-spin text-sm" />
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      >
                        <FiTrash2 className="text-white text-xs" />
                      </button>
                    </motion.div>
                  ))}

                  {uploadedImages.length < 7 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 rounded border-2 border-dashed border-glass-border flex flex-col items-center justify-center text-muted hover:text-foreground hover:border-primary/50 transition-all group"
                    >
                      <FiPlus className="text-lg group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt Input OR Hybrid Text-Timeline Scene Builder */}
            {videoMode === "long" && longSubMode === "scenes" ? (
              <div className="p-4 space-y-2.5 max-h-[210px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded hover:bg-glass-hover text-muted hover:text-foreground transition-colors"
                      title="Subir foto del producto o referencia"
                    >
                      <FiImage size={18} />
                    </button>
                    <span className="text-[11px] font-bold text-muted">
                      Hybrid Text-Timeline Editor ({getEffectiveTotalDuration()}
                      s en total • cada bloque de texto controla un corte de
                      escena):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addScene}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <FiPlus size={12} />
                    <span>Agregar Corte / Escena</span>
                  </button>
                </div>

                {scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="flex flex-wrap sm:flex-nowrap items-start gap-2 p-2.5 rounded bg-bg-card border border-glass-border"
                  >
                    <span className="px-2 py-1 rounded bg-glass-hover text-[10px] font-black text-foreground whitespace-nowrap mt-0.5">
                      Corte {idx + 1}
                    </span>
                    <textarea
                      value={scene.prompt}
                      onChange={(e) =>
                        updateScene(scene.id, "prompt", e.target.value)
                      }
                      placeholder={
                        idx === 0
                          ? "Ej: Hook inicial del Influencer mirando a cámara presentando el producto/servicio..."
                          : idx === 1
                            ? "Ej: Mostrando los beneficios y cómo funciona el producto/servicio/video..."
                            : "Ej: Llamado a la acción final invitando a hacer clic en el enlace..."
                      }
                      rows={1}
                      className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-foreground placeholder-muted resize-none"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={scene.transition || "cut"}
                        onChange={(e) =>
                          updateScene(scene.id, "transition", e.target.value)
                        }
                        className="px-2 py-1 rounded bg-glass-bg border border-glass-border text-[10px] font-bold text-secondary-text outline-none"
                        title="Transición de cámara"
                      >
                        {TIMELINE_TRANSITIONS.map((tr) => (
                          <option key={tr.id} value={tr.id}>
                            {tr.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={scene.duration}
                        onChange={(e) =>
                          updateScene(
                            scene.id,
                            "duration",
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="px-2 py-1 rounded bg-glass-bg border border-glass-border text-[11px] font-bold text-foreground outline-none"
                      >
                        {selectedModel.fixedClipDuration ? (
                          <>
                            <option value={8}>8s</option>
                            <option value={16}>16s</option>
                            <option value={24}>24s</option>
                          </>
                        ) : (
                          <>
                            <option value={6}>6s</option>
                            <option value={10}>10s</option>
                            <option value={15}>15s</option>
                            {selectedModel.maxClipDuration >= 30 && (
                              <>
                                <option value={20}>20s</option>
                                <option value={30}>30s</option>
                              </>
                            )}
                          </>
                        )}
                      </select>
                      {scenes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeScene(scene.id)}
                          className="p-1 text-muted hover:text-rose-500 transition-colors"
                          title="Eliminar escena"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 flex items-center gap-2 pb-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded hover:bg-glass-hover text-muted hover:text-foreground transition-colors"
                  title="Subir foto de tu producto, servicio o referencia"
                >
                  <FiImage size={20} className="text-sm" />
                </button>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  placeholder={
                    isInfluencerMode
                      ? `Guion para ${selectedInfluencer?.name || "tu Influencer IA"} (o llena los datos arriba y presiona 'Armar Guion' / Generar)...`
                      : videoMode === "long"
                        ? `Modo Video Largo (${longTotalDuration}s): pega tu guion largo o separa párrafos con Enter para cada escena...`
                        : selectedModel.name
                          ? `Usando ${selectedModel.name}... Escribe tu guion...`
                          : "Elige un modelo y escribe tu guion..."
                  }
                  className="w-full bg-transparent border-none outline-none text-xs font-medium text-foreground placeholder-muted resize-none max-h-[180px] overflow-y-auto no-scrollbar"
                  rows={videoMode === "long" || isInfluencerMode ? 2 : 1}
                />
              </div>
            )}

            {!hasEffectiveReferenceImage() &&
              !selectedModel.supportsTextToVideo && (
                <p className="px-4 pt-2 text-[10px] text-amber-600">
                  Seedance 2 requiere una imagen de referencia (sube una imagen
                  o activa Influencer IA).
                </p>
              )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Parameters & Model Selection Bar (Integrated) */}
            <div className="flex items-center justify-between px-4 py-3 bg-glass-bg border-t border-glass-border rounded-b">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setIsModelsModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-glass-bg border border-glass-border hover:bg-glass-hover transition-colors group"
                >
                  <selectedModel.icon className="text-xs text-muted group-hover:text-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    {selectedModel.name}
                  </span>
                </button>

                <div className="w-px h-4 bg-glass-border mx-2" />

                {/* Dynamic Parameters */}
                <div className="flex items-center flex-wrap gap-2 max-w-[340px] md:max-w-none">
                  {selectedModel.params &&
                    Object.keys(selectedModel.params).map((key) => {
                      const param = selectedModel.params[key];
                      if (key === "duration") {
                        if (videoMode === "long") {
                          if (longSubMode === "scenes") {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold"
                              >
                                <span>
                                  Total: {getEffectiveTotalDuration()}s (
                                  {getEstimatedSceneCount()} escenas)
                                </span>
                              </div>
                            );
                          }
                          return (
                            <RangeParameter
                              key="long-duration"
                              label="Duración Total"
                              value={longTotalDuration}
                              min={selectedModel.fixedClipDuration ? 16 : 20}
                              max={180}
                              step={selectedModel.fixedClipDuration ? 8 : 5}
                              presets={
                                selectedModel.fixedClipDuration
                                  ? [16, 24, 32, 48, 64, 96, 120, 160]
                                  : LONG_VIDEO_PRESETS
                              }
                              unit="s"
                              helperText={`Se generarán ${getEstimatedSceneCount()} escenas continuas automáticamente`}
                              onChange={(val) => setLongTotalDuration(val)}
                            />
                          );
                        }

                        if (param.min) {
                          return (
                            <RangeParameter
                              key={key}
                              label="Length"
                              value={modelSettings[key]}
                              min={param.min}
                              max={param.max}
                              unit="s"
                              onChange={(val) => updateSetting(key, val)}
                            />
                          );
                        }
                      }
                      if (param.options && param.options.length > 1) {
                        return (
                          <CustomDropdown
                            key={key}
                            label={key.replace("_", " ")}
                            value={modelSettings[key]}
                            options={param.options}
                            onChange={(val) => updateSetting(key, val)}
                          />
                        );
                      }
                      if (param.options && param.options.length === 1) {
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-1.5 px-3 py-1"
                          >
                            <span className="text-xs font-medium text-muted capitalize">
                              {key.replace("_", " ")}:
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {param.options[0]}s
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Show credit balance & cost for both Admin and Buyers */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-glass-bg border border-glass-border rounded-full">
                  <FaCoins className="text-yellow-500 text-xs" />
                  <span className="text-[10px] font-bold text-secondary-text">
                    Costo: {getRequiredCredits()} CR
                  </span>
                  <span className="text-muted">•</span>
                  <span className="text-[10px] font-black text-emerald-500">
                    {isAdminUser
                      ? `Saldo Admin: ${Number(availableCredits).toLocaleString()} CR (∞)`
                      : `Saldo: ${Number(availableCredits).toLocaleString()} / ${Number(assignedCredits).toLocaleString()} CR`}
                  </span>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    !hasEffectiveInput() ||
                    uploadedImages.some((img) => img.status !== "ready") ||
                    (!hasEffectiveReferenceImage() &&
                      !selectedModel.supportsTextToVideo)
                  }
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {isGenerating ? (
                    <FiLoader className="text-lg animate-spin" />
                  ) : (
                    <FiArrowUp className="text-lg group-hover:-translate-y-1 group-hover:scale-110 transition-all" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Models Modal */}
        <AnimatePresence>
          {isModelsModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModelsModalOpen(false)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl h-[80vh] bg-bg-card rounded shadow-2xl flex flex-col overflow-y-auto"
              >
                <div className="p-6 border-b border-divider/50 flex items-center gap-6">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      className="w-full pl-12 pr-4 py-2 bg-glass-bg border border-glass-border rounded text-xs font-bold outline-none focus:bg-bg-card focus:border-divider transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setIsModelsModalOpen(false)}
                    className="p-2 hover:bg-glass-hover rounded-full transition-colors"
                  >
                    <FiX className="text-xl text-secondary-text" />
                  </button>
                </div>

                <div className="flex-1 p-6 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MODELS.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        className={`p-5 rounded border transition-all cursor-pointer space-y-4 group ${selectedModel.id === model.id ? "border-primary ring-1 ring-primary bg-bg-card-hover" : "border-divider/50 bg-bg-card hover:border-divider hover:shadow-md"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-10 h-10 rounded flex items-center justify-center border border-divider/50 transition-all ${selectedModel.id === model.id ? "bg-primary text-white" : "bg-bg-card-hover text-secondary-text group-hover:bg-primary group-hover:text-white"}`}
                          >
                            <model.icon className="text-lg" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              model.type === "MODEL"
                                ? "bg-amber-100 text-amber-600"
                                : model.type === "TOOL"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {model.type}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-slate-900">
                            {model.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">
                            {model.description}
                          </p>
                        </div>
                        <div className="pt-2 flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-300">
                            {model.params
                              ? Object.keys(model.params).join(" • ")
                              : model.metadata}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
