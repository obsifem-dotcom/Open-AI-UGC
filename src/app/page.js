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
} from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCoins } from "react-icons/fa";
import SeamlessVideoPlayer from "@/components/SeamlessVideoPlayer";
import {
  AI_INFLUENCERS,
  PROMO_CATEGORIES,
  buildInfluencerScript,
} from "@/lib/influencers";

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
  const { status } = useSession();
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);

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
    { id: "s1", label: "Escena 1 (Hook)", prompt: "", duration: 15 },
    { id: "s2", label: "Escena 2 (Producto / Demo)", prompt: "", duration: 15 },
    { id: "s3", label: "Escena 3 (Beneficios y CTA)", prompt: "", duration: 15 },
  ]);

  // AI Influencer & Promotion Studio state
  const [isInfluencerMode, setIsInfluencerMode] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(
    AI_INFLUENCERS[0]
  );
  const [useInfluencerReferenceImage, setUseInfluencerReferenceImage] =
    useState(true);
  const [promoType, setPromoType] = useState("product"); // "product" | "service" | "video"
  const [promoName, setPromoName] = useState("");
  const [promoBenefit, setPromoBenefit] = useState("");
  const [promoCta, setPromoCta] = useState("");
  const [promoStyle, setPromoStyle] = useState("showcase");

  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [lastGeneration, setLastGeneration] = useState(null);
  const fileInputRef = useRef(null);

  const currentPromoCategory =
    PROMO_CATEGORIES.find((c) => c.id === promoType) || PROMO_CATEGORIES[0];

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

  const handlePromoTypeChange = (newType) => {
    setPromoType(newType);
    const cat = PROMO_CATEGORIES.find((c) => c.id === newType);
    if (cat && cat.styles.length > 0) {
      setPromoStyle(cat.styles[0].id);
    }
  };

  const applyInfluencerPromoToScript = () => {
    const readyUploads = uploadedImages.filter((img) => img.status === "ready");
    const { singleScript, multiScenes } = buildInfluencerScript({
      influencer: selectedInfluencer,
      promoType,
      name: promoName,
      benefit: promoBenefit,
      cta: promoCta,
      style: promoStyle,
      useInfluencerAvatar: useInfluencerReferenceImage && Boolean(selectedInfluencer?.avatar),
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
    if (isInfluencerMode && (promoName.trim() || promoBenefit.trim())) {
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
      selectedInfluencer?.avatar
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

      // Combine AI Influencer avatar reference (if Influencer mode is active) with user uploaded product/asset images
      const combinedImageUrls = [
        ...(isInfluencerMode &&
        useInfluencerReferenceImage &&
        selectedInfluencer?.avatar
          ? [selectedInfluencer.avatar]
          : []),
        ...readyUserUrls,
      ].slice(0, 7);

      // Auto-build Influencer script if user filled Influencer promo fields without manually writing a prompt
      const autoBuilt = isInfluencerMode
        ? buildInfluencerScript({
            influencer: selectedInfluencer,
            promoType,
            name: promoName,
            benefit: promoBenefit,
            cta: promoCta,
            style: promoStyle,
            useInfluencerAvatar:
              useInfluencerReferenceImage && Boolean(selectedInfluencer?.avatar),
            hasUploadedAsset: readyUserUrls.length > 0,
          })
        : null;

      let activeScenes = [];
      let finalPrompt = prompt.trim();

      if (videoMode === "long" && longSubMode === "scenes") {
        const userScenes = scenes.filter((s) => s.prompt.trim().length > 0);
        if (userScenes.length > 0) {
          activeScenes = userScenes.map((s) => ({
            prompt:
              isInfluencerMode && selectedInfluencer
                ? `${selectedInfluencer.visualPrompt}. ${s.prompt.trim()}`
                : s.prompt.trim(),
            duration:
              Number(s.duration) || selectedModel.minClipDuration || 8,
          }));
        } else if (autoBuilt) {
          const defaultDur =
            selectedModel.fixedClipDuration ||
            Math.min(15, selectedModel.maxClipDuration || 15);
          activeScenes = autoBuilt.multiScenes.map((ms) => ({
            prompt: ms.prompt,
            duration: defaultDur,
          }));
        }
        finalPrompt = activeScenes
          .map((s, i) => `[Escena ${i + 1}] ${s.prompt}`)
          .join("\n");
      } else {
        if (!finalPrompt && autoBuilt) {
          finalPrompt = autoBuilt.singleScript;
        } else if (
          isInfluencerMode &&
          selectedInfluencer &&
          !finalPrompt.includes(selectedInfluencer.visualPrompt)
        ) {
          finalPrompt = `${selectedInfluencer.visualPrompt}. ${finalPrompt}`;
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
          images: combinedImageUrls,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setLastGeneration({
        id: data.creationId,
        status: "processing",
        prompt: finalPrompt,
        segmentsTotal: data.segmentsTotal || 1,
        segmentsCompleted: 0,
        duration: data.totalDuration || effectiveDuration,
      });

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
                      ? `Modo Video Largo (${getEffectiveTotalDuration()}s • ${getEstimatedSceneCount()} escenas)`
                      : "Modo Video Corto"}
                  </span>
                  {isInfluencerMode && selectedInfluencer && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px]">
                      • Influencer IA: {selectedInfluencer.name}
                    </span>
                  )}
                </div>
                <p className="text-muted text-xs font-bold max-w-[320px] leading-relaxed">
                  {isInfluencerMode
                    ? "Selecciona tu Influencer IA abajo, elige Producto, Servicio o Video y genera tu anuncio promocional."
                    : "Usa @image1, @image2 en tu guion o activa 'Influencer IA' para promocionar un producto, servicio o video."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={lastGeneration.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg aspect-[9/16] max-h-[52vh] bg-glass-bg rounded border border-glass-border shadow-2xl overflow-hidden flex flex-col items-center justify-center"
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
                    title={`ugcora-${lastGeneration.id}`}
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
            {/* Top Mode Selector Bar: Short Video | Long Video | AI Influencer Promo */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-glass-border bg-glass-bg/60">
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
                      ? `Influencer IA: ${selectedInfluencer?.name || "Activo"}`
                      : "🧑‍🎤 Influencer IA (Producto / Servicio / Video)"}
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

            {/* AI Influencer & Promotion Studio Panel */}
            <AnimatePresence>
              {isInfluencerMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-glass-border bg-bg-card/50 p-4 space-y-3 overflow-hidden"
                >
                  {/* Row 1: Influencer Roster */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-muted">
                        1. Elige tu Influencer IA Presentador:
                      </span>
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useInfluencerReferenceImage}
                          onChange={(e) =>
                            setUseInfluencerReferenceImage(e.target.checked)
                          }
                          className="rounded accent-emerald-500"
                        />
                        <span>Usar foto de rostro del Influencer (@image1)</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {AI_INFLUENCERS.map((inf) => {
                        const isSelected = selectedInfluencer?.id === inf.id;
                        return (
                          <button
                            key={inf.id}
                            type="button"
                            onClick={() => setSelectedInfluencer(inf)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all flex-shrink-0 cursor-pointer ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                                : "border-glass-border bg-bg-card hover:border-primary/40"
                            }`}
                          >
                            <img
                              src={inf.avatar}
                              alt={inf.name}
                              className="w-10 h-10 rounded-full object-cover border border-white/20"
                            />
                            <div className="pr-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground">
                                  {inf.name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-bold">
                                  {inf.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted font-medium">
                                {inf.niche}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 2: What to Promote (Product / Service / Video) */}
                  <div className="space-y-2 pt-1 border-t border-glass-border/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted mr-1">
                          2. ¿Qué va a promocionar?
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePromoTypeChange("product")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            promoType === "product"
                              ? "bg-primary text-white"
                              : "bg-glass-bg text-muted hover:text-foreground border border-glass-border"
                          }`}
                        >
                          <FiShoppingBag size={12} />
                          <span>Un Producto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromoTypeChange("service")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            promoType === "service"
                              ? "bg-primary text-white"
                              : "bg-glass-bg text-muted hover:text-foreground border border-glass-border"
                          }`}
                        >
                          <FiBriefcase size={12} />
                          <span>Un Servicio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromoTypeChange("video")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            promoType === "video"
                              ? "bg-primary text-white"
                              : "bg-glass-bg text-muted hover:text-foreground border border-glass-border"
                          }`}
                        >
                          <FiPlayCircle size={12} />
                          <span>Un Video / Contenido</span>
                        </button>
                      </div>

                      <select
                        value={promoStyle}
                        onChange={(e) => setPromoStyle(e.target.value)}
                        className="px-2.5 py-1 rounded bg-bg-card border border-glass-border text-[11px] font-bold text-foreground outline-none"
                      >
                        {currentPromoCategory.styles.map((st) => (
                          <option key={st.id} value={st.id}>
                            Estilo: {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={promoName}
                        onChange={(e) => setPromoName(e.target.value)}
                        placeholder={currentPromoCategory.namePlaceholder}
                        className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={promoBenefit}
                        onChange={(e) => setPromoBenefit(e.target.value)}
                        placeholder={currentPromoCategory.benefitPlaceholder}
                        className="px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={promoCta}
                          onChange={(e) => setPromoCta(e.target.value)}
                          placeholder={currentPromoCategory.ctaPlaceholder}
                          className="flex-1 px-3 py-1.5 rounded bg-bg-card border border-glass-border text-xs text-foreground placeholder-muted outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={applyInfluencerPromoToScript}
                          className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shadow-sm"
                          title="Generar guion publicitario con el Influencer seleccionado"
                        >
                          <FiCheck size={13} />
                          <span>Armar Guion</span>
                        </button>
                      </div>
                    </div>
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

            {/* Prompt Input OR Multi-Scene Builder */}
            {videoMode === "long" && longSubMode === "scenes" ? (
              <div className="p-4 space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar">
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
                      Escenas del Video Largo ({getEffectiveTotalDuration()}s en
                      total):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addScene}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <FiPlus size={12} />
                    <span>Agregar Escena</span>
                  </button>
                </div>

                {scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="flex items-start gap-2 p-2.5 rounded bg-bg-card border border-glass-border"
                  >
                    <span className="px-2 py-1 rounded bg-glass-hover text-[10px] font-black text-foreground whitespace-nowrap mt-0.5">
                      Escena {idx + 1}
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
                {/* Show credit cost */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-glass-bg border border-glass-border rounded-full">
                  <FaCoins className="text-yellow-600 text-xs" />
                  <span className="text-[10px] font-bold text-secondary-text">
                    Cost: {getRequiredCredits()}
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
