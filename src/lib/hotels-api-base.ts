/**
 * @deprecated Use getPublicApiBase / getServerApiBase from @/lib/api
 */
import { getPublicApiBase, getServerApiBase } from "@/lib/api";

export function hotelsApiDirectBase(): string {
  return getServerApiBase();
}

export function getHotelsApiBase(): string {
  if (typeof window !== "undefined") {
    return getPublicApiBase();
  }
  return getServerApiBase();
}
