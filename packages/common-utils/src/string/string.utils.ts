// String utilities

/** Generate internal reference: TXN-2026-000001 */
export function generateReference(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  const seq = sequence.toString().padStart(6, "0");
  return `${prefix}-${year}-${seq}`;
}

/** Generate a short random ID */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/** Convert string to URL slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
