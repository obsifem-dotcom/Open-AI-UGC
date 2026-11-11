"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaKey,
  FaInfoCircle,
  FaArrowRight,
  FaUserShield,
  FaCheckCircle,
  FaCreditCard,
  FaCoins,
  FaEnvelope,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") || searchParams.get("next") || "/";

  // "email" | "admin" | "buyer" | "apikey"
  const [activeTab, setActiveTab] = useState("email");

  // Direct Email Login state
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // Admin Login state
  const [adminEmail, setAdminEmail] = useState("obsifem@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");

  // Buyer Login state
  const [buyerEmail, setBuyerEmail] = useState("comprador@ugcorestudio.com");
  const [buyerName, setBuyerName] = useState("Usuario Comprador Pro");
  const [buyerPlanId, setBuyerPlanId] = useState("pro");

  // API Key Login state
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeRedirect = () => {
    router.push(next);
    router.refresh();
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = next;
      }, 250);
    }
  };

  const handleEmailLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = userEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        loginType: "email",
        email: cleanEmail,
        name: userName.trim() || cleanEmail.split("@")[0],
        password: userPassword.trim(),
        planId: "standard",
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(res.error || "No se pudo ingresar con este correo");
      } else {
        toast.success(`¡Bienvenido! Sesión iniciada con ${cleanEmail}`);
        completeRedirect();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar sesión con tu correo electrónico");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        completeRedirect();
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
        toast.success(
          "¡Sesión de Comprador iniciada con tus créditos activos!"
        );
        completeRedirect();
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
        completeRedirect();
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al autenticar la API Key");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-page px-4 py-8 text-primary-text select-none">
      <Toaster position="top-right" />
      <div className="relative bg-bg-card border border-divider w-full max-w-md rounded-xl p-7 space-y-5 shadow-2xl animate-scale-up">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-13 h-13 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-2xl text-[#8B5CF6] font-black shadow-md">
            📹
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            UGCore Studio
          </h2>
          <p className="text-xs font-semibold text-secondary-text leading-relaxed px-2">
            Ingresa con tu Correo Electrónico, como Administrador, como
            Comprador o mediante tu API Key.
          </p>
        </div>

        {status === "authenticated" && session?.user?.email && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
            <div className="truncate">
              <span className="text-secondary-text">Sesión activa: </span>
              <strong className="text-emerald-400">{session.user.email}</strong>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-2.5 py-1 rounded bg-emerald-500 text-white text-[10px] font-bold whitespace-nowrap cursor-pointer"
            >
              Ir al Estudio →
            </button>
          </div>
        )}

        {/* Auth Method Selector Tabs (4 Clear Options including Email!) */}
        <div className="grid grid-cols-4 bg-bg-page p-1 rounded-lg border border-divider/60 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`py-2 px-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "email"
                ? "bg-[#8B5CF6] text-white shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaEnvelope className="text-[10px]" />
            <span>Con Email</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`py-2 px-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "admin"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaUserShield className="text-[10px]" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("buyer")}
            className={`py-2 px-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "buyer"
                ? "bg-primary text-white shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaCreditCard className="text-[10px]" />
            <span>Comprador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apikey")}
            className={`py-2 px-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "apikey"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaKey className="text-[10px]" />
            <span>API Key</span>
          </button>
        </div>

        {/* Tab 1: Direct Email Login */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Escribe tu correo (ej: tu@email.com o obsifem@gmail.com)"
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-secondary-text tracking-wider">
                  Tu Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: María / Creador"
                  className="w-full bg-bg-page border border-divider rounded-lg px-3 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-secondary-text tracking-wider">
                  Contraseña (Opcional)
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Acceso directo habilitado"
                  className="w-full bg-bg-page border border-divider rounded-lg px-3 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 p-3 space-y-1">
              <div className="text-[11px] font-bold text-[#8B5CF6] flex items-center gap-1.5">
                <FaEnvelope />
                <span>Ingreso Directo con Email Habilitado:</span>
              </div>
              <p className="text-[11px] text-secondary-text leading-relaxed">
                Ingresa con cualquier correo electrónico para acceder al estudio
                con créditos activos, o usa{" "}
                <strong className="text-foreground">obsifem@gmail.com</strong>{" "}
                para entrar con permisos de Administrador.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <FaEnvelope className="text-xs" />
              <span>
                {isSubmitting
                  ? "Ingresando con tu correo..."
                  : "Ingresar con mi Email"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>
          </form>
        )}

        {/* Tab 2: Admin Login */}
        {activeTab === "admin" && (
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
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-emerald-500 transition-colors"
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
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-emerald-500 transition-colors"
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
                    15 Influencers IA + Entornos Virtuales (#8B5CF6 & HeyGen)
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 text-[10px] shrink-0" />
                  <span>
                    Videos Cortos, Largos y Pipeline YouTube (4×5m)
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
        )}

        {/* Tab 3: Buyer Login */}
        {activeTab === "buyer" && (
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
                  Pack Starter / Creator — 1,500 Créditos ($19 USD)
                </option>
                <option value="standard">
                  Pack Growth / E-Commerce — 4,000 Créditos ($39 USD)
                </option>
                <option value="pro">
                  ⭐ Pack Pro Studio & YouTube — 10,000 Créditos ($79 USD)
                </option>
                <option value="business">
                  Pack Agency / Enterprise — 25,000 Créditos ($149 USD)
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
        )}

        {/* Tab 4: API Key Login */}
        {activeTab === "apikey" && (
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
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>
                {isSubmitting ? "Autenticando..." : "Entrar con API Key"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>
          </form>
        )}

        {/* Quick 1-Click Access Footer */}
        <div className="pt-2 border-t border-divider/60 space-y-2">
          <div className="text-[10px] font-bold uppercase text-secondary-text text-center">
            Accesos Rápidos 1-Click:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAdminLogin}
              disabled={isSubmitting}
              className="py-2 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold cursor-pointer transition-all"
            >
              👑 Entrar Admin Directo
            </button>
            <button
              type="button"
              onClick={handleBuyerLogin}
              disabled={isSubmitting}
              className="py-2 px-3 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold cursor-pointer transition-all"
            >
              💳 Entrar Comprador Demo
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 p-3 rounded text-[11px] leading-relaxed text-secondary-text">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            Todos los accesos por Email, Administrador, Comprador y paquetes de
            créditos están habilitados y listos para producción inmediata.
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
