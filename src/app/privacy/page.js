import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Política de Privacidad | UGCore Studio",
  description: "Tratamiento de datos, sesiones, activos cargados y claves API en UGCore Studio.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-page text-primary-text">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-6">
        <div className="space-y-2 border-b border-divider/60 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            ← Volver al Studio
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Política de Privacidad — UGCore Studio
          </h1>
          <p className="text-xs text-secondary-text">
            Última actualización: {new Date().getFullYear()}
          </p>
        </div>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">1. Datos Recopilados</h2>
          <p>
            Recopilamos únicamente el nombre, correo electrónico, historial de saldo de créditos y los prompts o referencias visuales que subas voluntariamente para generar tus videos dentro de la plataforma.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">2. Procesamiento de Videos e Imágenes</h2>
          <p>
            Las imágenes de producto, frames de Gemelo Digital y guiones enviados se transmiten de forma cifrada únicamente a los proveedores de renderizado y almacenamiento necesarios para completar tu generación y mostrarlas en tu galería privada.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">3. Seguridad de Credenciales y API Keys</h2>
          <p>
            Las sesiones están protegidas mediante tokens firmados de NextAuth y las claves personales BYOK se almacenan exclusivamente del lado del servidor sin exponerse en respuestas públicas del navegador.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">4. Eliminación de Contenido</h2>
          <p>
            Puedes eliminar cualquiera de tus creaciones desde tu Galería en cualquier momento, removiendo el registro asociado en tu cuenta.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

