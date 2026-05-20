"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Facebook, Link2, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BlogPostShareProps = {
  title: string;
  slug: string;
  className?: string;
  variant?: "default" | "pill";
};

function blogPostShareUrl(slug: string): string {
  return `${SITE.url.replace(/\/$/, "")}/blog/${encodeURIComponent(slug)}`;
}

const shareBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export function BlogPostShare({
  title,
  slug,
  className,
  variant = "default",
}: BlogPostShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = blogPostShareUrl(slug);
  const encoded = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(title);
  const isPill = variant === "pill";

  const copyLink = useCallback(async () => {
    const toCopy =
      typeof window !== "undefined" ? window.location.href : shareUrl;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  const iconSize = isPill ? "h-10 w-10 text-sm" : "h-9 w-9";
  const pillExtra = isPill ? "px-4 py-2 text-xs font-semibold" : "";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {!isPill ? (
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Share
        </span>
      ) : null}
      <a
        href={`https://wa.me/?text=${text}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={cn(
          shareBtn,
          iconSize,
          pillExtra,
          "border-emerald-200/80 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100",
        )}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        {isPill ? <span>WhatsApp</span> : null}
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={cn(
          shareBtn,
          iconSize,
          pillExtra,
          "border-blue-200/80 bg-blue-50/80 text-blue-800 hover:bg-blue-100",
        )}
      >
        <Facebook className="h-4 w-4 shrink-0" />
        {isPill ? <span>Facebook</span> : null}
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={cn(
          shareBtn,
          iconSize,
          pillExtra,
          "border-slate-200 bg-slate-900 text-white hover:bg-slate-800",
        )}
      >
        <span className="text-xs font-bold">𝕏</span>
        {isPill ? <span>X</span> : null}
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
        className={cn(
          shareBtn,
          iconSize,
          pillExtra,
          copied
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:bg-orange-50 hover:text-primary",
        )}
      >
        {copied ? (
          <Check className="h-4 w-4 shrink-0" />
        ) : isPill ? (
          <Link2 className="h-4 w-4 shrink-0" />
        ) : (
          <Copy className="h-4 w-4 shrink-0" />
        )}
        {isPill ? <span>{copied ? "Copied" : "Copy link"}</span> : null}
      </button>
    </div>
  );
}
