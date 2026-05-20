export type BlogHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[^;]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip empty blocks and stray tags from CMS HTML (reduces huge vertical gaps). */
function cleanBlogHtml(html: string): string {
  let out = html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "<br />")
    .replace(/<\/?span[^>]*>/gi, "");

  for (let i = 0; i < 6; i++) {
    const prev = out;
    out = out
      .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
      .replace(/<h[1-6][^>]*>(\s|&nbsp;)*<\/h[1-6]>/gi, "")
      .replace(/<div[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, "")
      .replace(/<li[^>]*>(\s|&nbsp;)*<\/li>/gi, "")
      .replace(/<ul[^>]*>\s*<\/ul>/gi, "")
      .replace(/<ol[^>]*>\s*<\/ol>/gi, "");
    if (out === prev) break;
  }

  return out.trim();
}

/** Adds anchor ids to h2/h3 and returns TOC entries for the sidebar. */
export function prepareBlogHtml(content: string): {
  html: string;
  headings: BlogHeading[];
} {
  const headings: BlogHeading[] = [];
  const usedIds = new Map<string, number>();

  const withIds = content.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string, inner: string) => {
      const text = plainText(inner);
      if (!text) return "";

      const base = slugifyHeading(text) || "section";
      const count = (usedIds.get(base) ?? 0) + 1;
      usedIds.set(base, count);
      const id = count > 1 ? `${base}-${count}` : base;

      headings.push({
        id,
        text,
        level: Number(level) === 3 ? 3 : 2,
      });

      const hasId = /\bid\s*=/i.test(attrs);
      const nextAttrs = hasId ? attrs : `${attrs} id="${id}"`;
      return `<h${level}${nextAttrs}>${inner}</h${level}>`;
    },
  );

  return { html: cleanBlogHtml(withIds), headings };
}
