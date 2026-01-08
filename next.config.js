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
    // 移除 React 属性（生产环境）
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // 性能优化：实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['recharts', 'echarts', 'echarts-for-react', 'framer-motion'],
  },

  // Telegram WebApp环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: 'DiceTreasure',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },

  // 生产环境优化
  productionBrowserSourceMaps: false,

  // 支持Three.js 和性能优化
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    
    // 代码分割优化
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Three.js 相关库单独打包
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              priority: 20,
            },
            // 图表库单独打包
            charts: {
              test: /[\\/]node_modules[\\/](recharts|echarts)[\\/]/,
              name: 'charts',
              priority: 15,
            },
            // 动画库单独打包
            animation: {
              test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
              name: 'animation',
              priority: 15,
            },
            // 其他第三方库
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
            },
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
