import type { Metadata } from 'next';
import { Inter, Roboto_Mono, Cinzel } from 'next/font/google';
import './globals.css';
import { TelegramProvider } from '@/contexts/TelegramContext';
import { GameProvider } from '@/contexts/GameContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import BottomNavigation from '@/components/layout/BottomNav';
import DevTelegramInit from '@/components/DevTelegramInit';

// 字体配置
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: '骰宝夺宝 | DiceTreasure - Telegram骰宝游戏',
  description: 'Telegram生态内首款移动优先、高沉浸感的实时骰宝游戏，融合即时动画、社交互动与加密货币支付',
  keywords: '骰宝,Sic Bo,Telegram游戏,加密货币,USDT,TON,区块链游戏',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#8B0000',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${robotoMono.variable} ${cinzel.variable}`}>
      <head>
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="bg-bg-darkest text-text-primary antialiased">
        {/* 开发环境 Telegram 模拟 */}
        <DevTelegramInit />
        
        <TelegramProvider>
          <NotificationProvider>
            <WalletProvider>
              <GameProvider>
                {/* 主内容区域 */}
                <main className="relative min-h-screen pb-16">
                  {children}
                </main>

                {/* 底部导航栏 - 固定在底部 */}
                <BottomNavigation />
              </GameProvider>
            </WalletProvider>
          </NotificationProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
