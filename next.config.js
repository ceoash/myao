/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'api.cloudinary.com', 'lh3.googleusercontent.com']
  }
}

module.exports = nextConfig
