import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Política usada por `next upgrade --agent` para los recordatorios de seguridad.
    agentUpgrade: "security",
  },
};

export default nextConfig;
