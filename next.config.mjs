/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/markets/:path*',
        destination: '/trade/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
