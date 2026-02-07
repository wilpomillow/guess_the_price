/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow external images if you add them later
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
}

export default nextConfig
