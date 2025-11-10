'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 交易记录列表组件
 *
 * 功能：
 * 1. 显示充值、提现、下注、中奖记录
 * 2. 筛选功能（全部/充值/提现/下注/中奖）
 * 3. 分页加载
 * 4. 下拉刷新
 */

type TransactionType = 'all' | 'deposit' | 'withdraw' | 'bet' | 'win';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  description: string;
  orderId?: string;
  timestamp: string;
}

// 模拟交易数据
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 100,
    status: 'success',
    description: '充值',
    orderId: 'ORD202501090001',
    timestamp: '2025-01-09 12:30:25',
  },
  {
    id: '2',
    type: 'bet',
    amount: -50,
    status: 'success',
    description: '下注-局号#123456',
    timestamp: '2025-01-09 12:25:18',
  },
  {
    id: '3',
    type: 'win',
    amount: 125,
    status: 'success',
    description: '中奖-局号#123455',
    timestamp: '2025-01-09 12:23:45',
  },
  {
    id: '4',
    type: 'withdraw',
    amount: -200,
    status: 'pending',
    description: '提现',
    orderId: 'WTH202501090001',
    timestamp: '2025-01-09 10:15:32',
  },
  {
    id: '5',
    type: 'deposit',
    amount: 500,
    status: 'success',
    description: '充值',
    orderId: 'ORD202501080001',
    timestamp: '2025-01-08 18:20:10',
  },
];

const filterTabs: { key: TransactionType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'deposit', label: '充值' },
  { key: 'withdraw', label: '提现' },
  { key: 'bet', label: '下注' },
  { key: 'win', label: '中奖' },
];

const typeConfig = {
  deposit: { icon: '🟢', label: '充值', color: 'text-success' },
  withdraw: { icon: '🟠', label: '提现', color: 'text-warning' },
  bet: { icon: '🔵', label: '下注', color: 'text-info' },
  win: { icon: '🟡', label: '中奖', color: 'text-primary-gold' },
};

const statusConfig = {
  success: { label: '成功', color: 'text-success' },
  pending: { label: '处理中', color: 'text-warning' },
  failed: { label: '失败', color: 'text-error' },
};

export default function TransactionList() {
  const [activeFilter, setActiveFilter] = useState<TransactionType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 筛选交易记录
  const filteredTransactions = mockTransactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    return tx.type === activeFilter;
  });

  // 切换展开/折叠
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {/* 筛选标签栏 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              activeFilter === tab.key
                ? 'bg-primary-gold text-bg-darkest'
                : 'bg-bg-medium text-text-secondary hover:bg-bg-medium/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 交易列表 */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-4xl mb-2 block">📭</span>
            <p className="text-text-secondary">暂无交易记录</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const config = typeConfig[tx.type];
            const statusInfo = statusConfig[tx.status];
            const isExpanded = expandedId === tx.id;
            const isPositive = tx.amount > 0;

            return (
              <button
                key={tx.id}
                onClick={() => toggleExpand(tx.id)}
                className="w-full bg-bg-dark border border-border rounded-xl p-4 hover:border-primary-gold/30 transition-all text-left"
              >
                {/* 主要信息 */}
                <div className="flex items-start justify-between gap-3">
                  {/* 左侧：图标 + 类型 + 描述 */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* 图标 */}
                    <span className="text-2xl flex-shrink-0">{config.icon}</span>

                    {/* 类型和描述 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-text-primary">
                        {config.label}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        {tx.description}
                      </p>
                      {tx.orderId && (
                        <p className="text-xs text-text-disabled mt-1">
                          订单号: {tx.orderId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 右侧：金额 + 时间 */}
                  <div className="flex-shrink-0 text-right">
                    <p
                      className={cn(
                        'text-lg font-bold font-mono',
                        isPositive ? 'text-success' : 'text-error'
                      )}
                    >
                      {isPositive ? '+' : ''}
                      {tx.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {tx.timestamp.split(' ')[1]}
                    </p>
                  </div>
                </div>

                {/* 展开的详细信息 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2 animate-slide-down">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">状态</span>
                      <span className={statusInfo.color}>{statusInfo.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">时间</span>
                      <span className="text-text-primary">{tx.timestamp}</span>
                    </div>
                    {tx.orderId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">订单号</span>
                        <span className="text-text-primary font-mono text-xs">
                          {tx.orderId}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 展开指示器 */}
                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      'text-xs text-text-disabled transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  >
                    ▼
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 加载更多 */}
      {filteredTransactions.length > 0 && (
        <button className="w-full py-3 text-sm text-text-secondary hover:text-primary-gold transition-colors">
          加载更多
        </button>
      )}
    </div>
  );
}
