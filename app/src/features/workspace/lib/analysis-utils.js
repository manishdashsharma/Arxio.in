export function isRecord(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function asNonEmptyString(value) {
  if (typeof value !== "string") return "";
  const t = value.trim();
  return t;
}

export function asStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
}

export function formatAuthors(authors) {
  if (typeof authors === "string" && authors.trim()) return authors.trim();
  if (!Array.isArray(authors)) return "";
  return authors.map((a) => String(a).trim()).filter(Boolean).join(", ");
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return "—";
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
