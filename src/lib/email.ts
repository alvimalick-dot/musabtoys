/** Normalize an email for comparison/keys — case-insensitive, trimmed. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Compare two emails ignoring case + surrounding whitespace. */
export function emailsMatch(a: string, b: string): boolean {
  return normalizeEmail(a) === normalizeEmail(b);
}

