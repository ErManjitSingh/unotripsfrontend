import type { PartnerCab } from "@/lib/cab-partner-api";

export type PartnerDriverRow = {
  key: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  license: string | null;
  vehicles: PartnerCab[];
};

export function driverIdentityKey(name: string | null | undefined, phone: string | null | undefined) {
  return `${(name || "").trim().toLowerCase()}|${(phone || "").trim().replace(/\s+/g, "")}`;
}

export function encodeDriverId(key: string) {
  if (typeof window === "undefined") {
    return Buffer.from(key, "utf8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(key);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeDriverId(id: string) {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(id, "base64url").toString("utf8");
    }
    const padded = id.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function buildDriverRows(vehicles: PartnerCab[]): {
  drivers: PartnerDriverRow[];
  unassigned: PartnerCab[];
} {
  const byKey = new Map<string, PartnerDriverRow>();
  const unassigned: PartnerCab[] = [];

  for (const cab of vehicles) {
    const name = cab.driver_name?.trim();
    const phone = cab.driver_phone?.trim() || null;
    if (!name && !phone) {
      unassigned.push(cab);
      continue;
    }
    const key = driverIdentityKey(name, phone);
    const existing = byKey.get(key);
    if (existing) {
      existing.vehicles.push(cab);
      if (!existing.whatsapp && cab.driver_whatsapp) existing.whatsapp = cab.driver_whatsapp;
      if (!existing.license && cab.driver_license) existing.license = cab.driver_license;
    } else {
      byKey.set(key, {
        key,
        name: name || "Unnamed driver",
        phone,
        whatsapp: cab.driver_whatsapp,
        license: cab.driver_license,
        vehicles: [cab],
      });
    }
  }

  return {
    drivers: Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name)),
    unassigned,
  };
}
