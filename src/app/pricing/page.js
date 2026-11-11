"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { CREDIT_PACKAGES, FREE_DEMO_PACKAGE, getPackageById } from "@/lib/plans";
import {
  FaCheck,
  FaCoins,
  FaCrown,
  FaShieldAlt,
  FaUserCheck,
  FaVideo,
  FaGem,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const COMMERCIAL_COMPARISON_ROWS = [
  {
    feature: "Precio Mensual (USD)",
    basic: "$29 USD / mes",
    standard: "$79 USD / mes",
    pro: "$199 USD / mes",
    business: "$499 USD / mes",
  },
  {
    feature: "Público Objetivo",
    basic: "Creadores independientes & Emprendedores",
    standard: "Pequeños negocios & Marcas locales",
    pro: "Agencias & Creadores con pauta",
    business: "Empresas medianas & Clínicas",
  },
  {
    feature: "Capacidad de Producción",
    basic: "10 - 15 videos o carruseles / mes",
    standard: "30 - 40 videos / mes (ritmo diario)",
    pro: "100 - 150 videos o créditos expandidos",
    business: "Volumen alto + Prioridad en cola",
  },
  {
    feature: "Créditos Asignados",
    basic: "2,000 CR",
    standard: "6,000 CR",
    pro: "20,000 CR",
    business: "60,000 CR",
  },
  {
    feature: "Avatares & Gemelos Digitales (#8B5CF6)",
    basic: "15 Avatares de Stock (Config. Mínima)",
    standard: "Avatares de alta fidelidad + Capítulos",
    pro: "Clonación Rostro + Voz (Video 2-5 min)",
    business: "Ultra-realismo + Asientos múltiples",
  },
  {
    feature: "Agentes de Ventas & Hooks Virales",
    basic: "Plantillas prediseñadas",
    standard: "Subtítulos auto + Transiciones dinámicas",
    pro: "Agentes de venta + Variantes de hooks y CTAs",
    business: "Flujos avanzados por lotes y multicanal",
  },
  {
    feature: "Estudios Virtuales HeyGen & Croma",
    basic: "Set Bienestar #8B5CF6 & Croma",
    standard: "6 Estudios + Croma Key Pro",
    pro: "10 Estudios + Fondos Custom + Relighting",
    business: "10 Estudios + Render 4K prioritario",
  },
  {
    feature: "Pipeline YouTube Largo (4×5m • B-Roll 25s)",
    basic: "—",
    standard: "Soporte bloques de capítulos",
    pro: "Completo 20 min + Timestamps automáticos",
    business: "Completo 20 min + Exportación JSON/Lotes",
  },
];

export default function Pricing() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [buyerEmailInput, setBuyerEmailInput] = useState("");
  const [buyerNameInput, setBuyerNameInput] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);

  const isAdmin = Boolean(
    session?.user?.isAdmin ||
      session?.user?.role === "admin" ||
      session?.user?.email === "obsifem@gmail.com"
  );

  const currentCredits =
    typeof session?.user?.credits === "number"
      ? session.user.credits
      : isAdmin
      ? 999999
      : 1500;

  const assignedCredits =
    typeof session?.user?.assignedCredits === "number"
      ? session.user.assignedCredits
      : currentCredits;

  const activePackageObj = getPackageById(session?.user?.planId || "pro");

  const currentPlanName =
    session?.user?.planName ||
    (isAdmin
      ? "Administrador Master (Acceso Total)"
      : `${activePackageObj.name} (${activePackageObj.priceLabel})`);

  const effectiveEmailValue =
    buyerEmailInput !== "" ? buyerEmailInput : session?.user?.email || "";

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then((d) => {
          if (d.users) setAdminUsers(d.users);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const handlePurchasePlan = async (plan) => {
    const emailToUse = (
      buyerEmailInput ||
      session?.user?.email ||
      "comprador@ugcorestudio.com"
    )
      .toLowerCase()
      .trim();

    if (!emailToUse.includes("@")) {
      toast.error("Ingresa tu correo electrónico para asignarte los créditos");
      return;
    }

    setProcessingPlanId(plan.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          email: emailToUse,
          name: buyerNameInput.trim() || emailToUse.split("@")[0],
          mode: "add",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo procesar el paquete");
      }

      if (
        status === "authenticated" &&
        session?.user?.email?.toLowerCase() === emailToUse
      ) {
        await updateSession({
          credits: data.user.credits,
          assignedCredits: data.user.assignedCredits,
          planName: `${plan.name} (${plan.priceLabel})`,
          planId: data.user.planId,
        });
      } else if (status !== "authenticated") {
        await signIn("credentials", {
          loginType: "buyer",
          email: emailToUse,
          name: buyerNameInput.trim() || emailToUse.split("@")[0],
          planId: plan.id,
          redirect: false,
        });
      }

      toast.success(
        `¡${plan.name} (${plan.priceLabel}) activado! +${plan.credits.toLocaleString()} créditos asignados a ${emailToUse}.`
      );

      if (isAdmin) {
        const listRes = await fetch("/api/admin/users");
        const listData = await listRes.json();
        if (listData.users) setAdminUsers(listData.users);
      }
    } catch (err) {
      toast.error(err.message || "Error al activar el paquete");
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page select-none text-primary-text overflow-hidden">
      <Toaster position="top-right" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8 overflow-y-auto scrollbar-subtle items-center">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 rounded-full">
            <FaShieldAlt className="text-[#8B5CF6] text-xs" />
            <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest">
              Precios Comerciales Fijos • Créditos y Derechos Visibles al Instante
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            Paquetes Comerciales de Créditos & Producción IA
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text max-w-3xl leading-relaxed">
            Selecciona tu paquete comercial según el volumen de tu marca o
            agencia. Cada compra acredita tu saldo al instante y habilita los
            derechos correspondientes sobre Avatares de Stock,{" "}
            <strong className="text-foreground">
              Gemelo Digital (Custom Avatar #8B5CF6)
            </strong>
            ,{" "}
            <strong className="text-foreground">
              10 Entornos Virtuales estilo HeyGen
            </strong>{" "}
            y el{" "}
            <strong className="text-foreground">
              Pipeline Universal de YouTube (4×5m)
            </strong>
            .
          </p>
        </div>

        {/* Current User Credit Balance, Assigned Package & Entitlements Banner */}
        <div className="w-full max-w-6xl rounded-2xl border border-[#8B5CF6]/40 bg-bg-card p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] text-xl shrink-0">
                {isAdmin ? <FaCrown /> : <FaGem />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-secondary-text">
                    {status === "authenticated"
                      ? isAdmin
                        ? "Cuenta Administrador Master"
                        : "Tu Paquete Comprado y Derechos Activos"
                      : "Activa tu Paquete Comercial al Instante"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                    {status === "authenticated"
                      ? currentPlanName
                      : "Selecciona un paquete abajo"}
                  </span>
                </div>
                <p className="text-sm font-bold text-primary-text mt-1">
                  Créditos Disponibles:{" "}
                  <span className="text-emerald-400 font-black text-base">
                    {Number(currentCredits).toLocaleString()} CR
                  </span>{" "}
                  <span className="text-xs text-secondary-text">
                    (Asignados según compra:{" "}
                    {Number(assignedCredits).toLocaleString()} CR • Capacidad:{" "}
                    {isAdmin
                      ? "Ilimitada ∞"
                      : activePackageObj.videoCapacityLabel}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                value={effectiveEmailValue}
                onChange={(e) => setBuyerEmailInput(e.target.value)}
                placeholder="Correo del comprador (ej: tu@correo.com)"
                className="flex-1 md:w-60 px-3.5 py-2 rounded-lg bg-bg-page border border-divider text-xs text-primary-text placeholder-secondary-text outline-none focus:border-[#8B5CF6]"
              />
              <input
                type="text"
                value={buyerNameInput}
                onChange={(e) => setBuyerNameInput(e.target.value)}
                placeholder="Nombre / Empresa (opcional)"
                className="w-full sm:w-44 px-3 py-2 rounded-lg bg-bg-page border border-divider text-xs text-primary-text placeholder-secondary-text outline-none focus:border-[#8B5CF6]"
              />
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Ir al Estudio →
              </button>
            </div>
          </div>

          {/* Active Entitlements Strip for Current User */}
          <div className="pt-3 border-t border-divider/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-[#8B5CF6] mr-1">
                ✓ A qué tienes derecho con tu plan actual:
              </span>
              {(isAdmin
                ? CREDIT_PACKAGES[3].entitlements
                : activePackageObj.entitlements
              ).map((ent, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[10px] font-bold text-primary-text"
                >
                  ✓ {ent}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Free Demo Banner */}
        <div className="w-full max-w-6xl rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                🎁 Demo Gratuito
              </span>
              <span className="text-sm font-black text-primary-text">
                Prueba la aplicación sin pagar: {FREE_DEMO_PACKAGE.credits} créditos de cortesía
              </span>
            </div>
            <p className="text-xs text-secondary-text">
              {FREE_DEMO_PACKAGE.videoCapacityLabel} • Sin tarjeta • 1 demo por correo •{" "}
              {FREE_DEMO_PACKAGE.entitlements.slice(1, 3).join(" • ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePurchasePlan(FREE_DEMO_PACKAGE)}
            disabled={processingPlanId === "demo"}
            className="px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black whitespace-nowrap cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            {processingPlanId === "demo"
              ? "Activando demo..."
              : `Probar Gratis (+${FREE_DEMO_PACKAGE.credits} CR)`}
          </button>
        </div>

        {/* Commercial Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {CREDIT_PACKAGES.map((plan) => {
            const isBusy = processingPlanId === plan.id;
            const isCurrentUserPlan =
              status === "authenticated" &&
              !isAdmin &&
              session?.user?.planId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-bg-card border rounded-2xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular
                    ? "border-[#8B5CF6] shadow-xl shadow-[#8B5CF6]/15 ring-2 ring-[#8B5CF6]"
                    : "border-divider/70 shadow-md"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full tracking-wider shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-black uppercase tracking-wide text-primary-text">
                        {plan.name}
                      </h3>
                      {!plan.popular && (
                        <span className="px-2 py-0.5 rounded bg-bg-page border border-divider text-[9px] font-bold text-secondary-text uppercase">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-black tracking-tight text-primary-text">
                        {plan.priceLabel}
                      </span>
                      {plan.originalPriceLabel && (
                        <span className="text-xs font-bold text-secondary-text line-through">
                          {plan.originalPriceLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-secondary-text">
                      {plan.billingNote} •{" "}
                      <span className="text-emerald-400 font-bold">
                        {plan.costPerCreditLabel}
                      </span>
                    </p>
                  </div>

                  {/* Credits & Video Capacity Box */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5">
                      <FaCoins className="text-xs" />
                      <span>
                        {plan.credits.toLocaleString()} Créditos Asignados
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-center text-primary-text flex items-center justify-center gap-1">
                      <FaVideo className="text-[9px] text-[#8B5CF6]" />
                      <span>{plan.videoCapacityLabel}</span>
                    </div>
                  </div>

                  <p className="text-xs text-secondary-text leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  {/* Entitlements Summary Box */}
                  <div className="p-2.5 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-[#8B5CF6]">
                      ¿A qué tienes derecho por {plan.priceLabel}/mes?
                    </div>
                    {plan.targetAudience && (
                      <p className="text-[10px] font-bold text-secondary-text pb-1 border-b border-[#8B5CF6]/20">
                        🎯 {plan.targetAudience}
                      </p>
                    )}
                    <ul className="space-y-1 text-[11px] font-bold text-primary-text">
                      {plan.entitlements.map((ent, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#8B5CF6]">●</span>
                          <span>{ent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Detailed Features List */}
                  <ul className="space-y-2 border-t border-divider/50 pt-3.5 text-[11px] font-semibold text-secondary-text">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaCheck className="text-emerald-500 text-[10px] mt-1 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  {isCurrentUserPlan && (
                    <div className="text-center text-[10px] font-black uppercase text-emerald-400">
                      ✓ Tu Paquete Actualmente Activo
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePurchasePlan(plan)}
                    disabled={isBusy}
                    className={`w-full rounded-full py-3 text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[#8B5CF6]/25"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                    } disabled:opacity-50`}
                  >
                    <FaUserCheck />
                    <span>
                      {isBusy
                        ? "Acreditando Paquete..."
                        : `Adquirir ${plan.priceLabel} (+${plan.credits.toLocaleString()} CR)`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commercial Entitlements Comparison Matrix */}
        <div className="w-full max-w-6xl rounded-2xl border border-divider bg-bg-card p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black uppercase text-primary-text">
                Matriz Comercial Comparativa: Derechos Incluidos Según el Valor
                de Cada Paquete
              </h3>
              <p className="text-xs text-secondary-text">
                Transparencia comercial completa sobre créditos, módulos v3.5,
                Gemelo Digital, Entornos Virtuales HeyGen y YouTube Formato
                Largo.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-black uppercase">
              Identidad #8B5CF6 & #FFFFFF
            </span>
          </div>

          <div className="border border-divider rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-page border-b border-divider text-[10px] font-black uppercase text-secondary-text">
                  <th className="py-3 px-4">Característica / Derecho</th>
                  <th className="py-3 px-4">Basic ($29 USD/mes)</th>
                  <th className="py-3 px-4">Standard ($79 USD/mes)</th>
                  <th className="py-3 px-4 text-[#8B5CF6]">
                    ⭐ Professional ($199 USD/mes)
                  </th>
                  <th className="py-3 px-4 text-emerald-400">
                    Business ($499 USD/mes)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/50">
                {COMMERCIAL_COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-bg-page/40">
                    <td className="py-2.5 px-4 font-bold text-primary-text">
                      {row.feature}
                    </td>
                    <td className="py-2.5 px-4 text-secondary-text font-medium">
                      {row.basic}
                    </td>
                    <td className="py-2.5 px-4 text-primary-text font-semibold">
                      {row.standard}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#8B5CF6] bg-[#8B5CF6]/5">
                      {row.pro}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">
                      {row.business}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Buyer Overview Section */}
        {isAdmin && adminUsers.length > 0 && (
          <div className="w-full max-w-6xl rounded-2xl border border-divider bg-bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-primary-text flex items-center gap-2">
                  <FaCrown className="text-emerald-400" />
                  <span>
                    Vista de Administrador: Créditos y Paquetes Asignados a
                    Usuarios Compradores
                  </span>
                </h3>
                <p className="text-xs text-secondary-text">
                  Todos los usuarios listados ven su saldo de créditos y los
                  derechos de su paquete en la barra superior y en el estudio.
                </p>
              </div>
            </div>

            <div className="border border-divider rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-page border-b border-divider text-[10px] font-black uppercase text-secondary-text">
                    <th className="py-2.5 px-4">Usuario / Correo</th>
                    <th className="py-2.5 px-4">Rol</th>
                    <th className="py-2.5 px-4">Paquete Comprado</th>
                    <th className="py-2.5 px-4">Créditos Disponibles</th>
                    <th className="py-2.5 px-4">Créditos Asignados</th>
                    <th className="py-2.5 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/50">
                  {adminUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-bg-page/40">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-primary-text">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-secondary-text">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 uppercase text-[10px] font-black">
                        {u.isAdmin ? (
                          <span className="text-amber-400">👑 Admin</span>
                        ) : (
                          <span className="text-[#8B5CF6]">💳 Comprador</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-primary-text">
                        {u.planName}
                      </td>
                      <td className="py-2.5 px-4 font-black text-emerald-400">
                        {Number(u.credits || 0).toLocaleString()} CR
                      </td>
                      <td className="py-2.5 px-4 text-secondary-text font-semibold">
                        {Number(
                          u.assignedCredits || u.credits || 0
                        ).toLocaleString()}{" "}
                        CR
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                          ✓ Aprobado y Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
