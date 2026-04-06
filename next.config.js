/** @type {import('next').NextConfig} */

// Simplified config for Vercel deployment
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'png.pngtree.com', 'icon2.cleanpng.com', 'static.vecteezy.com', 'fonts.googleapis.com', 'fonts.gstatic.com'],
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete 
    // even if your project has type errors.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.highperformanceformat.com https://pl28052492.effectivegatecpm.com https://*.adsterra.com https://*.highperformanceformat.com https://*.effectivegatecpm.com https://*.sourshaped.com https://sourshaped.com https://*.realizationnewestfangs.com https://realizationnewestfangs.com https://www.googletagmanager.com https://www.google-analytics.com https://*.firebase.googleapis.com https://firebase.googleapis.com https://*.googleapis.com https://*.gstatic.com https://apis.google.com https://www.googleapis.com",
              "frame-src 'self' https://www.highperformanceformat.com https://*.adsterra.com https://*.highperformanceformat.com https://*.effectivegatecpm.com https://*.sourshaped.com https://sourshaped.com https://*.realizationnewestfangs.com https://realizationnewestfangs.com https://accounts.google.com https://*.googleapis.com https://*.gstatic.com",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "connect-src 'self' https://www.highperformanceformat.com https://pl28052492.effectivegatecpm.com https://*.adsterra.com https://*.highperformanceformat.com https://*.effectivegatecpm.com https://*.sourshaped.com https://sourshaped.com https://*.realizationnewestfangs.com https://realizationnewestfangs.com https://*.firebase.googleapis.com https://firebase.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://*.gstatic.com",
            ].join('; '),
          },
        ],
      },
    ]
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

module.exports = nextConfig
