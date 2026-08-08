/**
 * UploadThing Direct Upload Utility
 *
 * Uploads a file directly from the browser to UploadThing CDN using their
 * REST API (no server-side route handler required).
 *
 * Required env var:
 *   REACT_APP_UPLOADTHING_TOKEN=<your UploadThing token>
 *
 * The token is a base64url-encoded JSON: { "apiKey": "sk_live_...", "appId": "..." }
 */

const TOKEN = process.env.REACT_APP_UPLOADTHING_TOKEN;

function decodeToken(token) {
  if (!token) throw new Error("REACT_APP_UPLOADTHING_TOKEN is not set.");
  try {
    // base64url → base64 → JSON
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    // Fallback: treat the token itself as the API key
    return { apiKey: token };
  }
}

/**
 * Upload a single File object to UploadThing.
 * Returns the public CDN URL string (e.g. https://utfs.io/f/...)
 *
 * @param {File} file
 * @returns {Promise<string>} public file URL
 */
export async function uploadFile(file) {
  const { apiKey } = decodeToken(TOKEN);

  // ── Step 1: Request a presigned upload URL ─────────────────────────────────
  const presignRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-uploadthing-api-key": apiKey,
    },
    body: JSON.stringify({
      files: [
        {
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
        },
      ],
      acl: "public-read",
      contentDisposition: "inline",
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.text();
    throw new Error(`UploadThing presign failed (${presignRes.status}): ${err}`);
  }

  const presignJson = await presignRes.json();
  // UploadThing returns either { data: [...] } or [...]
  const fileData = Array.isArray(presignJson)
    ? presignJson[0]
    : presignJson.data?.[0];

  if (!fileData) {
    throw new Error("UploadThing returned no upload data.");
  }

  const { presignedUrl, fields, key, fileUrl } = fileData;

  // ── Step 2: Upload the file ────────────────────────────────────────────────
  if (fields && Object.keys(fields).length > 0) {
    // Multipart POST (older presigned S3 flow)
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file);
    const uploadRes = await fetch(presignedUrl, { method: "POST", body: form });
    if (!uploadRes.ok) {
      throw new Error(`S3 upload failed (${uploadRes.status})`);
    }
  } else {
    // Direct PUT (newer flow)
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    if (!uploadRes.ok) {
      throw new Error(`UploadThing PUT failed (${uploadRes.status})`);
    }
  }

  // ── Step 3: Return the public URL ──────────────────────────────────────────
  return fileUrl || `https://utfs.io/f/${key}`;
}

/**
 * Convenience: validate that a file is an allowed image type.
 */
export function validateImageFile(file) {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) {
    throw new Error(`Unsupported image type: ${file.type}`);
  }
}

/**
 * Convenience: validate that a file is an allowed document type.
 */
export function validateDocumentFile(file) {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  if (!allowed.includes(file.type)) {
    throw new Error(`Unsupported document type: ${file.type}`);
  }
}
