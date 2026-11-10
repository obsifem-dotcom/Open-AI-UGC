export function parseJsonArray(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function formatCreationResponse(creation) {
  if (!creation) return creation;

  const formatted = { ...creation };

  // Parse inputImages
  if (formatted.inputImages && typeof formatted.inputImages === "string") {
    const parsedImages = parseJsonArray(formatted.inputImages);
    if (parsedImages) {
      formatted.inputImages = parsedImages;
    } else {
      formatted.inputImages = formatted.inputImages
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    }
  }

  // Parse multi-segment requestIds & urls
  const requestIds = parseJsonArray(formatted.requestId);
  const rawUrls = parseJsonArray(formatted.url);

  if (requestIds || rawUrls) {
    const total = requestIds ? requestIds.length : rawUrls.length;
    const urlSlotList = rawUrls || new Array(total).fill(null);
    const validUrls = urlSlotList.filter((u) => typeof u === "string" && u.length > 0);

    formatted.urls = validUrls;
    formatted.url = validUrls[0] || null;
    formatted.segmentsTotal = total;
    formatted.segmentsCompleted = validUrls.length;
  } else {
    formatted.urls = formatted.url ? [formatted.url] : [];
    formatted.segmentsTotal = 1;
    formatted.segmentsCompleted = formatted.url ? 1 : 0;
  }

  return formatted;
}

