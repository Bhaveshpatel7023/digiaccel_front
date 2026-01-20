/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Railway/Render builds can be memory-constrained; lint can run in CI instead.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Avoid OOM during deployment builds; typecheck can run in CI instead.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

