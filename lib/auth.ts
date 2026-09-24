const COOKIE_NAME = "hitop_cms_session";

function base64ToBytes(base64: string) {
  const binary = atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return false;
  }

  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex === -1) {
    return false;
  }

  const payload = token.slice(0, separatorIndex);
  const signatureBase64 = token.slice(separatorIndex + 1);

  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64ToBytes(signatureBase64),
      encoder.encode(payload)
    );
  } catch {
    return false;
  }
}

export { COOKIE_NAME };