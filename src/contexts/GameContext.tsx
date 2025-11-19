'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useTelegram } from './TelegramContext';
import { useWallet } from './WalletContext';
import { DiceEntity, DiceChooseVO } from '@/lib/types';
import { getBetChooseId } from '@/lib/betMapping';

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
  currentGameId: string | null;
  currentRound: number;
  countdown: number;
  setCountdown: (time: number) => void;

  // 下注选项
  diceOptions: Map<number, DiceChooseVO>;
  loadDiceOptions: () => Promise<void>;

  // 下注相关
  selectedChip: number;
  setSelectedChip: (chip: number) => void;
  bets: Record<string, number>;
  placeBet: (betId: string) => void;
  clearBets: () => void;
  confirmBets: () => Promise<boolean>;

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

  // 游戏控制
  startNewGame: () => Promise<void>;
  endCurrentGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useTelegram();
  const { refreshBalance } = useWallet();
  const [gameState, setGameState] = useState<GameState>('betting');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(123456);
  const [countdown, setCountdown] = useState(30);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [diceOptions, setDiceOptions] = useState<Map<number, DiceChooseVO>>(new Map());

  // 倍投状态
  const [multiplier, setMultiplier] = useState(1);

  // 撤销功能：下注历史栈
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);

  // 上一局下注记录
  const [lastBets, setLastBets] = useState<Record<string, number>>({});

  // 加载骰宝选项对照表
  const loadDiceOptions = useCallback(async () => {
    try {
      const response = await apiService.getDiceDisplay();
      if (response.success && response.data) {
        // 将对象转换为Map
        const optionsMap = new Map<number, DiceChooseVO>();
        Object.entries(response.data).forEach(([key, value]) => {
          optionsMap.set(Number(key), value as DiceChooseVO);
        });
        setDiceOptions(optionsMap);
        console.log('骰宝选项加载成功:', optionsMap);
      }
    } catch (error) {
      console.error('加载骰宝选项失败:', error);
    }
  }, []);

  // 初始化时加载骰宝选项
  useEffect(() => {
    loadDiceOptions();
  }, [loadDiceOptions]);

  // 开始新游戏
  const startNewGame = useCallback(async () => {
    if (!user) {
      console.error('用户未登录');
      return;
    }

    try {
      const response = await apiService.startGame(String(user.id));
      if (response.success && response.data) {
        setCurrentGameId(response.data);
        setGameState('betting');
        setCountdown(30);
        console.log('游戏开始，gameId:', response.data);
      } else {
        console.error('开始游戏失败:', response.message);
      }
    } catch (error) {
      console.error('开始游戏失败:', error);
    }
  }, [user]);

  // 结束当前游戏
  const endCurrentGame = useCallback(async () => {
    if (!currentGameId) {
      console.error('没有正在进行的游戏');
      return;
    }

    try {
      const response = await apiService.endGame(currentGameId);
      if (response.success) {
        console.log('游戏结束');
      } else {
        console.error('结束游戏失败:', response.message);
      }
    } catch (error) {
      console.error('结束游戏失败:', error);
    }
  }, [currentGameId]);

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
  const clearBets = useCallback(async () => {
    if (!currentGameId) return;

    try {
      // 调用后端撤销所有下注
      const response = await apiService.revertAllBets(currentGameId);
      if (response.success) {
        setBets({});
        setBetHistory([]);
        console.log('所有下注已清空');
      } else {
        console.error('清空下注失败:', response.message);
      }
    } catch (error) {
      console.error('清空下注失败:', error);
      // 即使后端失败，也清空前端状态
      setBets({});
      setBetHistory([]);
    }
  }, [currentGameId]);

  // 撤销上一步下注
  const undoLastBet = useCallback(async () => {
    if (betHistory.length === 0 || !currentGameId) return;

    const lastBet = betHistory[betHistory.length - 1];

    try {
      // 调用后端撤销接口
      const chooseId = getBetChooseId(lastBet.betId);
      if (chooseId === null) {
        console.error(`无效的下注选项: ${lastBet.betId}`);
        return;
      }
      const response = await apiService.revertBet(currentGameId, chooseId);
      if (response.success) {
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
        console.log('撤销下注成功');
      } else {
        console.error('撤销下注失败:', response.message);
      }
    } catch (error) {
      console.error('撤销下注失败:', error);
    }
  }, [betHistory, currentGameId]);

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
    if (!currentGameId || !user) {
      console.error('游戏未开始或用户未登录');
      return false;
    }

    try {
      // 提交所有下注到后端
      const betPromises = Object.entries(bets).map(([betId, amount]) => {
        const chooseId = getBetChooseId(betId);
        if (chooseId === null) {
          throw new Error(`无效的下注选项: ${betId}`);
        }
        console.log(`下注: ${betId} -> chooseId: ${chooseId}, 金额: ${amount}`);
        return apiService.placeBet(currentGameId, chooseId, String(amount));
      });

      const results = await Promise.all(betPromises);
      const allSuccess = results.every(r => r.success);

      if (!allSuccess) {
        console.error('部分下注失败');
        const failedResults = results.filter(r => !r.success);
        failedResults.forEach(r => console.error('下注失败:', r));
        return false;
      }

      console.log('所有下注提交成功');

      // 保存为上一局下注
      setLastBets(bets);

      // 下单成功后刷新余额，确保顶部余额及时更新
      await refreshBalance();

      // 立即进入滚动阶段，提升交互速度
      setGameState('rolling');
      const rollStartTime = Date.now();

      const handleResultFlow = async () => {
        try {
          // 结束游戏并获取结果
          await endCurrentGame();

          // 查询游戏结果后设置骰子动画
          const gameResult = await apiService.queryGame(currentGameId);
          if (gameResult.success && gameResult.data) {
            const result = gameResult.data;

            // 设置骰子结果
            if (result.outCome && result.outCome.length === 3) {
              console.log('设置骰子结果:', result.outCome);
              setDiceResults(result.outCome);
            } else {
              console.error('骰子结果数据异常:', result.outCome);
            }
          } else {
            console.error('查询游戏结果失败:', gameResult);
          }

          // 确保滚动动画至少展示2.3秒
          const elapsed = Date.now() - rollStartTime;
          const minRollingDuration = 2300;
          const remainingRollingTime = Math.max(0, minRollingDuration - elapsed);

          setTimeout(() => {
            setGameState('revealing');

            setTimeout(() => {
              setGameState('settled');

              setTimeout(async () => {
                setGameState('betting');
                setDiceResults([]);
                setBets({});
                setBetHistory([]);
                setMultiplier(1);
                setCurrentRound((prev) => prev + 1);

                // 自动开始下一局
                await startNewGame();
              }, 1000);
            }, 3000);
          }, remainingRollingTime);
        } catch (error) {
          console.error('处理游戏结果失败:', error);
          setGameState('betting');
        }
      };

      // 不等待结果流程执行，确保前端能立即反馈下注成功
      handleResultFlow();

      return true;
    } catch (error) {
      console.error('确认下注失败:', error);
      return false;
    }
  }, [bets, currentGameId, user, endCurrentGame, startNewGame, refreshBalance]);

  // 自动开始第一局游戏
  useEffect(() => {
    if (user && !currentGameId) {
      startNewGame();
    }
  }, [user, currentGameId, startNewGame]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        currentGameId,
        currentRound,
        countdown,
        setCountdown,
        diceOptions,
        loadDiceOptions,
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
        startNewGame,
        endCurrentGame,
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
