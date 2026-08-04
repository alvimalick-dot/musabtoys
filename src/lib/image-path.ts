export function normalizeImagePath(input: string): string {
  const raw = input.trim().replace(/\\/g, "/");
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) {
    return raw;
  }

  if (raw.startsWith("/images/") || raw.startsWith("/uploads/")) {
    return raw;
  }

  if (raw.startsWith("images/")) {
    return `/${raw}`;
  }

  if (raw.startsWith("uploads/")) {
    return `/${raw}`;
  }

  const cleaned = raw.replace(/^\.\/?/g, "").replace(/^public\//i, "");
  return `/images/${cleaned.replace(/^\/+/, "")}`;
}
