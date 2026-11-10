"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaKey,
  FaInfoCircle,
  FaArrowRight,
  FaUserShield,
  FaCheckCircle,
  FaCreditCard,
  FaCoins,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") || searchParams.get("next") || "/";

  const [activeTab, setActiveTab] = useState("admin"); // "admin" | "buyer" | "apikey"
  const [adminEmail, setAdminEmail] = useState("obsifem@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("comprador@ugcorestudio.com");
  const [buyerName, setBuyerName] = useState("Usuario Comprador Pro");
  const [buyerPlanId, setBuyerPlanId] = useState("pro");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(next);
    }
  }, [status, router, next]);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    const email = adminEmail.trim() || "obsifem@gmail.com";

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        loginType: "admin",
        email,
        password: adminPassword.trim(),
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(
          res.error || "No se pudo iniciar sesión como Administrador"
        );
      } else {
        toast.success(
          "¡Sesión de Administrador iniciada (999,999 Créditos y Permisos Totales)!"
        );
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar sesión como Administrador");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyerLogin = async (e) => {
    if (e) e.preventDefault();
    const email = buyerEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Ingresa un correo electrónico válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        loginType: "buyer",
        email,
        name: buyerName.trim() || email.split("@")[0],
        planId: buyerPlanId,
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(res.error || "No se pudo iniciar sesión como Comprador");
      } else {
        toast.success("¡Sesión de Comprador iniciada con tus créditos activos!");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar sesión como Comprador");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiKeyLogin = async (e) => {
    e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error("Ingresa una MuAPI Key válida");
      return;
    }
    if (key.length < 5) {
      toast.error("La API Key es demasiado corta");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        loginType: "apikey",
        apiKey: key,
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(res.error || "Error al autenticar con API Key");
      } else {
        toast.success("¡Autenticado con API Key exitosamente!");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al autenticar la API Key");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-page px-6 text-primary-text select-none">
      <Toaster position="top-right" />
      <div className="relative bg-bg-card border border-divider w-full max-w-md rounded-xl p-8 space-y-6 shadow-2xl animate-scale-up">
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary font-black shadow-md shadow-primary/15">
            📹
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            UGCore Studio
          </h2>
          <p className="text-xs font-semibold text-secondary-text leading-relaxed px-2">
            Ingresa como Administrador, como Usuario Comprador con tus créditos
            asignados o usando tu API Key.
          </p>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex bg-bg-page p-1 rounded-lg border border-divider/60 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "admin"
                ? "bg-bg-card text-primary-text shadow-sm border border-divider/40"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaUserShield className="text-emerald-500" />
            <span>Administrador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("buyer")}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "buyer"
                ? "bg-bg-card text-primary-text shadow-sm border border-divider/40"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaCreditCard className="text-primary" />
            <span>Comprador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apikey")}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "apikey"
                ? "bg-bg-card text-primary-text shadow-sm border border-divider/40"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaKey className="text-amber-400" />
            <span>API Key</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "admin" ? (
          <form onSubmit={handleAdminLogin} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Correo de Administrador
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="obsifem@gmail.com"
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Clave Admin (Opcional para {adminEmail || "admin"})
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Dejar vacío o ingresar clave maestra..."
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-3 space-y-1.5">
              <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5">
                <FaUserShield />
                <span>Permisos de Administrador Configurados:</span>
              </div>
              <ul className="text-[11px] text-secondary-text space-y-1 pl-1">
                <li className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 text-[10px] shrink-0" />
                  <span>
                    999,999 Créditos visibles (∞) + Panel de Aprobaciones
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 text-[10px] shrink-0" />
                  <span>
                    15 Influencers IA (Rostro, Estilo, Ropa, Voces e Idiomas)
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 text-[10px] shrink-0" />
                  <span>
                    Videos Cortos y Videos Largos (Multi-Escena hasta 180s)
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <FaUserShield className="text-xs" />
              <span>
                {isSubmitting
                  ? "Ingresando como Administrador..."
                  : "Entrar como Administrador (999,999 CR)"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>
          </form>
        ) : activeTab === "buyer" ? (
          <form onSubmit={handleBuyerLogin} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Correo del Usuario Comprador
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Nombre o Empresa
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ej: Mi Marca E-Commerce"
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Paquete de Créditos Asignado Según Compra
              </label>
              <select
                value={buyerPlanId}
                onChange={(e) => setBuyerPlanId(e.target.value)}
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs font-bold text-primary-text focus:outline-none focus:border-primary"
              >
                <option value="basic">
                  Pack Básico — 1,000 Créditos ($5 USD)
                </option>
                <option value="standard">
                  Pack Estándar — 2,500 Créditos ($10 USD)
                </option>
                <option value="pro">
                  Pack Profesional — 6,000 Créditos ($20 USD)
                </option>
                <option value="business">
                  Pack Business — 20,000 Créditos ($50 USD)
                </option>
              </select>
            </div>

            <div className="rounded-lg bg-primary/10 border border-primary/25 p-3 space-y-1">
              <div className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                <FaCoins />
                <span>Acceso Comprador Aprobado:</span>
              </div>
              <p className="text-[11px] text-secondary-text leading-relaxed">
                Verás en la barra superior tus créditos asignados según tu
                compra y el consumo en tiempo real por cada video generado.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <FaCreditCard className="text-xs" />
              <span>
                {isSubmitting
                  ? "Activando acceso comprador..."
                  : "Entrar como Comprador con Créditos"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleApiKeyLogin} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                MuAPI Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Ingresa tu clave mu_..."
                  className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !apiKeyInput.trim()}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>
                {isSubmitting ? "Autenticando..." : "Entrar con API Key"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>
          </form>
        )}

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 p-3.5 rounded text-[11px] leading-relaxed text-secondary-text">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            Todos los accesos, aprobaciones y paquetes de créditos están
            habilitados y listos para producción inmediata.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-bg-page text-primary-text">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
