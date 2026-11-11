"use client";

import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import {
  FiLogOut,
  FiDollarSign,
  FiPlus,
  FiUser,
  FiKey,
  FiCheck,
  FiX,
  FiTrash2,
  FiShield,
  FiCreditCard,
} from "react-icons/fi";
import config from "@/lib/config";
import { CREDIT_PACKAGES, getPackageById } from "@/lib/plans";
import toast from "react-hot-toast";

export default function Navbar() {
  const { data: session, status, update: updateSession } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAdminCreditsModalOpen, setIsAdminCreditsModalOpen] = useState(false);
  const [isBuyerPlanModalOpen, setIsBuyerPlanModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  // Admin Credits & Buyer Approvals Modal State
  const [buyerList, setBuyerList] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [targetBuyerEmail, setTargetBuyerEmail] = useState("");
  const [targetBuyerName, setTargetBuyerName] = useState("");
  const [targetPlanId, setTargetPlanId] = useState("pro");
  const [targetCustomCredits, setTargetCustomCredits] = useState("");
  const [targetMode, setTargetMode] = useState("add");
  const [assigningCredits, setAssigningCredits] = useState(false);

  const appName = config?.appName || "UGCore Studio";
  const logoLetter = appName.trim().charAt(0).toUpperCase();

  const isApiKeyActive = Boolean(session?.user?.customApiKey);
  const isAdminUser = Boolean(
    session?.user?.isAdmin ||
      session?.user?.role === "admin" ||
      session?.user?.email === "obsifem@gmail.com"
  );

  const userCredits =
    typeof session?.user?.credits === "number"
      ? session.user.credits
      : isAdminUser
      ? 999999
      : 1500;

  const assignedCredits =
    typeof session?.user?.assignedCredits === "number"
      ? session.user.assignedCredits
      : userCredits;

  const activeBuyerPackage = getPackageById(
    session?.user?.planId || (assignedCredits >= 25000 ? "business" : assignedCredits >= 10000 ? "pro" : assignedCredits >= 4000 ? "standard" : "basic")
  );

  const userPlanName =
    session?.user?.planName ||
    (isAdminUser ? "Administrador Master" : activeBuyerPackage.name);

  const fetchAdminUsers = async () => {
    setLoadingBuyers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setBuyerList(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load buyers:", err);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const openAdminCreditsModal = () => {
    setIsAdminCreditsModalOpen(true);
    fetchAdminUsers();
  };

  const handleAssignBuyerCredits = async (e) => {
    e.preventDefault();
    if (!targetBuyerEmail.trim() || !targetBuyerEmail.includes("@")) {
      toast.error("Ingresa un correo electrónico válido para el comprador");
      return;
    }
    setAssigningCredits(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetBuyerEmail.trim(),
          name: targetBuyerName.trim(),
          planId: targetPlanId,
          customCredits: targetCustomCredits,
          mode: targetMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al asignar créditos");
      setBuyerList(data.users || []);
      toast.success(
        `¡Aprobado! ${data.user.email} ahora tiene ${Number(
          data.user.credits
        ).toLocaleString()} créditos (${data.user.planName}).`
      );
      setTargetBuyerEmail("");
      setTargetBuyerName("");
      setTargetCustomCredits("");
    } catch (err) {
      toast.error(err.message || "No se pudieron asignar los créditos");
    } finally {
      setAssigningCredits(false);
    }
  };

  const handleQuickAdminSignIn = async () => {
    try {
      const res = await signIn("credentials", {
        loginType: "admin",
        email: "obsifem@gmail.com",
        redirect: false,
      });
      if (!res?.error) {
        toast.success("Sesión de Administrador activada (999,999 Créditos)");
        window.location.reload();
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  };

  const handleQuickBuyerSignIn = async () => {
    try {
      const res = await signIn("credentials", {
        loginType: "buyer",
        email: "comprador@ugcorestudio.com",
        planId: "pro",
        redirect: false,
      });
      if (!res?.error) {
        toast.success("Sesión de Comprador Pro activada ($79 USD • 10,000 Créditos)");
        window.location.reload();
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  };

  const openApiKeyModal = () => {
    setApiKeyInput(session?.user?.customApiKey || "");
    setIsApiKeyModalOpen(true);
  };

  const appMatch = pathname ? pathname.match(/^\/app\/([^\/]+)/) : null;
  const currentAppId = appMatch ? appMatch[1] : null;

  const navLinks = currentAppId
    ? [
        { name: "Estudio", path: `/app/${currentAppId}` },
        { name: "Galería", path: `/app/${currentAppId}/gallery` },
        { name: "Precios & Créditos", path: `/app/${currentAppId}/pricing` },
      ]
    : [
        { name: "Estudio", path: "/" },
        { name: "Galería", path: "/gallery" },
        { name: "Precios & Créditos", path: "/pricing" },
      ];

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error("Ingresa una API Key válida");
      return;
    }
    setSavingKey(true);
    try {
      if (status === "authenticated") {
        const res = await fetch("/api/user/apikey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save API key");

        await updateSession({ customApiKey: key });
        toast.success("¡API Key actualizada!");
        setIsApiKeyModalOpen(false);
        window.location.reload();
      } else {
        const res = await signIn("credentials", {
          loginType: "apikey",
          apiKey: key,
          redirect: false,
        });
        if (res?.error) {
          throw new Error(res.error || "Failed to sign in with API key");
        }
        toast.success("¡Sesión iniciada con API Key!");
        setIsApiKeyModalOpen(false);
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.message || "Failed to save API Key");
    } finally {
      setSavingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setSavingKey(true);
    try {
      const res = await fetch("/api/user/apikey", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove API key");

      await updateSession({ customApiKey: null });
      setApiKeyInput("");
      toast.success("API Key eliminada");
      setIsApiKeyModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to remove API Key");
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-divider/50 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo and Brand Title */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg shadow-md shadow-primary/30">
            {logoLetter}
          </div>
          <span className="text-lg font-black tracking-tight text-primary-text text-nowrap">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[13px] font-semibold transition-all relative py-1 ${
                  isActive
                    ? "text-primary"
                    : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions Section */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAdminUser && (
            <button
              type="button"
              onClick={openAdminCreditsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
              title="Ver todos los créditos y aprobar compras de usuarios"
            >
              <FiShield className="text-emerald-400" />
              <span>Aprobaciones & Créditos</span>
            </button>
          )}

          {/* Add/Manage API Key */}
          <button
            onClick={openApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isApiKeyActive
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-bg-page/50 border-divider text-secondary-text hover:text-white hover:border-primary/40"
            }`}
          >
            <FiKey
              className={
                isApiKeyActive ? "text-amber-400" : "text-secondary-text"
              }
            />
            <span>{isApiKeyActive ? "API Key Activa" : "API Key"}</span>
          </button>

          {status === "authenticated" ? (
            <div className="flex items-center">
              {/* Credit Balance indicator (Visible for BOTH Admin & Buyers!) */}
              <div
                onClick={() => {
                  if (isAdminUser) {
                    openAdminCreditsModal();
                  } else {
                    setIsBuyerPlanModalOpen(true);
                  }
                }}
                className="flex items-center h-9 border border-divider rounded-l bg-bg-page/40 overflow-hidden pr-2 cursor-pointer hover:bg-bg-card transition-colors"
                title={
                  isAdminUser
                    ? "Créditos de Administrador (Haz clic para gestionar créditos de usuarios)"
                    : `Haz clic para ver tus derechos y beneficios según tu paquete (${userPlanName} • $${activeBuyerPackage.price} USD)`
                }
              >
                <span className="font-bold text-xs px-3 flex items-center text-primary-text gap-1.5">
                  <FiDollarSign className="text-emerald-500 text-xs" />
                  {isAdminUser ? (
                    <span>
                      👑 ADMIN:{" "}
                      <strong className="text-emerald-400">
                        {Number(userCredits).toLocaleString()} CR
                      </strong>{" "}
                      (∞)
                    </span>
                  ) : (
                    <span>
                      💳{" "}
                      <strong className="text-emerald-400">
                        {Number(userCredits).toLocaleString()}
                      </strong>{" "}
                      <span className="text-[10px] text-secondary-text">
                        / {Number(assignedCredits).toLocaleString()} CR •{" "}
                        {userPlanName} (${activeBuyerPackage.price})
                      </span>
                    </span>
                  )}
                </span>
                <Link
                  href="/pricing"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-5 h-5 rounded bg-primary/15 hover:bg-primary/30 text-primary transition-colors"
                  title="Comprar o asignar más créditos"
                >
                  <FiPlus size={13} />
                </Link>
              </div>

              {/* Profile Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="h-9 w-9 flex items-center justify-center border-y border-r border-divider rounded-r bg-bg-page/30 hover:bg-bg-page transition-colors cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-secondary-text" size={16} />
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-11 w-64 rounded-lg border border-divider bg-bg-card p-1.5 shadow-xl z-[100] animate-scale-up">
                    <div className="px-3 py-2 text-xs text-secondary-text border-b border-divider/50 mb-1">
                      <div className="truncate font-bold text-primary-text">
                        {session.user.email}
                      </div>
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mt-0.5">
                        {isAdminUser
                          ? `Administrador • ${Number(userCredits).toLocaleString()} Créditos`
                          : `${userPlanName} ($${activeBuyerPackage.price} USD) • ${Number(userCredits).toLocaleString()} / ${Number(assignedCredits).toLocaleString()} CR`}
                      </div>
                    </div>

                    {isAdminUser ? (
                      <button
                        onClick={openAdminCreditsModal}
                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <FiShield size={14} />
                        <span>Gestionar Créditos & Compradores</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsBuyerPlanModalOpen(true)}
                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <FiCheck size={14} />
                        <span>💎 Mis Derechos según Compra (${activeBuyerPackage.price})</span>
                      </button>
                    )}

                    <Link
                      href="/pricing"
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-primary-text hover:bg-primary/10 transition-colors"
                    >
                      <FiCreditCard size={14} className="text-primary" />
                      <span>Ver Planes y Comprar Créditos</span>
                    </Link>

                    <Link
                      href="/login"
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors"
                    >
                      <FiUser size={14} className="text-[#8B5CF6]" />
                      <span>✉️ Ingresar con otro Email / Cuenta</span>
                    </Link>

                    <button
                      onClick={openApiKeyModal}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-primary-text hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <FiKey size={14} className="text-amber-400" />
                      <span>
                        {isApiKeyActive ? "Configurar API Key" : "Añadir API Key"}
                      </span>
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <FiLogOut size={14} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickAdminSignIn}
                className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                title="Acceso directo Administrador (999,999 Créditos)"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={handleQuickBuyerSignIn}
                className="border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                title="Acceso rápido Usuario Comprador"
              >
                💳 Comprador
              </button>
              <Link
                href="/login"
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-[#8B5CF6]/20"
              >
                ✉️ Ingresar con Email
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navbar Controls */}
        <div className="flex md:hidden items-center gap-2">
          {status === "authenticated" && (
            <div className="flex items-center h-8 border border-divider rounded bg-bg-page/30 px-2.5 text-xs font-bold text-primary-text gap-1">
              <FiDollarSign className="text-emerald-500 text-[10px]" />
              <span>
                {isAdminUser
                  ? `${Number(userCredits).toLocaleString()} CR (Admin)`
                  : `${Number(userCredits).toLocaleString()} CR`}
              </span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-bg-card p-2 rounded cursor-pointer transition-colors text-primary-text border border-divider/50"
            aria-label="Toggle Menu"
          >
            {isOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[200] glass-dropdown border-b border-divider shadow-2xl py-4 px-6 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center py-2.5 rounded text-sm font-semibold transition-all ${
                  pathname === link.path
                    ? "bg-primary/10 text-primary px-3 border border-primary/20"
                    : "text-primary-text hover:bg-bg-card"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAdminUser && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAdminCreditsModalOpen(true);
                }}
                className="flex w-full items-center justify-between rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-400"
              >
                <div className="flex items-center gap-2">
                  <FiShield />
                  <span>Gestionar Créditos y Aprobaciones</span>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                openApiKeyModal();
              }}
              className="flex w-full items-center justify-between rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-400"
            >
              <div className="flex items-center gap-2">
                <FiKey />
                <span>{isApiKeyActive ? "Gestionar API Key" : "Añadir API Key"}</span>
              </div>
            </button>

            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded bg-red-500/10 text-red-500 py-3 text-sm font-bold hover:bg-red-500/20 transition-all border border-red-500/20 mt-2"
              >
                <FiLogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleQuickAdminSignIn}
                  className="w-full py-2.5 rounded bg-emerald-500 text-white text-xs font-bold"
                >
                  👑 Entrar como Administrador
                </button>
                <button
                  type="button"
                  onClick={handleQuickBuyerSignIn}
                  className="w-full py-2.5 rounded bg-primary text-white text-xs font-bold"
                >
                  💳 Entrar como Comprador
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Admin Credits & Buyer Approvals Modal */}
      {isAdminCreditsModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-divider w-full max-w-2xl rounded-xl p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider/60 pb-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase">
                  <FiShield className="text-base" />
                  <span>
                    Panel de Administrador: Créditos, Compradores y Aprobaciones
                  </span>
                </div>
                <p className="text-[11px] text-secondary-text mt-0.5">
                  Saldo Admin Activo:{" "}
                  <strong className="text-emerald-400">
                    999,999 Créditos (Ilimitado ∞)
                  </strong>{" "}
                  • Aprueba compras o asigna créditos a cualquier usuario comprador.
                </p>
              </div>
              <button
                onClick={() => setIsAdminCreditsModalOpen(false)}
                className="text-secondary-text hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Form to Assign / Approve Buyer Credits */}
            <form
              onSubmit={handleAssignBuyerCredits}
              className="p-4 rounded-lg bg-bg-page/60 border border-divider space-y-3"
            >
              <div className="text-xs font-extrabold uppercase text-primary-text">
                ➕ Aprobar Compra / Asignar Créditos a Usuario Comprador
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="email"
                  value={targetBuyerEmail}
                  onChange={(e) => setTargetBuyerEmail(e.target.value)}
                  placeholder="Correo del comprador (ej: cliente@empresa.com)"
                  className="px-3 py-2 rounded bg-bg-card border border-divider text-xs text-primary-text outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  value={targetBuyerName}
                  onChange={(e) => setTargetBuyerName(e.target.value)}
                  placeholder="Nombre del cliente (opcional)"
                  className="px-3 py-2 rounded bg-bg-card border border-divider text-xs text-primary-text outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  value={targetPlanId}
                  onChange={(e) => setTargetPlanId(e.target.value)}
                  className="px-3 py-2 rounded bg-bg-card border border-divider text-xs font-bold text-primary-text outline-none"
                >
                  {CREDIT_PACKAGES.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} (${pkg.price} USD • {Number(pkg.credits).toLocaleString()} CR)
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={targetCustomCredits}
                  onChange={(e) => setTargetCustomCredits(e.target.value)}
                  placeholder="Créditos personalizados (opcional)"
                  className="px-3 py-2 rounded bg-bg-card border border-divider text-xs text-primary-text outline-none"
                />

                <select
                  value={targetMode}
                  onChange={(e) => setTargetMode(e.target.value)}
                  className="px-3 py-2 rounded bg-bg-card border border-divider text-xs font-bold text-primary-text outline-none"
                >
                  <option value="add">Sumar a su saldo actual</option>
                  <option value="set">Fijar saldo exacto</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={assigningCredits}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  {assigningCredits
                    ? "Asignando..."
                    : "✓ Aprobar y Asignar Créditos"}
                </button>
              </div>
            </form>

            {/* Buyer List Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-secondary-text">
                  Usuarios y Compradores Registrados ({buyerList.length})
                </span>
                <button
                  type="button"
                  onClick={fetchAdminUsers}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Actualizar lista
                </button>
              </div>

              {loadingBuyers ? (
                <div className="py-6 text-center text-xs text-secondary-text">
                  Cargando créditos de usuarios...
                </div>
              ) : (
                <div className="border border-divider rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-page border-b border-divider text-[10px] font-black uppercase text-secondary-text">
                        <th className="py-2 px-3">Usuario / Correo</th>
                        <th className="py-2 px-3">Plan / Paquete</th>
                        <th className="py-2 px-3">Créditos Disponibles</th>
                        <th className="py-2 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider/50">
                      {buyerList.map((u) => (
                        <tr key={u.email} className="hover:bg-bg-page/40">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-primary-text">
                              {u.name}
                            </div>
                            <div className="text-[10px] text-secondary-text">
                              {u.email}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-primary">
                            {u.planName || "Paquete Activo"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-emerald-400">
                              {Number(u.credits || 0).toLocaleString()} CR
                            </span>
                            <span className="text-[10px] text-secondary-text ml-1">
                              (Asignados:{" "}
                              {Number(
                                u.assignedCredits || u.credits || 0
                              ).toLocaleString()}
                              )
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                              ✓ Aprobado
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-divider w-full max-w-md rounded-xl p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-divider/60 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
                <FiKey className="text-base" />
                <span>Configuración de API Key</span>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="text-secondary-text hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed">
              Puedes usar tu propia <strong>MuAPI Key</strong> o los créditos asignados a tu cuenta.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                  MuAPI Secret Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="mu_..."
                  className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-secondary-text/50 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {isApiKeyActive && status === "authenticated" && (
                  <button
                    type="button"
                    onClick={handleRemoveApiKey}
                    disabled={savingKey}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                  >
                    <FiTrash2 />
                    <span>Eliminar Key</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-bg-page border border-divider text-xs font-semibold text-secondary-text hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingKey || !apiKeyInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <FiCheck />
                    <span>
                      {savingKey ? "Guardando..." : "Guardar API Key"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Plan Entitlements & Credits Modal */}
      {isBuyerPlanModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-divider w-full max-w-xl rounded-xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider/60 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[#8B5CF6] font-black text-sm uppercase">
                  <FiCreditCard className="text-base" />
                  <span>
                    💳 Mi Paquete Comercial y Derechos Activos ({userPlanName})
                  </span>
                </div>
                <p className="text-[11px] text-secondary-text mt-0.5">
                  Valor Comercial: <strong className="text-white">${activeBuyerPackage.price} USD</strong>{" "}
                  <span className="line-through opacity-70">${activeBuyerPackage.originalPrice} USD</span> •{" "}
                  Capacidad: <strong className="text-emerald-400">{activeBuyerPackage.videoEstimate}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsBuyerPlanModalOpen(false)}
                className="text-secondary-text hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-bg-page/60 border border-divider">
                <div className="text-[10px] font-bold uppercase text-secondary-text">
                  Créditos Disponibles
                </div>
                <div className="text-lg font-black text-emerald-400">
                  {Number(userCredits).toLocaleString()} CR
                </div>
              </div>
              <div className="p-3 rounded-lg bg-bg-page/60 border border-divider">
                <div className="text-[10px] font-bold uppercase text-secondary-text">
                  Créditos Asignados
                </div>
                <div className="text-lg font-black text-primary-text">
                  {Number(assignedCredits).toLocaleString()} CR
                </div>
              </div>
              <div className="p-3 rounded-lg bg-bg-page/60 border border-divider">
                <div className="text-[10px] font-bold uppercase text-secondary-text">
                  Paquete Activo
                </div>
                <div className="text-sm font-black text-[#8B5CF6]">
                  {activeBuyerPackage.name} (${activeBuyerPackage.price} USD)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                ✅ ¿A qué tienes derecho según tu compra de ${activeBuyerPackage.price} USD?
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {(activeBuyerPackage.entitlements || []).map((right, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs font-semibold text-primary-text"
                  >
                    <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{right}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bg-page/60 border border-divider space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-secondary-text">
                ⚡ Características Técnicas Incluidas en tu Paquete
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(activeBuyerPackage.features || []).map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-[11px] text-secondary-text"
                  >
                    <span className="text-[#8B5CF6] font-black">•</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsBuyerPlanModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-bg-page border border-divider text-xs font-bold text-secondary-text hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
              <Link
                href="/pricing"
                onClick={() => setIsBuyerPlanModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-[#8B5CF6]/20"
              >
                Ver Todos los Paquetes Comerciales ($19 - $149 USD) →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
