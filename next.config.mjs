import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopack: {
      // This tells Turbopack to look for the `next` package in the current directory
      // and not in a subdirectory.
      root: __dirname,
    },
  },
};

export default nextConfig;
