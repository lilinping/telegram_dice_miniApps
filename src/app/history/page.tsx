'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * 历史记录页面
 *
 * 功能：
 * 1. 投注历史列表（局号、下注内容、结果、盈亏）
 * 2. 开奖结果历史（近100局）
 * 3. 走势图（大小、单双热度）
 * 4. 筛选与搜索（按日期、结果类型）
 */

type TabType = 'my-bets' | 'results' | 'trends';

interface BetRecord {
  id: string;
  roundId: string;
  bets: { type: string; amount: number }[];
  result: number[];
  total: number;
  winAmount: number;
  status: 'win' | 'lose' | 'pending';
  timestamp: string;
}

interface DrawResult {
  id: string;
  roundId: string;
  dice: number[];
  total: number;
  isBig: boolean;
  isSmall: boolean;
  isOdd: boolean;
  timestamp: string;
}

// 模拟数据
const mockBets: BetRecord[] = [
  {
    id: '1',
    roundId: '123456',
    bets: [
      { type: '大', amount: 100 },
      { type: '单', amount: 50 },
    ],
    result: [4, 5, 6],
    total: 15,
    winAmount: 150,
    status: 'win',
    timestamp: '2025-01-09 12:30:25',
  },
  {
    id: '2',
    roundId: '123455',
    bets: [{ type: '小', amount: 200 }],
    result: [5, 5, 5],
    total: 15,
    winAmount: 0,
    status: 'lose',
    timestamp: '2025-01-09 12:25:18',
  },
];

const mockResults: DrawResult[] = [
  {
    id: '1',
    roundId: '123456',
    dice: [4, 5, 6],
    total: 15,
    isBig: true,
    isSmall: false,
    isOdd: true,
    timestamp: '2025-01-09 12:30:25',
  },
  {
    id: '2',
    roundId: '123455',
    dice: [5, 5, 5],
    total: 15,
    isBig: true,
    isSmall: false,
    isOdd: true,
    timestamp: '2025-01-09 12:25:18',
  },
  {
    id: '3',
    roundId: '123454',
    dice: [1, 2, 3],
    total: 6,
    isBig: false,
    isSmall: true,
    isOdd: false,
    timestamp: '2025-01-09 12:20:10',
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('my-bets');

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
        {/* 我的投注页 */}
        {activeTab === 'my-bets' && (
          <div className="space-y-3">
            {mockBets.map((bet) => (
              <div
                key={bet.id}
                className="bg-bg-dark border border-border rounded-xl p-4"
              >
                {/* 局号和时间 */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-mono text-text-secondary">
                    #{bet.roundId}
                  </span>
                  <span className="text-xs text-text-disabled">{bet.timestamp}</span>
                </div>

                {/* 投注内容 */}
                <div className="mb-3">
                  <p className="text-xs text-text-secondary mb-2">投注内容</p>
                  <div className="flex flex-wrap gap-2">
                    {bet.bets.map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-bg-medium rounded text-xs"
                      >
                        {b.type} {b.amount} USDT
                      </span>
                    ))}
                  </div>
                </div>

                {/* 开奖结果 */}
                <div className="mb-3 flex items-center gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">开奖结果</p>
                    <DiceDisplay values={bet.result} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">总点数</p>
                    <p className="text-2xl font-bold font-mono text-primary-gold">
                      {bet.total}
                    </p>
                  </div>
                </div>

                {/* 盈亏 */}
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-text-secondary">
                    {bet.status === 'win' ? '中奖金额' : bet.status === 'lose' ? '未中奖' : '等待中'}
                  </span>
                  {bet.status === 'win' && (
                    <span className="text-lg font-bold font-mono text-success">
                      +{bet.winAmount.toFixed(2)} USDT
                    </span>
                  )}
                  {bet.status === 'lose' && (
                    <span className="text-lg font-bold font-mono text-error">
                      -
                      {bet.bets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)} USDT
                    </span>
                  )}
                  {bet.status === 'pending' && (
                    <span className="text-sm text-warning">等待开奖</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 开奖历史页 */}
        {activeTab === 'results' && (
          <div className="space-y-2">
            {mockResults.map((result) => (
              <div
                key={result.id}
                className="bg-bg-dark border border-border rounded-xl p-4 flex items-center gap-4"
              >
                {/* 局号和时间 */}
                <div className="flex-1">
                  <p className="text-sm font-mono text-text-secondary mb-1">
                    #{result.roundId}
                  </p>
                  <p className="text-xs text-text-disabled">{result.timestamp}</p>
                </div>

                {/* 骰子结果 */}
                <div className="flex items-center gap-3">
                  <DiceDisplay values={result.dice} />
                  <div>
                    <p className="text-2xl font-bold font-mono text-primary-gold">
                      {result.total}
                    </p>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-col gap-1">
                  {result.isBig && (
                    <span className="px-2 py-0.5 bg-error text-white text-xs rounded">大</span>
                  )}
                  {result.isSmall && (
                    <span className="px-2 py-0.5 bg-info text-white text-xs rounded">小</span>
                  )}
                  {result.isOdd && (
                    <span className="px-2 py-0.5 bg-warning text-white text-xs rounded">单</span>
                  )}
                  {!result.isOdd && (
                    <span className="px-2 py-0.5 bg-success text-white text-xs rounded">双</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 走势分析页 */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* 大小走势 */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3">大小走势（近50局）</h3>
              <div className="bg-bg-dark rounded-xl p-4 border border-border">
                <div className="h-40 flex items-end justify-center gap-1">
                  {mockResults.map((result, idx) => (
                    <div
                      key={result.id}
                      className="flex-1 max-w-8 flex flex-col items-center"
                    >
                      <div
                        className={cn(
                          'w-full rounded-t transition-all',
                          result.isBig ? 'bg-error' : 'bg-info'
                        )}
                        style={{ height: `${(result.total / 18) * 100}%` }}
                      />
                      <span className="text-xs text-text-disabled mt-1">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 单双统计 */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3">单双统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                  <p className="text-sm text-text-secondary mb-2">单</p>
                  <p className="text-3xl font-bold text-warning mb-1">67%</p>
                  <p className="text-xs text-text-disabled">34局</p>
                </div>
                <div className="bg-bg-dark rounded-xl p-4 border border-border text-center">
                  <p className="text-sm text-text-secondary mb-2">双</p>
                  <p className="text-3xl font-bold text-success mb-1">33%</p>
                  <p className="text-xs text-text-disabled">16局</p>
                </div>
              </div>
            </div>

            {/* 热号冷号 */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3">热号冷号</h3>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const percentage = Math.floor(Math.random() * 30) + 10;
                  const isHot = percentage > 20;

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
