export function navigateAfterAuth(redirectTo: string): void {
  if (typeof window === "undefined") return;
  window.location.assign(redirectTo);
}
