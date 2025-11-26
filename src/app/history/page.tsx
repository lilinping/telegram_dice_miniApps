'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/contexts/TelegramContext';
import { useGame } from '@/contexts/GameContext';
import { apiService } from '@/lib/api';
import { DiceEntity } from '@/lib/types';
import { getChooseBetId } from '@/lib/betMapping';
import WithdrawalHistory from '@/components/wallet/WithdrawalHistory';

/**
 * 历史记录页面
 *
 * 功能：
 * 1. 投注历史列表（局号、下注内容、结果、盈亏）
 * 2. 开奖结果历史（近100局）
 * 3. 走势图（大小、单双热度）
 * 4. 筛选与搜索（按日期、结果类型）
 */

type TabType = 'my-bets' | 'results' | 'trends' | 'withdrawals';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { diceOptions } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('results');
  const [historyData, setHistoryData] = useState<DiceEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const lastFetchKeyRef = useRef('');

  const loadHistory = async () => {
    if (!user) return;

    // 防止重复请求
    const fetchKey = `${user.id}-${pageIndex}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    setLoading(true);
    try {
      const response = await apiService.getGameHistory(
        String(user.id),
        pageIndex,
        pageSize
      );

      if (response.success && response.data) {
        setHistoryData(response.data.list);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载历史记录
  useEffect(() => {
    if (user) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, pageIndex]);

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 计算总点数
  const calculateTotal = (dice: number[]): number => {
    return dice.reduce((sum, val) => sum + val, 0);
  };

  // 判断大小单双
  const analyzeDice = (dice: number[]) => {
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

  // 获取下注选项名称
  const getBetName = (chooseId: number): string => {
    const option = diceOptions.get(chooseId);
    if (option && option.display) {
      return option.display;
    }

    // 降级处理
    const betId = getChooseBetId(chooseId);
    if (betId) {
      return betId;
    }

    return `选项${chooseId}`;
  };

  // 骰子点数显示
  const DiceDisplay = ({ values }: { values: number[] }) => {
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return (
      <div className="flex gap-1">
        {values.map((value, idx) => (
          <span key={idx} className="text-2xl">
            {diceFaces[value - 1]}
          </span>
        ))}
      </div>
    );
  };

  // 计算走势统计
  const calculateTrends = () => {
    if (historyData.length === 0) {
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

    historyData.forEach((record) => {
      const analysis = analyzeDice(record.outCome);
      if (analysis.isBig) bigCount++;
      if (analysis.isSmall) smallCount++;
      if (analysis.isOdd) oddCount++;
      if (analysis.isEven) evenCount++;

      // 统计每个点数出现次数
      record.outCome.forEach((dice) => {
        diceFrequency[dice - 1]++;
      });
    });

    return {
      bigCount,
      smallCount,
      oddCount,
      evenCount,
      diceFrequency,
    };
  };

  const trends = calculateTrends();
  const totalGames = historyData.length;

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
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">历史记录</h1>
        <div className="w-10" />
      </header>

      {/* 标签页切换 */}
      <div className="sticky top-14 z-20 bg-bg-dark border-b border-border">
        <div className="flex">
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
            onClick={() => setActiveTab('withdrawals')}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-all',
              activeTab === 'withdrawals'
                ? 'text-primary-gold border-b-3 border-primary-gold'
                : 'text-text-secondary'
            )}
          >
            提币记录
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

        {!loading && historyData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-text-secondary">暂无记录</p>
          </div>
        )}

        {/* 我的投注页 */}
        {activeTab === 'my-bets' && !loading && historyData.length > 0 && (
          <div className="space-y-3">
            {historyData.map((record) => {
              const analysis = analyzeDice(record.outCome);
              const totalBet = parseFloat(record.totalBet);
              const winAmount = parseFloat(record.win);
              const profit = winAmount - totalBet;
              const isWin = winAmount > 0;

              return (
                <div
                  key={record.id}
                  className="bg-bg-dark border border-border rounded-xl p-4"
                >
                  {/* 局号和时间 */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-mono text-text-secondary">
                      #{record.id}
                    </span>
                    <span className="text-xs text-text-disabled">
                      {formatTime(record.createTime)}
                    </span>
                  </div>

                  {/* 投注内容 */}
                  <div className="mb-3">
                    <p className="text-xs text-text-secondary mb-2">投注内容</p>
                    <div className="flex flex-wrap gap-2">
                      {record.betInfo.map((bet, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-bg-medium rounded text-xs"
                        >
                          {getBetName(bet.betId)} {bet.bet} USDT
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 开奖结果 */}
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

                  {/* 盈亏 */}
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-sm text-text-secondary">
                      {isWin ? '中奖金额' : '未中奖'}
                    </span>
                    {isWin ? (
                      <span className="text-lg font-bold font-mono text-success">
                        +{profit.toFixed(2)} USDT
                      </span>
                    ) : (
                      <span className="text-lg font-bold font-mono text-error">
                        -{totalBet.toFixed(2)} USDT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 分页 */}
            {totalCount > pageSize && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  disabled={pageIndex === 1}
                  className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-text-secondary">
                  {pageIndex} / {Math.ceil(totalCount / pageSize)}
                </span>
                <button
                  onClick={() =>
                    setPageIndex((p) => Math.min(Math.ceil(totalCount / pageSize), p + 1))
                  }
                  disabled={pageIndex >= Math.ceil(totalCount / pageSize)}
                  className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}

        {/* 开奖历史页 */}
        {activeTab === 'results' && !loading && historyData.length > 0 && (
          <div className="space-y-2">
            {historyData.map((record) => {
              const analysis = analyzeDice(record.outCome);

              return (
                <div
                  key={record.id}
                  className="bg-bg-dark border border-border rounded-xl p-4 flex items-center gap-4"
                >
                  {/* 局号和时间 */}
                  <div className="flex-1">
                    <p className="text-sm font-mono text-text-secondary mb-1">
                      #{record.id}
                    </p>
                    <p className="text-xs text-text-disabled">
                      {formatTime(record.createTime)}
                    </p>
                  </div>

                  {/* 骰子结果 */}
                  <div className="flex items-center gap-3">
                    <DiceDisplay values={record.outCome} />
                    <div>
                      <p className="text-2xl font-bold font-mono text-primary-gold">
                        {analysis.total}
                      </p>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-col gap-1">
                    {analysis.isBig && (
                      <span className="px-2 py-0.5 bg-error text-white text-xs rounded">
                        大
                      </span>
                    )}
                    {analysis.isSmall && (
                      <span className="px-2 py-0.5 bg-info text-white text-xs rounded">
                        小
                      </span>
                    )}
                    {analysis.isOdd && (
                      <span className="px-2 py-0.5 bg-warning text-white text-xs rounded">
                        单
                      </span>
                    )}
                    {analysis.isEven && (
                      <span className="px-2 py-0.5 bg-success text-white text-xs rounded">
                        双
                      </span>
                    )}
                    {analysis.isTriple && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">
                        豹子
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 分页 */}
            {totalCount > pageSize && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  disabled={pageIndex === 1}
                  className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-text-secondary">
                  {pageIndex} / {Math.ceil(totalCount / pageSize)}
                </span>
                <button
                  onClick={() =>
                    setPageIndex((p) => Math.min(Math.ceil(totalCount / pageSize), p + 1))
                  }
                  disabled={pageIndex >= Math.ceil(totalCount / pageSize)}
                  className="px-4 py-2 bg-bg-dark border border-border rounded-lg text-sm disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}

        {/* 提币记录页 */}
        {activeTab === 'withdrawals' && user && (
          <WithdrawalHistory userId={String(user.id)} />
        )}

        {/* 走势分析页 */}
        {activeTab === 'trends' && !loading && historyData.length > 0 && (
          <div className="space-y-6">
            {/* 大小走势 */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3">
                大小走势（近{Math.min(20, totalGames)}局）
              </h3>
              <div className="bg-bg-dark rounded-xl p-4 border border-border">
                {/* 图表区域 */}
                <div className="relative h-48 mb-8">
                  {/* Y轴刻度线 */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[18, 15, 12, 9, 6, 3].map((value) => (
                      <div key={value} className="flex items-center">
                        <span className="text-xs text-text-disabled w-6">{value}</span>
                        <div className="flex-1 h-px bg-border ml-2" />
                      </div>
                    ))}
                  </div>

                  {/* 柱状图 */}
                  <div className="absolute inset-0 pl-8 flex items-end justify-start gap-1 overflow-x-auto pb-1">
                    {historyData.slice(0, 20).reverse().map((record, idx) => {
                      const analysis = analyzeDice(record.outCome);
                      const heightPercent = ((analysis.total - 3) / 15) * 100; // 3-18 映射到 0-100%
                      
                      return (
                        <div
                          key={record.id}
                          className="flex-shrink-0 flex flex-col items-center"
                          style={{ width: '32px' }}
                        >
                          {/* 柱子 */}
                          <div
                            className={cn(
                              'w-full rounded-t transition-all relative',
                              analysis.isTriple
                                ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                                : analysis.isBig
                                ? 'bg-gradient-to-t from-error to-red-400'
                                : 'bg-gradient-to-t from-info to-blue-400'
                            )}
                            style={{ 
                              height: `${Math.max(heightPercent, 5)}%`,
                              minHeight: '24px'
                            }}
                          >
                            {/* 大小标签 - 在柱子顶部外侧 */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                              {analysis.isTriple ? (
                                <span className="text-purple-400">豹</span>
                              ) : analysis.isBig ? (
                                <span className="text-error">大</span>
                              ) : (
                                <span className="text-info">小</span>
                              )}
                            </div>
                            
                            {/* 点数标签 - 在柱子内部顶部 */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-white drop-shadow-md">
                              {analysis.total}
                            </div>
                          </div>
                          
                          {/* 序号 */}
                          <span className="text-xs text-text-disabled mt-1">
                            {20 - idx}
                          </span>
                        </div>
                      );
                    })}
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
                    {totalGames > 0
                      ? Math.round((trends.bigCount / totalGames) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-text-disabled">{trends.bigCount}局</p>
                </div>
                <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                  <p className="text-sm text-text-secondary mb-2">小</p>
                  <p className="text-3xl font-bold text-info mb-1">
                    {totalGames > 0
                      ? Math.round((trends.smallCount / totalGames) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-text-disabled">{trends.smallCount}局</p>
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
                    {totalGames > 0
                      ? Math.round((trends.oddCount / totalGames) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-text-disabled">{trends.oddCount}局</p>
                </div>
                <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                  <p className="text-sm text-text-secondary mb-2">双</p>
                  <p className="text-3xl font-bold text-success mb-1">
                    {totalGames > 0
                      ? Math.round((trends.evenCount / totalGames) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-text-disabled">{trends.evenCount}局</p>
                </div>
              </div>
            </div>

            {/* 热号冷号 */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3">热号冷号</h3>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const frequency = trends.diceFrequency[num - 1];
                  const totalDice = totalGames * 3;
                  const percentage =
                    totalDice > 0 ? Math.round((frequency / totalDice) * 100) : 0;
                  const isHot = percentage > 18; // 超过平均值(16.67%)视为热号

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
          </div>
        )}
      </div>
    </div>
  );
}
