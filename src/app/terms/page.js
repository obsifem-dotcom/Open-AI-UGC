import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Términos de Servicio | UGCore Studio",
  description: "Condiciones de uso, licencias de contenido y sistema de créditos de UGCore Studio.",
};

export default function TermsPage() {
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
            Términos de Servicio — UGCore Studio
          </h1>
          <p className="text-xs text-secondary-text">
            Última actualización: {new Date().getFullYear()}
          </p>
        </div>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">1. Uso de la Plataforma y Créditos</h2>
          <p>
            UGCore Studio ofrece herramientas de generación de video mediante inteligencia artificial bajo un sistema de créditos prepagados y un bono Demo único por usuario/correo electrónico. Los créditos se descuentan al enviar exitosamente una tarea de renderizado a los motores de video soportados.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">2. Contenido Generado y Derechos Comerciales</h2>
          <p>
            El usuario conserva los derechos comerciales sobre los guiones, productos cargados y videos generados en su cuenta, siempre que cumplan con la legislación aplicable y las políticas de uso aceptable de los modelos de generación subyacentes.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">3. Uso Aceptable y Restricciones</h2>
          <p>
            Queda estrictamente prohibido generar material fraudulento, suplantación de identidad no autorizada (deepfakes de personas reales sin consentimiento explícito), contenido difamatorio, ilegal o engañoso en materia médica/financiera sin descargos regulatorios apropiados.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-secondary-text">
          <h2 className="text-base font-bold text-primary-text">4. Pagos, Reembolsos y Llave BYOK</h2>
          <p>
            Los pagos procesados mediante Stripe acreditan paquetes de créditos de forma inmediata tras la confirmación del webhook. Quienes utilicen su propia clave de API (BYOK) asumen directamente el consumo facturado por su proveedor externo.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

