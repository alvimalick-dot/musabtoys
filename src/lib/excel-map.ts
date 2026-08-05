/**
 * Flexible Excel column detection — client can keep any header names.
 * Maps common aliases and falls back to guessing name/price columns.
 */

export type MappedProductRow = {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand: string;
  ageGroup: string;
  stock: number;
  description: string;
  images: string[];
  featured: boolean;
  dimensions?: string;
  battery?: string;
  pieceCount?: number;
  material?: string;
  weight?: string;
};

function norm(key: string) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/** header aliases → field */
const ALIASES: Record<string, keyof MappedProductRow | "rawImages"> = {
  // name
  name: "name",
  productname: "name",
  product: "name",
  itemname: "name",
  item: "name",
  title: "name",
  toyname: "name",
  descriptionname: "name",
  producttitle: "name",
  // sku / id
  sku: "sku",
  productsku: "sku",
  productid: "sku",
  productcode: "sku",
  itemcode: "sku",
  itemid: "sku",
  code: "sku",
  barcode: "sku",
  id: "sku",
  // price
  price: "price",
  retailprice: "price",
  rprice: "price",
  saleprice: "price",
  sellingprice: "price",
  unitprice: "price",
  amount: "price",
  cost: "price",
  rate: "price",
  pkr: "price",
  rs: "price",
  // compare
  compareatprice: "compareAtPrice",
  mrp: "compareAtPrice",
  oldprice: "compareAtPrice",
  listprice: "compareAtPrice",
  originalprice: "compareAtPrice",
  // category
  category: "category",
  cat: "category",
  type: "category",
  group: "category",
  department: "category",
  // brand
  brand: "brand",
  make: "brand",
  manufacturer: "brand",
  company: "brand",
  // age
  agegroup: "ageGroup",
  age: "ageGroup",
  ages: "ageGroup",
  agerange: "ageGroup",
  // stock
  stock: "stock",
  quantity: "stock",
  qty: "stock",
  inventory: "stock",
  available: "stock",
  onhand: "stock",
  // description
  description: "description",
  // Accept the spelling used by the supplier sheet as well.
  discription: "description",
  desc: "description",
  details: "description",
  detail: "description",
  remarks: "description",
  // images — file name in public/images/ or full URL
  images: "rawImages",
  image: "rawImages",
  imageurl: "rawImages",
  imageurls: "rawImages",
  imagepath: "rawImages",
  imagefile: "rawImages",
  imagename: "rawImages",
  filename: "rawImages",
  photo: "rawImages",
  photos: "rawImages",
  picture: "rawImages",
  pic: "rawImages",
  img: "rawImages",
  // featured
  featured: "featured",
  isfeatured: "featured",
  // specs
  dimensions: "dimensions",
  size: "dimensions",
  battery: "battery",
  batteries: "battery",
  piececount: "pieceCount",
  pieces: "pieceCount",
  pcs: "pieceCount",
  material: "material",
  weight: "weight",
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return false;
  return ["true", "1", "yes", "y"].includes(String(value).toLowerCase());
}

function buildHeaderMap(headers: string[]) {
  const map = new Map<string, string>(); // field -> original header
  for (const header of headers) {
    const alias = ALIASES[norm(header)];
    if (alias && !map.has(alias)) {
      map.set(alias, header);
    }
  }
  return map;
}

/** Guess name column if none matched */
function guessNameHeader(headers: string[], sampleRows: Record<string, unknown>[]) {
  const ranked = headers
    .map((h) => {
      const n = norm(h);
      let score = 0;
      if (n.includes("name") || n.includes("title") || n.includes("product")) score += 5;
      if (n.includes("id") || n.includes("sku") || n.includes("price") || n.includes("qty"))
        score -= 3;
      const values = sampleRows.map((r) => r[h]).filter((v) => v !== undefined && v !== "");
      const strings = values.filter((v) => typeof v === "string" || (typeof v === "number" && String(v).length > 3));
      if (strings.length >= Math.max(1, values.length * 0.6)) score += 2;
      return { h, score };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score > 0 ? ranked[0].h : headers[0];
}

/** Guess price column if none matched */
function guessPriceHeader(headers: string[], sampleRows: Record<string, unknown>[]) {
  const ranked = headers
    .map((h) => {
      const n = norm(h);
      let score = 0;
      if (n.includes("price") || n.includes("retail") || n.includes("amount") || n.includes("rate"))
        score += 5;
      if (n.includes("id") || n.includes("qty") || n.includes("stock") || n.includes("name"))
        score -= 4;
      const nums = sampleRows
        .map((r) => toNumber(r[h]))
        .filter((v): v is number => v !== undefined && v >= 0);
      if (nums.length >= Math.max(1, sampleRows.length * 0.5)) score += 3;
      return { h, score };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score > 0 ? ranked[0].h : undefined;
}

export function detectColumns(rows: Record<string, unknown>[]) {
  if (!rows.length) {
    return { headerMap: new Map<string, string>(), warnings: ["Sheet is empty"] };
  }

  const headers = Object.keys(rows[0]);
  const sample = rows.slice(0, Math.min(20, rows.length));
  const headerMap = buildHeaderMap(headers);
  const warnings: string[] = [];

  if (!headerMap.has("name")) {
    const guessed = guessNameHeader(headers, sample);
    if (guessed) {
      headerMap.set("name", guessed);
      warnings.push(`Name column auto-detected as "${guessed}"`);
    }
  }

  if (!headerMap.has("price")) {
    const guessed = guessPriceHeader(headers, sample);
    if (guessed) {
      headerMap.set("price", guessed);
      warnings.push(`Price column auto-detected as "${guessed}"`);
    } else {
      warnings.push("No price column found — rows without a number will fail");
    }
  }

  if (!headerMap.has("sku")) {
    const idLike = headers.find((h) => {
      const n = norm(h);
      return n.includes("id") || n.includes("code") || n.includes("sku");
    });
    if (idLike) {
      headerMap.set("sku", idLike);
      warnings.push(`SKU/ID column auto-detected as "${idLike}"`);
    }
  }

  return {
    headerMap,
    warnings,
    detected: Object.fromEntries(headerMap.entries()),
  };
}

export function mapExcelRow(
  raw: Record<string, unknown>,
  headerMap: Map<string, string>
): MappedProductRow | { error: string } {
  const get = (field: string) => {
    const header = headerMap.get(field);
    return header ? raw[header] : undefined;
  };

  const nameVal = get("name");
  const name = nameVal !== undefined && nameVal !== null ? String(nameVal).trim() : "";
  if (!name) return { error: "Missing product name" };

  const price = toNumber(get("price"));
  if (price === undefined) return { error: "Missing or invalid price" };

  const skuRaw = get("sku");
  const sku =
    skuRaw !== undefined && skuRaw !== null && String(skuRaw).trim() !== ""
      ? String(skuRaw).trim()
      // ProductName is the import key for sheets without a ProductID/SKU.
      // Keeping this stable avoids duplicate products when row positions change.
      : name;

  const imagesRaw = get("rawImages");
  const images = imagesRaw
    ? String(imagesRaw)
        .split(/[,|;]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const stock = toNumber(get("stock"));
  const pieceCount = toNumber(get("pieceCount"));
  const compareAtPrice = toNumber(get("compareAtPrice"));

  return {
    name,
    sku,
    price,
    compareAtPrice,
    category: String(get("category") ?? "Toys").trim() || "Toys",
    brand: String(get("brand") ?? "Generic").trim() || "Generic",
    ageGroup: String(get("ageGroup") ?? "All Ages").trim() || "All Ages",
    stock: stock !== undefined ? stock : 10,
    description: String(get("description") ?? "").trim(),
    images,
    featured: toBool(get("featured")),
    dimensions: get("dimensions") != null ? String(get("dimensions")) : undefined,
    battery: get("battery") != null ? String(get("battery")) : undefined,
    pieceCount,
    material: get("material") != null ? String(get("material")) : undefined,
    weight: get("weight") != null ? String(get("weight")) : undefined,
  };
}
