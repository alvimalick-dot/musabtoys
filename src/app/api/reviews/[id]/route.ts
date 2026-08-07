import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { isValidObjectId, safeErrorMessage, requireAdmin } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  approved: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/**
 * Admin-only review moderation.
 * - PATCH: approve (approved: true) or reject (approved: false) a review.
 * - DELETE: permanently remove a review.
 * Both require a valid admin session so the public API can never mutate
 * reviews and the moderation flow stays server-side.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const body = updateSchema.parse(await req.json());
    if (body.approved === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await connectDB();
    const review = await Review.findByIdAndUpdate(
      id,
      { approved: body.approved },
      { new: true }
    ).lean();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to update review") },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    await connectDB();
    const review = await Review.findByIdAndDelete(id).lean();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to delete review") },
      { status: 400 }
    );
  }
}
