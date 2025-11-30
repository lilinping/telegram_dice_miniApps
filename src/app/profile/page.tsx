'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { useTelegram } from '@/contexts/TelegramContext';
import { apiService } from '@/lib/api';
import { DiceStatisticEntity } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useTelegram();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [statistics, setStatistics] = useState<DiceStatisticEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const lastFetchKeyRef = useRef('');

  // 获取用户统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // 防止重复请求
      const fetchKey = `${user.id}`;
      if (lastFetchKeyRef.current === fetchKey) {
        return;
      }
      lastFetchKeyRef.current = fetchKey;

      try {
        const response = await apiService.getUserStatistics(String(user.id));
        if (response.success && response.data) {
          setStatistics(response.data);
        } else {
          console.error('获取统计数据失败:', response.message);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 计算用户数据
  const userData = {
    avatar: user?.photoUrl || 'https://i.pravatar.cc/150?img=33',
    username: user?.firstName || user?.username || 'Player',
    telegramId: user?.username ? `@${user.username}` : '',
    userId: `UID: ${user?.id || '0'}`,
    vipLevel: 0, // 暂时固定为0，后续可以根据投注额计算
    totalBet: statistics ? parseFloat(statistics.totalBet) : 0,
    totalWin: statistics ? parseFloat(statistics.winBet) : 0,
    winRate: statistics && statistics.totalCount > 0 
      ? ((statistics.winCount / statistics.totalCount) * 100).toFixed(1) 
      : '0.0',
    inviteCount: 0, // 暂时固定为0，后续添加邀请功能后对接
  };

  // VIP等级配置
  const vipLevels = [
    { level: 0, name: '普通', color: '#808080', icon: '⚪' },
    { level: 1, name: '青铜', color: '#CD7F32', icon: '🥉' },
    { level: 2, name: '白银', color: '#C0C0C0', icon: '🥈' },
    { level: 3, name: '黄金', color: '#FFD700', icon: '🥇' },
    { level: 4, name: '铂金', color: '#E5E4E2', icon: '💎' },
    { level: 5, name: '钻石', color: '#B9F2FF', icon: '💠' },
  ];

  const currentVip = vipLevels[userData.vipLevel];

  // 功能菜单
  const menuItems = [
    {
      icon: '👥',
      title: '邀请好友',
      subtitle: `已邀请${userData.inviteCount}人`,
      route: '/invite',
      color: '#10B981',
    },
    {
      icon: '👑',
      title: 'VIP中心',
      subtitle: currentVip.name,
      route: '/vip',
      color: '#FFD700',
    },
    {
      icon: '⚙️',
      title: '设置',
      subtitle: '语言、音效、隐私',
      action: 'settings',
      color: '#3B82F6',
    },
    {
      icon: '💬',
      title: '客服中心',
      subtitle: '在线客服 7×24小时',
      action: 'support',
      color: '#F59E0B',
    },
    {
      icon: 'ℹ️',
      title: '关于我们',
      subtitle: '版本 V1.0',
      action: 'about',
      color: '#8B5CF6',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else if (item.action === 'settings') {
      alert('设置功能开发中...');
    } else if (item.action === 'support') {
      alert('正在连接客服...');
    } else if (item.action === 'about') {
      alert('骰宝夺宝 V1.0\n© 2025 DiceTreasure\nPowered by Telegram WebApp');
    }
  };

  // 退出登录
  const handleLogout = () => {
    setShowLogoutModal(false);
    // 清空本地缓存
    localStorage.clear();
    sessionStorage.clear();
    // 跳转到欢迎页
    router.push('/');
  };

  const userInfoItems = [
    {
      label: 'UID',
      value: user?.id ? `#${user.id}` : '--',
      copyValue: user?.id ? String(user.id) : undefined,
    },
    {
      label: '账号',
      value: userData.telegramId || '未绑定',
      copyValue: userData.telegramId?.replace('@', ''),
    },
    {
      label: '语言',
      value: user?.languageCode?.toUpperCase() || '未知',
    },
    {
      label: '会员等级',
      value: `${currentVip.name} · VIP${currentVip.level}`,
    },
    {
      label: '邀请数',
      value: `${userData.inviteCount} 人`,
    },
  ];

  const handleCopy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      (window as any)?.Telegram?.WebApp?.showPopup?.({ title: '复制成功', message: text, buttons: [{ id: 'ok', type: 'close' }] });
    } catch (error) {
      console.warn('复制失败', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] pt-16 safe-top pb-20">
      {/* 顶部导航 */}
      <TopBar title="个人中心" />

      {/* 用户头部卡片 */}
      <div className="px-5 pt-2 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2A1010] to-[#1A1A1A] rounded-2xl p-6 border-2 border-[#FFD700] shadow-[0_8px_24px_rgba(255,215,0,0.2)]"
        >
          <div className="flex items-center gap-4 mb-6">
            {/* 头像 */}
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.username}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#FFD700]"
              />
              {/* VIP徽章 */}
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg"
                style={{ backgroundColor: currentVip.color }}
              >
                {currentVip.icon}
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1 truncate">{userData.username}</h2>
              <div className="text-sm text-[#A0A0A0] mb-1">{userData.telegramId}</div>
              <div className="text-xs text-[#505050]">{userData.userId}</div>
            </div>

            {/* VIP等级 */}
            <div className="text-right">
              <div
                className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: `${currentVip.color}20`, color: currentVip.color }}
              >
                {currentVip.name}VIP
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#3A3A3A]">
            <div className="text-center">
              <div className="text-lg font-bold text-[#FFD700] font-mono">
                {loading ? '...' : userData.totalBet.toLocaleString()}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">累计投注</div>
            </div>
            <div className="text-center border-l border-r border-[#3A3A3A]">
              <div className="text-lg font-bold text-[#10B981] font-mono">
                {loading ? '...' : userData.totalWin.toLocaleString()}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">累计中奖</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#3B82F6] font-mono">
                {loading ? '...' : `${userData.winRate}%`}
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1">胜率</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 用户信息补充 */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111]/80 border border-[#2C2C2C] rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">账户信息</p>
            <span className="text-xs text-[#8a8a8a]">实时同步</span>
          </div>
          <div className="divide-y divide-[#1F1F1F]">
            {userInfoItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 text-sm">
                <div className="text-[#A0A0A0]">{item.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{item.value}</span>
                  {item.copyValue && (
                    <button
                      onClick={() => handleCopy(item.copyValue)}
                      className="text-xs text-primary-gold border border-primary-gold/40 rounded-full px-2 py-0.5 hover:bg-primary-gold/10 transition"
                    >
                      复制
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 功能菜单列表 */}
      <div className="px-5 py-4">
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleMenuClick(item)}
              className="w-full bg-[#1A1A1A] rounded-xl p-4 border border-[#3A3A3A] hover:border-[#FFD700] transition-all active:scale-98"
            >
              <div className="flex items-center gap-4">
                {/* 图标 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  {item.icon}
                </div>

                {/* 标题和副标题 */}
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-sm text-[#A0A0A0] mt-0.5">{item.subtitle}</div>
                </div>

                {/* 箭头 */}
                <svg
                  className="w-5 h-5 text-[#505050]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 退出登录按钮 */}
      <div className="px-5 py-6">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full bg-transparent border-2 border-[#EF4444] text-[#EF4444] py-4 rounded-xl font-semibold hover:bg-[#EF4444] hover:text-white transition-all active:scale-98"
        >
          退出登录
        </button>
      </div>

      {/* 退出登录确认弹窗 */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="退出登录">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-[#A0A0A0] mb-6">确定要退出登录吗？</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 bg-[#2A2A2A] text-white py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition-all"
            >
              取消
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-[#EF4444] text-white py-3 rounded-lg font-semibold hover:bg-[#DC2626] transition-all"
            >
              确定退出
            </button>
          </div>
        </div>
      </Modal>

      {/* 版本信息 */}
      <div className="text-center py-8 text-xs text-[#505050]">
        <div>骰宝夺宝 / DiceTreasure</div>
        <div className="mt-1">Version 1.0.0</div>
        <div className="mt-1">© 2025 All Rights Reserved</div>
      </div>
    </div>
  );
}
