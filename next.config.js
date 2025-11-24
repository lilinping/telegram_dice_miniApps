/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 禁用自动尾部斜杠处理
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // 优化图片加载
  images: {
    domains: ['images.unsplash.com', 'cdn.pixabay.com', 'images.pexels.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // 移动端优先优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // PWA支持（可选）
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ]
  },

  // API代理配置 - 解决跨域问题
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*/',
        destination: 'http://46.250.168.177:8079/:path*/',
      },
      {
        source: '/api/backend/:path*',
        destination: 'http://46.250.168.177:8079/:path*',
      },
    ]
  },

  // Telegram WebApp环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: 'DiceTreasure',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // 生产环境优化
  productionBrowserSourceMaps: false,

  // 支持Three.js
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
}

module.exports = nextConfig
