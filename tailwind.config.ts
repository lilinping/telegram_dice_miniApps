import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主题颜色系统
        'primary-gold': '#FFD700',
        'primary-light-gold': '#FFED4E',
        'primary-dark-gold': '#B8860B',
        
        // 背景色系统
        'bg-darkest': '#0D0D0D',
        'bg-dark': '#1A1A1A',
        'bg-medium': '#2B2B2B',
        
        // 文字色系统
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-disabled': '#666666',
        
        // 边框色
        'border': '#3B3B3B',
        
        // 金色系统
        gold: {
          primary: '#D4AF37',
          bright: '#FFD700',
          dark: '#B8860B',
          metallic: '#C9B037',
        },
        // 红色系统
        casino: {
          red: '#8B0000',
          velvet: '#A52A2A',
          burgundy: '#6B1414',
        },
        // 黑色系统
        rich: {
          black: '#0D0D0D',
          onyx: '#1A1A1A',
          charcoal: '#2B2B2B',
        },
        // 筹码颜色
        chip: {
          10: '#E53935',
          50: '#1E88E5',
          100: '#000000',
          500: '#9C27B0',
          1000: '#FFD700',
        },
        // 功能色
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        error: '#EF4444',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['SF Pro Display', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.2', fontWeight: '900' }],
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'xxxl': '64px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.25)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'xl': '0 12px 48px rgba(0, 0, 0, 0.5)',
        'gold': '0 0 24px rgba(255, 215, 0, 0.6)',
        'gold-lg': '0 0 40px rgba(255, 215, 0, 0.9)',
        'inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'chip-pulse': 'chipPulse 1.5s infinite',
        'glow-pulse': 'glowPulse 2s infinite',
        'win-flash': 'winFlash 0.5s ease-in-out 3',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) rotate(0deg)' },
          '100%': { transform: 'translateX(100%) rotate(360deg)' },
        },
        chipPulse: {
          '0%, 100%': {
            boxShadow: '0 0 0 4px #FFD700, 0 10px 20px rgba(255, 215, 0, 0.6)',
          },
          '50%': {
            boxShadow: '0 0 0 6px #FFD700, 0 15px 30px rgba(255, 215, 0, 0.9)',
          },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        winFlash: {
          '0%, 100%': { boxShadow: '0 0 40px rgba(255, 215, 0, 1)', opacity: '1' },
          '50%': { boxShadow: '0 0 80px rgba(255, 165, 0, 1)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
