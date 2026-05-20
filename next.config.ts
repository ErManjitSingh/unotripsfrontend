import type { NextConfig } from "next";

/**
 * Fully dynamic app — NO `output: "export"`.
 * Hotel pages load live API data at runtime (no generateStaticParams / static HTML).
 * Deploy: `npm run build` && `npm run start`
 */
const nextConfig: NextConfig = {
  /** Default `.next` — required for Vercel and `next start`. */
  transpilePackages: ["swiper"],
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/**",
      },
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
        hostname: "dynamic-media-cdn.tripadvisor.com",
        pathname: "/**",
      },
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
      {
        protocol: "https",
        hostname: "unpluggedlife.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.thrillophilia.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "t4.ftcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instahimachal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tvixaxwpfwxtmfanfyjr.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
