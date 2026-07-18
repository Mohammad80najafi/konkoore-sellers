import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["socket.io"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
