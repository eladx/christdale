export function computeVariantKey(
  selectedOptions?: Record<string, string> | null
): string {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) return "";
  return Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}