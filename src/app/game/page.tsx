'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { useGameSounds } from '@/hooks/useSound';
import { useGameHaptics } from '@/hooks/useHaptic';
import DiceCupDemo from '@/components/game/DiceCupDemo'; // 骰盅展示组件（betting状态）
import DiceCupAnimation from '@/components/game/DiceCupAnimation'; // 骰盅动画组件（rolling/revealing状态）
import BetPanel from '@/components/game/BetPanel';
import ChipSelector from '@/components/game/ChipSelector';
import MultiplierSelector from '@/components/game/MultiplierSelector';
import CountdownTimer from '@/components/game/CountdownTimer';
import WinAnimation from '@/components/game/WinAnimation';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { useRouter, usePathname } from 'next/navigation';

/**
 * 游戏大厅页面 - 专业赌场版V2.0
 *
 * 布局结构：
 * 1. 顶部栏 (56px) - 局号、倒计时、余额、充值
 * 2. 3D骰盅展示区 (280px)
 * 3. 投注面板 (可滚动)
 * 4. 筹码选择器 (90px, 固定)
 * 5. 底部操作栏 (64px, 固定)
 */
export default function GamePage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { balance, refreshBalance } = useWallet();
  
  // 页面加载时刷新余额（WalletContext已经在初始化时刷新了，这里只是确保）
  useEffect(() => {
    // 延迟一下，让WalletContext先完成初始化
    const timer = setTimeout(() => {
      if (user) {
        console.log('🎮 游戏页面：刷新余额');
        refreshBalance();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, refreshBalance]);
  const {
    gameState,
    currentRound,
    countdown,
    selectedChip,
    setSelectedChip,
    bets,
    placeBet,
    clearBets,
    confirmBets,
    multiplier,
    setMultiplier,
    undoLastBet,
    canUndo,
    repeatLastBets,
    lastBets,
    winAmount,
    hasWon,
  } = useGame();

  // 音效和震动反馈
  const {
    playBetClick,
    playChipSelect,
    playRoundStart,
    playDiceRoll,
    playDiceLand,
    playWinSmall,
    enabled: soundEnabled,
    toggleSound,
  } = useGameSounds();

  const {
    hapticBetClick,
    hapticChipSelect,
    hapticWin,
    hapticError,
    hapticSuccess,
    enabled: hapticEnabled,
    toggleHaptic,
  } = useGameHaptics();

  // 中奖动画状态
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  // 下注限额
  const BET_LIMITS = {
    min: 1,
    max: 10000,
    vipMax: 50000,
  };

  const [showRules, setShowRules] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const betPanelWrapperRef = useRef<HTMLDivElement>(null);
  const betPanelContentRef = useRef<HTMLDivElement>(null);
  const [betPanelScale, setBetPanelScale] = useState<number | null>(null);

  const betsSnapshot = JSON.stringify(bets);

  useLayoutEffect(() => {
    const updateScale = () => {
      const wrapper = betPanelWrapperRef.current;
      const content = betPanelContentRef.current;

      if (!wrapper || !content) {
        setBetPanelScale(1);
        return;
      }

      const wrapperHeight = wrapper.clientHeight;
      const contentHeight = content.scrollHeight;

      if (wrapperHeight <= 0 || contentHeight <= 0) {
        setBetPanelScale(1);
        return;
      }

      const scale = Math.min(1, wrapperHeight / contentHeight);
      const rounded = Number(scale.toFixed(3));
      setBetPanelScale((prev) => (prev === rounded ? prev : rounded));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, [betsSnapshot]);

  // 计算总下注金额
  const totalBetAmount = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  // 处理充值按钮点击
  const handleDeposit = () => {
    router.push('/deposit');
  };

  // 处理确认下注
  const handleConfirmBet = async () => {
    // 验证下注金额
    if (totalBetAmount === 0) {
      toast.warning('请先选择投注项');
      return;
    }

    // 验证最小限额
    const hasBelowMin = Object.values(bets).some(amount => amount < BET_LIMITS.min);
    if (hasBelowMin) {
      toast.error(`单注金额不得少于 $${BET_LIMITS.min}`);
      hapticError();
      return;
    }

    // 验证最大限额
    const hasAboveMax = Object.values(bets).some(amount => amount > BET_LIMITS.max);
    if (hasAboveMax) {
      toast.error(`单注金额不得超过 $${BET_LIMITS.max}`);
      hapticError();
      return;
    }

    // 验证余额
    if (totalBetAmount > balance) {
      toast.error('余额不足，请先充值');
      hapticError();
      return;
    }

    // 确认下注
    const success = await confirmBets();
    if (success) {
      hapticSuccess();
      toast.success(`下注成功 $${totalBetAmount.toFixed(2)}`);
    } else {
      hapticError();
      toast.error('下注失败，请稍后重试');
    }
  };

  // 判断是否可以下注
  const canBet = gameState === 'betting' && countdown > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--rich-black)' }}>
      {/* 顶部栏 - 60px */}
      <header
        className="sticky top-0 z-50 border-b-2 flex items-center justify-between px-3 py-1"
        style={{
          background: 'linear-gradient(180deg, var(--rich-black) 0%, var(--onyx-black) 100%)',
          borderBottomColor: 'var(--gold-primary)',
          backdropFilter: 'blur(10px)',
          minHeight: '60px',
        }}
      >
        {/* 左侧：局号 */}
        <div className="flex flex-col gap-0.5">
          <span className="text-tiny" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>局号</span>
          <span
            className="text-small font-bold font-mono"
            style={{
              color: 'var(--gold-bright)',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
            }}
          >
            #{currentRound.toString().padStart(6, '0')}
          </span>
        </div>

        {/* 中间：倒计时 */}
        <div className="flex-1 flex justify-center items-center" style={{ overflow: 'visible' }}>
          <CountdownTimer />
        </div>

        {/* 右侧：余额 + 充值 */}
        <div className="flex items-center gap-3">
          {/* 余额显示 */}
          <button
            onClick={() => router.push('/wallet')}
            className="flex flex-col items-end gap-0.5 hover:opacity-80 transition-opacity"
          >
            <span className="text-tiny" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>余额</span>
            <span
              className="text-small font-bold font-mono"
              style={{ color: '#FFFFFF' }}
            >
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </span>
          </button>

          {/* 充值按钮 */}
          <button
            onClick={handleDeposit}
            className="px-md py-sm rounded-lg text-small font-bold flex items-center gap-1 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-dark) 100%)',
              color: 'var(--rich-black)',
              boxShadow: 'var(--shadow-gold)',
            }}
          >
            <span>充值</span>
          </button>
        </div>
      </header>

      {/* 3D骰盅展示区 - 优化高度，在开奖时隐藏 */}
      {gameState === 'betting' && (
        <div
          className="relative h-[200px] pt-2 pb-0"
          style={{
            background: 'linear-gradient(180deg, var(--onyx-black) 0%, var(--rich-black) 100%)',
          }}
        >
          <DiceCupDemo className="w-full h-full" />

          {/* 右上角按钮组 */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-center">
            {/* 全局模式入口 */}
            <button
              onClick={() => router.push('/global-game')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'rgba(42, 42, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--gold-primary)',
              }}
            >
              <span className="text-xl">🌐</span>
            </button>

            {/* 规则按钮 */}
          <button
            onClick={() => router.push('/rules')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'rgba(42, 42, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-primary)',
            }}
          >
            <span className="text-xl">❓</span>
          </button>

          {/* 设置按钮 - 音效和震动开关 */}
          <button
            onClick={() => {
              // 显示设置面板
              const message = `音效: ${soundEnabled ? '开启' : '关闭'}\n震动: ${hapticEnabled ? '开启' : '关闭'}`;
              if (confirm(`${message}\n\n点击确定切换设置`)) {
                toggleSound();
                toggleHaptic();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'rgba(42, 42, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-primary)',
            }}
          >
            <span className="text-lg">{soundEnabled || hapticEnabled ? '🔊' : '🔇'}</span>
          </button>
        </div>
        </div>
      )}

      {/* 投注面板 - 可滚动 */}
      <div
        ref={betPanelWrapperRef}
        className="flex-1 overflow-hidden"
        style={{
          background: 'var(--rich-black)',
          paddingBottom: '20px',
          display: 'flex',
          justifyContent: 'center',
          height: 'calc(100vh - 60px - 120px - 160px - 56px - 64px)', // 额外减去底部导航64px
          maxHeight: 'calc(100vh - 60px - 120px - 160px - 56px - 64px)',
        }}
      >
        <div
          ref={betPanelContentRef}
          style={{
            opacity: betPanelScale === null ? 0 : 1,
            transform: `scale(${betPanelScale ?? 1})`,
            transformOrigin: 'top center',
            width:
              betPanelScale !== null && betPanelScale < 1
                ? `${(100 / betPanelScale).toFixed(3)}%`
                : '100%',
            transition: 'opacity 0.2s ease',
          }}
        >
          <BetPanel disabled={!canBet} />
        </div>
      </div>

      {/* 倍投选择器 + 筹码选择器 - 固定在底部操作栏上方 */}
      <div
        className="fixed z-[60] left-0 right-0"
        style={{
          bottom: '120px', // 底部导航64px + 操作栏56px = 120px
          height: '160px', // 减少总高度：70px (倍投) + 90px (筹码) = 160px
          overflow: 'hidden',
        }}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* 倍投选择器 - 减少高度到70px */}
          <div style={{ height: '70px', flexShrink: 0 }}>
            <MultiplierSelector
              value={multiplier}
              onChange={(newMultiplier) => {
                setMultiplier(newMultiplier);
                hapticChipSelect();
                playChipSelect();
              }}
              disabled={!canBet}
            />
          </div>

          {/* 筹码选择器 - 固定高度90px */}
          <div style={{ height: '90px', flexShrink: 0 }}>
            <ChipSelector />
          </div>
        </div>
      </div>

      {/* 底部操作栏 - 56px, 固定在底部导航之上 */}
      <div
        className="fixed left-0 right-0 z-50 border-t-2 px-2 py-2 flex items-center gap-1.5"
        style={{
          bottom: '64px', // 底部导航高度 64px
          background: 'var(--onyx-black)',
          borderTopColor: 'var(--gold-primary)',
          minHeight: '56px',
        }}
      >
        {/* 清空按钮 */}
        <button
          onClick={() => {
            clearBets();
            hapticChipSelect();
          }}
          disabled={totalBetAmount === 0 || !canBet}
          className="flex-1 h-10 rounded-lg text-tiny font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            border: '2px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mb-0.5">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>清空</span>
        </button>

        {/* 撤销按钮 - 当有多个下注时撤销全部，否则撤销上一个 */}
        <button
          onClick={() => {
            // 检查是否有多个不同的下注项目
            const betCount = Object.keys(bets).length;
            if (betCount > 1) {
              // 多个下注项目，清空全部
              clearBets();
            } else {
              // 单个或无下注，撤销上一个
              undoLastBet();
            }
            hapticChipSelect();
          }}
          disabled={!canUndo || !canBet}
          className="flex-1 h-10 rounded-lg text-tiny font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            border: '2px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mb-0.5">
            <path d="M3 7V13C3 16.866 6.13401 20 10 20H15M3 7L7 3M3 7L7 11M17 11L21 7M17 11L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{Object.keys(bets).length > 1 ? '全撤销' : '撤销'}</span>
        </button>

        {/* 确认下注按钮 */}
        <button
          onClick={handleConfirmBet}
          disabled={totalBetAmount === 0 || !canBet}
          className="flex-[2] h-10 rounded-lg text-small font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: totalBetAmount > 0 && canBet
              ? 'linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-dark) 100%)'
              : 'var(--charcoal)',
            color: 'var(--rich-black)',
            boxShadow: totalBetAmount > 0 && canBet ? 'var(--shadow-gold)' : 'none',
            animation: totalBetAmount > 0 && canBet ? 'pulse 2s infinite' : 'none',
          }}
        >
          <span>确认下注</span>
          {totalBetAmount > 0 && (
            <span className="text-tiny font-mono">
              ${totalBetAmount.toFixed(2)}
            </span>
          )}
        </button>

        {/* 走势按钮 */}
        <button
          onClick={() => router.push('/history')}
          className="flex-1 h-10 rounded-lg text-tiny font-bold flex flex-col items-center justify-center transition-all active:scale-95"
          style={{
            background: 'transparent',
            border: '2px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mb-0.5">
            <path d="M3 3V16C3 17.1046 3.89543 18 5 18H21M7 14L12 9L16 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>走势</span>
        </button>
      </div>

      {/* 开奖动画遮罩 - 预渲染但在 betting 状态时隐藏，避免每次重新初始化 Three.js 场景 */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center ${
          gameState === 'rolling' || gameState === 'revealing' || gameState === 'settled'
            ? 'animate-fade-in'
            : 'pointer-events-none'
        }`}
        style={{
          background: 'var(--rich-black)',
          backdropFilter: 'blur(12px)',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'auto',
          padding: '20px',
          opacity: gameState === 'rolling' || gameState === 'revealing' || gameState === 'settled' ? 1 : 0,
          visibility: gameState === 'rolling' || gameState === 'revealing' || gameState === 'settled' ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <div className="text-center w-full h-full flex items-center justify-center" style={{ minHeight: '100vh' }}>
          <DiceCupAnimation fullscreen winAmount={winAmount} hasWon={hasWon} />
        </div>
      </div>

      {/* 中奖动画 */}
      <WinAnimation
        amount={winAmount}
        show={showWinAnimation}
        onComplete={() => setShowWinAnimation(false)}
      />

      {/* Toast 提示容器 */}
      <ToastContainer />
    </div>
  );
}
