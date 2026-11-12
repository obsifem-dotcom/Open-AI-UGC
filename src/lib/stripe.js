import Stripe from "stripe";
import config from "./config";

export function isStripeConfigured() {
  const key = (process.env.STRIPE_SECRET_KEY || config.stripe.secretKey || "").trim();
  return (
    (key.startsWith("sk_live_") || key.startsWith("sk_test_")) &&
    key.length > 24 &&
    !key.includes("placeholder") &&
    !key.includes("your-")
  );
}

export function isStripeWebhookConfigured() {
  const secret = (
    process.env.STRIPE_WEBHOOK_SECRET ||
    config.stripe.webhookSecret ||
    ""
  ).trim();
  return (
    secret.startsWith("whsec_") &&
    secret.length > 15 &&
    !secret.includes("placeholder") &&
    !secret.includes("your-")
  );
}

const apiKey = isStripeConfigured()
  ? (process.env.STRIPE_SECRET_KEY || config.stripe.secretKey).trim()
  : "sk_test_placeholder_key_for_build_purposes";

export const stripe = new Stripe(apiKey, {
  apiVersion: "2023-10-16",
});

export default stripe;

