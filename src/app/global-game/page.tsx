'use client';

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { useGameSounds } from '@/hooks/useSound';
import { useGameHaptics } from '@/hooks/useHaptic';
import DiceCupDemo from '@/components/game/DiceCupDemo';
import DiceCupAnimation from '@/components/game/DiceCupAnimation';
import BetPanel from '@/components/game/BetPanel';
import ChipSelector from '@/components/game/ChipSelector';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { GlobalDiceResult, GlobalDiceBet, DiceChooseVO } from '@/lib/types';
import { getBetChooseId } from '@/lib/betMapping';

// 全局游戏状态
type GlobalGameState = 'betting' | 'sealed' | 'rolling' | 'settled';

export default function GlobalGamePage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { balance, refreshBalance } = useWallet();

  // 状态管理
  const [gameState, setGameState] = useState<GlobalGameState>('betting');
  const [currentRound, setCurrentRound] = useState<string>('Loading...');
  const [countdown, setCountdown] = useState(300); // 5分钟
  const [bets, setBets] = useState<Record<string, number>>({});
  const [selectedChip, setSelectedChip] = useState(100);
  const [winAmount, setWinAmount] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [lastBets, setLastBets] = useState<Record<string, number>>({});
  const [diceOptions, setDiceOptions] = useState<Map<number, DiceChooseVO>>(new Map());
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [lastProcessedRound, setLastProcessedRound] = useState<string | null>(null);

  // 引用
  const betPanelWrapperRef = useRef<HTMLDivElement>(null);
  const betPanelContentRef = useRef<HTMLDivElement>(null);
  const [betPanelScale, setBetPanelScale] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 音效和震动
  const {
    playBetClick,
    playRoundStart,
    playWinSmall,
    enabled: soundEnabled,
    toggleSound,
  } = useGameSounds();

  const {
    hapticBetClick,
    hapticWin,
    hapticError,
    hapticSuccess,
    enabled: hapticEnabled,
    toggleHaptic,
  } = useGameHaptics();

  // 加载骰宝选项
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await apiService.getDiceDisplay();
        if (response.success && response.data) {
          const map = new Map<number, DiceChooseVO>();
          Object.entries(response.data).forEach(([key, value]) => {
            map.set(Number(key), value as DiceChooseVO);
          });
          setDiceOptions(map);
        }
      } catch (error) {
        console.error('Failed to load dice options', error);
      }
    };
    loadOptions();
  }, []);

  // 轮询同步服务器状态
  const syncState = useCallback(async () => {
    try {
      const response = await apiService.getGlobalLatestResults();
      if (response.success && response.data && response.data.length > 0) {
        const latest = response.data[0];
        
        // 解析倒计时 (假设 createTime 是本期开始时间)
        const createTime = new Date(latest.createTime).getTime();
        const now = Date.now();
        const diff = (now - createTime) / 1000;
        const roundDuration = 300; // 5分钟
        let remaining = Math.max(0, roundDuration - diff);
        
        if (latest.status === 'FINISHED') {
             // 如果是刚刚结束的一期，且未处理过
             if (latest.number.toString() !== lastProcessedRound) {
                 console.log('Round finished:', latest.number);
                 setLastProcessedRound(latest.number.toString());
                 setDiceResults(latest.outCome);
                 
                 // 如果当前还在投注或封盘状态，切换到开奖状态
                 if (gameState !== 'rolling' && gameState !== 'settled') {
                    setGameState('rolling');
                    
                    // 获取我的中奖信息
                    if (user) {
                        try {
                            const myResult = await apiService.getGlobalGameInfo(String(user.id), String(latest.number));
                            if (myResult.success && myResult.data) {
                                const win = myResult.data.winAmount || 0;
                                setWinAmount(win);
                                setHasWon(win > 0);
                                if (win > 0) {
                                    playWinSmall();
                                    hapticWin();
                                }
                                refreshBalance();
                            }
                        } catch (e) {
                            console.error('Failed to get my result', e);
                        }
                    }
                    
                    // 动画结束后重置
                    setTimeout(() => {
                        setGameState('settled');
                        setTimeout(() => {
                           setGameState('betting');
                           setLastBets(bets); // 保存上一局下注
                           setBets({}); // 清空当前下注
                           setWinAmount(0);
                           setHasWon(false);
                           setDiceResults([]);
                        }, 2000);
                    }, 5000);
                 }
             }
        } else {
             // 如果是新的一期
             if (latest.number.toString() !== currentRound && gameState !== 'rolling' && gameState !== 'settled') {
                 setCurrentRound(latest.number.toString());
             }
             
             // 只有在非结算状态下更新倒计时和状态
             if (gameState !== 'rolling' && gameState !== 'settled') {
                 setCountdown(Math.floor(remaining));
                 
                 if (remaining <= 30 && remaining > 0) {
                     if (gameState !== 'sealed') setGameState('sealed');
                 } else if (remaining <= 0) {
                     // 倒计时结束，等待 FINISHED 状态
                 } else {
                     if (gameState !== 'betting') setGameState('betting');
                 }
             }
        }
      }
    } catch (error) {
      console.error('Failed to sync global game state', error);
    }
  }, [gameState, lastProcessedRound, user, playWinSmall, hapticWin, refreshBalance, currentRound, bets]);

  // 倒计时逻辑
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 30 && next > 0) {
            setGameState('sealed');
        } else if (next <= 0) {
            setGameState('rolling');
            // 触发开奖查询
            syncState();
        }
        return next;
      });
    }, 1000);

    // 初始同步
    syncState();
    // 每10秒同步一次
    const syncTimer = setInterval(syncState, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(syncTimer);
    };
  }, [syncState]);

  // 下注逻辑
  const placeBet = (betId: string) => {
    if (gameState !== 'betting') {
        toast.warning('当前无法下注');
        return;
    }
    const amount = selectedChip; // 简化：不乘倍率，或者可以加上 MultiplierSelector
    if (balance < amount) {
        toast.error('余额不足');
        return;
    }
    
    playBetClick();
    hapticBetClick();
    
    setBets(prev => ({
        ...prev,
        [betId]: (prev[betId] || 0) + amount
    }));
  };

  const clearBets = () => {
      setBets({});
  };

  const undoLastBet = () => {
      const keys = Object.keys(bets);
      if (keys.length > 0) {
          const newBets = { ...bets };
          delete newBets[keys[keys.length - 1]]; 
          setBets(newBets);
      }
  };

  const confirmBets = async () => {
      if (!user) return;
      
      let successCount = 0;
      const betEntries = Object.entries(bets);
      
      for (const [betId, amount] of betEntries) {
          const chooseId = getBetChooseId(betId);
          if (chooseId === null) continue;
          
          try {
              const res = await apiService.placeGlobalBet(String(user.id), currentRound, chooseId, amount);
              if (res.success) successCount++;
          } catch (e) {
              console.error(e);
          }
      }
      
      if (successCount === betEntries.length) {
          toast.success('全部下注成功');
          setLastBets(bets);
          setBets({});
          refreshBalance();
          return true;
      } else {
          toast.warning(`部分下注成功 (${successCount}/${betEntries.length})`);
          return false;
      }
  };

  // 缩放逻辑
  const betsSnapshot = JSON.stringify(bets);
  useLayoutEffect(() => {
    const updateScale = () => {
      const wrapper = betPanelWrapperRef.current;
      const content = betPanelContentRef.current;
      if (!wrapper || !content) { setBetPanelScale(1); return; }
      const wrapperHeight = wrapper.clientHeight;
      const contentHeight = content.scrollHeight;
      if (wrapperHeight <= 0 || contentHeight <= 0) { setBetPanelScale(1); return; }
      const scale = Math.min(1, wrapperHeight / contentHeight);
      setBetPanelScale(Number(scale.toFixed(3)));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [betsSnapshot]);

  const totalBetAmount = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  const formatTime = (seconds: number) => {
      if (seconds < 0) return '00:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--rich-black)' }}>
      {/* 顶部栏 */}
      <header
        className="sticky top-0 z-50 border-b-2 flex items-center justify-between px-3 py-1"
        style={{
          background: 'linear-gradient(180deg, var(--rich-black) 0%, var(--onyx-black) 100%)',
          borderBottomColor: 'var(--gold-primary)',
          backdropFilter: 'blur(10px)',
          minHeight: '60px',
        }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-tiny text-gray-400">全局局号</span>
          <span className="text-small font-bold font-mono text-gold-bright">#{currentRound}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-tiny text-gray-400">
                {gameState === 'sealed' ? '已封盘' : gameState === 'rolling' ? '开奖中' : '下注倒计时'}
            </span>
            <div className={`text-2xl font-mono font-bold ${gameState === 'sealed' ? 'text-red-500' : 'text-white'}`}>
                {formatTime(countdown)}
            </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/wallet')} className="flex flex-col items-end">
            <span className="text-tiny text-gray-400">余额</span>
            <span className="text-small font-bold font-mono text-white">
              {balance.toLocaleString()} USDT
            </span>
          </button>
        </div>
      </header>

      {/* 状态提示 */}
      {gameState === 'sealed' && (
          <div className="w-full bg-red-900/50 text-red-200 text-center py-1 text-xs animate-pulse">
              ⚠️ 已封盘，停止下注
          </div>
      )}

      {/* 3D骰盅区 */}
      {gameState !== 'rolling' && (
        <div className="relative h-[200px] bg-gradient-to-b from-onyx-black to-rich-black">
          <DiceCupDemo className="w-full h-full" />
           <div className="absolute top-4 right-4 flex flex-col gap-2 items-center">
             <button
               onClick={() => router.push('/game')}
               className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/80 border border-gold-primary/30 text-gold-primary"
             >
               <span className="text-sm">单人</span>
             </button>
             <button
               onClick={() => router.push('/global-history')}
               className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/80 border border-gold-primary/30 text-gold-primary"
             >
               <span className="text-sm">走势</span>
             </button>
           </div>
        </div>
      )}

      {/* 投注面板 */}
      <div
        ref={betPanelWrapperRef}
        className="flex-1 overflow-hidden flex justify-center pb-5"
        style={{
             height: 'calc(100vh - 300px)',
        }}
      >
        <div
          ref={betPanelContentRef}
          style={{
            transform: `scale(${betPanelScale ?? 1})`,
            transformOrigin: 'top center',
            width: betPanelScale !== null && betPanelScale < 1 ? `${(100 / betPanelScale).toFixed(3)}%` : '100%',
          }}
        >
             <BetPanel 
                disabled={gameState !== 'betting'}
                bets={bets}
                onPlaceBet={placeBet}
                diceOptions={diceOptions}
             />
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="fixed bottom-0 left-0 right-0 bg-onyx-black border-t-2 border-gold-primary p-2 flex gap-2 z-50 flex-col pb-6">
           <div className="flex justify-between items-center px-2">
               <button onClick={clearBets} className="text-gold-primary text-sm border border-gold-primary px-3 py-1 rounded">清空</button>
               <button onClick={undoLastBet} className="text-gold-primary text-sm border border-gold-primary px-3 py-1 rounded">撤销</button>
           </div>
           <div className="flex gap-2 items-center">
                <div className="flex-1 overflow-x-auto">
                    <ChipSelector value={selectedChip} onChange={setSelectedChip} />
                </div>
               <button 
                 onClick={confirmBets}
                 disabled={gameState !== 'betting' || totalBetAmount === 0}
                 className="w-32 h-12 bg-gold-primary text-black font-bold rounded-lg disabled:opacity-50 flex flex-col items-center justify-center shrink-0"
               >
                   <span>{gameState === 'sealed' ? '封盘中' : '确认下注'}</span>
                   {totalBetAmount > 0 && <span className="text-xs">${totalBetAmount}</span>}
               </button>
           </div>
      </div>

      {/* 开奖动画 */}
      {gameState === 'rolling' && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
              <DiceCupAnimation fullscreen winAmount={winAmount} hasWon={hasWon} diceResults={diceResults} />
          </div>
      )}

      <ToastContainer />
    </div>
  );
}
