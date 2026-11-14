/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional: lets a second local dev server run with its own build folder
  // (e.g. NEXT_DIST_DIR=.next-local). Defaults to the standard ".next".
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;
