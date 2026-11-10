"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Footer from "@/components/Footer";
import {
  FaCheck,
  FaCoins,
  FaCrown,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const PLANS = [
  {
    id: "basic",
    name: "Pack Básico",
    price: "$5 USD",
    credits: 1000,
    badge: "Acceso Inicial",
    description:
      "Ideal para probar campañas UGC, videos cortos y promociones rápidas con Influencers IA.",
    features: [
      "1,000 Créditos asignados al instante",
      "Hasta ~30 videos cortos o 5 videos largos",
      "15 Influencers IA con selector de idioma y voz",
      "Licencia comercial libre de regalías (v3.5)",
    ],
  },
  {
    id: "standard",
    name: "Pack Estándar",
    price: "$10 USD",
    credits: 2500,
    badge: "Creadores & E-Commerce",
    description:
      "Perfecto para tiendas online y creadores que necesitan contenido constante en alta resolución.",
    features: [
      "2,500 Créditos asignados al instante",
      "Videos Cortos y Videos Largos (Multi-Escena)",
      "Personalización de rostro, estilo, ropa y voces",
      "Ingesta por URL de producto (Shopify / Amazon / ML)",
    ],
  },
  {
    id: "pro",
    name: "Pack Profesional",
    price: "$20 USD",
    credits: 6000,
    popular: true,
    badge: "Más Vendido",
    description:
      "Diseñado para marcas y marketers con alto volumen de anuncios UGC y consistencia UCID.",
    features: [
      "6,000 Créditos asignados al instante",
      "Todos los modelos (Grok, Veo 3.1, Seedance 2, Happy Horse)",
      "Editor híbrido Text-To-Timeline y subtítulos",
      "Prioridad de renderizado y soporte comercial",
    ],
  },
  {
    id: "business",
    name: "Pack Business / Agencia",
    price: "$50 USD",
    credits: 20000,
    badge: "Volumen Industrial",
    description:
      "Máxima capacidad para agencias de marketing, equipos de performance y producción masiva.",
    features: [
      "20,000 Créditos asignados al instante",
      "Producción masiva multi-idioma (7 idiomas)",
      "Videos largos de hasta 180s (Multi-Escena)",
      "Aprobación empresarial y derechos comerciales completos",
    ],
  },
];

export default function Pricing() {
  const { data: session, status, update: updateSession } = useSession();
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
      : 0;

  const assignedCredits =
    typeof session?.user?.assignedCredits === "number"
      ? session.user.assignedCredits
      : currentCredits;

  const currentPlanName =
    session?.user?.planName ||
    (isAdmin ? "Administrador Master" : "Sin paquete activo");

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
          planName: data.user.planName,
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
        `¡Paquete ${plan.name} activado! +${plan.credits.toLocaleString()} créditos asignados a ${emailToUse}.`
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <FaShieldAlt className="text-emerald-400 text-xs" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              Precios Habilitados • Asignación Instantánea de Créditos
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            Planes y Paquetes de Créditos
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text max-w-2xl leading-relaxed">
            Elige tu paquete de producción para generar videos cortos, videos
            largos multi-escena y promociones con los 15 Influencers IA. Tus
            créditos quedan asignados y aprobados al instante en tu cuenta.
          </p>
        </div>

        {/* Current User Credit Balance & Buyer Assignment Bar */}
        <div className="w-full max-w-5xl rounded-xl border border-divider bg-bg-card p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
              {isAdmin ? <FaCrown /> : <FaCoins />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-secondary-text">
                  {status === "authenticated"
                    ? isAdmin
                      ? "Cuenta Administrador Activa"
                      : "Tu Cuenta de Comprador"
                    : "Asignación de Compra Instantánea"}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  {status === "authenticated" ? currentPlanName : "Listo para comprar"}
                </span>
              </div>
              {status === "authenticated" ? (
                <p className="text-sm font-bold text-primary-text mt-0.5">
                  Saldo Disponible:{" "}
                  <span className="text-emerald-400 font-black">
                    {Number(currentCredits).toLocaleString()} Créditos
                  </span>{" "}
                  <span className="text-xs text-secondary-text">
                    (Total asignado según compra:{" "}
                    {Number(assignedCredits).toLocaleString()} CR)
                  </span>
                </p>
              ) : (
                <p className="text-xs text-secondary-text mt-0.5">
                  Ingresa tu correo abajo y haz clic en cualquier paquete para
                  activar tu cuenta con tus créditos asignados.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              value={effectiveEmailValue}
              onChange={(e) => setBuyerEmailInput(e.target.value)}
              placeholder="Correo del comprador (ej: tu@correo.com)"
              className="flex-1 md:w-64 px-3.5 py-2 rounded-lg bg-bg-page border border-divider text-xs text-primary-text placeholder-secondary-text outline-none focus:border-primary"
            />
            {isAdmin && (
              <span className="text-[10px] font-bold text-emerald-400">
                Modo Admin: puedes asignar el paquete al correo escrito arriba
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {PLANS.map((plan) => {
            const isBusy = processingPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-bg-card border rounded-xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary"
                    : "border-divider/60 shadow-md"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary-text">
                        {plan.name}
                      </h3>
                      {!plan.popular && (
                        <span className="text-[9px] font-bold text-secondary-text uppercase">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black tracking-tight text-primary-text">
                      {plan.price}
                    </p>
                  </div>

                  <div className="text-xs bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-center font-black text-emerald-400 flex items-center justify-center gap-1.5">
                    <FaCoins className="text-xs" />
                    <span>{plan.credits.toLocaleString()} Créditos UGC</span>
                  </div>

                  <p className="text-xs text-secondary-text leading-relaxed font-medium min-h-[3rem]">
                    {plan.description}
                  </p>

                  <ul className="space-y-2 border-t border-divider/40 pt-4 text-xs font-semibold text-secondary-text">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaCheck className="text-emerald-500 text-[10px] mt-1 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchasePlan(plan)}
                  disabled={isBusy}
                  className={`w-full rounded-full py-3 text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                  } disabled:opacity-50`}
                >
                  <FaUserCheck />
                  <span>
                    {isBusy
                      ? "Activando Créditos..."
                      : `Comprar / Activar (+${plan.credits.toLocaleString()} CR)`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Admin Buyer Overview Section */}
        {isAdmin && adminUsers.length > 0 && (
          <div className="w-full max-w-5xl rounded-xl border border-divider bg-bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-primary-text flex items-center gap-2">
                  <FaCrown className="text-emerald-400" />
                  <span>
                    Vista de Administrador: Créditos Asignados a Usuarios
                    Compradores
                  </span>
                </h3>
                <p className="text-xs text-secondary-text">
                  Todos los usuarios listados tienen acceso aprobado para
                  generar videos según su saldo de créditos.
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
                          <span className="text-primary">💳 Comprador</span>
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
