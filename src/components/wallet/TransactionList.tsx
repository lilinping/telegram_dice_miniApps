'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api';
import { useTelegram } from '@/contexts/TelegramContext';

/**
 * 交易记录列表组件
 *
 * 功能：
 * 1. 显示充值、提现、下注、中奖记录
 * 2. 筛选功能（全部/充值/提现/下注/中奖）
 * 3. 分页加载
 * 4. 实时数据获取
 */

type TransactionType = 'all' | 'deposit' | 'withdraw' | 'bet' | 'win';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  description: string;
  orderId?: string;
  timestamp: number;
  gameId?: string;
}

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
  const { user } = useTelegram();
  const [activeFilter, setActiveFilter] = useState<TransactionType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const lastFetchKeyRef = useRef('');

  // 加载交易记录
  const loadTransactions = async () => {
    if (!user) return;

    const fetchKey = `${user.id}-${activeFilter}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    setLoading(true);
    setError('');

    try {
      const allTransactions: Transaction[] = [];

      // 1. 获取游戏历史（下注和中奖）
      if (activeFilter === 'all' || activeFilter === 'bet' || activeFilter === 'win') {
        try {
          const gameHistory = await apiService.getGameHistory(String(user.id), 1, 20);
          if (gameHistory.success && gameHistory.data) {
            gameHistory.data.list.forEach((game) => {
              const totalBet = parseFloat(game.totalBet);
              const winAmount = parseFloat(game.win);

              // 添加下注记录
              if (totalBet > 0 && (activeFilter === 'all' || activeFilter === 'bet')) {
                allTransactions.push({
                  id: `bet-${game.id}`,
                  type: 'bet',
                  amount: -totalBet,
                  status: 'success',
                  description: `下注-局号#${game.id}`,
                  gameId: game.gameId,
                  timestamp: game.createTime,
                });
              }

              // 添加中奖记录
              if (winAmount > 0 && (activeFilter === 'all' || activeFilter === 'win')) {
                allTransactions.push({
                  id: `win-${game.id}`,
                  type: 'win',
                  amount: winAmount,
                  status: 'success',
                  description: `中奖-局号#${game.id}`,
                  gameId: game.gameId,
                  timestamp: game.modifyTime || game.createTime,
                });
              }
            });
          }
        } catch (err) {
          console.error('获取游戏历史失败:', err);
        }
      }

      // 2. 获取提现历史
      if (activeFilter === 'all' || activeFilter === 'withdraw') {
        try {
          const withdrawHistory = await apiService.getWithdrawalOrders(String(user.id), 1, 20);
          if (withdrawHistory.success && withdrawHistory.data) {
            withdrawHistory.data.list.forEach((order) => {
              allTransactions.push({
                id: `withdraw-${order.id}`,
                type: 'withdraw',
                amount: -parseFloat(order.money),
                status: order.txCode === 0 ? 'success' : order.txCode === -1 ? 'pending' : 'failed',
                description: '提现',
                orderId: `WTH${order.id}`,
                timestamp: order.createTime,
              });
            });
          }
        } catch (err) {
          console.error('获取提现历史失败:', err);
        }
      }

      // 3. 充值记录
      // 注意：后端暂时没有提供充值历史列表接口
      // 只有单个订单查询接口 /order/query/{userId}/{orderNo}
      // 如果需要显示充值记录，需要后端添加类似 /order/list/{userId}/{pageIndex}/{pageSize} 的接口
      if (activeFilter === 'all' || activeFilter === 'deposit') {
        // TODO: 等待后端提供充值订单列表接口
        // 目前无法获取充值历史记录
      }

      // 按时间倒序排序
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(allTransactions);
    } catch (err) {
      console.error('加载交易记录失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选变化时重新加载
  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeFilter]);

  // 筛选交易记录
  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    return tx.type === activeFilter;
  });

  // 切换展开/折叠
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  // 格式化时间（仅显示时分秒）
  const formatTimeShort = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
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

      {/* 错误提示 */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-error flex-1">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-error hover:text-error/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading && transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
          <p className="mt-4 text-sm text-text-secondary">加载中...</p>
        </div>
      )}

      {/* 交易列表 */}
      <div className="space-y-2">
        {!loading && filteredTransactions.length === 0 && !error ? (
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
                      {Math.abs(tx.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatTimeShort(tx.timestamp)}
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
                      <span className="text-text-primary">{formatTime(tx.timestamp)}</span>
                    </div>
                    {tx.gameId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">游戏ID</span>
                        <span className="text-text-primary font-mono text-xs">
                          {tx.gameId}
                        </span>
                      </div>
                    )}
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

      {/* 刷新按钮 */}
      {filteredTransactions.length > 0 && !loading && (
        <button 
          onClick={loadTransactions}
          className="w-full py-3 text-sm text-text-secondary hover:text-primary-gold transition-colors"
        >
          🔄 刷新
        </button>
      )}
    </div>
  );
}
