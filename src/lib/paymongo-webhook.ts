import crypto from "crypto";

// PayMongo signs webhooks via the Paymongo-Signature header, formatted as
// "t=<timestamp>,te=<test_signature>,li=<live_signature>". The signed
// payload is the timestamp directly concatenated with the raw request
// body (no separator), HMAC-SHA256'd with the webhook's own signing
// secret (from Dashboard > Developers > Webhooks — NOT your API secret
// key). Only one of te/li will be present, depending on whether the
// event is test or live mode.
export function verifyPaymongoSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const pair of signatureHeader.split(",")) {
    const [key, value] = pair.split("=");
    if (key && value) parts[key] = value;
  }

  const timestamp = parts.t;
  const providedSignature = parts.te ?? parts.li;
  if (!timestamp || !providedSignature) return false;

  const signedPayload = `${timestamp}${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(providedSignature)
    );
  } catch {
    // Buffers of different lengths throw — treat as invalid, not an error.
    return false;
  }
}
