import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We remove the strict headers entirely to see if it fixes the hanging issue.
  // We'll let standard browser policies apply.
};

export default nextConfig;
