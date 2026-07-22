/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      // { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },  // Google profile photos (OAuth avatars)
    ],
  },
};

export default nextConfig;
