'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/contexts/TelegramContext';

/**
 * 启动欢迎页
 *
 * 功能：
 * 1. 品牌Logo与Slogan展示
 * 2. 加载进度条（预加载游戏资源）
 * 3. Telegram用户授权
 * 4. 首次用户新手引导提示
 *
 * 停留2-3秒后自动跳转至游戏大厅
 */
export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoading: telegramLoading } = useTelegram();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('正在连接 Telegram...');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 模拟加载进度
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // 更新加载文本
    const textInterval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev.includes('连接')) return '正在加载游戏资源...';
        if (prev.includes('资源')) return '正在初始化游戏引擎...';
        if (prev.includes('引擎')) return '准备就绪！';
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  useEffect(() => {
    // 当进度达到100%且Telegram已授权时，跳转到游戏大厅
    if (progress >= 100 && !telegramLoading) {
      const timer = setTimeout(() => {
        router.push('/game');
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [progress, telegramLoading, router]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--rich-black) 0%, var(--casino-red) 50%, var(--rich-black) 100%)',
      }}
    >
      {/* 简化背景 - 装饰性骰子 */}
      <div className="absolute inset-0" style={{ opacity: 0.1 }}>
        <div
          className="absolute top-10 left-10 w-8 h-8 animate-pulse-slow"
          style={{ color: 'var(--gold-bright)' }}
        >
          ⚄
        </div>
        <div
          className="absolute top-20 right-20 w-8 h-8 animate-pulse-slow"
          style={{ color: 'var(--gold-bright)' }}
        >
          ⚅
        </div>
        <div
          className="absolute bottom-20 left-20 w-8 h-8 animate-pulse-slow"
          style={{ color: 'var(--gold-bright)' }}
        >
          ⚂
        </div>
        <div
          className="absolute bottom-10 right-10 w-8 h-8 animate-pulse-slow"
          style={{ color: 'var(--gold-bright)' }}
        >
          ⚃
        </div>
      </div>

      {/* Logo区域 */}
      <div className="relative z-10 flex flex-col items-center mb-16 animate-fade-in">
        {/* 骰子Logo图标 */}
        <div className="relative mb-6">
          {/* 金色光晕背景 */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Logo容器 */}
          <div
            className="relative w-32 h-32 flex items-center justify-center rounded-3xl animate-bounce-slow"
            style={{
              background: 'linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-dark) 100%)',
              boxShadow: 'var(--shadow-gold-lg)',
            }}
          >
            <span className="text-6xl">🎲</span>
          </div>
        </div>

        {/* 品牌名称 */}
        <h1
          className="font-display text-5xl font-bold mb-3 tracking-wider"
          style={{
            color: 'var(--gold-bright)',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          DiceTreasure
        </h1>
        <p
          className="font-display text-xl tracking-wide"
          style={{
            color: 'var(--gold-primary)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          骰宝夺宝
        </p>

        {/* Slogan */}
        <p
          className="mt-4 text-sm tracking-widest"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          随时随地 · 激情投注 · 即刻中奖
        </p>
      </div>

      {/* 用户信息显示 */}
      {user && (
        <div
          className="relative z-10 mb-8 flex items-center gap-3 px-6 py-3 rounded-full animate-slide-up"
          style={{
            background: 'rgba(26, 26, 26, 0.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212, 175, 55, 0.2)' }}
          >
            <span className="text-xl">👤</span>
          </div>
          <div className="text-left">
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              欢迎回来
            </p>
            <p
              className="text-base font-semibold"
              style={{ color: 'var(--gold-bright)' }}
            >
              {user.firstName || user.username || '玩家'}
            </p>
          </div>
        </div>
      )}

      {/* 加载进度条 */}
      <div className="relative z-10 w-80 max-w-[90%] animate-slide-up">
        {/* 进度条容器 */}
        <div
          className="relative h-3 rounded-full overflow-hidden"
          style={{
            background: 'var(--onyx-black)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          {/* 进度条填充 */}
          <div
            className="absolute left-0 top-0 h-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--gold-primary) 0%, var(--gold-bright) 50%, var(--gold-primary) 100%)',
              boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
            }}
          >
            {/* 光效动画 */}
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {/* 进度文字 */}
        <div className="mt-3 flex justify-between items-center text-sm">
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{loadingText}</span>
          <span
            className="font-mono font-bold"
            style={{ color: 'var(--gold-bright)' }}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* 版本号 */}
      <div
        className="absolute bottom-8 right-8 text-xs font-mono"
        style={{ color: 'rgba(255, 255, 255, 0.3)' }}
      >
        v1.0.0
      </div>

      {/* 底部提示 */}
      <div
        className="absolute bottom-8 left-0 right-0 text-center text-xs px-8"
        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        <p>本游戏仅供娱乐，请理性投注</p>
        <p className="mt-1">Powered by Telegram WebApp</p>
      </div>
    </div>
  );
}
