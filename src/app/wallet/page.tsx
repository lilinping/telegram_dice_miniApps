'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useTelegram } from '@/contexts/TelegramContext';
import BalanceCard from '@/components/wallet/BalanceCard';
import TransactionList from '@/components/wallet/TransactionList';
import RebateCard from '@/components/wallet/RebateCard';
import RebateHistory from '@/components/wallet/RebateHistory';

/**
 * 钱包页面
 *
 * 功能：
 * 1. 余额总览（可用余额、冻结余额、赠送余额）
 * 2. 充值/提现入口
 * 3. 交易记录列表（充值、提现、下注、中奖）
 */

export default function WalletPage() {
  const router = useRouter();
  const { balance, frozenBalance, bonusBalance, refreshBalance } = useWallet();
  const { user, isInitialized } = useTelegram();
  const [activeTab, setActiveTab] = useState<'transactions' | 'rebate'>('transactions');

  // 页面加载时刷新余额（确保用户已初始化）
  useEffect(() => {
    if (user && isInitialized) {
      console.log('💰 钱包页面加载，刷新余额...', { 
        userId: user.id, 
        currentBalance: balance,
        isInitialized 
      });
    refreshBalance();
    }
  }, [user, isInitialized, refreshBalance]);

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
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">钱包</h1>
        <div className="w-10" /> {/* 占位平衡布局 */}
      </header>

      {/* 余额卡片 */}
      <div className="p-5 space-y-4">
        <BalanceCard
          balance={balance}
          frozenBalance={frozenBalance}
          bonusBalance={bonusBalance}
          onRefresh={refreshBalance}
        />
        
        {/* 反水卡片 */}
        <RebateCard onRefresh={refreshBalance} />
      </div>

      {/* 操作按钮 */}
      <div className="px-5 pb-6 flex gap-4">
        {/* 充值按钮 */}
        <button
          onClick={() => router.push('/deposit')}
          className="flex-1 h-14 bg-success rounded-xl font-semibold text-white shadow-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">➕</span>
          <span className="text-lg">充值</span>
        </button>

        {/* 提现按钮 */}
        <button
          onClick={() => router.push('/withdraw')}
          className="flex-1 h-14 bg-warning rounded-xl font-semibold text-white shadow-lg hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">➖</span>
          <span className="text-lg">提现</span>
        </button>
      </div>

      {/* 交易记录 / 反水历史 */}
      <div className="px-5 pb-6">
        {/* 标签切换 */}
        <div className="flex gap-2 mb-4 bg-bg-medium rounded-xl p-1">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-bg-dark text-primary-gold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            交易记录
          </button>
          <button
            onClick={() => setActiveTab('rebate')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'rebate'
                ? 'bg-bg-dark text-purple-400 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            反水记录
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'transactions' ? (
        <TransactionList />
        ) : (
          <RebateHistory />
        )}
      </div>
    </div>
  );
}
