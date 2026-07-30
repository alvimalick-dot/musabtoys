import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SAMPLE = [
  {
    name: "Mega Block City Builder 500pc",
    price: 4599,
    compareAtPrice: 5499,
    category: "Building Sets",
    brand: "BrickJoy",
    ageGroup: "6-12 years",
    stock: 40,
    featured: true,
    description:
      "Build streets, shops, and towers with 500 colorful interlocking bricks.",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { pieceCount: 500, material: "ABS Plastic", dimensions: "40×30×8 cm" },
  },
  {
    name: "Turbo RC Drift Car",
    price: 8999,
    compareAtPrice: 10999,
    category: "Vehicles",
    brand: "SpeedKarachi",
    ageGroup: "8+ years",
    stock: 18,
    featured: true,
    description: "2.4GHz remote control drift car with rechargeable battery pack.",
    images: [
      "https://images.unsplash.com/photo-1594787318285-aeefe3a1c1c2?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { battery: "7.4V Li-ion", material: "ABS + Rubber", weight: "850g" },
  },
  {
    name: "Soft Sensory Ball Set",
    price: 1499,
    category: "Baby & Toddler",
    brand: "TinyHands",
    ageGroup: "0-3 years",
    stock: 75,
    featured: false,
    description: "Six textured soft balls for first grip and sensory play.",
    images: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { pieceCount: 6, material: "BPA-free TPE" },
  },
  {
    name: "Galaxy Wooden Puzzle Map",
    price: 2499,
    category: "Puzzles",
    brand: "MindCraft",
    ageGroup: "4-8 years",
    stock: 32,
    featured: true,
    description: "48-piece wooden solar system puzzle with glow accents.",
    images: [
      "https://images.unsplash.com/photo-1606503153255-059d349df4b5?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { pieceCount: 48, material: "Birch plywood", dimensions: "35×25 cm" },
  },
  {
    name: "Junior Coding Robot Kit",
    price: 15999,
    compareAtPrice: 18999,
    category: "STEM Toys",
    brand: "CodePlay",
    ageGroup: "8-14 years",
    stock: 12,
    featured: true,
    description:
      "Screen-free coding robot with 40 challenge cards and LED feedback.",
    images: [
      "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { battery: "USB-C rechargeable", pieceCount: 65 },
  },
  {
    name: "Family Strategy Board Game",
    price: 3299,
    category: "Games",
    brand: "TableTop PK",
    ageGroup: "10+ years",
    stock: 4,
    featured: false,
    description: "Fast-paced strategy game for 2–5 players. 45-minute sessions.",
    images: [
      "https://images.unsplash.com/photo-1611195979587-c390ef0c7d1b?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { pieceCount: 120, material: "Cardboard + wood" },
  },
  {
    name: "Plush Adventure Bear",
    price: 999,
    category: "Baby & Toddler",
    brand: "CuddleCo",
    ageGroup: "0-5 years",
    stock: 0,
    featured: false,
    description: "Ultra-soft embroidered plush bear — machine washable.",
    images: [
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { material: "Polyester fleece", weight: "320g" },
  },
  {
    name: "Premium Diecast Collector Set",
    price: 45000,
    category: "Vehicles",
    brand: "MetalCraft",
    ageGroup: "14+ years",
    stock: 3,
    featured: true,
    description: "Limited edition 1:18 diecast collection with display case.",
    images: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    ],
    specs: { pieceCount: 3, material: "Diecast metal", dimensions: "Display 60cm" },
  },
];

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let inserted = 0;
    for (const item of SAMPLE) {
      const slug = makeSlug(item.name);
      const sku = `DEMO-${slug.toUpperCase().slice(0, 20)}`;
      const existing = await Product.findOne({ sku });
      if (existing) continue;
      await Product.create({ ...item, slug, sku });
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: inserted
        ? `Inserted ${inserted} sample products.`
        : "Sample products already exist.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}
