import mongoose from "mongoose";
import { getAdminSession } from "@/lib/auth";

/**
 * Strict ObjectId validation. Rejects non-hex, wrong-length, and object/array
 * inputs to prevent NoSQL injection and server crashes on malformed ids.
 */
export function isValidObjectId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return false;
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Return a safe, generic error message. Never expose raw internal errors
 * (DB stack traces, connection strings, etc.) to the client.
 */
export function safeErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (error instanceof Error && error.name === "ZodError") {
    return error.message;
  }
  return fallback;
}

/**
 * Require an authenticated admin session. Returns the session payload, or
 * null when the caller is not an admin. Centralizes the guard so routes stay
 * consistent and can't forget the check.
 */
export async function requireAdmin() {
  return getAdminSession();
}
