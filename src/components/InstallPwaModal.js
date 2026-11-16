"use client";

import { useEffect, useState } from "react";
import { FiX, FiShare, FiPlusSquare, FiSmartphone, FiCopy, FiCheck, FiAlertTriangle, FiCompass } from "react-icons/fi";
import { FaWhatsapp, FaApple, FaChrome } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UgcSymbol } from "./UgcLogo";

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isChromeIos, setIsChromeIos] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => {
      const standaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(Boolean(standaloneMode));

      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
      const isMobileDevice =
        /iphone|ipad|ipod|android|mobile/i.test(userAgent) ||
        (typeof window !== "undefined" && window.innerWidth < 768);

      const inApp =
        isIosDevice &&
        /instagram|fbav|fbios|fban|line|micromessenger|whatsapp|twitter|tiktok|threads|snapchat/.test(
          userAgent
        );
      const chromeOnIos = isIosDevice && /crios/.test(userAgent);

      setIsIos(Boolean(isIosDevice));
      setIsMobile(Boolean(isMobileDevice));
      setIsInAppBrowser(Boolean(inApp));
      setIsChromeIos(Boolean(chromeOnIos));
      setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");

      if (isIosDevice && !standaloneMode) {
        const dismissed = localStorage.getItem("ugcore_pwa_dismissed");
        if (!dismissed) {
          setTimeout(() => setShowFloatingBanner(true), 3500);
        }
      }
    };

    checkDevice();

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("ugcore_pwa_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowFloatingBanner(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowFloatingBanner(false);
      setIsOpenModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult?.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowFloatingBanner(false);
    } else {
      setIsOpenModal(true);
    }
  };

  const handleTriggerIosShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "UGCore Studio",
          text: "UGCore Studio - Generador de Videos UGC con Inteligencia Artificial",
          url: window.location.href,
        });
        toast.success("¡Desliza hacia abajo en el menú y toca 'Agregar a pantalla de inicio'!", {
          icon: "📲",
          duration: 6000,
        });
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.log("Share dismissed or error:", err);
        }
      }
    } else {
      toast("Usa el botón Compartir de Safari en la barra inferior", {
        icon: "ℹ️",
        duration: 4000,
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://ugcorestudio.vercel.app");
      setCopied(true);
      toast.success("Enlace copiado al portapapeles. ¡Pégalo en Safari!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const dismissBanner = () => {
    setShowFloatingBanner(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ugcore_pwa_dismissed", "true");
    }
  };

  if (isStandalone || isInstalled) return null;

  return (
    <>
      {/* Botón en barra superior */}
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-[#8B5CF6] to-indigo-600 hover:from-[#7C3AED] hover:to-indigo-500 text-white shadow-sm ring-1 ring-white/20 transition-all cursor-pointer active:scale-95"
        title="Instalar UGCore Studio como aplicación en tu celular"
      >
        <FiSmartphone className="text-xs" />
        <span>Instalar App</span>
      </button>

      {/* Floating Banner en móviles */}
      <AnimatePresence>
        {showFloatingBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-96 p-3.5 rounded-2xl bg-bg-card/95 backdrop-blur-xl border border-[#8B5CF6]/40 shadow-2xl shadow-[#8B5CF6]/20 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <UgcSymbol className="w-10 h-10 shadow-md" />
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground truncate">
                  Instala UGCore en tu celular
                </p>
                <p className="text-[10px] text-muted truncate">
                  Pantalla completa, acceso directo y mayor rapidez.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-black shadow-md cursor-pointer transition-all active:scale-95"
              >
                Instalar
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                className="p-1.5 rounded-lg text-muted hover:text-foreground cursor-pointer"
                title="Cerrar aviso"
              >
                <FiX size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Instructivo para iPhone / iPad / Android / Desktop */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-bg-card border border-[#8B5CF6]/40 shadow-2xl shadow-[#8B5CF6]/30 text-foreground space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-foreground hover:bg-glass-hover cursor-pointer"
              >
                <FiX size={18} />
              </button>

              <div className="flex items-center gap-3">
                <UgcSymbol className="w-12 h-12 shadow-lg" />
                <div>
                  <h3 className="text-sm font-black uppercase text-foreground">
                    {isIos ? "Instalar en tu iPhone" : "Instalar UGCore Studio"}
                  </h3>
                  <p className="text-xs text-muted">
                    {isIos
                      ? "Cómo agregar la App a la pantalla de tu iPhone"
                      : "Acceso directo en tu dispositivo"}
                  </p>
                </div>
              </div>

              {/* SECCIÓN IPHONE / IPAD */}
              {isIos ? (
                <div className="space-y-3.5">
                  {/* ALERTA: Si está dentro de WhatsApp / Instagram */}
                  {isInAppBrowser && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 space-y-2">
                      <div className="flex items-center gap-2 font-black text-amber-400">
                        <FiAlertTriangle size={16} />
                        <span>Estás dentro de WhatsApp / Instagram</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Apple bloquea la opción de instalar apps desde navegadores internos de redes sociales.
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black text-[11px] font-black cursor-pointer shadow-sm active:scale-95"
                        >
                          <FiCopy size={13} />
                          <span>Copiar link y abrir en Safari</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ALERTA: Si está en Google Chrome en iOS */}
                  {isChromeIos && (
                    <div className="p-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-xs text-blue-200 space-y-2">
                      <div className="flex items-center gap-2 font-black text-blue-400">
                        <FaChrome size={16} />
                        <span>Estás en Google Chrome para iPhone</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        En Chrome para iPhone: toca los tres puntos (•••) abajo a la derecha &gt; <strong>Compartir</strong> &gt; <strong>Añadir a la pantalla de inicio</strong>. O copia el enlace y ábrelo en <strong>Safari</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-[11px] font-black cursor-pointer shadow-sm active:scale-95"
                      >
                        <FiCopy size={13} />
                        <span>Copiar link para Safari</span>
                      </button>
                    </div>
                  )}

                  {/* Botón directo de compartir nativo en iOS */}
                  {canShare && (
                    <button
                      type="button"
                      onClick={handleTriggerIosShare}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-[#7C3AED] hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#8B5CF6]/30 active:scale-95 transition-all cursor-pointer"
                    >
                      <FiShare size={16} />
                      <span>1. Toca aquí para abrir Compartir en iPhone</span>
                    </button>
                  )}

                  {/* Pasos en Safari */}
                  <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 space-y-3">
                    <p className="text-xs font-black text-foreground">
                      Sigue estos pasos en la app Safari:
                    </p>

                    <div className="space-y-3.5 text-xs text-secondary-text">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <p>
                            En la barra inferior de Safari, toca el botón{" "}
                            <strong className="text-foreground">Compartir</strong>:
                          </p>
                          <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-page border border-glass-border text-[11px] font-bold text-[#8B5CF6]">
                            <FiShare size={13} />
                            <span>Ícono de cuadrado con flecha hacia arriba (⎋)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <p className="leading-relaxed">
                            <strong className="text-amber-300">Desliza con tu dedo hacia abajo</strong> en la lista de opciones hasta encontrar:
                          </p>
                          <div className="mt-1.5 space-y-1">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-page border border-[#8B5CF6]/40 text-[11px] font-bold text-foreground">
                              <FiPlusSquare size={14} className="text-[#8B5CF6] flex-shrink-0" />
                              <span>&quot;Agregar a pantalla de inicio&quot;</span>
                            </div>
                            <p className="text-[10px] text-muted pl-1">
                              (En España puede decir <em className="text-foreground">&quot;Añadir a pantalla de inicio&quot;</em>, o en inglés <em className="text-foreground">&quot;Add to Home Screen&quot;</em>).
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <p>
                            Toca <strong className="text-emerald-400">&quot;Agregar&quot;</strong> (o &quot;Add&quot;) en la esquina superior derecha.
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            ¡Listo! Se creará el ícono en la pantalla principal de tu iPhone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notas de resolución si no aparece */}
                  <div className="p-3.5 rounded-2xl bg-bg-page/80 border border-glass-border/60 text-[11px] space-y-2 text-muted leading-relaxed">
                    <p className="font-bold text-foreground flex items-center gap-1">
                      <FiCompass className="text-[#8B5CF6]" />
                      <span>¿Por qué no te aparece el término?</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5">
                      <li>
                        <strong>Estás en WhatsApp o Instagram</strong>: Apple solo lo permite si abres la página en la app <strong>Safari</strong> (el navegador con icono de brújula azul).
                      </li>
                      <li>
                        <strong>No deslizaste hacia abajo</strong>: En la ventana de compartir, baja con el dedo; la opción está debajo de &quot;Copiar&quot; y &quot;Favoritos&quot;.
                      </li>
                      <li>
                        <strong>Pestaña Privada</strong>: Si Safari está en modo privado (fondo oscuro en la barra de búsqueda), Apple oculta esta opción. Abre una pestaña normal.
                      </li>
                      <li>
                        <strong>Opción oculta</strong>: Desliza hasta el fondo del menú y toca <em>&quot;Editar acciones...&quot;</em> para activar <em>&quot;Agregar a pantalla de inicio&quot;</em>.
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover text-[11px] font-bold text-foreground cursor-pointer transition-all"
                    >
                      {copied ? <FiCheck size={13} className="text-emerald-400" /> : <FiCopy size={13} />}
                      <span>{copied ? "¡Enlace Copiado!" : "Copiar Enlace para Safari"}</span>
                    </button>
                  </div>
                </div>
              ) : isMobile ? (
                /* SECCIÓN ANDROID / CHROME MOBILE */
                <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 space-y-3 text-xs">
                  <p className="font-bold text-foreground">
                    Para instalar en Android / Google Chrome:
                  </p>
                  <div className="space-y-2 text-secondary-text">
                    <p>
                      1. Toca los tres puntos (⋮) en la esquina superior derecha de tu navegador.
                    </p>
                    <p>
                      2. Elige <strong className="text-foreground">&quot;Instalar aplicación&quot;</strong> o <strong className="text-foreground">&quot;Agregar a pantalla principal&quot;</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                /* SECCIÓN COMPUTADOR / DESKTOP (SOLO AQUÍ SE MUESTRA EL QR CODE) */
                <div className="p-4 rounded-2xl bg-bg-page/70 border border-glass-border/60 text-center space-y-3">
                  <p className="text-xs font-bold text-foreground">
                    ¿Estás en tu computador?
                  </p>
                  <p className="text-[11px] text-muted">
                    Escanea este código con la cámara de tu celular para abrirlo e instalarlo directamente en tu teléfono:
                  </p>
                  <div className="flex justify-center py-1">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://ugcorestudio.vercel.app"
                      alt="Código QR UGCore Studio"
                      className="w-36 h-36 rounded-2xl p-2 bg-white shadow-md border border-[#8B5CF6]/40"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <a
                      href="https://api.whatsapp.com/send?text=Abre%20UGCore%20Studio%20en%20tu%20celular:%20https://ugcorestudio.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm cursor-pointer transition-all"
                    >
                      <FaWhatsapp size={14} />
                      <span>Enviar a mi WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover text-[11px] font-bold text-foreground cursor-pointer transition-all"
                    >
                      {copied ? <FiCheck size={13} className="text-emerald-400" /> : <FiCopy size={13} />}
                      <span>{copied ? "¡Copiado!" : "Copiar Enlace"}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-5 py-2 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover text-xs font-bold text-foreground cursor-pointer transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}