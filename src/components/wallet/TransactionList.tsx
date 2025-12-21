'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api';
import { getWithdrawalStatusText } from './WithdrawalHistory';
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
  status: 'success' | 'pending' | 'failed' | 'manual' | 'rejected';
  description: string;
  orderId?: string;
  timestamp: number;
  gameId?: string;
  originalStatus?: string; // 保存原始状态，用于详情展示
  // 提现相关字段
  toAddress?: string;
  txId?: string;
  fee?: string;
  actualAmount?: string;
  confirmTime?: number;
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
  manual: { label: '人工审核中', color: 'text-warning' },
  rejected: { label: '已驳回', color: 'text-error' },
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
              // 计算总下注金额（从 betInfo 数组中累加）
              const totalBet = game.betInfo?.reduce((sum, bet) => sum + parseFloat(bet.bet || '0'), 0) || 0;
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
                  timestamp: new Date(game.createTime).getTime(),
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
                  timestamp: new Date(game.createTime).getTime(),
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
              const money = parseFloat(order.money || '0');
              // 优先使用后端返回的 fee 字段（可能为 "0"），否则回退到默认 2.00
              const backendFeeNum = order.fee !== undefined && order.fee !== null ? parseFloat((order as any).fee as any) : NaN;
              const feeNum = Number.isFinite(backendFeeNum) ? backendFeeNum : 2.0;
              {
                const txCode = order.txCode;
                let statusKey: Transaction['status'] = 'pending';
                if (txCode === 0) statusKey = 'success';
                else if (txCode === -1) statusKey = 'pending';
                else if (txCode === -2) statusKey = 'manual';
                else if (txCode === 1) statusKey = 'failed';
                else if (txCode === -3) statusKey = 'rejected';

                allTransactions.push({
                  id: `withdraw-${order.id}`,
                  type: 'withdraw',
                  amount: -money,
                  status: statusKey,
                  description: '提现',
                  orderId: String(order.id),
                  timestamp: typeof order.createTime === 'string' ? new Date(order.createTime).getTime() : order.createTime,
                  // 提现详情字段
                  toAddress: order.toAddress,
                  txId: order.txId,
                  fee: feeNum.toFixed(2),
                  actualAmount: Math.max(0, money - feeNum).toFixed(2),
                  confirmTime: order.modifyTime,
                  originalStatus: getWithdrawalStatusText(txCode),
                });
              }
            });
          }
        } catch (err) {
          console.error('获取提现历史失败:', err);
        }
      }

      // 3. 充值记录
      if (activeFilter === 'all' || activeFilter === 'deposit') {
        try {
          const depositHistory = await apiService.getDepositHistory(String(user.id), 1, 20);
          console.log('充值历史响应:', depositHistory);
          
          if (depositHistory.success && depositHistory.data) {
            console.log('充值订单列表:', depositHistory.data.list);
            
            depositHistory.data.list.forEach((order) => {
              console.log('处理充值订单:', order);
              
              // 状态映射：根据后端返回的中文状态映射到前端状态
              // 默认为 pending（待处理），只有明确的成功状态才显示为 success
              let status: 'success' | 'pending' | 'failed' = 'pending';
              let description = '充值';
              
              if (order.state === '成功' || order.state === 'SUCCESS') {
                status = 'success';
                description = '充值';
              } else if (order.state === '超时' || order.state === 'TIMEOUT' || order.state === '失败' || order.state === 'FAILED') {
                status = 'failed';
                description = order.state === '超时' ? '充值（超时）' : '充值（失败）';
              } else if (order.state === '未完成' || order.state === '等待' || order.state === 'WAIT' || order.state === 'PENDING') {
                status = 'pending';
                description = '充值（处理中）';
              } else {
                // 其他未知状态，默认为待处理
                status = 'pending';
                description = `充值（${order.state}）`;
              }
              
              const transaction = {
                id: `deposit-${order.orderId}`,
                type: 'deposit' as const,
                amount: parseFloat(order.money),
                status: status,
                description: description,
                orderId: order.orderId,
                timestamp: typeof order.createTime === 'string' ? new Date(order.createTime).getTime() : order.createTime,
                originalStatus: order.state, // 保存原始状态
              };
              console.log('添加充值交易:', transaction, '原始状态:', order.state, '映射状态:', status);
              allTransactions.push(transaction);
            });
          }
        } catch (err) {
          console.error('获取充值历史失败:', err);
        }
      }

      // 按时间倒序排序
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);

      console.log('最终交易列表:', allTransactions);
      console.log('交易数量:', allTransactions.length);
      
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

            // 根据状态选择图标（充值和提现需要根据状态显示不同颜色）
            let displayIcon = config.icon;
            if (tx.type === 'deposit' || tx.type === 'withdraw') {
              if (tx.status === 'success') {
                displayIcon = '🟢'; // 成功 - 绿色
              } else if (tx.status === 'pending') {
                displayIcon = '🟡'; // 处理中 - 黄色
              } else if (tx.status === 'failed') {
                displayIcon = '🔴'; // 失败 - 红色
              }
            }

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
                    <span className="text-2xl flex-shrink-0">{displayIcon}</span>

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
                    {/* 充值和提现：只有成功状态才显示金额变化，否则显示订单金额但不带正负号 */}
                    {(tx.type === 'deposit' || tx.type === 'withdraw') && tx.status !== 'success' ? (
                      <p className="text-lg font-bold font-mono text-text-secondary">
                        {Math.abs(tx.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    ) : (
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
                    )}
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
                      <span className={statusInfo.color}>
                        {tx.originalStatus || statusInfo.label}
                      </span>
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
                    {/* 提现特有字段 */}
                    {tx.type === 'withdraw' && (
                      <>
                        {tx.fee && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">手续费</span>
                            <span className="text-text-primary font-mono">
                              {tx.fee} USDT
                            </span>
                          </div>
                        )}
                        {tx.actualAmount && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">实际到账</span>
                            <span className="text-primary-gold font-mono font-semibold">
                              {tx.actualAmount} USDT
                            </span>
                          </div>
                        )}
                        {tx.toAddress && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">提币地址</span>
                            <span className="text-text-primary font-mono text-xs">
                              {tx.toAddress.length > 20 
                                ? `${tx.toAddress.slice(0, 10)}...${tx.toAddress.slice(-6)}`
                                : tx.toAddress}
                            </span>
                          </div>
                        )}
                        {tx.txId && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">交易ID</span>
                            <span className="text-text-primary font-mono text-xs break-all">
                              {tx.txId}
                            </span>
                          </div>
                        )}
                        {tx.confirmTime && tx.confirmTime !== tx.timestamp && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">确认时间</span>
                            <span className="text-text-primary">
                              {formatTime(tx.confirmTime)}
                            </span>
                          </div>
                        )}
                      </>
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
