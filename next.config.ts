import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImageUrl = supabaseUrl ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  images: supabaseImageUrl
    ? {
        remotePatterns: [
          {
            protocol: supabaseImageUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseImageUrl.hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
