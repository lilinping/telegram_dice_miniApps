'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 余额卡片组件
 *
 * 显示：
 * 1. 总余额（大字显示）
 * 2. 可用余额
 * 3. 冻结余额
 * 4. 赠送余额
 */

interface BalanceCardProps {
  balance: number;
  frozenBalance: number;
  bonusBalance: number;
  onRefresh?: () => void;
}

export default function BalanceCard({
  balance,
  frozenBalance,
  bonusBalance,
  onRefresh,
}: BalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // 计算总余额
  const totalBalance = balance + bonusBalance;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-dark-gold/20 via-bg-dark to-bg-dark" />

      {/* 金色边框 */}
      <div className="absolute inset-0 rounded-2xl border-2 border-primary-gold/30" />

      {/* 内容 */}
      <div className="relative p-6">
        {/* 顶部：标签 + 刷新按钮 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span>总余额</span>
          </span>

          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'w-8 h-8 rounded-full bg-bg-medium/50 backdrop-blur-sm flex items-center justify-center text-primary-gold hover:bg-bg-medium transition-all',
              isRefreshing && 'animate-spin'
            )}
          >
            <span className="text-sm">🔄</span>
          </button>
        </div>

        {/* 余额数字 */}
        <div className="mb-6">
          <p className="text-5xl font-bold font-mono text-primary-gold leading-none">
            {totalBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-base text-text-secondary mt-2">USDT</p>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-border my-4" />

        {/* 余额明细 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 可用余额 */}
          <div>
            <p className="text-xs text-text-secondary mb-1">可用</p>
            <p className="text-base font-semibold font-mono text-success">
              {balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* 冻结余额 */}
          <div>
            <p className="text-xs text-text-secondary mb-1">冻结</p>
            <p className="text-base font-semibold font-mono text-warning">
              {frozenBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* 赠送余额 */}
          <div>
            <p className="text-xs text-text-secondary mb-1">赠送</p>
            <p className="text-base font-semibold font-mono text-info">
              {bonusBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* 金色光晕效果 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-gold/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
