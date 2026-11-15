import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true" || process.env.NEXT_EXPORT === "true";
const repoName = process.env.NEXT_PUBLIC_BASE_PATH || "/CareSync";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: "export",
        basePath: repoName,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
