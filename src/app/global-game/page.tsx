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
import MultiplierSelector from '@/components/game/MultiplierSelector';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { GlobalDiceResult, GlobalDiceBet, DiceChooseVO } from '@/lib/types';
import { getBetChooseId, getChooseBetId } from '@/lib/betMapping';

// 全局游戏状态
type GlobalGameState = 'betting' | 'sealed' | 'rolling' | 'settled';

export default function GlobalGamePage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { balance, refreshBalance } = useWallet();

  // 状态管理
  const [gameState, setGameState] = useState<GlobalGameState>('betting');
  const [currentRound, setCurrentRound] = useState<string>('Loading...');
  const currentRoundRef = useRef<string>('Loading...'); // 使用 ref 存储当前期号，避免闭包问题
  const [countdown, setCountdown] = useState(300); // 5分钟
  const [bets, setBets] = useState<Record<string, number>>({});
  const [selectedChip, setSelectedChip] = useState(1);
  const [winAmount, setWinAmount] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [lastBets, setLastBets] = useState<Record<string, number>>({});
  const [diceOptions, setDiceOptions] = useState<Map<number, DiceChooseVO>>(new Map());
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [lastProcessedRound, setLastProcessedRound] = useState<string | null>(null);
  const [recentResults, setRecentResults] = useState<GlobalDiceResult[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<GlobalDiceResult | null>(null);
  const [showMultiplierSelector, setShowMultiplierSelector] = useState(false);
  const [multiplier, setMultiplier] = useState(1); // 倍投倍数，默认1倍
  // 记住的筹码、倍数和下注区域 - 从 localStorage 恢复
  const [rememberedChip, setRememberedChip] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('global_dice_remembered_chip');
    return saved ? Number(saved) : null;
  });
  const [rememberedMultiplier, setRememberedMultiplier] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('global_dice_remembered_multiplier');
    return saved ? Number(saved) : null;
  });
  const [rememberedBets, setRememberedBets] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('global_dice_remembered_bets');
    return saved ? JSON.parse(saved) : {};
  });
  const betsLoadedRef = useRef(false); // 标记是否已加载下注信息
  const isProcessingResultRef = useRef(false); // 标记是否正在处理开奖结果，防止重复调用

  // 引用
  const betPanelWrapperRef = useRef<HTMLDivElement>(null);
  const betPanelContentRef = useRef<HTMLDivElement>(null);
  const [betPanelScale, setBetPanelScale] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const doubleBetButtonRef = useRef<HTMLButtonElement>(null);

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

  // 页面加载时刷新余额（确保余额正确显示）
  useEffect(() => {
    if (user) {
      // 延迟一下，让WalletContext先完成初始化
      const timer = setTimeout(() => {
        console.log('🔄 全局模式页面：刷新余额');
        refreshBalance();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, refreshBalance]);

  // 页面加载时立即加载用户下注信息（已合并到 syncState 中，避免重复请求）
  // 这个 useEffect 已移除，逻辑合并到 syncState 中

  // 加载上期结果（从开奖历史获取第一条）
  const loadLastRoundResult = useCallback(async () => {
    try {
      const historyResponse = await apiService.getGlobalResults(1, 1); // 获取第一页，每页1条
      if (historyResponse.success && historyResponse.data && historyResponse.data.list && historyResponse.data.list.length > 0) {
        const firstResult = historyResponse.data.list[0];
        if (firstResult && (firstResult.outCome || firstResult.result)) {
          console.log('✅ 从开奖历史获取到上期结果:', firstResult);
          setLastRoundResult(firstResult);
        } else {
          console.log('⚠️ 开奖历史第一条没有结果数据');
        }
      } else {
        console.log('⚠️ 开奖历史为空');
      }
    } catch (error) {
      console.error('❌ 获取上期结果失败:', error);
    }
  }, []);

  // 轮询同步服务器状态
  const syncState = useCallback(async () => {
    // 防止重复调用（在请求完成前不会再次调用）
    if (syncStateCalledRef.current) {
      console.log('⏸️ syncState 正在执行，跳过重复请求');
      return;
    }
    syncStateCalledRef.current = true;
    
    try {
      const response = await apiService.getGlobalLatestResults();
      
      // 同时获取历史开奖结果（用于显示上期结果和最近30期）
      try {
        const historyResponse = await apiService.getGlobalResults(1, 30);
        if (historyResponse.success && historyResponse.data && historyResponse.data.list) {
          const historyList = historyResponse.data.list;
          setRecentResults(historyList);
          // 设置上一期结果
          if (historyList.length > 0) {
            setLastRoundResult(historyList[0]);
          }
        }
      } catch (e) {
        console.error('获取历史开奖结果失败:', e);
      }
      
      if (response.success && response.data && response.data.length > 0) {
        const latest = response.data[0];
        
        // 解析倒计时 (使用 openTime 作为开奖时间)
        let remaining = 0;
        if (latest.openTime) {
          const openTime = typeof latest.openTime === 'string' 
            ? new Date(latest.openTime).getTime() 
            : latest.openTime;
          const now = Date.now();
          remaining = Math.max(0, (openTime - now) / 1000);
        } else {
          // 如果没有 openTime，使用 createTime + 5分钟作为备用方案
        const createTime = new Date(latest.createTime).getTime();
        const now = Date.now();
        const diff = (now - createTime) / 1000;
        const roundDuration = 300; // 5分钟
          remaining = Math.max(0, roundDuration - diff);
        }
        
        // 只在倒计时结束后才处理开奖结果
        // 如果状态是 FINISHED，但不应该在这里处理，应该在倒计时结束后处理
        // 这里只更新最近结果和历史记录
        if (latest.status === 'FINISHED') {
             // 只更新最近结果，不在这里获取开奖结果
             // 开奖结果应该在倒计时结束后获取
        } else {
             // 获取当前期号
             const currentRoundNumber = latest.number.toString();
             const isNewRound = currentRoundNumber !== currentRound;
             
             // 确保 currentRoundRef 始终是最新的期号（即使不是新的一期也要更新）
             if (currentRoundRef.current !== currentRoundNumber) {
               currentRoundRef.current = currentRoundNumber;
             }
             
             // 如果是新的一期，更新期号
             if (isNewRound && gameState !== 'rolling' && gameState !== 'settled') {
                 setCurrentRound(currentRoundNumber);
                 currentRoundRef.current = currentRoundNumber; // 同时更新 ref
                 betsLoadedRef.current = false; // 重置加载标记
                 // 重置已处理期号标记，允许查询新一期的结果
                 setLastProcessedRound(null);
                 lastProcessedRoundRef.current = null; // 同时重置 ref
                 countdownEndTriggeredRef.current = false; // 重置倒计时结束触发标记
                 
                 // 恢复用户上次选择的筹码、倍数和下注区域（如果用户之前下过注）
                 if (rememberedChip !== null) {
                     setSelectedChip(rememberedChip);
                 }
                 if (rememberedMultiplier !== null) {
                     setMultiplier(rememberedMultiplier);
                 } else {
                     // 如果没有记住的值，重置为默认值
                     setMultiplier(1);
                 }
                 // 恢复下注区域
                 if (Object.keys(rememberedBets).length > 0) {
                     setBets({ ...rememberedBets });
                 }
                 
                 console.log('✅ 新一期开始，恢复筹码:', rememberedChip, '恢复倍数:', rememberedMultiplier, '恢复下注区域:', rememberedBets);
             }
             
             // 加载当前期数的用户下注信息（只在首次加载或新的一期时加载，避免重复请求）
             // 条件：用户存在、状态为运行中或封盘中、未加载过、期号匹配（包括刚设置的新期号）
             const shouldLoadBets = user && 
                                   (latest.status === 'RUNNING' || latest.status === 'SEALED') && 
                                   !betsLoadedRef.current && 
                                   (currentRoundNumber === currentRound || isNewRound || currentRound === 'Loading...');
                    
             // 只在倒计时结束时才请求用户下注信息，而不是每10秒轮询
             // 这里只在新一期开始时加载一次
             if (shouldLoadBets && isNewRound) {
                 console.log('🔄 Loading user bets for round:', currentRoundNumber, 'currentRound:', currentRound, 'isNewRound:', isNewRound);
                 betsLoadedRef.current = true; // 先标记为已加载，避免重复请求
                        try {
                     const myGameInfo = await apiService.getGlobalGameInfo(String(user.id), currentRoundNumber);
                     console.log('📥 API response:', myGameInfo);
                     if (myGameInfo.success && myGameInfo.data) {
                         if (myGameInfo.data.myBets && Array.isArray(myGameInfo.data.myBets) && myGameInfo.data.myBets.length > 0) {
                             // 将后端返回的下注信息转换为前端格式
                             const loadedBets: Record<string, number> = {};
                             myGameInfo.data.myBets.forEach((bet) => {
                                 const betId = getChooseBetId(bet.chooseId);
                                 if (betId) {
                                     loadedBets[betId] = (loadedBets[betId] || 0) + bet.amount;
                                 }
                             });
                             const totalAmount = Object.values(loadedBets).reduce((sum, amount) => sum + amount, 0);
                             console.log('✅ Loaded bets:', loadedBets, 'Total amount:', totalAmount);
                             setLastBets(loadedBets);
                         } else {
                             console.log('⚠️ No bets found for this round');
                             setLastBets({}); // 明确设置为空对象
                         }
                     } else {
                         console.log('❌ API call failed or no data');
                         setLastBets({}); // 明确设置为空对象
                            }
                        } catch (e) {
                     console.error('❌ Failed to load user bets', e);
                     setLastBets({}); // 出错也设置为空对象
                 }
             } else if (shouldLoadBets && !isNewRound) {
                 // 首次加载时也加载一次（但不是新的一期）
                 console.log('🔄 Loading user bets for first time:', currentRoundNumber);
                 betsLoadedRef.current = true;
                 try {
                     const myGameInfo = await apiService.getGlobalGameInfo(String(user.id), currentRoundNumber);
                     if (myGameInfo.success && myGameInfo.data) {
                         if (myGameInfo.data.myBets && Array.isArray(myGameInfo.data.myBets) && myGameInfo.data.myBets.length > 0) {
                             const loadedBets: Record<string, number> = {};
                             myGameInfo.data.myBets.forEach((bet) => {
                                 const betId = getChooseBetId(bet.chooseId);
                                 if (betId) {
                                     loadedBets[betId] = (loadedBets[betId] || 0) + bet.amount;
                                 }
                             });
                             setLastBets(loadedBets);
                         } else {
                             setLastBets({});
             }
        } else {
                         setLastBets({});
                     }
                 } catch (e) {
                     console.error('❌ Failed to load user bets', e);
                     setLastBets({});
                 }
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
    } finally {
      // 请求完成后重置标记，允许下次调用
      syncStateCalledRef.current = false;
    }
  }, [gameState, currentRound, user, rememberedChip, rememberedMultiplier, rememberedBets]);

  // 倒计时结束后的处理函数
  const handleCountdownEnd = useCallback(async () => {
    if (!user) return;
    
    // 防止重复调用
    if (isProcessingResultRef.current) {
      console.log('⚠️ 已在处理开奖结果，跳过重复调用');
      return;
    }
    
    isProcessingResultRef.current = true;
    console.log('⏰ 倒计时结束，开始获取开奖结果，期号:', currentRound);
    
    // 时间配置（单位：毫秒）
    // 摇盅动画约 5 秒（300帧 / 60fps）
    // 骰子停下后 1 秒显示结果卡片
    // 结果展示 3 秒后重置
    const SHAKE_ANIMATION_TIME = 5000; // 摇盅动画时间
    const RESULT_SHOW_DELAY = 1000;    // 骰子停下后延迟显示结果
    const RESULT_DISPLAY_TIME = 3000;  // 结果展示时间
    
    const fetchResult = async () => {
      try {
        // 使用新接口获取特定期号的开奖结果
        const response = await apiService.getGlobalSingleResult(currentRound);
        
        if (response.success && response.data) {
          const result = response.data;
          
          // 检查是否已开奖
          if (result.status === 'FINISHED') {
            console.log('✅ 获取到开奖结果:', result);
            setLastProcessedRound(result.number.toString());
            
            // 获取我的中奖信息
            let winValue = 0;
            try {
              const myResult = await apiService.getGlobalGameInfo(String(user.id), currentRound);
              if (myResult.success && myResult.data) {
                winValue = myResult.data.winAmount || 0;
              }
            } catch (e) {
              console.error('Failed to get my result', e);
            }
            
            // 立即设置 diceResults，让摇盅动画开始引导
            console.log('🎲 设置开奖结果，开始摇盅动画:', result.outCome || result.result);
            setDiceResults(result.outCome || result.result || []);
            
            // 摇盅动画结束后（约3秒），再等1秒显示结果卡片
            setTimeout(() => {
              console.log('🎯 骰子停下，准备显示结果');
              // 设置中奖信息
              setWinAmount(winValue);
              setHasWon(winValue > 0);
              if (winValue > 0) {
                playWinSmall();
                hapticWin();
              }
              refreshBalance();
              
              // 1秒后显示结果卡片
              setTimeout(() => {
                console.log('📋 显示结果卡片');
                setGameState('settled');
                
                // 结果展示3秒后重置
                setTimeout(() => {
                  setGameState('betting');
                  setLastBets(bets); // 保存上一局下注
                  setBets({}); // 清空当前下注
                  setWinAmount(0);
                  setHasWon(false);
                  setDiceResults([]);
                  // 重置处理标志，准备下一轮
                  isProcessingResultRef.current = false;
                }, RESULT_DISPLAY_TIME);
              }, RESULT_SHOW_DELAY);
            }, SHAKE_ANIMATION_TIME);
            
            // 成功获取结果，不再重试
            return;
          } else {
            // 如果还没有开奖结果，等待一下再重试
            console.log('⏳ 开奖结果尚未生成，状态:', result.status, '等待中...');
          }
        } else {
          // API 调用失败
          console.log('⏳ 获取开奖结果失败，等待重试...');
        }
      } catch (error) {
        console.error('❌ 获取开奖结果失败:', error);
      }
      
      // 重试（只有在未获取到 FINISHED 状态时才重试）
      setTimeout(fetchResult, 2000);
    };
    
    // 开始获取结果
    fetchResult();
  }, [user, currentRound, bets, playWinSmall, hapticWin, refreshBalance]);

  // 倒计时逻辑
  useEffect(() => {
    // 只在组件首次挂载时调用一次 syncState，避免重复请求
    if (!syncStateInitializedRef.current) {
      syncStateInitializedRef.current = true;
      syncState();
      // 加载上期结果
      loadLastRoundResult();
    }
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 30 && next > 0) {
            setGameState('sealed');
        } else if (next === 0) {
            // 只在倒计时刚好为0时触发一次，避免重复调用
            // 倒计时结束，切换到开奖状态
            // 防止重复触发（倒计时可能多次检查 next <= 0）
            if (countdownEndTriggeredRef.current) {
              return 0; // 已经触发过，保持为0
            }
            
            // 检查是否已经处理过这一期，避免重复查询（使用 ref 避免闭包问题）
            const currentRoundValue = currentRoundRef.current;
            const lastProcessedValue = lastProcessedRoundRef.current;
            console.log('⏰ 倒计时结束，检查是否需要查询结果:', {
              currentRoundValue,
              lastProcessedValue,
              shouldQuery: lastProcessedValue !== currentRoundValue,
              alreadyTriggered: countdownEndTriggeredRef.current
            });
            
            if (lastProcessedValue !== currentRoundValue && currentRoundValue !== 'Loading...') {
              countdownEndTriggeredRef.current = true; // 标记已触发
            setGameState('rolling');
            // 倒计时结束后，获取开奖结果（只请求一次）
            handleCountdownEnd();
        }
        // 倒计时为负数时不做任何处理，等待 syncState 重置
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (queryResultTimerRef.current) {
        clearTimeout(queryResultTimerRef.current);
        queryResultTimerRef.current = null;
      }
    };
  }, [syncState, handleCountdownEnd, loadLastRoundResult]);

  // 下注逻辑
  const placeBet = (betId: string) => {
    if (gameState !== 'betting') {
        toast.warning('当前无法下注');
        return;
    }
    // 实际下注金额 = 选择的筹码金额 × 倍投倍数
    const amount = selectedChip * multiplier;
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

  // 清空所有下注（包括已确认的）
  const clearBets = async () => {
      if (!user) return;
      
      // 先清空未确认的下注
      setBets({});
      
      // 如果有已确认的下注，调用 API 撤销
      if (Object.keys(lastBets).length > 0) {
          try {
              const res = await apiService.revertAllGlobalBets(String(user.id), currentRound);
              if (res.success) {
                  toast.success('已清空所有下注');
                  setLastBets({});
                  // 清空记忆的下注区域
                  setRememberedBets({});
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('global_dice_remembered_bets');
                  }
                  refreshBalance();
              } else {
                  toast.error('清空下注失败');
              }
          } catch (error) {
              console.error('清空下注失败:', error);
              toast.error('清空下注失败');
          }
      } else {
          // 即使没有已确认的下注，也清空记忆的下注区域
          setRememberedBets({});
          if (typeof window !== 'undefined') {
            localStorage.removeItem('global_dice_remembered_bets');
          }
          hapticSuccess();
      }
  };

  // 撤销最后一次下注
  const undoLastBet = async () => {
      if (!user) return;
      
      // 先处理未确认的下注
      const keys = Object.keys(bets);
      if (keys.length > 0) {
          const newBets = { ...bets };
          delete newBets[keys[keys.length - 1]]; 
          setBets(newBets);
          hapticSuccess();
          return;
      }
      
      // 如果有已确认的下注，撤销最后一个
      const lastBetKeys = Object.keys(lastBets);
      if (lastBetKeys.length > 0) {
          const lastBetId = lastBetKeys[lastBetKeys.length - 1];
          const chooseId = getBetChooseId(lastBetId);
          
          if (chooseId !== null) {
              try {
                  const res = await apiService.revertGlobalBet(String(user.id), currentRound, chooseId);
                  if (res.success) {
                      toast.success('已撤销最后一次下注');
                      const newLastBets = { ...lastBets };
                      delete newLastBets[lastBetId];
                      setLastBets(newLastBets);
                      refreshBalance();
                      hapticSuccess();
                  } else {
                      toast.error('撤销下注失败');
                      hapticError();
                  }
              } catch (error) {
                  console.error('撤销下注失败:', error);
                  toast.error('撤销下注失败');
                  hapticError();
              }
          }
      }
  };

  // 倍投选择处理
  const handleMultiplierSelect = (selectedMultiplier: number) => {
    setMultiplier(selectedMultiplier);
    hapticBetClick();
  };

  const confirmBets = async () => {
      if (!user) return;
      
      // 验证最小下注（1U）
      const MIN_BET = 1;
      const hasBelowMin = Object.values(bets).some(amount => amount < MIN_BET);
      if (hasBelowMin) {
          toast.error(`单注金额不得少于 ${MIN_BET}U`);
          return false;
      }
      
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
          
          // 记住用户选择的筹码、倍数和下注区域，并持久化到 localStorage
          setRememberedChip(selectedChip);
          setRememberedMultiplier(multiplier);
          setRememberedBets({ ...bets }); // 深拷贝保存下注区域
          
          // 持久化到 localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('global_dice_remembered_chip', String(selectedChip));
            localStorage.setItem('global_dice_remembered_multiplier', String(multiplier));
            localStorage.setItem('global_dice_remembered_bets', JSON.stringify(bets));
          }
          
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

  // 计算总下注额：未确认的下注 + 已确认的下注
  const totalBetAmount = Object.values(bets).reduce((sum, amount) => sum + amount, 0) +
                         Object.values(lastBets).reduce((sum, amount) => sum + amount, 0);
  
  // 合并未确认和已确认的下注，用于显示在投注面板
  const displayBets = { ...lastBets, ...bets };

  const formatTime = (seconds: number) => {
      if (seconds < 0) return '00:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 格式化期号：如 20170802-0501期
  const formatRoundNumber = (round: string) => {
    if (!round || round === 'Loading...') return '00000000-0000期';
    // 假设 round 是数字字符串，格式化为日期-序号
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = round.padStart(4, '0');
    return `${dateStr}-${seq}期`;
  };

  // 计算大小单双
  const analyzeDice = (dice: number[]) => {
    if (!dice || dice.length === 0) return { total: 0, size: '', parity: '', label: '' };
    const total = dice.reduce((sum, val) => sum + val, 0);
    const size = total >= 11 ? '大' : '小';
    const parity = total % 2 === 0 ? '双' : '单';
    return { total, size, parity, label: `${size}${parity} ${total}` };
  };

  return (
    <div className="flex flex-col h-screen" style={{ 
      background: 'radial-gradient(circle at 50% 35%, #0d5a30 0%, #0b3f24 45%, #09261c 100%)',
      overflowX: 'hidden' 
    }}>
      {/* 顶部栏 - 按照图一布局 */}
      <header className="sticky top-0 z-50">
        <div
          className="shadow-md"
          style={{
            background: '#3a3a3a',
            borderBottom: '2px solid #1f1f1f',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
          }}
        >
          {/* 移动端：垂直布局 */}
          <div className="md:hidden flex flex-col text-white">
            {/* 第一行：期号 + 按钮 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a2a]">
              <div className="text-[13px] font-mono font-semibold" style={{ color: '#e0e0e0' }}>
                {formatRoundNumber(currentRound)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  className="px-2 py-1 rounded text-[11px] font-semibold"
                  style={{ 
                    background: soundEnabled ? '#ffd75e' : '#2c2c2c',
                    color: soundEnabled ? '#000' : '#d9d9d9',
                  }}
                >
                  音效{soundEnabled ? '开' : '关'}
                </button>
                <button
                  onClick={toggleHaptic}
                  className="px-2 py-1 rounded text-[11px] font-semibold"
                  style={{ 
                    background: hapticEnabled ? '#ffd75e' : '#2c2c2c',
                    color: hapticEnabled ? '#000' : '#d9d9d9',
                  }}
                >
                  震动{hapticEnabled ? '开' : '关'}
                </button>
                <button
                  onClick={() => router.push('/wallet')}
                  className="px-2 py-1 rounded text-[11px] font-semibold"
                  style={{ 
                    background: '#ffd75e',
                    color: '#000',
                  }}
                >
                  余额{balance.toLocaleString()}
                </button>
              </div>
            </div>
            {/* 第二行：上期结果（左） + 倒计时（中） + 查看历史（右） */}
            <div className="flex items-center justify-between px-3 py-3 gap-3">
              {/* 左侧：上期结果 */}
              <div className="flex items-center gap-2 flex-1">
                {lastRoundResult && (lastRoundResult.outCome || lastRoundResult.result) ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: '#a0a0a0' }}>上期:</span>
                    {(lastRoundResult.outCome || lastRoundResult.result || []).map((n, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded bg-white border border-gray-300 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        <span className="text-sm font-bold" style={{ color: i === 0 ? '#c40000' : '#000' }}>
                          {n}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-400">暂无上期结果</span>
                )}
              </div>
              
              {/* 中间：倒计时 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {formatTime(countdown).split('').map((char, idx) => (
                  <div
                    key={`${char}-${idx}`}
                    className="w-10 h-12 bg-[#1a1a1a] border-2 border-[#0a0a0a] rounded-[6px] flex items-center justify-center relative"
                    style={{
                      boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.5)',
                      background: char === ':' ? '#1a1a1a' : 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
                    }}
                  >
                    <span
                      className="font-mono text-2xl font-black"
                      style={{ 
                        color: char === ':' ? '#888' : '#ffffff',
                        letterSpacing: '2px',
                        textShadow: char === ':' ? 'none' : '0 2px 4px rgba(0,0,0,0.9)',
                      }}
                    >
                      {char}
                    </span>
                    {char !== ':' && (
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* 右侧：查看历史 */}
              <div className="flex items-center justify-end flex-1">
                <button
                  onClick={() => router.push('/global-history')}
                  className="px-3 py-1 rounded text-[11px] font-semibold"
                  style={{ 
                    background: '#2c2c2c',
                    color: '#ffd75e',
                    border: '1px solid #1f1f1f',
                  }}
                >
                  查看历史
                </button>
              </div>
            </div>
          </div>

          {/* 桌面端：水平布局 */}
          <div className="hidden md:flex items-stretch text-white" style={{ minHeight: '100px' }}>
            {/* 左侧：期号 */}
            <div
              className="flex flex-col justify-center px-4 min-w-[200px]"
              style={{
                background: 'linear-gradient(180deg, #444 0%, #2f2f2f 100%)',
                borderRight: '1px solid #2a2a2a',
              }}
            >
              <div className="text-[15px] font-mono font-semibold" style={{ color: '#e0e0e0', letterSpacing: '0.5px' }}>
                {formatRoundNumber(currentRound)}
              </div>
            </div>

            {/* 中间：上期结果（左） + 数字翻牌时钟倒计时（中） + 查看历史（右） */}
            <div className="flex-1 flex items-center justify-between px-4 py-3">
              {/* 左侧：上期结果 */}
              <div className="flex items-center gap-2 flex-1">
                {lastRoundResult && (lastRoundResult.outCome || lastRoundResult.result) ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px]" style={{ color: '#a0a0a0' }}>上期:</span>
                    {(lastRoundResult.outCome || lastRoundResult.result || []).map((n, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded bg-white border-2 border-gray-300 flex items-center justify-center shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)',
                        }}
                      >
                        <span className="text-lg font-bold" style={{ color: i === 0 ? '#c40000' : '#000' }}>
                          {n}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[12px] text-gray-400">暂无上期结果</span>
                )}
              </div>
              
              {/* 中间：倒计时 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {formatTime(countdown).split('').map((char, idx) => (
                  <div
                    key={`${char}-${idx}`}
                    className="w-14 h-16 bg-[#1a1a1a] border-2 border-[#0a0a0a] rounded-[8px] flex items-center justify-center relative"
                    style={{
                      boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.8), 0 3px 10px rgba(0,0,0,0.5)',
                      background: char === ':' ? '#1a1a1a' : 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
                    }}
                  >
                    <span
                      className="font-mono text-4xl font-black"
                      style={{ 
                        color: char === ':' ? '#888' : '#ffffff',
                        letterSpacing: '3px',
                        textShadow: char === ':' ? 'none' : '0 2px 4px rgba(0,0,0,0.9), 0 0 12px rgba(255,255,255,0.15)',
                      }}
                    >
                      {char}
                    </span>
                    {char !== ':' && (
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* 右侧：查看历史 */}
              <div className="flex items-center justify-end flex-1">
                <button
                  onClick={() => router.push('/global-history')}
                  className="px-4 py-2 rounded-md text-[12px] font-semibold transition-all"
                  style={{ 
                    background: '#2c2c2c',
                    color: '#ffd75e',
                    border: '1px solid #1f1f1f',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  查看历史
                </button>
              </div>
            </div>

            {/* 右侧：最近30期开奖结果 */}
            <div
              className="min-w-[280px] px-3 py-2 flex flex-col gap-2"
              style={{
                background: 'linear-gradient(180deg, #4a4a4a 0%, #333 100%)',
                borderLeft: '1px solid #2a2a2a',
              }}
            >
              {/* 最近30期开奖结果 */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-gray-200" style={{ color: '#a0a0a0' }}>
                    最近30期开奖结果
                  </div>
                  <button
                    onClick={() => router.push('/global-history')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                  >
                    查看全部
                  </button>
                </div>
                <div className="space-y-1 max-h-[120px] overflow-auto pr-1">
                  {recentResults.slice(0, 3).map((item, idx) => {
                    // 使用 outCome 或 result 字段
                    const diceResult = item.outCome || item.result || [];
                    const analysis = analyzeDice(diceResult);
                    return (
                      <div
                        key={`${item.number}-${idx}`}
                        className="flex items-center gap-2 text-[11px] text-gray-100 bg-[#262626] rounded px-2 py-1 border border-[#1a1a1a] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                        onClick={() => router.push('/global-history')}
                      >
                        <span className="font-mono text-[10px]" style={{ color: '#a0a0a0', minWidth: '40px' }}>
                          {String(item.number).slice(-4)}
                        </span>
                        <div className="flex items-center gap-1">
                          {diceResult.map((n, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded bg-white border border-gray-300 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                              }}
                            >
                              <span className="text-[10px] font-bold" style={{ color: i === 0 ? '#c40000' : '#000' }}>
                                {n}
                              </span>
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px]" style={{ color: '#a0a0a0', minWidth: '35px' }}>
                          {analysis.label}
                        </span>
                      </div>
                    );
                  })}
                  {recentResults.length === 0 && (
                    <div className="text-[11px] text-gray-400">暂无数据</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 状态提示 */}
      {gameState === 'sealed' && (
          <div className="w-full bg-red-900/50 text-red-200 text-center py-2 text-xs">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="animate-pulse">⚠️ 已封盘，停止下注</span>
              {totalBetAmount > 0 && (
                <>
                  <span className="text-yellow-300 font-semibold">
                    投注总额: ${totalBetAmount.toLocaleString()}
                  </span>
                  {multiplier > 1 && (
                    <span className="text-orange-400 font-semibold">
                      倍数: {multiplier}x
                    </span>
                  )}
                </>
              )}
              </div>
            </div>
          )}

      {/* 投注信息提示 - 只要用户有投注就显示 */}
      {totalBetAmount > 0 && gameState !== 'sealed' && gameState !== 'rolling' && gameState !== 'settled' && (
          <div className="w-full bg-blue-900/50 text-blue-200 text-center py-2 text-xs">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-yellow-300 font-semibold">
                当前投注: ${totalBetAmount.toLocaleString()}
              </span>
              {multiplier > 1 && (
                <span className="text-orange-400 font-semibold">
                  倍数: {multiplier}x
                </span>
              )}
              </div>
            </div>
          )}

      {/* 投注面板 */}
            <div
              ref={betPanelWrapperRef}
        className="flex-1 overflow-hidden"
        style={{
          paddingBottom: '8px',
          paddingLeft: '4px',
          paddingRight: '4px',
          paddingTop: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          position: 'relative',
          zIndex: 1, // 确保在底部操作区下方
          // 移动端：减去头部高度、底部操作区高度、底部导航栏高度
          // 头部高度：移动端约 110px，桌面端约 100px
          // 底部操作区：约 200px（信息栏 + 筹码选择器 + 按钮）
          // 底部导航栏：64px
          height: 'calc(100vh - 110px - 200px - 64px)',
          maxHeight: 'calc(100vh - 100px - 200px - 64px)', // 桌面端使用较小的头部高度
          minHeight: 0,
        }}
      >
                <div
                  ref={betPanelContentRef}
          className="w-full max-w-5xl mx-auto"
                  style={{
            opacity: betPanelScale === null ? 0 : 1,
                    transform: `scale(${betPanelScale ?? 1})`,
                    transformOrigin: 'top center',
                    width: betPanelScale !== null && betPanelScale < 1 ? `${(100 / betPanelScale).toFixed(3)}%` : '100%',
            transition: 'opacity 0.2s ease',
                  }}
                >
          <div className="p-2 md:p-5">
                  <BetPanel
                    disabled={gameState !== 'betting'}
                    bets={displayBets}
                    onPlaceBet={placeBet}
                    diceOptions={diceOptions}
              theme="green"
                  />
                </div>
              </div>
            </div>

      {/* 底部操作区 - 深灰条 + 彩色按钮/筹码 - 开奖时隐藏 */}
      {gameState !== 'rolling' && gameState !== 'settled' && (
      <div
        className="fixed left-0 right-0 flex flex-col gap-2 pb-4 pt-2"
        style={{
          bottom: '64px', // 为底部导航栏留出空间
          zIndex: 100, // 提高 z-index，确保始终显示在最上层
          width: '100vw',
          maxWidth: '100vw',
          paddingLeft: '0px',
          paddingRight: '0px',
          background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderTop: '2px solid #0d0d0d',
          boxShadow: '0 -6px 16px rgba(0,0,0,0.45)',
          overflow: 'visible',
        }}
      >
        <div className="flex items-center justify-between text-xs text-gray-200 gap-2 w-full px-2">
          <div className="flex items-center gap-1 flex-shrink-0">
            <span>余额:</span>
            <span className="text-yellow-300 font-semibold">{balance.toLocaleString()}</span>
            <button
              onClick={() => router.push('/deposit')}
              className="ml-1 px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                background: 'linear-gradient(180deg, #f5a623 0%, #d4880f 100%)',
                color: '#fff',
                border: '1px solid #b8760c',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              充值
            </button>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span>下注额:</span>
            <span className="text-yellow-300 font-semibold">${totalBetAmount}</span>
            {multiplier > 1 && (
              <span className="text-orange-400 font-semibold ml-1">({multiplier}x)</span>
            )}
          </div>
          <div className="flex items-center flex-shrink-0">
            {gameState === 'sealed' && <span className="text-red-400">已封盘</span>}
            {gameState === 'betting' && <span className="text-green-300">可下注</span>}
        </div>
      </div>

        <div className="w-full" style={{ width: '100%', maxWidth: '100%', overflow: 'visible' }}>
          <ChipSelector value={selectedChip} onChange={setSelectedChip} />
      </div>

        <div className="flex gap-1.5 justify-between w-full px-2">
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={clearBets}
              className="px-2.5 py-2 rounded-md text-xs text-white flex-shrink-0"
              style={{
                background: '#4a4a4a',
                border: '1px solid #2f2f2f',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)',
                minWidth: '70px',
              }}
            >
              重置
            </button>
            <button
              onClick={undoLastBet}
              className="px-2.5 py-2 rounded-md text-xs text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, #4287d9 0%, #2e6bb3 100%)',
                border: '1px solid #1f4f86',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                minWidth: '70px',
              }}
            >
              撤销投注
            </button>
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            <button
              ref={doubleBetButtonRef}
              onClick={() => {
                setShowMultiplierSelector(true);
                hapticBetClick();
              }}
              className="px-2.5 py-2 rounded-md text-xs text-white flex-shrink-0"
              style={{
                background: multiplier > 1 
                  ? 'linear-gradient(180deg, #ffd75e 0%, #f5a623 100%)'
                  : 'linear-gradient(180deg, #f5a623 0%, #d8840f 100%)',
                border: multiplier > 1 
                  ? '1px solid rgba(255, 215, 94, 0.5)'
                  : '1px solid #b6660a',
                boxShadow: multiplier > 1
                  ? '0 2px 8px rgba(255, 215, 94, 0.4)'
                  : '0 2px 6px rgba(0,0,0,0.35)',
                minWidth: '70px',
              }}
            >
              翻倍下注
            </button>
            <button
              onClick={confirmBets}
              disabled={gameState !== 'betting' || totalBetAmount === 0}
              className="px-2.5 py-2 rounded-md text-xs font-bold text-white disabled:opacity-50 flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, #d0342c 0%, #a0211f 100%)',
                border: '1px solid #7f1717',
                boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
                minWidth: '80px',
              }}
            >
              {gameState === 'sealed' ? '封盘中' : '确认下注'}
            </button>
          </div>
        </div>
      </div>
      )}

<<<<<<< HEAD
      {/* 开奖动画 */}
=======
      {/* 开奖动画 - 在 rolling 和 settled 状态都显示，以便显示结果 */}
>>>>>>> 333f859e82273034d61ff2d28e15657ff534eb1f
      {(gameState === 'rolling' || gameState === 'settled') && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center" style={{ zIndex: 90 }}>
          <DiceCupAnimation 
            fullscreen 
            winAmount={winAmount} 
            hasWon={hasWon} 
<<<<<<< HEAD
            diceResults={diceResults} 
            gameState={gameState === 'settled' ? 'settled' : 'rolling'}
=======
            diceResults={diceResults}
            gameState={gameState}
            myBets={myBets}
            globalOutcome={globalOutcome}
>>>>>>> 333f859e82273034d61ff2d28e15657ff534eb1f
          />
        </div>
      )}

      {/* 倍投选择器 */}
      <MultiplierSelector
        isOpen={showMultiplierSelector}
        onClose={() => setShowMultiplierSelector(false)}
        onSelect={handleMultiplierSelect}
        buttonRef={doubleBetButtonRef}
        currentMultiplier={multiplier}
      />

      <ToastContainer />
    </div>
  );
}
