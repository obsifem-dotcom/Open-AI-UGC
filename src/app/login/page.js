"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaKey,
  FaInfoCircle,
  FaArrowRight,
  FaUserShield,
  FaCheckCircle,
  FaCoins,
  FaEnvelope,
} from "react-icons/fa";
import toast from "react-hot-toast";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next =
    searchParams.get("callbackUrl") || searchParams.get("next") || "/";

  // "email" | "admin" | "apikey"
  const [activeTab, setActiveTab] = useState("email");

  // Email / Demo Login state
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // Admin Login state
  const [adminEmail, setAdminEmail] = useState("obsifem@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");

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

  const handleEmailLogin = async (e, overrideEmail = null) => {
    if (e) e.preventDefault();
    const cleanEmail = (overrideEmail || userEmail).trim().toLowerCase();
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
        planId: "demo",
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(
          res.error === "CredentialsSignin"
            ? "No se pudo iniciar sesión con este correo."
            : res.error || "No se pudo ingresar con este correo"
        );
      } else {
        const isAdmin = cleanEmail.includes("obsifem") || cleanEmail.startsWith("admin@");
        toast.success(
          isAdmin
            ? `¡Bienvenido Administrador! (999,999 CR) con ${cleanEmail}`
            : `¡Bienvenido! Demo Gratuito activo (300 CR) con ${cleanEmail}`
        );
        completeRedirect();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar sesión con tu correo electrónico");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e, overrideEmail = null) => {
    if (e) e.preventDefault();
    const email = (overrideEmail || adminEmail || "obsifem@gmail.com").trim().toLowerCase();
    const password = adminPassword.trim() || "ugcore2025";
    if (!email || !email.includes("@")) {
      toast.error("Ingresa el correo de administrador");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        loginType: "admin",
        email,
        password,
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(
          res.error === "CredentialsSignin"
            ? "Error al autenticar credenciales de Administrador."
            : res.error || "Error al iniciar sesión como Administrador"
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
      <div className="relative bg-bg-card border border-divider w-full max-w-md rounded-xl p-7 space-y-5 shadow-2xl animate-scale-up">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-13 h-13 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-2xl text-[#8B5CF6] font-black shadow-md">
            📹
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            UGCore Studio
          </h2>
          <p className="text-xs font-semibold text-secondary-text leading-relaxed px-2">
            Ingresa con tu correo electrónico (+300 CR Demo Gratis para cuentas nuevas), usa tu MuAPI Key (BYOK) o accede como Administrador.
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

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-3 bg-bg-page p-1 rounded-lg border border-divider/60 gap-1">
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
                placeholder="tu@correo.com"
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
                <span>Acceso con Correo Electrónico:</span>
              </div>
              <p className="text-[11px] text-secondary-text leading-relaxed">
                Si eres usuario nuevo recibirás <strong>300 Créditos Demo Gratis</strong> automáticamente para probar el estudio (suficiente para probar cualquier avatar o modelo). Si ya compraste un paquete, conservarás tu saldo acumulado.
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
                  ? "Activando tu acceso..."
                  : "Ingresar / Activar Demo con mi Email"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-divider/60"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-secondary-text">o prueba en 1 clic</span>
              <div className="flex-grow border-t border-divider/60"></div>
            </div>

            <button
              type="button"
              onClick={() => handleEmailLogin(null, "comprador@ugcorestudio.com")}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>🎁 Entrar con Demo Gratuito Comprador (1 Clic • 300 CR)</span>
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
                placeholder="admin@tudominio.com"
                required
                className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                Contraseña de Administrador (Opcional si usas tu correo autorizado)
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Ingresa contraseña o deja en blanco con obsifem@gmail.com..."
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

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-divider/60"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-secondary-text">acceso directo</span>
              <div className="flex-grow border-t border-divider/60"></div>
            </div>

            <button
              type="button"
              onClick={() => handleAdminLogin(null, "obsifem@gmail.com")}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>👑 Entrar como Administrador Master (obsifem@gmail.com • 1 Clic)</span>
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

        <div className="pt-2 border-t border-divider/60 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-secondary-text">¿Necesitas más créditos?</span>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 font-bold text-[#8B5CF6] hover:underline"
          >
            <FaCoins className="text-[10px]" />
            <span>Ver Paquetes y Precios →</span>
          </Link>
        </div>

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 p-3 rounded text-[11px] leading-relaxed text-secondary-text">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            Inicia sesión con tu correo para activar tu Demo Gratuito de 300 créditos o recarga un paquete en la sección de Precios.
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
