'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { motion } from 'framer-motion';

// VIP等级配置
interface VIPLevel {
  level: number;
  name: string;
  icon: string;
  color: string;
  requiredAmount: number;
  benefits: {
    withdrawFee: string;
    betLimit: string;
    dailyBonus: string;
    support: string;
    birthday: string;
    other: string;
  };
}

export default function VIPPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // 当前用户数据
  const userData = {
    currentLevel: 3, // 黄金VIP
    totalDeposit: 5888.88, // 累计充值金额
    nextLevelAmount: 10000, // 升级到下一级所需金额
  };

  // VIP等级配置
  const vipLevels: VIPLevel[] = [
    {
      level: 0,
      name: '普通',
      icon: '⚪',
      color: '#808080',
      requiredAmount: 0,
      benefits: {
        withdrawFee: '2%',
        betLimit: '10,000 USDT',
        dailyBonus: '10 USDT',
        support: '普通客服',
        birthday: '无',
        other: '基础权益',
      },
    },
    {
      level: 1,
      name: '青铜',
      icon: '🥉',
      color: '#CD7F32',
      requiredAmount: 1000,
      benefits: {
        withdrawFee: '1.5%',
        betLimit: '20,000 USDT',
        dailyBonus: '20 USDT',
        support: '优先客服',
        birthday: '50 USDT',
        other: '周返水0.5%',
      },
    },
    {
      level: 2,
      name: '白银',
      icon: '🥈',
      color: '#C0C0C0',
      requiredAmount: 3000,
      benefits: {
        withdrawFee: '1%',
        betLimit: '50,000 USDT',
        dailyBonus: '50 USDT',
        support: '专属客服',
        birthday: '100 USDT',
        other: '周返水1%',
      },
    },
    {
      level: 3,
      name: '黄金',
      icon: '🥇',
      color: '#FFD700',
      requiredAmount: 5000,
      benefits: {
        withdrawFee: '0.8%',
        betLimit: '100,000 USDT',
        dailyBonus: '100 USDT',
        support: '专属经理',
        birthday: '200 USDT',
        other: '周返水1.5%',
      },
    },
    {
      level: 4,
      name: '铂金',
      icon: '💎',
      color: '#E5E4E2',
      requiredAmount: 10000,
      benefits: {
        withdrawFee: '0.5%',
        betLimit: '200,000 USDT',
        dailyBonus: '200 USDT',
        support: '专属经理24/7',
        birthday: '500 USDT',
        other: '周返水2%',
      },
    },
    {
      level: 5,
      name: '钻石',
      icon: '💠',
      color: '#B9F2FF',
      requiredAmount: 50000,
      benefits: {
        withdrawFee: '0%',
        betLimit: '无限制',
        dailyBonus: '500 USDT',
        support: '专属团队',
        birthday: '1,000 USDT',
        other: '周返水3%',
      },
    },
  ];

  const currentVip = vipLevels[userData.currentLevel];
  const nextVip = vipLevels[userData.currentLevel + 1] || null;
  const progress = nextVip
    ? ((userData.totalDeposit - currentVip.requiredAmount) /
        (nextVip.requiredAmount - currentVip.requiredAmount)) *
      100
    : 100;

  // 处理升级按钮点击
  const handleUpgrade = () => {
    router.push('/deposit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] pb-20">
      {/* 顶部导航 */}
      <TopBar title="VIP中心" showBack />

      {/* 当前等级卡片 */}
      <div className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2A1010] to-[#1A1A1A] rounded-2xl p-6 border-2 shadow-[0_8px_24px_rgba(255,215,0,0.3)]"
          style={{ borderColor: currentVip.color }}
        >
          {/* 等级图标和名称 */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{currentVip.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentVip.name} VIP
            </h2>
            <div className="text-sm text-[#A0A0A0]">
              累计充值：
              <span className="text-[#FFD700] font-mono font-semibold">
                {userData.totalDeposit.toLocaleString()} USDT
              </span>
            </div>
          </div>

          {/* 升级进度条 */}
          {nextVip && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#A0A0A0]">
                  {currentVip.name} VIP
                </span>
                <span className="text-white font-semibold">
                  {nextVip.name} VIP
                </span>
              </div>
              <div className="relative h-3 bg-[#2A2A2A] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${currentVip.color}, ${nextVip.color})`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-[#A0A0A0]">
                  {currentVip.requiredAmount.toLocaleString()} USDT
                </span>
                <span className="text-[#FFD700] font-semibold">
                  还需 {(nextVip.requiredAmount - userData.totalDeposit).toLocaleString()} USDT
                </span>
                <span className="text-[#A0A0A0]">
                  {nextVip.requiredAmount.toLocaleString()} USDT
                </span>
              </div>
            </div>
          )}

          {/* 当前权益概览 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#1A1A1A] rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#10B981]">
                {currentVip.benefits.withdrawFee}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">提现手续费</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#3B82F6]">
                {currentVip.benefits.betLimit}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">单次下注限额</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#F59E0B]">
                {currentVip.benefits.dailyBonus}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">每日签到奖励</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#8B5CF6]">
                {currentVip.benefits.birthday}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">生日礼金</div>
            </div>
          </div>

          {/* 升级按钮 */}
          {nextVip && (
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#DAA520] text-[#0A0A0A] py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_24px_rgba(255,215,0,0.6)] transition-all active:scale-98"
            >
              充值升级到 {nextVip.name} VIP
            </button>
          )}
        </motion.div>
      </div>

      {/* 权益对比表 */}
      <div className="px-5 py-4">
        <h3 className="text-lg font-bold text-white mb-4">VIP权益对比</h3>

        {/* 等级选择器 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {vipLevels.map(vip => (
            <button
              key={vip.level}
              onClick={() => setSelectedLevel(selectedLevel === vip.level ? null : vip.level)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                selectedLevel === vip.level
                  ? 'border-current shadow-lg'
                  : vip.level === userData.currentLevel
                  ? 'border-current'
                  : 'border-[#3A3A3A]'
              }`}
              style={{
                borderColor: selectedLevel === vip.level || vip.level === userData.currentLevel ? vip.color : '',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{vip.icon}</span>
                <span
                  className={`text-sm font-semibold ${
                    selectedLevel === vip.level || vip.level === userData.currentLevel
                      ? 'text-white'
                      : 'text-[#A0A0A0]'
                  }`}
                >
                  {vip.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 权益详情 */}
        <div className="space-y-3">
          {Object.entries(
            vipLevels[selectedLevel !== null ? selectedLevel : userData.currentLevel].benefits
          ).map(([key, value], index) => {
            const labels: Record<string, string> = {
              withdrawFee: '提现手续费',
              betLimit: '单次下注限额',
              dailyBonus: '每日签到奖励',
              support: '客服支持',
              birthday: '生日礼金',
              other: '其他权益',
            };

            const icons: Record<string, string> = {
              withdrawFee: '💳',
              betLimit: '🎲',
              dailyBonus: '🎁',
              support: '💬',
              birthday: '🎂',
              other: '⭐',
            };

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icons[key]}</span>
                    <div>
                      <div className="font-semibold text-white">{labels[key]}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#FFD700]">{value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 升级要求 */}
        <div className="mt-4 bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#A0A0A0] mb-1">升级要求</div>
              <div className="font-semibold text-white">
                累计充值 ≥{' '}
                {vipLevels[
                  selectedLevel !== null ? selectedLevel : userData.currentLevel
                ].requiredAmount.toLocaleString()}{' '}
                USDT
              </div>
            </div>
            {selectedLevel !== null && selectedLevel > userData.currentLevel && (
              <button
                onClick={handleUpgrade}
                className="bg-[#FFD700] text-[#0A0A0A] px-6 py-2 rounded-lg font-semibold hover:bg-[#DAA520] transition-all"
              >
                去充值
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIP特权说明 */}
      <div className="px-5 py-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A]">
          <h4 className="text-sm font-semibold text-white mb-3">👑 VIP特权说明</h4>
          <ul className="text-xs text-[#A0A0A0] space-y-2">
            <li>• VIP等级根据累计充值金额自动升级，永不降级</li>
            <li>• 等级越高，享受的手续费折扣越大，最高可免手续费</li>
            <li>• 每日签到可获得额外USDT奖励，等级越高奖励越多</li>
            <li>• 高等级VIP享有专属客服经理，7×24小时优先服务</li>
            <li>• 生日当天可领取专属礼金，最高1000 USDT</li>
            <li>• 周返水：每周根据投注额返还一定比例的奖励</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
