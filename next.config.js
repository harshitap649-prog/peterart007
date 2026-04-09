/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'png.pngtree.com', 'icon2.cleanpng.com', 'static.vecteezy.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'i.pinimg.com', 'i.etsystatic.com'],
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://i.pinimg.com https://png.pngtree.com https://firebasestorage.googleapis.com https://i.etsystatic.com; connect-src 'self' https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com https://fonts.googleapis.com https://fonts.gstatic.com;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
