/**
 * Media URL helpers.
 *
 * Hotel Master photos in the DB were rewritten to the MinIO CDN host
 * (`storage.unotrips.com`), but many objects still only exist on the old
 * Supabase public bucket. Those CDN URLs 404 and show broken images on
 * package stay cards. Prefer the CDN URL when it works; until migration
 * finishes, fall back to the Supabase public path for the same key.
 */

const CDN_PHOTOS_PREFIX = "https://storage.unotrips.com/photos/";
const SUPABASE_PHOTOS_PREFIX =
  "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/";

/** Rewrite unmigrated CDN photo URLs to the still-live Supabase public URL. */
export function resolveMediaUrl(url: string | null | undefined): string {
  const raw = (url ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith(CDN_PHOTOS_PREFIX)) {
    return `${SUPABASE_PHOTOS_PREFIX}${raw.slice(CDN_PHOTOS_PREFIX.length)}`;
  }
  return raw;
}

export function resolveMediaUrls(urls: Array<string | null | undefined> | null | undefined): string[] {
  if (!urls?.length) return [];
  return urls
    .map((url) => resolveMediaUrl(url))
    .filter((url): url is string => Boolean(url));
}
