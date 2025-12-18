'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/contexts/TelegramContext';
import { useGame } from '@/contexts/GameContext'; // Still need this for diceOptions mapping if needed, or I can fetch it
import { apiService } from '@/lib/api';
import { GlobalDiceResult, GlobalDiceQuery } from '@/lib/types';
import { getChooseBetId } from '@/lib/betMapping';

/**
 * 全局游戏历史记录页面
 *
 * 功能：
 * 1. 我的投注历史（局号、下注内容、结果、盈亏）
 * 2. 全局开奖历史（近100局）
 * 3. 走势图（大小、单双热度）
 */

type TabType = 'my-bets' | 'results' | 'trends';

export default function GlobalHistoryPage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { diceOptions } = useGame(); // Use diceOptions for mapping bet IDs to names
  const [activeTab, setActiveTab] = useState<TabType>('results');
  
  // Data states
  const [myBetsData, setMyBetsData] = useState<GlobalDiceQuery[]>([]);
  const [resultsData, setResultsData] = useState<GlobalDiceResult[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const lastFetchKeyRef = useRef('');

  // 加载我的投注记录
  const loadMyBets = async () => {
    if (!user) return;

    const fetchKey = `my-bets-${user.id}-${pageIndex}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;

    setLoading(true);
    try {
      const response = await apiService.getGlobalUserHistory(
        String(user.id),
        pageIndex,
        pageSize
      );

      if (response.success && response.data) {
        setMyBetsData(response.data.list);
        setTotalCount(response.data.total);
      }
    } catch (error) {
      console.error('加载我的投注记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载全局开奖记录
  const loadGlobalResults = async () => {
    const fetchKey = `results-${pageIndex}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;

    setLoading(true);
    try {
      const response = await apiService.getGlobalResults(pageIndex, pageSize);

      if (response.success && response.data) {
        setResultsData(response.data.list);
        setTotalCount(response.data.total);
      }
    } catch (error) {
      console.error('加载全局开奖记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-bets' && user) {
      loadMyBets();
    } else if (activeTab === 'results' || activeTab === 'trends') {
      loadGlobalResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pageIndex, user?.id]);

  // Reset page index when tab changes
  useEffect(() => {
    setPageIndex(1);
    lastFetchKeyRef.current = '';
  }, [activeTab]);

  // 格式化时间
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '-';
    // If it's already a formatted string, return it. If timestamp, format it.
    // The API types say string, assuming standard format or ISO.
    try {
        const date = new Date(timeStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    } catch (e) {
        return timeStr;
    }
  };

  // 计算总点数
  const calculateTotal = (dice: number[]): number => {
    if (!dice || dice.length === 0) return 0;
    return dice.reduce((sum, val) => sum + val, 0);
  };

  // 判断大小单双
  const analyzeDice = (dice: number[]) => {
    if (!dice || dice.length === 0) return { total: 0, isBig: false, isSmall: false, isOdd: false, isEven: false, isTriple: false };
    
    const total = calculateTotal(dice);
    const isBig = total >= 11 && total <= 17;
    const isSmall = total >= 4 && total <= 10;
    const isOdd = total % 2 === 1;
    const isEven = total % 2 === 0;
    const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

    // 三同号通杀大小
    if (isTriple) {
      return { total, isBig: false, isSmall: false, isOdd, isEven, isTriple };
    }

    return { total, isBig, isSmall, isOdd, isEven, isTriple };
  };

  // 获取双面分类（大双、小双、大单、小单）
  const getDoubleSide = (dice: number[]): string => {
    if (!dice || dice.length === 0) return '';
    const total = calculateTotal(dice);
    const isEven = total % 2 === 0;
    const isBig = total >= 11;
    
    if (isBig && isEven) return '大双';
    if (!isBig && isEven) return '小双';
    if (isBig && !isEven) return '大单';
    return '小单';
  };

  // 获取极值分类（极大、极小、无）
  const getExtremeValue = (dice: number[]): string => {
    if (!dice || dice.length === 0) return '无';
    const total = calculateTotal(dice);
    if (total >= 16) return '极大';
    if (total <= 5) return '极小';
    return '无';
  };

  // 获取形态分类（对子、顺子、杂六）
  const getPattern = (dice: number[]): string => {
    if (!dice || dice.length !== 3) return '杂六';
    
    const sorted = [...dice].sort((a, b) => a - b);
    
    // 检查是否是对子（有两个相同）
    if (sorted[0] === sorted[1] || sorted[1] === sorted[2]) {
      return '对子';
    }
    
    // 检查是否是顺子（三个连续数字）
    if (sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1) {
      return '顺子';
    }
    
    return '杂六';
  };

  // 获取下注选项名称
  const getBetName = (chooseId: number): string => {
    const option = diceOptions.get(chooseId);
    if (option && option.display) {
      return option.display;
    }
    const betId = getChooseBetId(chooseId);
    if (betId) return betId;
    return `选项${chooseId}`;
  };

  // 骰子点数显示
  const DiceDisplay = ({ values }: { values: number[] }) => {
    if (!values || values.length === 0) return <span>等待开奖</span>;
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return (
      <div className="flex gap-1">
        {values.map((value, idx) => (
          <span key={idx} className="text-2xl">
            {diceFaces[value - 1] || '?'}
          </span>
        ))}
      </div>
    );
  };

  // 计算走势统计 (基于 resultsData)
  const calculateTrends = () => {
    if (resultsData.length === 0) {
      return {
        bigCount: 0,
        smallCount: 0,
        oddCount: 0,
        evenCount: 0,
        diceFrequency: [0, 0, 0, 0, 0, 0],
      };
    }

    let bigCount = 0;
    let smallCount = 0;
    let oddCount = 0;
    let evenCount = 0;
    const diceFrequency = [0, 0, 0, 0, 0, 0];

    resultsData.forEach((record) => {
      const diceResult = record.result || record.outCome || [];
      const analysis = analyzeDice(diceResult);
      if (analysis.isBig) bigCount++;
      if (analysis.isSmall) smallCount++;
      if (analysis.isOdd) oddCount++;
      if (analysis.isEven) evenCount++;

      // 统计每个点数出现次数
      if (diceResult.length > 0) {
        diceResult.forEach((dice) => {
            if (dice >= 1 && dice <= 6) {
                diceFrequency[dice - 1]++;
            }
        });
      }
    });

    return {
      bigCount,
      smallCount,
      oddCount,
      evenCount,
      diceFrequency,
    };
  };

  return (
    <div className="min-h-screen bg-bg-darkest pb-20">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 h-14 bg-bg-dark border-b border-border flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-primary-gold hover:bg-bg-medium rounded-lg transition-colors"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">全局模式历史</h1>
        <div className="w-10" />
      </header>

      {/* 标签页切换 */}
      <div className="sticky top-14 z-20 bg-bg-dark border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('results')}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-all',
              activeTab === 'results'
                ? 'text-primary-gold border-b-3 border-primary-gold'
                : 'text-text-secondary'
            )}
          >
            开奖历史
          </button>
          <button
            onClick={() => setActiveTab('my-bets')}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-all',
              activeTab === 'my-bets'
                ? 'text-primary-gold border-b-3 border-primary-gold'
                : 'text-text-secondary'
            )}
          >
            我的投注
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-all',
              activeTab === 'trends'
                ? 'text-primary-gold border-b-3 border-primary-gold'
                : 'text-text-secondary'
            )}
          >
            走势分析
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {loading && (
          <div className="text-center py-8">
            <p className="text-text-secondary">加载中...</p>
          </div>
        )}

        {/* 开奖历史页 */}
        {activeTab === 'results' && !loading && (
            <>
            {resultsData.length === 0 ? (
                 <div className="text-center py-8"><p className="text-text-secondary">暂无记录</p></div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg">
                    <table className="w-full border-collapse" style={{ backgroundColor: '#fff' }}>
                        {/* 表头 */}
                        <thead>
                            <tr style={{ backgroundColor: '#fff' }}>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold border border-gray-300" style={{ color: '#000', backgroundColor: '#fff' }}>期号</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold border border-gray-300" style={{ color: '#000', backgroundColor: '#fff' }}>结果</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold border border-gray-300" style={{ color: '#000', backgroundColor: '#fff' }}>特码</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold border border-gray-300" style={{ color: '#000', backgroundColor: '#fff' }}>双面</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold border border-gray-300" style={{ color: '#000', backgroundColor: '#fff' }}>极值</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold border border-gray-300" style={{ color: '#000', backgroundColor: '#fff' }}>形态</th>
                            </tr>
                        </thead>
                        {/* 表体 */}
                        <tbody>
                            {resultsData.map((record, index) => {
                                // 使用API返回的数据，如果没有则使用计算值作为后备
                                const diceResult = record.result || record.outCome || [];
                                const resultDisplay = record.resultDisplay;
                                const dualRet = record.dualRet;
                                const format = record.format;
                                const limitValue = record.limitValue;
                                
                                // 如果没有API返回的数据，则计算（需要确保diceResult不为空）
                                const analysis = diceResult.length > 0 ? analyzeDice(diceResult) : { total: 0 };
                                const doubleSide = dualRet || (diceResult.length > 0 ? getDoubleSide(diceResult) : '');
                                const extremeValue = limitValue || (diceResult.length > 0 ? getExtremeValue(diceResult) : '');
                                const pattern = format || (diceResult.length > 0 ? getPattern(diceResult) : '');
                                const isEvenRow = index % 2 === 1;
                                
                    return (
                                    <tr
                        key={record.number}
                                        style={{ backgroundColor: isEvenRow ? '#f5f5f5' : '#fff' }}
                        >
                                        {/* 期号 */}
                                        <td className="px-3 py-2.5 text-xs border border-gray-300" style={{ color: '#000' }}>
                                            {record.number}
                                        </td>

                                        {/* 结果 */}
                                        <td className="px-3 py-2.5 text-xs border border-gray-300" style={{ color: '#000' }}>
                                            {resultDisplay ? (
                                                // 使用API返回的格式化结果，如 "5 + 4 + 3 = 12"
                                                (() => {
                                                    const parts = resultDisplay.split('=');
                                                    const leftPart = parts[0]?.trim() || '';
                                                    const rightPart = parts[1]?.trim() || '';
                                                    const numbers = leftPart.split('+').map(s => s.trim()).filter(s => s);
                                                    
                                                    return (
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            {numbers.map((num, idx) => (
                                                                <span key={idx} className="flex items-center">
                                                                    <span
                                                                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
                                                                        style={{
                                                                            backgroundColor: '#e3f2fd',
                                                                            color: '#1976d2',
                                                                            border: '1px solid #90caf9',
                                                                            minWidth: '24px',
                                                                            height: '24px',
                                                                        }}
                                                                    >
                                                                        {num}
                                                                    </span>
                                                                    {idx < numbers.length - 1 && <span className="mx-1" style={{ color: '#000' }}>+</span>}
                                                                </span>
                                                            ))}
                                                            <span className="mx-1" style={{ color: '#000' }}>=</span>
                                                            <span className="font-bold" style={{ color: '#000' }}>{rightPart}</span>
                        </div>
                                                    );
                                                })()
                                            ) : diceResult.length === 3 ? (
                                                // 如果没有格式化结果，使用数组计算
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {diceResult.map((num, idx) => (
                                                        <span key={idx} className="flex items-center">
                                                            <span
                                                                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
                                                                style={{
                                                                    backgroundColor: '#e3f2fd',
                                                                    color: '#1976d2',
                                                                    border: '1px solid #90caf9',
                                                                    minWidth: '24px',
                                                                    height: '24px',
                                                                }}
                                                            >
                                                                {num}
                                                            </span>
                                                            {idx < 2 && <span className="mx-1" style={{ color: '#000' }}>+</span>}
                                                        </span>
                                                    ))}
                                                    <span className="mx-1" style={{ color: '#000' }}>=</span>
                                                    <span className="font-bold" style={{ color: '#000' }}>{analysis.total}</span>
                                                </div>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                        
                                        {/* 特码 */}
                                        <td className="px-3 py-2.5 text-xs border border-gray-300" style={{ color: '#000' }}>
                                            {/* 特码列留空 */}
                                        </td>
                                        
                                        {/* 双面 */}
                                        <td className="px-3 py-2.5 text-xs border border-gray-300" style={{ color: '#d32f2f', fontWeight: 500 }}>
                                            {doubleSide || '-'}
                                        </td>
                                        
                                        {/* 极值 */}
                                        <td className="px-3 py-2.5 text-xs border border-gray-300" style={{ color: '#000' }}>
                                            {extremeValue || '-'}
                                        </td>
                                        
                                        {/* 形态 */}
                                        <td className="px-3 py-2.5 text-xs border border-gray-300" style={{ 
                                            color: pattern === '对子' || pattern === '顺子' ? '#2e7d32' : '#000',
                                            fontWeight: pattern === '对子' || pattern === '顺子' ? 500 : 400,
                                        }}>
                                            {pattern || '-'}
                                        </td>
                                    </tr>
                    );
                    })}
                        </tbody>
                    </table>
                    
                    {/* 分页 */}
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                            disabled={pageIndex === 1}
                            className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                        >
                            上一页
                        </button>
                        <span className="px-4 py-2 text-sm text-text-secondary">
                            {pageIndex}
                        </span>
                        <button
                            onClick={() => setPageIndex((p) => p + 1)}
                            disabled={resultsData.length < pageSize}
                            className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                        >
                            下一页
                        </button>
                    </div>
                </div>
            )}
            </>
        )}

        {/* 我的投注页 */}
        {activeTab === 'my-bets' && !loading && (
             <>
             {myBetsData.length === 0 ? (
                  <div className="text-center py-8"><p className="text-text-secondary">暂无记录</p></div>
             ) : (
                <div className="space-y-3">
                    {myBetsData.map((record) => {
                    const analysis = analyzeDice(record.outCome || []);
                    
                    // 优先使用 betInfo（历史查询），否则使用 myBets（实时查询）
                    const hasBetInfo = record.betInfo && Array.isArray(record.betInfo) && record.betInfo.length > 0;
                    const hasMyBets = record.myBets && Array.isArray(record.myBets) && record.myBets.length > 0;
                    
                    // 计算总投注额
                    let totalBet = 0;
                    if (hasBetInfo) {
                        totalBet = record.betInfo!.reduce((sum, bet) => sum + parseFloat(bet.bet || '0'), 0);
                    } else if (hasMyBets) {
                        totalBet = record.myBets!.reduce((sum, bet) => sum + (bet.amount || 0), 0);
                    }
                    
                    // 获取总赢钱金额：优先使用 win 字段（字符串），否则使用 winAmount
                    const totalWin = record.win ? parseFloat(record.win) : (record.winAmount || 0);
                    const isWin = totalWin > 0;

                    return (
                        <div
                        key={record.number}
                        className="bg-bg-dark border border-border rounded-xl p-4"
                        >
                        {/* 局号和状态 */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-mono text-text-secondary">
                            #{record.number}
                            </span>
                            <span className={cn("text-xs", record.status === 'FINISHED' ? "text-success" : "text-warning")}>
                            {record.status === 'FINISHED' ? '已结束' : '进行中'}
                            </span>
                        </div>

                        {/* 投注内容 */}
                        <div className="mb-3">
                            <p className="text-xs text-text-secondary mb-2">投注内容</p>
                            <div className="flex flex-wrap gap-2">
                            {hasBetInfo ? (
                                // 使用 betInfo（历史查询返回的数据）
                                record.betInfo!.map((bet, idx) => {
                                    const betAmount = parseFloat(bet.bet || '0');
                                    const betWin = parseFloat(bet.win || '0');
                                    return (
                                        <span
                                            key={idx}
                                            className={cn(
                                                "px-2 py-1 rounded text-xs",
                                                betWin > 0 ? "bg-success/20 text-success" : "bg-bg-medium"
                                            )}
                                        >
                                            {getBetName(bet.betId)} {betAmount.toFixed(2)} USDT
                                            {betWin > 0 && <span className="ml-1 text-success">+{betWin.toFixed(2)}</span>}
                                        </span>
                                    );
                                })
                            ) : hasMyBets ? (
                                // 使用 myBets（实时查询返回的数据）
                                record.myBets!.map((bet, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-bg-medium rounded text-xs"
                                    >
                                        {getBetName(bet.chooseId)} {bet.amount} USDT
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-disabled">暂无投注</span>
                            )}
                            </div>
                        </div>

                        {/* 开奖结果 */}
                        {record.outCome && (
                            <div className="mb-3 flex items-center gap-3">
                                <div>
                                <p className="text-xs text-text-secondary mb-1">开奖结果</p>
                                <DiceDisplay values={record.outCome} />
                                </div>
                                <div>
                                <p className="text-xs text-text-secondary mb-1">总点数</p>
                                <p className="text-2xl font-bold font-mono text-primary-gold">
                                    {analysis.total}
                                </p>
                                </div>
                            </div>
                        )}

                        {/* 盈亏 */}
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-text-disabled">投注额: {totalBet.toFixed(2)} USDT</span>
                                <span className="text-sm text-text-secondary">
                                    {isWin ? '中奖金额' : '未中奖'}
                                </span>
                            </div>
                            {record.status === 'FINISHED' ? (
                                isWin ? (
                                <span className="text-lg font-bold font-mono text-success">
                                    +{totalWin.toFixed(2)} USDT
                                </span>
                                ) : (
                                <span className="text-lg font-bold font-mono text-error">
                                    -{totalBet.toFixed(2)} USDT
                                </span>
                                )
                            ) : (
                                <span className="text-lg font-bold font-mono text-text-secondary">
                                    待开奖
                                </span>
                            )}
                        </div>
                        </div>
                    );
                    })}
                     {/* 分页 */}
                     <div className="flex justify-center gap-2 mt-4">
                        <button
                            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                            disabled={pageIndex === 1}
                            className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                        >
                            上一页
                        </button>
                        <span className="px-4 py-2 text-sm text-text-secondary">
                            {pageIndex}
                        </span>
                        <button
                            onClick={() => setPageIndex((p) => p + 1)}
                            disabled={myBetsData.length < pageSize}
                            className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                        >
                            下一页
                        </button>
                    </div>
                </div>
             )}
             </>
        )}

        {/* 走势分析页 */}
        {activeTab === 'trends' && !loading && (
             <>
              {resultsData.length === 0 ? (
                  <div className="text-center py-8"><p className="text-text-secondary">暂无数据</p></div>
              ) : (
                <div className="space-y-6">
                    {/* 大小走势折线图 */}
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-3">
                        大小走势（近{Math.min(20, resultsData.length)}期）
                      </h3>
                      <div className="bg-bg-dark rounded-xl p-4 border border-border">
                        {/* 图表区域 */}
                        <div className="relative h-64 mb-8">
                          {/* Y轴刻度线 */}
                          <div className="absolute inset-0 flex flex-col justify-between">
                            {[18, 15, 12, 9, 6, 3].map((value) => (
                              <div key={value} className="flex items-center">
                                <span className="text-xs text-text-disabled w-6">{value}</span>
                                <div className="flex-1 h-px bg-border ml-2" />
                              </div>
                            ))}
                          </div>

                          {/* 折线图 */}
                          <div className="absolute inset-0 pl-8 pr-2 pb-8">
                            {(() => {
                              const data = resultsData.slice(0, 20).reverse();
                              const points: string[] = [];
                              const pointData: Array<{ 
                                x: number; 
                                y: number; 
                                total: number; 
                                isBig: boolean; 
                                isTriple: boolean;
                                idx: number;
                              }> = [];
                              
                              data.forEach((record, idx) => {
                                const diceResult = record.result || record.outCome || [];
                                const analysis = analyzeDice(diceResult);
                                const x = (idx / (data.length - 1 || 1)) * 100;
                                const y = 100 - ((analysis.total - 3) / 15) * 100;
                                points.push(`${x},${y}`);
                                pointData.push({
                                  x,
                                  y,
                                  total: analysis.total,
                                  isBig: analysis.isBig,
                                  isTriple: analysis.isTriple,
                                  idx
                                });
                              });

                              return (
                                <>
                                  {/* SVG折线 */}
                                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polyline
                                      points={points.join(' ')}
                                      fill="none"
                                      stroke="#3B82F6"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    {pointData.map((point) => (
                                      <circle
                                        key={point.idx}
                                        cx={point.x}
                                        cy={point.y}
                                        r="2.5"
                                        fill={
                                          point.isTriple
                                            ? '#9333EA'
                                            : point.isBig
                                            ? '#EF4444'
                                            : '#3B82F6'
                                        }
                                        stroke="#fff"
                                        strokeWidth="1"
                                      />
                                    ))}
                                  </svg>
                                  
                                  {/* HTML标签层 */}
                                  <div className="absolute inset-0">
                                    {pointData.map((point) => (
                                      <div
                                        key={point.idx}
                                        className="absolute flex flex-col items-center"
                                        style={{
                                          left: `${point.x}%`,
                                          top: `${point.y}%`,
                                          transform: 'translate(-50%, -100%)',
                                          marginTop: '-8px'
                                        }}
                                      >
                                        <span
                                          className={cn(
                                            'text-xs font-semibold mb-0.5',
                                            point.isTriple
                                              ? 'text-purple-400'
                                              : point.isBig
                                              ? 'text-error'
                                              : 'text-info'
                                          )}
                                        >
                                          {point.isTriple ? '豹' : point.isBig ? '大' : '小'}
                                        </span>
                                        <span className="text-xs font-bold text-white drop-shadow-md">
                                          {point.total}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* X轴序号 */}
                                  <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                                    {data.map((_, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs text-text-disabled"
                                        style={{ 
                                          width: `${100 / (data.length || 1)}%`, 
                                          textAlign: 'center' 
                                        }}
                                      >
                                        {20 - idx}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* 图例 */}
                        <div className="flex justify-center gap-4 pt-2 border-t border-border">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-error" />
                            <span className="text-xs text-text-secondary">大 (11-17)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-info" />
                            <span className="text-xs text-text-secondary">小 (4-10)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-purple-600" />
                            <span className="text-xs text-text-secondary">豹子</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 大小统计 */}
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-3">大小统计</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                          <p className="text-sm text-text-secondary mb-2">大</p>
                          <p className="text-3xl font-bold text-error mb-1">
                            {resultsData.length > 0
                              ? Math.round((calculateTrends().bigCount / resultsData.length) * 100)
                              : 0}
                            %
                          </p>
                          <p className="text-xs text-text-disabled">{calculateTrends().bigCount}期</p>
                        </div>
                        <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                          <p className="text-sm text-text-secondary mb-2">小</p>
                          <p className="text-3xl font-bold text-info mb-1">
                            {resultsData.length > 0
                              ? Math.round((calculateTrends().smallCount / resultsData.length) * 100)
                              : 0}
                            %
                          </p>
                          <p className="text-xs text-text-disabled">{calculateTrends().smallCount}期</p>
                        </div>
                      </div>
                    </div>

                    {/* 单双统计 */}
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-3">单双统计</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                          <p className="text-sm text-text-secondary mb-2">单</p>
                          <p className="text-3xl font-bold text-warning mb-1">
                            {resultsData.length > 0
                              ? Math.round((calculateTrends().oddCount / resultsData.length) * 100)
                              : 0}
                            %
                          </p>
                          <p className="text-xs text-text-disabled">{calculateTrends().oddCount}期</p>
                        </div>
                        <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                          <p className="text-sm text-text-secondary mb-2">双</p>
                          <p className="text-3xl font-bold text-success mb-1">
                            {resultsData.length > 0
                              ? Math.round((calculateTrends().evenCount / resultsData.length) * 100)
                              : 0}
                            %
                          </p>
                          <p className="text-xs text-text-disabled">{calculateTrends().evenCount}期</p>
                        </div>
                      </div>
                    </div>

                    {/* 热号冷号 */}
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-3">热号冷号</h3>
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((num) => {
                          const trends = calculateTrends();
                          const frequency = trends.diceFrequency[num - 1];
                          const totalDice = resultsData.length * 3;
                          const percentage =
                            totalDice > 0 ? Math.round((frequency / totalDice) * 100) : 0;
                          const isHot = percentage > 18;

                          return (
                            <div
                              key={num}
                              className={cn(
                                'aspect-square rounded-xl p-2 flex flex-col items-center justify-center',
                                isHot
                                  ? 'bg-gradient-to-br from-error to-orange-600'
                                  : 'bg-gradient-to-br from-info to-blue-600'
                              )}
                            >
                              <span className="text-2xl mb-1">{num}</span>
                              <span className="text-xs font-semibold">{percentage}%</span>
                              <span className="text-xs opacity-75">{frequency}次</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 近期走势（大小方块） */}
                    <div className="bg-bg-dark rounded-xl p-4 border border-border">
                      <h3 className="text-base font-semibold text-text-primary mb-3">近期走势</h3>
                      <div className="flex flex-wrap gap-2">
                        {resultsData.slice(0, 50).map((record) => {
                          const diceResult = record.result || record.outCome || [];
                          const analysis = analyzeDice(diceResult);
                          if (diceResult.length === 0) return null;
                          return (
                            <div key={record.number} className={cn(
                              "w-8 h-8 flex items-center justify-center rounded text-xs font-bold text-white",
                              analysis.isTriple ? "bg-purple-600" :
                              analysis.isBig ? "bg-error" : "bg-info"
                            )}>
                              {analysis.isTriple ? "豹" : analysis.isBig ? "大" : "小"}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                </div>
              )}
             </>
        )}
      </div>
    </div>
  );
}
