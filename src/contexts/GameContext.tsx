'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type GameState = 'betting' | 'rolling' | 'revealing' | 'settled';

interface BetHistoryItem {
  betId: string;
  amount: number;
}

interface GameContextType {
  // 游戏状态
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // 当前局信息
  currentRound: number;
  countdown: number;
  setCountdown: (time: number) => void;

  // 下注相关
  selectedChip: number;
  setSelectedChip: (chip: number) => void;
  bets: Record<string, number>;
  placeBet: (betId: string) => void;
  clearBets: () => void;
  confirmBets: () => Promise<void>;

  // 倍投功能
  multiplier: number;
  setMultiplier: (multiplier: number) => void;

  // 撤销功能
  betHistory: BetHistoryItem[];
  undoLastBet: () => void;
  canUndo: boolean;

  // 重复上局下注
  lastBets: Record<string, number>;
  repeatLastBets: () => void;

  // 开奖结果
  diceResults: number[];
  setDiceResults: (results: number[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>('betting');
  const [currentRound, setCurrentRound] = useState(123456);
  const [countdown, setCountdown] = useState(30);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [diceResults, setDiceResults] = useState<number[]>([]);

  // 倍投状态
  const [multiplier, setMultiplier] = useState(1);

  // 撤销功能：下注历史栈
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);

  // 上一局下注记录
  const [lastBets, setLastBets] = useState<Record<string, number>>({});

  // 下注（考虑倍投）
  const placeBet = useCallback(
    (betId: string) => {
      if (gameState !== 'betting' || countdown === 0) {
        return;
      }

      const actualAmount = selectedChip * multiplier;

      setBets((prev) => ({
        ...prev,
        [betId]: (prev[betId] || 0) + actualAmount,
      }));

      // 记录到历史栈（用于撤销）
      setBetHistory((prev) => [...prev, { betId, amount: actualAmount }]);
    },
    [gameState, countdown, selectedChip, multiplier]
  );

  // 清空下注
  const clearBets = useCallback(() => {
    setBets({});
    setBetHistory([]);
  }, []);

  // 撤销上一步下注
  const undoLastBet = useCallback(() => {
    if (betHistory.length === 0) return;

    const lastBet = betHistory[betHistory.length - 1];

    setBets((prev) => {
      const newBets = { ...prev };
      const newAmount = (newBets[lastBet.betId] || 0) - lastBet.amount;

      if (newAmount <= 0) {
        delete newBets[lastBet.betId];
      } else {
        newBets[lastBet.betId] = newAmount;
      }

      return newBets;
    });

    setBetHistory((prev) => prev.slice(0, -1));
  }, [betHistory]);

  // 重复上局下注
  const repeatLastBets = useCallback(() => {
    if (Object.keys(lastBets).length === 0) return;

    setBets(lastBets);
    // 重建历史栈
    const history: BetHistoryItem[] = [];
    Object.entries(lastBets).forEach(([betId, amount]) => {
      history.push({ betId, amount });
    });
    setBetHistory(history);
  }, [lastBets]);

  // 确认下注
  const confirmBets = useCallback(async () => {
    // TODO: 发送到后端
    console.log('确认下注:', bets);

    // 保存为上一局下注
    setLastBets(bets);

    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 生成随机骰子结果（3个骰子，每个1-6）
    const results = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    
    // 先设置骰子结果，再开始动画
    setDiceResults(results);
    
    // 开始滚动动画（会先显示 shaking，然后 0.8s 后显示 rolling）
    setGameState('rolling');

    // 动画时间线：
    // 0-0.8s: shaking (骰盅晃动)
    // 0.8-2.3s: rolling (骰子滚动，1.5秒)
    // 2.3s+: revealing (显示结果)
    setTimeout(() => {
      setGameState('revealing');
    }, 2300); // 0.8s shaking + 1.5s rolling

    // 显示结果3秒后结算
    setTimeout(() => {
      setGameState('settled');
    }, 5300); // 2.3s + 3s revealing

    // 结算后1秒重置为下注状态
    setTimeout(() => {
      setGameState('betting');
      setDiceResults([]);
      setBets({});
      setBetHistory([]);
      setMultiplier(1);
      // 更新局号
      setCurrentRound((prev) => prev + 1);
    }, 6300); // 5.3s + 1s
  }, [bets, setGameState]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        currentRound,
        countdown,
        setCountdown,
        selectedChip,
        setSelectedChip,
        bets,
        placeBet,
        clearBets,
        confirmBets,
        multiplier,
        setMultiplier,
        betHistory,
        undoLastBet,
        canUndo: betHistory.length > 0,
        lastBets,
        repeatLastBets,
        diceResults,
        setDiceResults,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
