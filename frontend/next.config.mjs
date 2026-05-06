const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  basePath: '/autocheck',
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
