/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/market/:path*',
        destination: '/trade/:path*',
        permanent: true,
      },
      {
        source: '/markets/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
