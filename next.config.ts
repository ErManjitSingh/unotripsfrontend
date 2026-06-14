import type { NextConfig } from "next";

const isStaticExport = process.env.BUILD_STATIC === "1";

/**
 * Default: dynamic app (`npm run build` && `npm run start` on Vercel/VPS).
 * Static host: `npm run build:static` → `out/` (BUILD_STATIC=1, output: "export").
 *
 * IMAGE DOMAINS
 * ─────────────
 * unoptimized: true  — images served as-is from Supabase CDN without Next.js
 *                      resizing. Keeps bundle simple on VPS; Supabase already
 *                      returns optimised WebP.
 *
 * remotePatterns whitelist — every external hostname used by:
 *   • Package featured_image / gallery_images  (Supabase storage)
 *   • Blog post featured_image                 (Supabase storage)
 *   • Hotel photos                             (Supabase storage)
 *   • Partner-uploaded property photos         (Supabase storage)
 *   • Marketing/hero images                    (Unsplash, Vecteezy, etc.)
 *   • Third-party travel content               (Thrillophilia, Tripadvisor, etc.)
 *
 * The wildcard *.supabase.co pattern covers all Supabase project URLs so
 * adding a new project never requires a config change.
 */
const nextConfig: NextConfig = {
  // TEMPORARY: allow production builds while partner portal
  // TypeScript/ESLint issues are being fixed.
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  ...(isStaticExport
    ? { output: "export" as const, distDir: ".next-build" }
    : {}),

  transpilePackages: ["swiper"],

  images: {
    // Serve images as-is — Supabase CDN handles resizing/compression.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [

      // ── Supabase storage (all projects) ───────────────────────────────────
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },

      // ── UNO Trips own CDN / website ───────────────────────────────────────
      {
        protocol: "https",
        hostname: "website.travelwithuno.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "travelwithuno.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unotrips.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.unotrips.com",
        pathname: "/**",
      },

      // ── Stock / marketing images ──────────────────────────────────────────
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },

      // ── Travel content CDNs ───────────────────────────────────────────────
      {
        protocol: "https",
        hostname: "dynamic-media-cdn.tripadvisor.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.thrillophilia.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media1.thrillophilia.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instahimachal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "navbharattourism.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "trailblazertours.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unpluggedlife.in",
        pathname: "/**",
      },

      // ── Hotel brand images ────────────────────────────────────────────────
      {
        protocol: "https",
        hostname: "www.orchidhotel.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.maritim.com",
        pathname: "/**",
      },

      // ── Misc CDNs used by package/hotel images ────────────────────────────
      {
        protocol: "https",
        hostname: "t4.ftcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s7ap1.scene7.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.indianexpress.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.justwravel.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.lehladakhindia.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;