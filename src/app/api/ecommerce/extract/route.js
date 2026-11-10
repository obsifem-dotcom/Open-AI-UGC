import { NextResponse } from "next/server";
import { generatePredictiveHooks } from "@/lib/ugcore-v3";

function extractMetaTag(html, property) {
  const regex1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const match = html.match(regex1) || html.match(regex2);
  return match ? match[1].trim() : "";
}

function decodeHtmlEntities(str = "") {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function inferFromUrlSlug(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    const lastSegment = segments[segments.length - 1] || host;
    const humanized = decodeURIComponent(lastSegment)
      .replace(/[-_]+/g, " ")
      .replace(/\b(dp|p|products|item|mla|mlm|mco)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    let marketplace = "E-Commerce";
    if (host.includes("amazon")) marketplace = "Amazon";
    else if (host.includes("mercadolibre") || host.includes("mercadolivre"))
      marketplace = "Mercado Libre";
    else if (host.includes("shopify") || parsed.pathname.includes("/products/"))
      marketplace = "Shopify";

    return {
      title: humanized ? humanized.charAt(0).toUpperCase() + humanized.slice(1) : `Producto de ${marketplace}`,
      marketplace,
      host,
    };
  } catch {
    return {
      title: "Producto Destacado",
      marketplace: "E-Commerce",
      host: "",
    };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json(
        { error: "Ingresa una URL válida de Shopify, Amazon, Mercado Libre o tu tienda." },
        { status: 400 }
      );
    }

    let normalizedUrl = rawUrl;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    const fallbackInfo = inferFromUrlSlug(normalizedUrl);
    let title = "";
    let description = "";
    let price = "";
    const images = [];

    // 1. Try Shopify JSON endpoint if URL contains /products/
    try {
      const u = new URL(normalizedUrl);
      if (u.pathname.includes("/products/")) {
        const shopifyJsonUrl = `${u.origin}${u.pathname.replace(/\/$/, "")}.json`;
        const shopRes = await fetch(shopifyJsonUrl, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(4500),
        });
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          if (shopData?.product) {
            title = shopData.product.title || "";
            description = (shopData.product.body_html || "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 220);
            const firstVariant = shopData.product.variants?.[0];
            if (firstVariant?.price) {
              price = `$${firstVariant.price}`;
            }
            if (Array.isArray(shopData.product.images)) {
              shopData.product.images.slice(0, 4).forEach((img) => {
                if (img?.src) images.push(img.src);
              });
            }
          }
        }
      }
    } catch {}

    // 2. Fetch HTML and parse OpenGraph / JSON-LD metadata
    if (!title || images.length === 0) {
      try {
        const res = await fetch(normalizedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const html = await res.text();

          const ogTitle =
            extractMetaTag(html, "og:title") ||
            extractMetaTag(html, "twitter:title");
          const ogDesc =
            extractMetaTag(html, "og:description") ||
            extractMetaTag(html, "description") ||
            extractMetaTag(html, "twitter:description");
          const ogImage =
            extractMetaTag(html, "og:image") ||
            extractMetaTag(html, "twitter:image");
          const ogPrice =
            extractMetaTag(html, "product:price:amount") ||
            extractMetaTag(html, "og:price:amount");
          const ogCurrency =
            extractMetaTag(html, "product:price:currency") ||
            extractMetaTag(html, "og:price:currency") ||
            "USD";

          if (!title && ogTitle) title = decodeHtmlEntities(ogTitle);
          if (!description && ogDesc)
            description = decodeHtmlEntities(ogDesc).slice(0, 220);
          if (ogImage && !images.includes(ogImage)) {
            images.push(ogImage);
          }
          if (!price && ogPrice) {
            price = `${ogPrice} ${ogCurrency}`;
          }

          // Fallback <title>
          if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
              title = decodeHtmlEntities(titleMatch[1]);
            }
          }
        }
      } catch {}
    }

    const finalTitle = (title || fallbackInfo.title).slice(0, 90);
    const finalBenefit =
      description ||
      `Calidad garantizada disponible en ${fallbackInfo.marketplace} con envío rápido y resultados inmediatos`;
    const finalCta = price
      ? `Aprovecha el precio especial de ${price} en el link del perfil`
      : "Pídelo hoy mismo desde el enlace de mi perfil antes de que se agote";

    const hooks = generatePredictiveHooks({
      topic: finalTitle,
      benefit: finalBenefit,
      platform: "tiktok",
      promoType: "product",
    });

    return NextResponse.json({
      success: true,
      engine: "UGCore Instant E-Commerce URL-to-Video v3.0",
      product: {
        url: normalizedUrl,
        marketplace: fallbackInfo.marketplace,
        title: finalTitle,
        benefit: finalBenefit,
        price: price || null,
        cta: finalCta,
        images: images.slice(0, 4),
      },
      recommendedHook: hooks[0],
      hooks,
    });
  } catch (error) {
    console.error("[ECOMMERCE_EXTRACT_ERROR]", error);
    return NextResponse.json(
      { error: "No se pudo procesar la URL del producto" },
      { status: 500 }
    );
  }
}

