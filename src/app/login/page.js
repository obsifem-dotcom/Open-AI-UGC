"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaGithub,
  FaKey,
  FaInfoCircle,
  FaArrowRight,
  FaUserShield,
  FaCheckCircle,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("callbackUrl") || searchParams.get("next") || "/";
  const githubAuthEnabled = Boolean(process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID);

  const [activeTab, setActiveTab] = useState("admin"); // "admin" | "apikey" | "github"
  const [adminEmail, setAdminEmail] = useState("obsifem@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
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
        toast.error(res.error || "No se pudo iniciar sesión como Administrador");
      } else {
        toast.success("¡Sesión de Administrador iniciada con todos los permisos!");
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

  const handleApiKeyLogin = async (e) => {
    e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error("Please enter a valid MuAPI key");
      return;
    }
    if (key.length < 5) {
      toast.error("API Key appears too short");
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
        toast.error(res.error || "Failed to sign in with API key");
      } else {
        toast.success("Signed in with API Key successfully!");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during API key authentication");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-page px-6 text-primary-text select-none">
      <Toaster position="top-right" />
      <div className="relative bg-bg-card border border-divider w-full max-w-md rounded-xl p-8 space-y-6 shadow-2xl animate-scale-up">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary font-black shadow-md shadow-primary/15">
            📹
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            UGCora Studio
          </h2>
          <p className="text-xs font-semibold text-secondary-text leading-relaxed px-2">
            Ingresa como Administrador con todos tus permisos o usa una API Key.
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

          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "github"
                ? "bg-bg-card text-primary-text shadow-sm border border-divider/40"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <FaGithub className="text-secondary-text" />
            <span>GitHub</span>
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
                Clave / Token Admin (Opcional para {adminEmail || "admin"})
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Dejar vacío o ingresar clave admin..."
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
                  <span>Créditos ilimitados (∞) y API Key maestra activa</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 text-[10px] shrink-0" />
                  <span>Videos Cortos y Videos Largos (hasta 3 min / Multi-Escena)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 text-[10px] shrink-0" />
                  <span>Todos los modelos desbloqueados (Veo 3.1 4K, Seedance 2, Grok, Happy Horse)</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <FaUserShield className="text-xs" />
              <span>
                {isSubmitting
                  ? "Ingresando como Administrador..."
                  : "Entrar como Administrador"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>
          </form>
        ) : activeTab === "github" ? (
          <div className="space-y-4 pt-2">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: next })}
              disabled={!githubAuthEnabled}
              className="w-full py-3.5 bg-neutral-900 text-white rounded-full text-xs font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaGithub className="text-sm" />
              <span>
                {githubAuthEnabled
                  ? "Continue with GitHub"
                  : "GitHub sign-in not configured"}
              </span>
            </button>
            <p className="text-[11px] text-center text-secondary-text">
              {githubAuthEnabled
                ? "Uses system credit balance."
                : "Set up GitHub OAuth credentials to enable social sign-in."}
            </p>
          </div>
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
                  placeholder="Enter your mu_... key"
                  className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href="https://muapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  Get API Key from MuAPI →
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !apiKeyInput.trim()}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>
                {isSubmitting ? "Authenticating..." : "Sign In with API Key"}
              </span>
              <FaArrowRight className="text-xs" />
            </button>

            <p className="text-[11px] text-center text-amber-400/90 font-medium">
              ⚡ Generate UGC videos using your API key. 0 website credits
              required!
            </p>
          </form>
        )}

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 p-3.5 rounded text-[11px] leading-relaxed text-secondary-text">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            By signing in, you agree to our Terms of Service. API keys are kept
            secure and encrypted for generation calls.
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
