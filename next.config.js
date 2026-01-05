/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 根据环境决定是否静态导出
  // 生产环境使用服务端渲染以支持 API 路由
  // 如需静态导出，请设置环境变量 STATIC_EXPORT=true
  ...(process.env.STATIC_EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
  
  // 禁用自动尾部斜杠处理
  skipTrailingSlashRedirect: true,

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