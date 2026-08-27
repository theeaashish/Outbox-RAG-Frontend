import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/env"],
  reactCompiler: true,
  turbopack: {
    root: "../../",
  },
};

export default nextConfig;
