// Minimal row mapping used by server import processing.
const ALIASES = {
  name: "name",
  productname: "name",
  sku: "sku",
  image: "images",
  images: "images",
};

function norm(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function mapRow(raw: any) {
  const headers = Object.keys(raw || {});
  const map = new Map<string, string>();
  for (const h of headers) {
    const field = ALIASES[norm(h) as keyof typeof ALIASES];
    if (field && !map.has(field)) map.set(field, h);
  }
  const get = (f: string) => (map.has(f) ? raw[map.get(f) as string] : undefined);
  const name = get("name") != null ? String(get("name")).trim() : "";
  const sku = get("sku") != null ? String(get("sku")).trim() : "";
  const images = get("images")
    ? String(get("images"))
        .split(/[,|;]/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];
  return { name, sku, images };
}
