import type { NextConfig } from "next";

const apiOrigin = (
  process.env.EWARRANTY_API_ORIGIN ||
  process.env.NEXT_PUBLIC_EWARRANTY_URL ||
  "http://localhost:5067"
).replace(/\/+$/, "").replace(/\/api$/i, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
