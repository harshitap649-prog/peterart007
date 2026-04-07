const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep your existing ignoreBuildErrors setting
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'png.pngtree.com', 'icon2.cleanpng.com', 'static.vecteezy.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'i.pinimg.com'],
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://i.pinimg.com https://png.pngtree.com https://firebasestorage.googleapis.com;",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    // Add TypeScript file resolution
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    
    // Fix for undici package parsing issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Exclude undici from being parsed by webpack
    config.module.noParse = /node_modules[\\/]undici/;

    // Ignore undici package completely in client bundle
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^undici$/,
        })
      );
    }

    // Fix for server-side undici issue
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('undici');
    }

    return config;
  },
}

module.exports = withPWA(nextConfig)
