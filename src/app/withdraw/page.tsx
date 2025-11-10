'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

/**
 * 提现页面
 *
 * 功能：
 * 1. 提现金额输入
 * 2. 提现地址管理（加密货币钱包地址）
 * 3. 身份验证（KYC，大额提现）
 * 4. 手续费与到账时间说明
 * 5. 提现记录查询
 */

interface WalletAddress {
  id: string;
  label: string;
  address: string;
  network: string;
}

const mockAddresses: WalletAddress[] = [
  {
    id: '1',
    label: '我的Trust Wallet',
    address: 'TXs7n4kL9mP2qR8tV3wY5zB6cD7eF8gH9jK3Lm',
    network: 'TRC20',
  },
];

export default function WithdrawPage() {
  const router = useRouter();
  const { balance } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 计算手续费和实际到账
  const withdrawAmount = parseFloat(amount) || 0;
  const fee = withdrawAmount >= 1000 ? withdrawAmount * 0.02 : 5;
  const actualAmount = withdrawAmount - fee;

  // 处理全部提现
  const handleWithdrawAll = () => {
    setAmount(balance.toString());
  };

  // 处理提现确认
  const handleConfirm = () => {
    if (withdrawAmount < 50) {
      // TODO: 显示最小提现金额提示
      return;
    }

    if (withdrawAmount > balance) {
      // TODO: 显示余额不足提示
      return;
    }

    if (!selectedAddress) {
      // TODO: 显示请选择地址提示
      return;
    }

    setShowConfirm(true);
  };

  // 处理提现提交
  const handleSubmit = () => {
    // TODO: 提交提现请求
    setShowConfirm(false);
    router.push('/wallet');
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
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">提现</h1>
        <div className="w-10" />
      </header>

      <div className="p-5 space-y-6">
        {/* 可提现余额 */}
        <div className="bg-bg-dark rounded-xl p-4 border border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">可提现余额</span>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-primary-gold">
                {balance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-text-secondary mt-1">USDT</p>
            </div>
          </div>
        </div>

        {/* 提现金额 */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">提现金额</h2>

          <div className="relative mb-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入提现金额"
              className="w-full h-12 bg-bg-medium border-2 border-border rounded-lg px-4 pr-24 text-base text-text-primary placeholder:text-text-disabled focus:border-primary-gold focus:outline-none focus:ring-2 focus:ring-primary-gold/20 transition-all"
              min="50"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
              USDT
            </span>
          </div>

          {/* 全部提现按钮 */}
          <button
            onClick={handleWithdrawAll}
            className="text-sm text-primary-gold hover:text-primary-light-gold transition-colors"
          >
            全部提现
          </button>

          <p className="mt-2 text-xs text-text-secondary">
            最小提现金额: 50 USDT
          </p>
        </section>

        {/* 提现地址 */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">提现地址</h2>

          <div className="space-y-2 mb-3">
            {mockAddresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr.id)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all text-left',
                  selectedAddress === addr.id
                    ? 'bg-primary-gold/10 border-primary-gold'
                    : 'bg-bg-dark border-border hover:border-primary-gold/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* 单选按钮 */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                      selectedAddress === addr.id
                        ? 'border-primary-gold bg-primary-gold'
                        : 'border-border'
                    )}
                  >
                    {selectedAddress === addr.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-bg-darkest" />
                    )}
                  </div>

                  {/* 地址信息 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-text-primary">
                      {addr.label}
                    </p>
                    <p className="text-xs font-mono text-text-secondary truncate">
                      {addr.address}
                    </p>
                    <p className="text-xs text-text-disabled mt-1">
                      网络: {addr.network}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 添加新地址按钮 */}
          <button
            onClick={() => setShowAddAddress(true)}
            className="w-full py-3 border-2 border-dashed border-primary-gold/30 text-primary-gold rounded-lg hover:bg-primary-gold/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">➕</span>
            <span>添加新地址</span>
          </button>
        </section>

        {/* 手续费说明 */}
        <section className="bg-bg-dark rounded-xl p-4 border border-border space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">提现金额</span>
            <span className="text-sm font-mono text-text-primary">
              {withdrawAmount.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">手续费</span>
            <span className="text-sm font-mono text-error">
              -{fee.toFixed(2)} USDT
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-text-primary">实际到账</span>
            <span className="text-base font-mono font-bold text-primary-gold">
              {actualAmount > 0 ? actualAmount.toFixed(2) : '0.00'} USDT
            </span>
          </div>
        </section>

        {/* 提现规则 */}
        <section className="bg-info/10 border border-info/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-info">提现规则</p>
              <p className="text-xs text-text-secondary">• 最小提现金额: 50 USDT</p>
              <p className="text-xs text-text-secondary">• 小额（&lt;1000）手续费: 5 USDT</p>
              <p className="text-xs text-text-secondary">• 大额（≥1000）手续费: 2%</p>
              <p className="text-xs text-text-secondary">• 小额自动审核，2小时内到账</p>
              <p className="text-xs text-text-secondary">• 大额人工审核，24小时内到账</p>
              <p className="text-xs text-text-secondary">• 每日提现限额: 3次</p>
            </div>
          </div>
        </section>

        {/* 提现按钮 */}
        <button
          onClick={handleConfirm}
          disabled={withdrawAmount < 50 || withdrawAmount > balance || !selectedAddress}
          className="w-full h-14 bg-gradient-to-r from-warning to-orange-600 text-white text-lg font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          确认提现
        </button>
      </div>

      {/* 确认提现弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-bg-dark border-2 border-primary-gold rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary-gold mb-6">确认提现</h3>

              {/* 提现信息汇总 */}
              <div className="bg-bg-darkest rounded-xl p-4 mb-6 space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">提现金额</span>
                  <span className="text-sm font-mono text-text-primary">
                    {withdrawAmount.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">手续费</span>
                  <span className="text-sm font-mono text-error">
                    -{fee.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">实际到账</span>
                  <span className="text-base font-mono font-bold text-primary-gold">
                    {actualAmount.toFixed(2)} USDT
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-sm text-text-secondary mb-1">提现地址</p>
                  <p className="text-xs font-mono text-text-primary break-all">
                    {mockAddresses.find((a) => a.id === selectedAddress)?.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">到账时间</p>
                  <p className="text-xs text-text-primary">
                    {withdrawAmount >= 1000 ? '24小时内' : '2小时内'}
                  </p>
                </div>
              </div>

              {/* 警告提示 */}
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-warning">
                  ⚠️ 请仔细核对提现地址，转账后无法撤回
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-bg-medium text-text-primary rounded-lg hover:bg-bg-medium/80 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-warning to-orange-600 text-white rounded-lg hover:opacity-90 transition-all font-semibold"
                >
                  确认提现
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
