/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@spc27/shared'],
};

module.exports = nextConfig;
