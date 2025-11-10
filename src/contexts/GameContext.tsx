'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type GameState = 'betting' | 'rolling' | 'revealing' | 'settled';

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

  // 下注
  const placeBet = useCallback(
    (betId: string) => {
      if (gameState !== 'betting' || countdown === 0) {
        return;
      }

      setBets((prev) => ({
        ...prev,
        [betId]: (prev[betId] || 0) + selectedChip,
      }));
    },
    [gameState, countdown, selectedChip]
  );

  // 清空下注
  const clearBets = useCallback(() => {
    setBets({});
  }, []);

  // 确认下注
  const confirmBets = useCallback(async () => {
    // TODO: 发送到后端
    console.log('确认下注:', bets);

    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, [bets]);

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
