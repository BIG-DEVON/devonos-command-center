const MAX_PORTRAIT_BYTES = 8 * 1024 * 1024;

type SupportedImage = {
  bytes: Uint8Array<ArrayBuffer>;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

function hasBytes(
  bytes: Uint8Array<ArrayBuffer>,
  expected: number[],
  offset = 0
) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function detectedMimeType(bytes: Uint8Array<ArrayBuffer>) {
  if (hasBytes(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg" as const;
  if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png" as const;
  }
  if (
    hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp" as const;
  }
  return null;
}

export async function readHallPortrait(
  value: FormDataEntryValue | null
): Promise<SupportedImage | null> {
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > MAX_PORTRAIT_BYTES) {
    throw new Error("Portraits must be 8 MB or smaller.");
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  const mimeType = detectedMimeType(bytes);
  if (!mimeType) {
    throw new Error("Use a real JPEG, PNG, or WebP portrait.");
  }

  return { bytes, mimeType };
}

export function formText(
  formData: FormData,
  key: string,
  fallback = ""
) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}
