// Simple email-whitelist admin check. Set ADMIN_EMAILS in .env as a
// comma-separated list, e.g. ADMIN_EMAILS="you@example.com,other@x.com"
// This is enforced server-side in every /api/admin/* route — the
// client-side isAdmin flag (AuthContext) only controls UI visibility,
// it is never trusted for actual authorization.

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
