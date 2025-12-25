import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co", // Für unsere Mock-Daten
      },
      {
        protocol: "https",
        hostname: "**.supabase.co", // WICHTIG: Für deine echten Uploads später
      },
    ],
  },
};

export default nextConfig;