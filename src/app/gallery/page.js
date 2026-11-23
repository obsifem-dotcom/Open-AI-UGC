"use client";

import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiVideo,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiMaximize2,
  FiCalendar,
  FiX,
  FiInfo,
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiZap,
  FiTrash2,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeamlessVideoPlayer from "@/components/SeamlessVideoPlayer";

const LOCAL_ARCHIVE_KEY = "ugcore_creations_archive_v1";
const DISMISSED_ARCHIVE_KEY = "ugcore_dismissed_creations_v1";

function readDismissedArchive() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISSED_ARCHIVE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function addDismissedArchive(itemOrId, requestId = null) {
  if (typeof window === "undefined" || !itemOrId) return;
  try {
    const set = readDismissedArchive();
    if (typeof itemOrId === "object" && itemOrId !== null) {
      if (itemOrId.id) set.add(String(itemOrId.id));
      if (itemOrId.requestId) set.add(String(itemOrId.requestId));
      const playable = getPlayableUrl(itemOrId) || itemOrId.url;
      if (playable) {
        set.add(String(playable).trim().toLowerCase());
        set.add(`url:${String(playable).trim().toLowerCase()}`);
      }
      if (itemOrId.prompt) {
        const cleanPrompt = String(itemOrId.prompt)
          .replace(/\[.*?\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .slice(0, 100);
        if (cleanPrompt.length >= 8) set.add(`prompt:${cleanPrompt}`);
      }
      const canonKey = getCanonicalCreationKey(itemOrId);
      if (canonKey) set.add(canonKey);
    } else {
      set.add(String(itemOrId));
      if (requestId) set.add(String(requestId));
    }
    window.localStorage.setItem(
      DISMISSED_ARCHIVE_KEY,
      JSON.stringify(Array.from(set))
    );
  } catch {
    // ignore
  }
}

function getUserArchiveKey(userEmail) {
  if (!userEmail) return "ugcore_creations_guest_v1";
  const clean = userEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
  return `ugcore_creations_${clean}_v1`;
}

export function getPlayableUrl(item) {
  if (!item) return null;
  if (Array.isArray(item.urls) && item.urls.length > 0 && typeof item.urls[0] === "string" && item.urls[0].startsWith("http")) {
    return item.urls[0];
  }
  if (typeof item.url === "string") {
    const trimmed = item.url.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string" && parsed[0].startsWith("http")) {
          return parsed[0];
        }
      } catch {}
    }
    if (trimmed.startsWith("http")) return trimmed;
  }
  return null;
}

function getCanonicalCreationKey(item) {
  if (!item) return null;

  // 1. If user creation (not showcase), deduplicate strictly by normalized prompt:
  // Guarantees one single card per video request even if IDs or storage layers differ!
  if (!item.isShowcase && typeof item.prompt === "string") {
    const cleanPrompt = item.prompt
      .replace(/\[.*?\]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .slice(0, 120);
    if (cleanPrompt.length >= 10) {
      return `prompt:${cleanPrompt}`;
    }
  }

  // 2. By real playable video URL (excluding generic demo placeholders)
  const playableUrl = getPlayableUrl(item);
  if (playableUrl && !playableUrl.includes("sample/ForBigger")) {
    return `url:${playableUrl.toLowerCase().trim()}`;
  }

  // 3. By cleaned Request ID
  if (item.requestId) {
    const rawReq = String(item.requestId).trim();
    if (rawReq.startsWith("[")) {
      try {
        const parsed = JSON.parse(rawReq);
        if (Array.isArray(parsed) && parsed[0]) {
          const clean = String(parsed[0]).replace(/["'\[\]\\]/g, "").trim();
          if (clean.length > 0) return `req:${clean}`;
        }
      } catch {}
    }
    const cleanReq = rawReq.replace(/["'\[\]\\]/g, "").trim();
    if (cleanReq.length > 0 && !cleanReq.startsWith("sandbox_req_")) {
      return `req:${cleanReq}`;
    }
  }

  // 4. By ID
  if (item.id) {
    return `id:${String(item.id).replace(/^mu_|^stateless_/, "")}`;
  }

  return null;
}

function readLocalArchive(userEmail = null) {
  if (typeof window === "undefined") return [];
  try {
    const key = getUserArchiveKey(userEmail);
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    if (userEmail) {
      const guestRaw = window.localStorage.getItem("ugcore_creations_guest_v1");
      const guestParsed = guestRaw ? JSON.parse(guestRaw) : [];
      if (Array.isArray(guestParsed) && guestParsed.length > 0) {
        return [...list, ...guestParsed];
      }
    }
    return list;
  } catch {
    return [];
  }
}

function writeLocalArchive(items, userEmail = null) {
  if (typeof window === "undefined") return;
  try {
    const key = getUserArchiveKey(userEmail);
    const userItems = items.filter((item) => !item.isShowcase).slice(0, 60);
    window.localStorage.setItem(key, JSON.stringify(userItems));
  } catch {
    // ignore storage errors
  }
}

function mergeCreationsList(localItems, serverItems, sessionUser = null) {
  const dismissed = readDismissedArchive();
  const byKey = new Map();

  // 1. Process server items FIRST (Server/Vercel is the authoritative source of truth)
  for (const rawItem of (serverItems || [])) {
    if (!rawItem || !rawItem.id) continue;
    if (dismissed.has(String(rawItem.id))) continue;
    if (rawItem.requestId && dismissed.has(String(rawItem.requestId))) continue;

    const playableUrl = getPlayableUrl(rawItem);
    if (playableUrl && (playableUrl.includes("sample/ForBigger") || playableUrl.includes("commondatastorage"))) {
      continue;
    }
    if (playableUrl && dismissed.has(playableUrl.toLowerCase().trim())) continue;

    if (typeof rawItem.prompt === "string") {
      const cleanPrompt = rawItem.prompt
        .replace(/\[.*?\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .slice(0, 100);
      if (cleanPrompt.length >= 8 && dismissed.has(`prompt:${cleanPrompt}`)) continue;
    }

    const item = {
      ...rawItem,
      url: playableUrl || rawItem.url,
    };

    const key = getCanonicalCreationKey(item) || item.id;
    if (dismissed.has(key)) continue;

    if (!byKey.has(key)) {
      byKey.set(key, item);
    } else {
      const existing = byKey.get(key);
      const isBetter =
        (item.url && !existing.url) ||
        (item.status === "completed" && existing.status !== "completed");
      byKey.set(
        key,
        isBetter ? { ...existing, ...item } : { ...item, ...existing }
      );
    }
  }

  // 2. Only add local items if they do NOT match any existing server creation
  for (const rawItem of (localItems || [])) {
    if (!rawItem || !rawItem.id) continue;
    if (dismissed.has(String(rawItem.id))) continue;
    if (rawItem.requestId && dismissed.has(String(rawItem.requestId))) continue;

    const playableUrl = getPlayableUrl(rawItem);
    if (playableUrl && (playableUrl.includes("sample/ForBigger") || playableUrl.includes("commondatastorage"))) {
      continue;
    }
    if (playableUrl && dismissed.has(playableUrl.toLowerCase().trim())) continue;

    if (typeof rawItem.prompt === "string") {
      const cleanPrompt = rawItem.prompt
        .replace(/\[.*?\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .slice(0, 100);
      if (cleanPrompt.length >= 8 && dismissed.has(`prompt:${cleanPrompt}`)) continue;
    }

    const item = {
      ...rawItem,
      url: playableUrl || rawItem.url,
    };

    const key = getCanonicalCreationKey(item) || item.id;
    if (dismissed.has(key)) continue;

    // If already in byKey, DO NOT DUPLICATE!
    if (byKey.has(key)) {
      const existing = byKey.get(key);
      byKey.set(key, { ...item, ...existing });
    } else {
      // Check if any existing item has matching normalized prompt
      const cleanPrompt = (item.prompt || "")
        .replace(/\[.*?\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .slice(0, 80);
      const isDuplicate = Array.from(byKey.values()).some((ex) => {
        if (!ex.prompt) return false;
        const exClean = ex.prompt
          .replace(/\[.*?\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .slice(0, 80);
        return exClean.length >= 10 && exClean === cleanPrompt;
      });

      if (!isDuplicate) {
        byKey.set(key, item);
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const aShow = Boolean(a.isShowcase);
    const bShow = Boolean(b.isShowcase);
    if (aShow !== bShow) return aShow ? 1 : -1;
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });
}

export default function GalleryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "mine" | "influencer" | "long"
  const [copiedId, setCopiedId] = useState(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const userEmail = session?.user?.email || null;
    const localItems = readLocalArchive(userEmail);
    try {
      const response = await fetch("/api/creations", { cache: "no-store" });
      if (response.ok) {
        const serverData = await response.json();
        const serverItems = Array.isArray(serverData) ? serverData : [];
        const merged = mergeCreationsList(localItems, serverItems, session?.user);
        setCreations(merged);
        writeLocalArchive(merged, userEmail);
      } else if (localItems.length > 0) {
        setCreations((prev) => mergeCreationsList(localItems, prev, session?.user));
      }
    } catch (error) {
      console.error("Failed to fetch creations:", error);
      if (localItems.length > 0) {
        setCreations((prev) => mergeCreationsList(localItems, prev, session?.user));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInitialGallery = async () => {
      // Clean up legacy unpartitioned archive to prevent admin creations leaking to buyers
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem("ugcore_creations_archive_v1");
        } catch {
          // ignore
        }
      }

      const userEmail = session?.user?.email || null;
      const localItems = readLocalArchive(userEmail);
      try {
        const response = await fetch("/api/creations", { cache: "no-store" });
        if (!isMounted) return;
        if (response.ok) {
          const serverData = await response.json();
          const serverItems = Array.isArray(serverData) ? serverData : [];
          const merged = mergeCreationsList(localItems, serverItems, session?.user);
          setCreations(merged);
          writeLocalArchive(merged, userEmail);
        } else if (localItems.length > 0) {
          setCreations((prev) => mergeCreationsList(localItems, prev, session?.user));
        }
      } catch (error) {
        console.error("Failed to fetch creations:", error);
        if (isMounted && localItems.length > 0) {
          setCreations((prev) => mergeCreationsList(localItems, prev, session?.user));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchInitialGallery();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, session?.user?.id]);

  // Poll any creation currently in processing state
  useEffect(() => {
    const activeStatuses = ["processing", "pending", "starting", "queued"];
    const pendingItems = creations.filter(
      (c) => c && c.id && activeStatuses.includes(c.status) && !c.isShowcase
    );
    if (pendingItems.length === 0) return;

    const timer = setInterval(async () => {
      let hasUpdates = false;
      const updatedMap = new Map();

      await Promise.all(
        pendingItems.map(async (item) => {
          try {
            const res = await fetch(`/api/creations/${item.id}`, {
              cache: "no-store",
            });
            if (res.ok) {
              const updated = await res.json();
              if (
                updated &&
                (updated.status !== item.status ||
                  updated.url !== item.url ||
                  updated.segmentsCompleted !== item.segmentsCompleted)
              ) {
                hasUpdates = true;
                updatedMap.set(item.id, updated);
              }
            }
          } catch {
            // ignore transient polling error
          }
        })
      );

      if (hasUpdates) {
        setCreations((prev) => {
          const next = prev.map((c) =>
            updatedMap.has(c.id) ? { ...c, ...updatedMap.get(c.id) } : c
          );
          writeLocalArchive(next);
          return next;
        });
        setSelectedCreation((prev) =>
          prev && updatedMap.has(prev.id)
            ? { ...prev, ...updatedMap.get(prev.id) }
            : prev
        );
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [creations]);

  const handleCopyPrompt = async (item) => {
    if (!item?.prompt) return;
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleReuseInStudio = (item) => {
    if (typeof window !== "undefined" && item?.prompt) {
      window.sessionStorage.setItem("ugcore_reuse_prompt", item.prompt);
    }
    router.push("/");
  };

  const handleDeleteCreation = async (itemOrId, e) => {
    if (e) e.stopPropagation();
    const item =
      typeof itemOrId === "object" && itemOrId !== null
        ? itemOrId
        : creations.find((c) => c.id === itemOrId) || { id: itemOrId };

    const id = item.id;
    const reqId = item.requestId;
    const playable = getPlayableUrl(item) || item.url;
    const cleanPrompt = item.prompt
      ? item.prompt
          .replace(/\[.*?\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .slice(0, 100)
      : "";

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este video de tu galería?"
    );
    if (!confirmed) return;

    // 1. Register as permanently dismissed across all keys on this device
    addDismissedArchive(item);

    // 2. Remove immediately from React state
    setCreations((prev) => {
      const next = prev.filter((c) => {
        if (c.id === id) return false;
        if (reqId && c.requestId === reqId) return false;
        if (playable) {
          const cPlayable = getPlayableUrl(c) || c.url;
          if (cPlayable && cPlayable.toLowerCase().trim() === playable.toLowerCase().trim()) return false;
        }
        if (cleanPrompt && c.prompt) {
          const cClean = c.prompt
            .replace(/\[.*?\]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase()
            .slice(0, 100);
          if (cClean === cleanPrompt) return false;
        }
        return true;
      });
      writeLocalArchive(next, session?.user?.email || null);
      return next;
    });

    if (selectedCreation?.id === id) {
      setSelectedCreation(null);
    }

    // 3. Call server DELETE endpoint with all identifiers in body
    try {
      const targetParam = id || "item";
      await fetch(`/api/creations/${encodeURIComponent(targetParam)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          requestId: reqId,
          url: playable,
          prompt: item.prompt,
        }),
      });
      toast.success("🗑️ Video eliminado de tu galería");
    } catch (err) {
      console.warn("Failed to delete creation from server:", err);
    }
  };

  const filteredCreations = creations.filter((item) => {
    if (activeFilter === "mine") return !item.isShowcase;
    if (activeFilter === "influencer")
      return Boolean(
        item.influencerName ||
          item.environmentName ||
          item.category === "influencer" ||
          item.category === "chroma"
      );
    if (activeFilter === "long")
      return Boolean(
        (item.segmentsTotal && item.segmentsTotal > 1) ||
          (item.duration && item.duration >= 30) ||
          item.category === "longform"
      );
    return true;
  });

  const userCreationsCount = creations.filter((c) => !c.isShowcase).length;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
      <header className="max-w-7xl mx-auto mb-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-muted">
            <FiCalendar className="text-xs text-[#8B5CF6]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#8B5CF6]">
              UGCore Studio • Archivo & Galería de Producciones
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-3 py-1.5 rounded-full bg-glass-bg hover:bg-glass-hover border border-glass-border text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FiRefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-[#8B5CF6]" : ""}
              />
              <span>Sincronizar Galería</span>
            </button>

            <Button
              onClick={() => router.push("/")}
              size="sm"
              className="!rounded-full !bg-[#8B5CF6] !text-white hover:!bg-[#7C3AED] px-5 py-2.5 font-bold text-xs shadow-lg shadow-[#8B5CF6]/25"
            >
              <FiPlus className="mr-1.5" /> Crear Nuevo Video
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              GALERÍA DE VIDEOS & PRODUCCIONES IA
            </h1>
            <p className="text-muted font-medium text-xs leading-relaxed max-w-2xl">
              Visualiza, reproduce sin cortes, descarga en MP4 o reutiliza los
              guiones de tus videos generados, avatares en estudios virtuales
              (#8B5CF6 & HeyGen Sets) y flujos largos de YouTube.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
              }`}
            >
              Todos ({creations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("mine")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeFilter === "mine"
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
              }`}
            >
              Mis Generaciones ({userCreationsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("influencer")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeFilter === "influencer"
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
              }`}
            >
              Influencers & Sets Virtuales
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("long")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeFilter === "long"
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-glass-bg text-secondary-text border-glass-border hover:text-foreground"
              }`}
            >
              Videos Largos / YouTube
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-4">
            <FiClock className="text-4xl text-[#8B5CF6] animate-spin" />
            <span className="text-xs font-bold text-muted animate-pulse">
              Cargando producciones de la galería...
            </span>
          </div>
        ) : filteredCreations.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 rounded-2xl border border-glass-border bg-bg-card/40 p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center">
              <FiVideo className="text-2xl text-[#8B5CF6]" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-black text-foreground">
                No hay videos en este filtro todavía
              </h3>
              <p className="text-xs text-muted">
                Genera un nuevo video en el estudio o cambia a la pestaña
                &ldquo;Todos&rdquo; para explorar las producciones de muestra.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="px-4 py-2 rounded-full border border-glass-border bg-glass-bg text-xs font-bold text-foreground cursor-pointer"
                >
                  Ver Todas las Producciones
                </button>
              )}
              <Button
                onClick={() => router.push("/")}
                variant="primary"
                className="!rounded-full !bg-[#8B5CF6] px-6 text-xs font-bold"
              >
                Ir al Estudio de Creación
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredCreations.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group relative rounded-xl bg-solid-bg border border-glass-border aspect-[3/4] cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8B5CF6]/50 hover:-translate-y-1 transition-all flex flex-col justify-between"
                  onClick={() => setSelectedCreation(item)}
                >
                  {item.status === "completed" && getPlayableUrl(item) ? (
                    <>
                      <video
                        src={getPlayableUrl(item)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.isShowcase ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/90 backdrop-blur-md text-[9px] font-black text-white uppercase">
                              Demo Studio
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[9px] font-black text-white uppercase">
                              Mi Video
                            </span>
                          )}
                          {item.segmentsTotal > 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white border border-white/15">
                              {item.segmentsTotal} Escenas
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white">
                          {item.aspectRatio || "9:16"} •{" "}
                          {item.duration ? `${item.duration}s` : "15s"}
                        </span>
                      </div>

                      {item.environmentName && (
                        <div className="absolute top-10 left-3 px-2 py-0.5 rounded bg-black/65 backdrop-blur-md text-[9px] font-bold text-[#C4B5FD] border border-[#8B5CF6]/40 pointer-events-none">
                          {item.environmentName}
                        </div>
                      )}
                    </>
                  ) : item.status === "failed" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-rose-500/10 p-6 text-center gap-3">
                      <FiAlertCircle className="text-rose-500 text-3xl" />
                      <span className="text-xs font-bold text-rose-500">
                        Generación Fallida
                      </span>
                      <p className="text-[10px] text-muted line-clamp-3">
                        {item.error || "Error durante el renderizado del modelo."}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-glass-hover p-6 text-center gap-3">
                      <FiClock className="text-3xl text-[#8B5CF6] animate-spin" />
                      <span className="text-xs font-bold text-foreground animate-pulse">
                        Renderizando Video...
                      </span>
                      {item.segmentsTotal > 1 && (
                        <span className="text-[10px] font-semibold text-muted">
                          Escenas listas: {item.segmentsCompleted || 0} /{" "}
                          {item.segmentsTotal}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom overlay info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 pt-12 flex flex-col justify-end">
                    {item.title && (
                      <p className="text-[11px] font-black text-white truncate mb-0.5">
                        {item.title}
                      </p>
                    )}
                    <p className="text-white/80 text-[10px] font-medium leading-snug line-clamp-2 mb-2.5">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/15 text-[9px] font-bold text-white uppercase">
                        {item.modelId || "grok-video"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReuseInStudio(item);
                          }}
                          title="Usar este guion en el estudio"
                          className="px-2 py-1 rounded bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FiZap size={10} />
                          <span>Usar Guion</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCreation(item, e)}
                          title="Eliminar de mi galería"
                          className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 cursor-pointer transition-colors"
                        >
                          <FiTrash2 size={11} />
                        </button>
                        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                          <FiMaximize2 size={11} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCreation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md p-4 md:p-10 flex flex-col items-center justify-center"
            onClick={() => setSelectedCreation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-bg-card rounded-2xl border border-glass-border overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Side */}
              <div className="flex w-full md:w-[58%] min-h-[320px] md:min-h-[520px] bg-black border-b md:border-b-0 md:border-r border-glass-border items-center justify-center">
                {selectedCreation.status === "completed" &&
                (selectedCreation.url || (selectedCreation.urls && selectedCreation.urls.length > 0) || getPlayableUrl(selectedCreation)) ? (
                  <SeamlessVideoPlayer
                    url={getPlayableUrl(selectedCreation) || selectedCreation.url}
                    urls={selectedCreation.urls}
                    className="h-full w-full object-contain max-h-[75vh]"
                    showSceneBar={true}
                    showDownloadButton={true}
                    muted={false}
                    title={`ugcore-${selectedCreation.id}`}
                  />
                ) : selectedCreation.status === "failed" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <FiAlertCircle className="text-rose-500 text-5xl" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-rose-500">
                        Error en la Generación
                      </h3>
                      <p className="text-xs text-muted max-w-xs">
                        {selectedCreation.error ||
                          "El proveedor reportó un error al procesar este clip."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                    <FiClock className="text-5xl text-[#8B5CF6] animate-spin" />
                    <span className="text-xs font-bold text-white animate-pulse">
                      Sincronizando renderizado en vivo...
                    </span>
                  </div>
                )}
              </div>

              {/* Details Side */}
              <div className="flex w-full md:w-[42%] p-6 md:p-7 flex-col justify-between overflow-y-auto max-h-[85vh]">
                <div className="space-y-5">
                  <div className="space-y-2 pr-8">
                    <div className="flex items-center gap-2 text-[#8B5CF6]">
                      <FiInfo className="text-xs" />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Detalles de Producción
                      </span>
                    </div>
                    {selectedCreation.title && (
                      <h2 className="text-base font-black text-foreground">
                        {selectedCreation.title}
                      </h2>
                    )}
                    {selectedCreation.influencerName && (
                      <p className="text-xs font-bold text-emerald-500">
                        👤 {selectedCreation.influencerName}
                      </p>
                    )}
                    {selectedCreation.environmentName && (
                      <p className="text-xs font-bold text-[#8B5CF6]">
                        🎬 Entorno: {selectedCreation.environmentName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-muted">
                        Prompt / Guion Completo
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(selectedCreation)}
                        className="text-[10px] font-bold text-[#8B5CF6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === selectedCreation.id ? (
                          <>
                            <FiCheck size={11} />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <FiCopy size={11} />
                            <span>Copiar Guion</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-medium text-foreground leading-relaxed p-3 rounded-xl bg-glass-bg border border-glass-border max-h-40 overflow-y-auto">
                      {selectedCreation.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-glass-border">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted">
                        Modelo
                      </div>
                      <div className="text-xs text-foreground font-black">
                        {selectedCreation.modelId || "grok-video"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted">
                        Formato
                      </div>
                      <div className="text-xs text-foreground font-black">
                        {selectedCreation.aspectRatio || "9:16"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted">
                        Duración
                      </div>
                      <div className="text-xs text-foreground font-black">
                        {selectedCreation.duration
                          ? `${selectedCreation.duration}s`
                          : "15s"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted">
                        Resolución
                      </div>
                      <div className="text-xs text-foreground font-black">
                        {selectedCreation.resolution || "720p"}
                      </div>
                    </div>
                  </div>

                  {selectedCreation.inputImages?.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-glass-border">
                      <div className="text-[10px] font-bold uppercase text-muted">
                        Referencias Visuales (@image1 / Estudio Virtual)
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedCreation.inputImages.map((img, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-lg border border-glass-border overflow-hidden bg-glass-hover"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt={`Referencia ${i + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleReuseInStudio(selectedCreation)}
                    className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#8B5CF6]/25"
                  >
                    <FiZap size={14} /> Usar este Guion en el Estudio
                  </button>

                  {selectedCreation.url && (
                    <a
                      href={selectedCreation.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-glass-bg hover:bg-glass-hover border border-glass-border text-foreground rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <FiDownload size={14} /> Descargar Video MP4
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={(e) =>
                      handleDeleteCreation(selectedCreation, e)
                    }
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FiTrash2 size={13} /> Eliminar este Video de la Galería
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCreation(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer"
              >
                <FiX />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
