import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app's own directory. Without this,
  // Turbopack gets confused by the root-level package-lock.json (added for
  // the convenience `npm run dev`/`build` scripts in the repo root) and
  // warns about multiple lockfiles / an ambiguous root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
