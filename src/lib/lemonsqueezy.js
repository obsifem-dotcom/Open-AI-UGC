import crypto from "crypto";
import { getPackageById } from "./plans";
import { safeAssignOrPurchaseCredits } from "./runtime-store";

export function isLemonSqueezyConfigured() {
  const apiKey = (process.env.LEMONSQUEEZY_API_KEY || "").trim();
  const storeId = (process.env.LEMONSQUEEZY_STORE_ID || "").trim();
  return (
    apiKey.length > 20 &&
    !apiKey.includes("placeholder") &&
    storeId.length > 0 &&
    !storeId.includes("placeholder")
  );
}

export function isLemonSqueezyWebhookConfigured() {
  const secret = (process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "").trim();
  return secret.length > 8 && !secret.includes("placeholder");
}

/**
 * Maps each credit package to its corresponding Lemon Squeezy variant ID.
 * Configure these via environment variables or define them in your Lemon Squeezy dashboard.
 */
export function getLemonSqueezyVariantId(planId) {
  const envMap = {
    basic: process.env.LEMONSQUEEZY_VARIANT_BASIC,
    standard: process.env.LEMONSQUEEZY_VARIANT_STANDARD,
    professional: process.env.LEMONSQUEEZY_VARIANT_PRO || process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL,
    business: process.env.LEMONSQUEEZY_VARIANT_BUSINESS,
  };

  const normalized = planId === "pro" ? "professional" : planId;
  return envMap[normalized] || envMap[planId] || null;
}

export const LemonSqueezyService = {
  async createCheckout({ userId, planId, email = "", name = "", originUrl = "" }) {
    if (!isLemonSqueezyConfigured()) {
      throw new Error("Lemon Squeezy no está configurado en el servidor.");
    }

    const pkg = getPackageById(planId);
    if (!pkg || pkg.id === "demo" || !pkg.price || pkg.price <= 0) {
      throw new Error("Plan seleccionado no válido para compra.");
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY.trim();
    const storeId = process.env.LEMONSQUEEZY_STORE_ID.trim();
    const variantId = getLemonSqueezyVariantId(pkg.id);

    if (!variantId) {
      throw new Error(
        `Falta configurar LEMONSQUEEZY_VARIANT_${pkg.id.toUpperCase()} en las variables de entorno.`
      );
    }

    const baseUrl = (originUrl || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
      /\/+$/,
      ""
    );

    const redirectUrl = `${baseUrl}/pricing?success=true&provider=lemonsqueezy&plan=${encodeURIComponent(
      pkg.id
    )}`;

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: email.toLowerCase().trim() || undefined,
              name: name.trim() || undefined,
              custom: {
                user_id: String(userId || ""),
                email: email.toLowerCase().trim() || "",
                plan_id: pkg.id,
                credits: String(pkg.credits),
              },
            },
            product_options: {
              redirect_url: redirectUrl,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: String(storeId),
              },
            },
            variant: {
              data: {
                type: "variants",
                id: String(variantId),
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[LEMONSQUEEZY_CHECKOUT_ERROR]", response.status, errText);
      throw new Error(`Error de Lemon Squeezy (${response.status}): ${errText}`);
    }

    const payload = await response.json();
    const checkoutUrl = payload?.data?.attributes?.url;
    if (!checkoutUrl) {
      throw new Error("Lemon Squeezy no devolvió una URL de checkout válida.");
    }

    return checkoutUrl;
  },

  verifyWebhookSignature(rawBody, signature, secret) {
    if (!signature || !secret) return false;
    try {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
      const signatureBuffer = Buffer.from(signature, "utf8");
      return (
        digest.length === signatureBuffer.length &&
        crypto.timingSafeEqual(digest, signatureBuffer)
      );
    } catch (err) {
      console.error("[LEMONSQUEEZY_SIG_VERIFY_ERROR]", err);
      return false;
    }
  },

  async handleWebhook(rawBody, signature) {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
    if (!secret || !this.verifyWebhookSignature(rawBody, signature, secret)) {
      throw new Error("Firma de webhook de Lemon Squeezy inválida o no configurada.");
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload?.meta?.event_name;
    const customData = payload?.meta?.custom_data || {};

    const userId = customData.user_id || "";
    const email =
      customData.email ||
      payload?.data?.attributes?.user_email ||
      payload?.data?.attributes?.customer_email ||
      "";
    const planId = customData.plan_id || "basic";
    const credits = parseInt(customData.credits || "0", 10);

    const relevantEvents = [
      "order_created",
      "subscription_created",
      "subscription_payment_success",
    ];

    if (relevantEvents.includes(eventName) && (email || userId)) {
      const pkg = getPackageById(planId);
      const creditsToAssign = credits > 0 ? credits : pkg.credits;

      const updatedUser = await safeAssignOrPurchaseCredits({
        email: email.toLowerCase().trim(),
        userId,
        planId: pkg.id,
        customCredits: creditsToAssign,
        mode: "add",
      });

      return {
        success: true,
        event: eventName,
        userId: updatedUser.id,
        email: updatedUser.email,
        credits: creditsToAssign,
      };
    }

    return { success: true, event: eventName, processed: false };
  },
};

export default LemonSqueezyService;
