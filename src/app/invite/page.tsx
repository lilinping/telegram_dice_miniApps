'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';

// 邀请记录接口
interface InviteRecord {
  id: string;
  username: string;
  avatar: string;
  registeredAt: string;
  hasDeposited: boolean;
  reward: number;
}

export default function InvitePage() {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const [copied, setCopied] = useState(false);

  // 邀请数据
  const inviteData = {
    inviteCode: 'DICE888',
    inviteLink: 'https://t.me/DiceTreasureBot?start=invite_1234567890',
    totalInvites: 12,
    depositedInvites: 8,
    totalReward: 888.88,
  };

  // 奖励规则
  const rewardRules = [
    { icon: '🎁', title: '邀请注册', reward: '10 USDT', description: '好友通过您的链接注册即得' },
    { icon: '💰', title: '首次充值', reward: '10%', description: '好友首充金额的10%佣金' },
    { icon: '🔄', title: '持续返佣', reward: '5%', description: '好友每次充值均可获得5%返佣' },
  ];

  // 邀请记录（模拟数据）
  const inviteRecords: InviteRecord[] = [
    {
      id: '001',
      username: 'Lucky Player',
      avatar: 'https://i.pravatar.cc/150?img=41',
      registeredAt: '2025-11-08 15:30',
      hasDeposited: true,
      reward: 120.0,
    },
    {
      id: '002',
      username: 'Golden Tiger',
      avatar: 'https://i.pravatar.cc/150?img=42',
      registeredAt: '2025-11-07 12:20',
      hasDeposited: true,
      reward: 88.5,
    },
    {
      id: '003',
      username: 'Fortune King',
      avatar: 'https://i.pravatar.cc/150?img=43',
      registeredAt: '2025-11-06 09:15',
      hasDeposited: false,
      reward: 10.0,
    },
    {
      id: '004',
      username: 'Dice Master',
      avatar: 'https://i.pravatar.cc/150?img=44',
      registeredAt: '2025-11-05 18:45',
      hasDeposited: true,
      reward: 150.0,
    },
    {
      id: '005',
      username: 'Big Winner',
      avatar: 'https://i.pravatar.cc/150?img=45',
      registeredAt: '2025-11-04 14:30',
      hasDeposited: false,
      reward: 10.0,
    },
  ];

  // 复制邀请链接
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteData.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 复制邀请码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteData.inviteCode);
    alert('邀请码已复制！');
  };

  // 分享到Telegram
  const handleShare = () => {
    const shareText = `🎲 快来玩骰宝夺宝！\n\n使用我的邀请码 ${inviteData.inviteCode} 注册，立得10 USDT！\n\n${inviteData.inviteLink}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      inviteData.inviteLink
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  // 下载二维码
  const handleDownloadQR = () => {
    alert('二维码下载功能开发中...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] pb-20">
      {/* 顶部导航 */}
      <TopBar 
        title="邀请好友" 
        showBack 
        rightAction={
          <button
            onClick={() => router.push('/notification')}
            className="relative w-8 h-8 flex items-center justify-center rounded-full text-white hover:text-primary-gold transition-colors"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center border border-bg-darkest">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        }
      />

      {/* 邀请卡片 */}
      <div className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-6 shadow-[0_8px_24px_rgba(16,185,129,0.3)]"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">邀请好友，双方得奖励！</h2>
            <p className="text-sm text-white/80">每邀请一位好友注册，立得10 USDT</p>
          </div>

          {/* 二维码 */}
          <div className="bg-white rounded-xl p-4 mb-4 mx-auto w-48 h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">📱</div>
              <div className="text-xs text-gray-600">扫码邀请好友</div>
              <div className="text-xs text-gray-500 mt-1">（二维码占位）</div>
            </div>
          </div>

          {/* 邀请码 */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/70 mb-1">专属邀请码</div>
                <div className="text-2xl font-bold text-white font-mono">{inviteData.inviteCode}</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-white text-[#10B981] px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all"
              >
                复制
              </button>
            </div>
          </div>

          {/* 邀请链接 */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="text-xs text-white/70 mb-2">邀请链接</div>
            <div className="text-sm text-white break-all mb-3">{inviteData.inviteLink}</div>
            <button
              onClick={handleCopyLink}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                copied
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-[#10B981] hover:bg-white/90'
              }`}
            >
              {copied ? '✓ 已复制' : '复制链接'}
            </button>
          </div>

          {/* 分享按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-white text-[#10B981] py-3 rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">📤</span>
              分享到Telegram
            </button>
            <button
              onClick={handleDownloadQR}
              className="bg-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-all"
            >
              <span className="text-xl">⬇️</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* 统计数据 */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A] text-center"
          >
            <div className="text-2xl font-bold text-[#FFD700] font-mono">
              {inviteData.totalInvites}
            </div>
            <div className="text-xs text-[#A0A0A0] mt-1">已邀请人数</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A] text-center"
          >
            <div className="text-2xl font-bold text-[#10B981] font-mono">
              {inviteData.depositedInvites}
            </div>
            <div className="text-xs text-[#A0A0A0] mt-1">成功充值</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A] text-center"
          >
            <div className="text-2xl font-bold text-[#F97316] font-mono">
              {inviteData.totalReward.toFixed(2)}
            </div>
            <div className="text-xs text-[#A0A0A0] mt-1">累计奖励</div>
          </motion.div>
        </div>
      </div>

      {/* 奖励规则 */}
      <div className="px-5 py-4">
        <h3 className="text-lg font-bold text-white mb-4">奖励规则</h3>
        <div className="space-y-3">
          {rewardRules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A]"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{rule.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">{rule.title}</div>
                  <div className="text-sm text-[#A0A0A0]">{rule.description}</div>
                </div>
                <div className="text-lg font-bold text-[#FFD700]">{rule.reward}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 邀请记录 */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">邀请记录</h3>
          <div className="text-sm text-[#A0A0A0]">共{inviteRecords.length}条</div>
        </div>
        <div className="space-y-3">
          {inviteRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A]"
            >
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <img
                  src={record.avatar}
                  alt={record.username}
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-[#3A3A3A]"
                />

                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{record.username}</div>
                  <div className="text-xs text-[#A0A0A0] mt-1">{record.registeredAt}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {record.hasDeposited ? (
                      <span className="text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded">
                        ✓ 已充值
                      </span>
                    ) : (
                      <span className="text-xs bg-[#505050]/20 text-[#A0A0A0] px-2 py-0.5 rounded">
                        未充值
                      </span>
                    )}
                  </div>
                </div>

                {/* 奖励金额 */}
                <div className="text-right">
                  <div className="text-lg font-bold text-[#FFD700] font-mono">
                    +{record.reward.toFixed(2)}
                  </div>
                  <div className="text-xs text-[#A0A0A0]">USDT</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="px-5 py-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A]">
          <h4 className="text-sm font-semibold text-white mb-3">📌 温馨提示</h4>
          <ul className="text-xs text-[#A0A0A0] space-y-2">
            <li>• 好友通过您的邀请链接注册，双方均可获得奖励</li>
            <li>• 好友首次充值后，您将获得充值金额10%的佣金</li>
            <li>• 好友每次充值，您都可持续获得5%的返佣</li>
            <li>• 奖励将实时到账，可直接用于游戏或提现</li>
            <li>• 邀请人数无上限，多邀多得</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
