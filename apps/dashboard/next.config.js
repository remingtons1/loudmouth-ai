/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow reading credentials from home directory
  serverExternalPackages: ['fs', 'path', 'crypto'],
}

module.exports = nextConfig
