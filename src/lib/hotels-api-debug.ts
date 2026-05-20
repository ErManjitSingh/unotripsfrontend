/** Dev-only console logging for hotels API debugging (browser + server terminal). */
export function logHotelsApi(label: string, data: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  console.log(`[Hotels API] ${label}`, data);
}
