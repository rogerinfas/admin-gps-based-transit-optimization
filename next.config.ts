import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
let backendOrigin = "http://localhost:4000";
try {
  const urlObj = new URL(apiBaseUrl);
  backendOrigin = urlObj.origin;
} catch {
  backendOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/backend-proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000"}/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
