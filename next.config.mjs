/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:13000",
    "http://127.0.0.1:13000",
    "http://100.101.209.15:3000",
  ],
};

export default nextConfig;
