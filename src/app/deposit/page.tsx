'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * 充值页面
 *
 * 功能：
 * 1. 充值金额选择（快捷金额+自定义）
 * 2. 支付方式选择（USDT TRC20/ERC20, TON）
 * 3. 支付流程引导与状态追踪
 * 4. 充值优惠活动展示
 */

const quickAmounts = [10, 50, 100, 500, 1000];

const paymentMethods = [
  { id: 'usdt-trc20', name: 'USDT (TRC20)', recommended: true, fee: 0, icon: '💵' },
  { id: 'usdt-erc20', name: 'USDT (ERC20)', recommended: false, fee: 0, icon: '💵' },
  { id: 'ton', name: 'TON', recommended: false, fee: 0, icon: '💎' },
];

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('usdt-trc20');
  const [showQR, setShowQR] = useState(false);

  // 处理快捷金额选择
  const handleQuickAmount = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  // 处理自定义金额输入
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  // 处理充值确认
  const handleDeposit = () => {
    if (amount < 10) {
      // TODO: 显示最小充值金额提示
      return;
    }
    setShowQR(true);
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
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">充值</h1>
        <div className="w-10" />
      </header>

      <div className="p-5 space-y-6">
        {/* 步骤1：选择金额 */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">选择充值金额</h2>

          {/* 快捷金额按钮 */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => handleQuickAmount(value)}
                className={cn(
                  'h-14 rounded-lg text-base font-semibold transition-all',
                  amount === value && !customAmount
                    ? 'bg-gradient-to-br from-primary-gold to-primary-dark-gold text-bg-darkest scale-105'
                    : 'bg-bg-medium text-text-primary border-2 border-border hover:border-primary-gold/50'
                )}
              >
                {value >= 1000 ? `${value / 1000}K` : value}
              </button>
            ))}
          </div>

          {/* 自定义金额输入 */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">自定义金额</label>
            <div className="relative">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="输入充值金额"
                className="w-full h-12 bg-bg-medium border-2 border-border rounded-lg px-4 pr-16 text-base text-text-primary placeholder:text-text-disabled focus:border-primary-gold focus:outline-none focus:ring-2 focus:ring-primary-gold/20 transition-all"
                min="10"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                USDT
              </span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              最小充值金额: 10 USDT
            </p>
          </div>
        </section>

        {/* 步骤2：选择支付方式 */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">选择支付方式</h2>

          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all text-left',
                  selectedMethod === method.id
                    ? 'bg-primary-gold/10 border-primary-gold'
                    : 'bg-bg-dark border-border hover:border-primary-gold/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 单选按钮 */}
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedMethod === method.id
                          ? 'border-primary-gold bg-primary-gold'
                          : 'border-border'
                      )}
                    >
                      {selectedMethod === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-bg-darkest" />
                      )}
                    </div>

                    {/* 图标和名称 */}
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="text-base font-semibold text-text-primary">
                        {method.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        手续费: {method.fee === 0 ? '免费' : `${method.fee} USDT`}
                      </p>
                    </div>
                  </div>

                  {/* 推荐标签 */}
                  {method.recommended && (
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">
                      推荐
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 优惠活动 */}
        <section className="bg-gradient-to-r from-primary-darkest/30 to-transparent border border-primary-gold/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-gold mb-1">充值优惠</p>
              <p className="text-xs text-text-secondary">• 首充送20%奖励</p>
              <p className="text-xs text-text-secondary">• 充值≥500送50 USDT</p>
            </div>
          </div>
        </section>

        {/* 预计到账 */}
        <section className="bg-bg-dark rounded-xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">充值金额</span>
            <span className="text-base font-mono font-semibold text-text-primary">
              {amount.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">手续费</span>
            <span className="text-base font-mono font-semibold text-success">
              0.00 USDT
            </span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-text-primary">预计到账</span>
            <span className="text-lg font-mono font-bold text-primary-gold">
              {amount.toFixed(2)} USDT
            </span>
          </div>
        </section>

        {/* 确认充值按钮 */}
        <button
          onClick={handleDeposit}
          disabled={amount < 10}
          className="w-full h-14 bg-gradient-to-r from-primary-gold to-primary-dark-gold text-bg-darkest text-lg font-bold rounded-xl shadow-gold hover:shadow-gold-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          确认充值
        </button>
      </div>

      {/* 支付信息弹窗 */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-bg-dark border-2 border-primary-gold rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary-gold mb-4">充值信息</h3>

              {/* 二维码（模拟） */}
              <div className="w-52 h-52 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl mb-2">📱</p>
                  <p className="text-xs text-gray-600">扫描二维码</p>
                </div>
              </div>

              {/* 充值地址 */}
              <div className="mb-4">
                <p className="text-sm text-text-secondary mb-2">充值地址</p>
                <div className="bg-bg-darkest rounded-lg p-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-text-primary truncate">
                    TXs7n4kL9mP2qR8tV3wY5zB6cD7eF8gH9jK3Lm
                  </p>
                  <button className="flex-shrink-0 px-3 py-1 bg-primary-gold text-bg-darkest text-xs rounded-lg">
                    复制
                  </button>
                </div>
              </div>

              {/* 充值金额 */}
              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-2">充值金额</p>
                <div className="bg-bg-darkest rounded-lg p-3 flex items-center justify-between gap-2">
                  <p className="text-lg font-mono font-bold text-primary-gold">
                    {amount.toFixed(2)} USDT
                  </p>
                  <button className="flex-shrink-0 px-3 py-1 bg-primary-gold text-bg-darkest text-xs rounded-lg">
                    复制
                  </button>
                </div>
              </div>

              {/* 等待确认 */}
              <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="animate-spin">⏳</span>
                  <span className="text-sm font-semibold text-warning">等待区块链确认...</span>
                </div>
                <p className="text-xs text-text-secondary">预计5-10分钟到账</p>
              </div>

              {/* 温馨提示 */}
              <div className="text-left mb-6 space-y-1">
                <p className="text-xs text-text-secondary">温馨提示：</p>
                <p className="text-xs text-text-secondary">• 请勿向此地址转账其他币种</p>
                <p className="text-xs text-text-secondary">• 最小充值金额10 USDT</p>
                <p className="text-xs text-text-secondary">• 到账后将自动刷新余额</p>
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={() => {
                  setShowQR(false);
                  router.push('/wallet');
                }}
                className="w-full py-3 bg-bg-medium text-text-primary rounded-lg hover:bg-bg-medium/80 transition-colors"
              >
                我已完成转账
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
