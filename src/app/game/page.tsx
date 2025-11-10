'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTelegram } from '@/contexts/TelegramContext';
import DiceAnimation from '@/components/game/DiceAnimation';
import BetPanel from '@/components/game/BetPanel';
import ChipSelector from '@/components/game/ChipSelector';
import CountdownTimer from '@/components/game/CountdownTimer';
import { useRouter } from 'next/navigation';

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
  const { balance } = useWallet();
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
  } = useGame();

  const [showRules, setShowRules] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  // 计算总下注金额
  const totalBetAmount = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  // 处理充值按钮点击
  const handleDeposit = () => {
    router.push('/deposit');
  };

  // 处理确认下注
  const handleConfirmBet = async () => {
    if (totalBetAmount === 0) {
      // TODO: 显示提示
      return;
    }

    if (totalBetAmount > balance) {
      // TODO: 显示余额不足提示
      return;
    }

    await confirmBets();
  };

  // 判断是否可以下注
  const canBet = gameState === 'betting' && countdown > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--rich-black)' }}>
      {/* 顶部栏 - 56px */}
      <header
        className="sticky top-0 z-50 h-14 border-b-2 flex items-center justify-between px-4"
        style={{
          background: 'linear-gradient(180deg, var(--rich-black) 0%, var(--onyx-black) 100%)',
          borderBottomColor: 'var(--gold-primary)',
          backdropFilter: 'blur(10px)',
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
        <div className="flex-1 flex justify-center">
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

      {/* 3D骰盅展示区 - 280px */}
      <div
        className="relative h-[280px]"
        style={{
          background: 'linear-gradient(180deg, var(--onyx-black) 0%, var(--rich-black) 100%)',
        }}
      >
        <DiceAnimation />

        {/* 规则按钮 - 右上角 */}
        <button
          onClick={() => router.push('/rules')}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'rgba(42, 42, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: 'var(--gold-primary)',
          }}
        >
          <span className="text-xl">❓</span>
        </button>
      </div>

      {/* 投注面板 - 可滚动 */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          background: 'var(--rich-black)',
          paddingBottom: '180px', // 给筹码选择器+底部栏预留空间
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <BetPanel disabled={!canBet} />
      </div>

      {/* 筹码选择器 - 90px, 固定在底部操作栏上方 */}
      <div
        className="fixed z-40 left-0 right-0 px-md py-md"
        style={{
          bottom: '64px',
          height: '90px',
          background: 'linear-gradient(to top, var(--rich-black) 70%, transparent 100%)',
        }}
      >
        <ChipSelector />
      </div>

      {/* 底部操作栏 - 64px, 固定 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t-2 px-md py-sm flex items-center gap-sm"
        style={{
          background: 'var(--onyx-black)',
          borderTopColor: 'var(--gold-primary)',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        {/* 清空按钮 */}
        <button
          onClick={clearBets}
          disabled={totalBetAmount === 0 || !canBet}
          className="flex-1 h-12 rounded-lg text-small font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            border: '2px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mb-0.5">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>清空</span>
        </button>

        {/* 确认下注按钮 */}
        <button
          onClick={handleConfirmBet}
          disabled={totalBetAmount === 0 || !canBet}
          className="flex-[2] h-12 rounded-lg text-body font-bold flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex-1 h-12 rounded-lg text-small font-bold flex flex-col items-center justify-center transition-all active:scale-95"
          style={{
            background: 'transparent',
            border: '2px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mb-0.5">
            <path d="M3 3V16C3 17.1046 3.89543 18 5 18H21M7 14L12 9L16 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>走势</span>
        </button>
      </div>

      {/* 开奖动画遮罩 */}
      {(gameState === 'rolling' || gameState === 'revealing') && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-center">
            <DiceAnimation fullscreen />
          </div>
        </div>
      )}

      {/* 中奖弹窗 */}
      {gameState === 'settled' && totalBetAmount > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="rounded-2xl p-8 mx-4 max-w-sm w-full animate-scale-in"
            style={{
              background: 'var(--onyx-black)',
              border: '2px solid var(--gold-primary)',
              boxShadow: 'var(--shadow-gold)',
            }}
          >
            <div className="text-center">
              {/* 标题 */}
              <h2
                className="text-h2 font-bold mb-4"
                style={{ color: 'var(--gold-bright)' }}
              >
                🎉 恭喜中奖！
              </h2>

              {/* 奖金金额 */}
              <div className="mb-6">
                <p className="text-small mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>本局奖金</p>
                <p
                  className="text-display font-bold font-mono animate-number-roll"
                  style={{
                    color: 'var(--gold-bright)',
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.6)'
                  }}
                >
                  +1,250.00
                </p>
                <p className="text-small mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>USDT</p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // TODO: 分享功能
                  }}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all active:scale-95"
                  style={{
                    border: '2px solid var(--gold-primary)',
                    color: 'var(--gold-primary)',
                    background: 'transparent',
                  }}
                >
                  分享
                </button>
                <button
                  onClick={() => {
                    // TODO: 继续游戏
                  }}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-bright) 0%, var(--gold-dark) 100%)',
                    color: 'var(--rich-black)',
                  }}
                >
                  继续游戏
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
