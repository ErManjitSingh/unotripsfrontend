export type ApiCityEntry = {
  slug: string;
  city: string;
};

export function formatCityLabel(city: string): string {
  const trimmed = city.trim();
  if (!trimmed) return city;
  return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
}
