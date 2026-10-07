/** Deterministic file slug for a spoken phrase ("con mèo" -> "con-meo"). */
export function speechSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Pre-recorded clip for a phrase; unknown phrases get a missing file and the
 * player falls back to device speech.
 */
export function speechFile(text: string): string {
  return `/speech/${speechSlug(text)}.mp3`;
}
