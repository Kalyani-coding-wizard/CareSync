import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);
const isGithubPages = !isVercel &&
  (process.env.GITHUB_PAGES === "true" || process.env.NEXT_EXPORT === "true");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages ? {
    output: "export",
    ...(basePath ? { basePath } : {}),
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
};

export default nextConfig;
