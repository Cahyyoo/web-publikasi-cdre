/**
 * FormData and route-param readers.
 *
 * `String(formData.get(x) ?? "")` appeared around forty times across the admin
 * actions, and every [id] page did a bare `Number(params.id)` that turned
 * /admin/categories/abc into NaN and an opaque Prisma error instead of a 404.
 */

/** Reads a trimmed string field. Missing or non-string values become "". */
export function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Reads a string field, or null when it is blank — for nullable columns. */
export function readOptionalString(
  formData: FormData,
  key: string
): string | null {
  return readString(formData, key) || null;
}

/** Reads an integer field, falling back to `fallback` when absent or invalid. */
export function readInt(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number(readString(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Reads a checkbox field (unchecked boxes are simply absent from FormData). */
export function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

/**
 * Parses a positive integer route param, or null when it isn't one, so the
 * page can render notFound() instead of handing NaN to Prisma.
 */
export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
