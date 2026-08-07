import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";
import { normalizeImagePath } from "@/lib/image-path";
import { isValidObjectId, safeErrorMessage } from "@/lib/security";
import { notifyRestockAlerts } from "@/lib/stock-alerts";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;

    // Look up by Mongo ObjectId when the segment is a valid ObjectId,
    // otherwise treat it strictly as a slug string. This prevents NoSQL
    // injection (operator objects) and redundant, error-prone casts.
    let product;
    if (isValidObjectId(id)) {
      product = await Product.findOne({ _id: id }).lean();
    } else {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to fetch product") },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const body = await req.json();

const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Capture the old stock value before applying changes so we can detect
    // a restock transition (0 → >0) and notify waiting customers.
    const oldStock = product.stock;

    const allowed = [
      "name",
      "sku",
      "price",
      "compareAtPrice",
      "category",
      "brand",
      "ageGroup",
      "stock",
      "description",
      "images",
      "featured",
      "newArrival",
      "specs",
      "slug",
    ] as const;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        let value = body[key] as unknown;
        // Round monetary values to 2 decimal places
        if (key === "price" || key === "compareAtPrice") {
          value = Math.round(Number(value) * 100) / 100;
        }
        if (key === "images" && Array.isArray(value)) {
          value = value
            .map((img: string) => normalizeImagePath(String(img)))
            .filter(Boolean);
        }
        // Use Mongoose Document#set to assign dynamic keys safely
        product.set(key, value);
      }
    }

    // Enforce mutual exclusivity: a product is either Featured or New Arrival
    if (body.featured === true && body.newArrival !== true) {
      product.newArrival = false;
    }
    if (body.newArrival === true && body.featured !== true) {
      product.featured = false;
    }

    await product.save(); // runs validate hook → stockStatus

    // When stock transitions from 0 → >0, email everyone who signed up for a
    // back-in-stock alert on this product. Non-blocking: failures are logged
    // inside notifyRestockAlerts and never break the PATCH response.
    if (oldStock <= 0 && product.stock > 0) {
      try {
        await notifyRestockAlerts({
          productId: String(product._id),
          productName: product.name,
          productSlug: product.slug,
          price: product.price,
        });
      } catch (err) {
        console.error("Restock notification failed:", err);
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to update product") },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to delete product") },
      { status: 500 }
    );
  }
}
