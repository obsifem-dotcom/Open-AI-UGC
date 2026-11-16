"use client";

import { useEffect, useState } from "react";
import { FiX, FiShare, FiPlusSquare, FiSmartphone } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => {
      const standaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(Boolean(standaloneMode));

      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice =
        /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
      setIsIos(Boolean(isIosDevice));

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

  const dismissBanner = () => {
    setShowFloatingBanner(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ugcore_pwa_dismissed", "true");
    }
  };

  if (isStandalone || isInstalled) return null;

  return (
    <>
      {/* Botón en barra para abrir el instalador */}
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-[#8B5CF6] to-indigo-600 hover:from-[#7C3AED] hover:to-indigo-500 text-white shadow-sm ring-1 ring-white/20 transition-all cursor-pointer active:scale-95"
        title="Instalar UGCore Studio como aplicación en tu celular o computador"
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#4C1D95] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <FiSmartphone size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground truncate">
                  Instala UGCore en tu celular
                </p>
                <p className="text-[10px] text-muted truncate">
                  Acceso directo, pantalla completa y sin barras de navegador.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-black shadow-md cursor-pointer transition-all"
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

      {/* Modal Instructivo para iPhone / iPad y Navegadores */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-bg-card border border-[#8B5CF6]/40 shadow-2xl shadow-[#8B5CF6]/30 text-foreground space-y-4"
            >
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-foreground hover:bg-glass-hover cursor-pointer"
              >
                <FiX size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#4C1D95] flex items-center justify-center text-white shadow-lg">
                  <FiSmartphone size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-foreground">
                    Instalar UGCore Studio App
                  </h3>
                  <p className="text-xs text-muted">
                    {isIos
                      ? "Guía rápida para iPhone y iPad (Safari)"
                      : "Guía de instalación en tu dispositivo"}
                  </p>
                </div>
              </div>

              {isIos ? (
                <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 space-y-3">
                  <p className="text-xs font-bold text-foreground">
                    Sigue estos 3 pasos rápidos en Safari:
                  </p>
                  <div className="space-y-2.5 text-xs text-secondary-text">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <p>
                        Toca el botón <strong className="text-foreground">Compartir</strong> (<FiShare className="inline text-[#8B5CF6]" /> icono de la cajita con la flecha) en la barra inferior de Safari.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <p>
                        Desliza hacia abajo en el menú y selecciona <strong className="text-foreground">&quot;Agregar a pantalla de inicio&quot;</strong> (<FiPlusSquare className="inline text-[#8B5CF6]" />).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <p>
                        Toca <strong className="text-emerald-400">&quot;Agregar&quot;</strong> en la esquina superior derecha. ¡Y listo!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 space-y-3 text-xs">
                  <p className="font-bold text-foreground">
                    Para instalar en Android o Chrome:
                  </p>
                  <p className="text-secondary-text">
                    Toca el menú de tres puntos (⋮) en la esquina superior derecha de tu navegador y elige <strong className="text-foreground">&quot;Instalar aplicación&quot;</strong> o <strong className="text-foreground">&quot;Agregar a pantalla principal&quot;</strong>.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover text-xs font-bold text-foreground cursor-pointer"
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
