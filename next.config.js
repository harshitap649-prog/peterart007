/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'png.pngtree.com', 'icon2.cleanpng.com', 'static.vecteezy.com'],
  },
  webpack: (config, { isServer, webpack }) => {
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

