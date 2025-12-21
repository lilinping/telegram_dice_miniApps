'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useTelegram } from '@/contexts/TelegramContext';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

/**
 * 反水卡片组件
 * 
 * 显示：
 * 1. 当前反水额度
 * 2. 当前流水
 * 3. 刷新按钮
 * 4. 领取反水按钮（当有反水余额时）
 */

interface RebateCardProps {
  onRefresh?: () => void;
}

export default function RebateCard({ onRefresh }: RebateCardProps) {
  const { user } = useTelegram();
  const { refreshBalance } = useWallet();
  const [rebateAmount, setRebateAmount] = useState<string>('0.00');
  const [turnover, setTurnover] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // 加载反水数据（只查询反水额度，不执行任何操作）
  const loadRebateData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 只查询反水额度，不调用 /account/rebate/money/{userId}（那是执行操作的接口）
      console.log('📊 加载反水数据（仅查询）...');
      const amountResponse = await apiService.queryRebateAmount(String(user.id));

      if (amountResponse.success && amountResponse.data) {
        // API返回的字段是 rebate，不是 amount
        const rebateValue = amountResponse.data.rebate || '0.00';
        console.log('📊 反水额度数据:', amountResponse.data, '解析值:', rebateValue);
        setRebateAmount(rebateValue);
      }
      
      // 注意：流水信息可能需要从其他地方获取，或者通过反水额度接口返回
      // 暂时不查询流水，避免误触发反水操作
      
      console.log('✅ 反水数据加载完成（仅查询，未执行操作）');
    } catch (error) {
      console.error('❌ 加载反水数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    await loadRebateData();
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // 执行反水操作（点击按钮时调用）
  const handleConvertTurnover = async () => {
    if (!user || isConverting) return;
    // 前端校验：流水须>=100 才能转换
    const availableTurnover = parseFloat(rebateAmount) || 0;
    if (availableTurnover < 100) {
      toast.warning('流水额度不足 100 USDT，无法转换');
      return;
    }

    // 确认操作（防止误触）
    console.log('🔄 用户手动点击：执行反水操作');

    setIsConverting(true);
    try {
      const response = await apiService.convertTurnoverToRebate(String(user.id));

      if (response.success) {
        toast.success('反水操作成功');
        // 刷新反水数据和余额
        await Promise.all([loadRebateData(), refreshBalance()]);
        onRefresh?.();
      } else {
        toast.error(response.message || '反水操作失败');
      }
    } catch (error) {
      console.error('❌ 反水操作失败:', error);
      toast.error('反水操作失败，请稍后重试');
    } finally {
      setIsConverting(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    if (user) {
      loadRebateData();
    }
  }, [user]);

  const rebateAmountNum = parseFloat(rebateAmount) || 0;
  const turnoverNum = parseFloat(turnover) || 0;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-dark-gold/20 via-bg-dark to-bg-dark" />

      {/* 紫色边框（区别于余额卡片） */}
      <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/30" />

      {/* 内容 */}
      <div className="relative p-6">
        {/* 顶部：标签 + 刷新按钮 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary flex items-center gap-2">
            <span className="text-xl">💎</span>
            <span>流水金额</span>
          </span>

          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className={cn(
              'w-8 h-8 rounded-full bg-bg-medium/50 backdrop-blur-sm flex items-center justify-center text-purple-400 hover:bg-bg-medium transition-all',
              isRefreshing && 'animate-spin'
            )}
          >
            <span className="text-sm">🔄</span>
          </button>
        </div>

        {/* 反水额度数字 */}
        <div className="mb-6">
          <p className="text-5xl font-bold font-mono text-purple-400 leading-none">
            {rebateAmountNum.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-base text-text-secondary mt-2">USDT</p>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-border my-4" />

        {/* 操作按钮 */}
        <div className="space-y-4">
          {/* 执行反水按钮（禁用态显示并提示最低流水） */}
          {(() => {
            const canConvert = !isConverting && !isLoading && rebateAmountNum >= 100;
            return (
              <>
                <button
                  onClick={handleConvertTurnover}
                  disabled={!canConvert}
                  className={cn(
                    'w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2',
                    rebateAmountNum >= 100
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                      : 'bg-bg-medium text-text-secondary cursor-not-allowed',
                    'active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed',
                    isConverting && 'animate-pulse'
                  )}
                >
                  {isConverting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>反水中...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">💎</span>
                      <span>点击反水</span>
                    </>
                  )}
                </button>

                {/* 最低流水提示 */}
                {rebateAmountNum < 100 && (
                  <p className="mt-2 text-xs text-text-secondary text-center">
                    最低流水 <span className="font-semibold">100 USDT</span> 才能转换为反水
                  </p>
                )}
              </>
            );
          })()}

          {/* 提示信息 */}
          {rebateAmountNum === 0 && (
            <div className="text-center py-2">
              <p className="text-xs text-text-secondary">
                当前反水余额：{rebateAmountNum.toFixed(2)} USDT
              </p>
            </div>
          )}
        </div>

        {/* 紫色光晕效果 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}

