'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { useTelegram } from '@/contexts/TelegramContext';
import { useWallet } from '@/contexts/WalletContext';
import { apiService } from '@/lib/api';
import { DiceStatisticEntity } from '@/lib/types';
import { getVipLevelByDeposit, vipLevels as vipLevelConfig } from '@/config/vipLevels';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { depositAmount } = useWallet();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [statistics, setStatistics] = useState<DiceStatisticEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCount, setInviteCount] = useState<number | null>(null);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);

  // 获取用户统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('👤 个人页面：获取用户统计数据', user.id);

      try {
        const response = await apiService.getUserStatistics(String(user.id));
        if (response.success && response.data) {
          setStatistics(response.data);
          console.log('✅ 统计数据获取成功:', response.data);
        } else {
          console.error('❌ 获取统计数据失败:', response.message);
        }
      } catch (error) {
        console.error('❌ 获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user]); // 每次user变化或页面加载时都刷新

  // 计算用户数据
  const isPremiumUser = user?.isPremium || false;
  const vipLevels = vipLevelConfig;
  const walletVipLevel = getVipLevelByDeposit(depositAmount);
  const currentVip = (isPremiumUser && walletVipLevel.level < 1
    ? vipLevels.find(level => level.level === 1) || walletVipLevel
    : walletVipLevel) || vipLevels[0];

  const userData = {
    avatar: user?.photoUrl || 'https://i.pravatar.cc/150?img=33',
    username: user?.firstName || user?.username || 'Player',
    telegramId: user?.username ? `@${user.username}` : '',
    userId: `UID: ${user?.id || '0'}`,
    vipLevel: currentVip.level,
    totalBet: statistics ? parseFloat(statistics.totalBet) : 0,
    totalWin: statistics ? parseFloat(statistics.winBet) : 0,
    winRate: statistics && statistics.totalCount > 0 
      ? ((statistics.winCount / statistics.totalCount) * 100).toFixed(1) 
      : '0.0',
    inviteCount: inviteCount ?? 0,
    depositTotal: depositAmount || 0,
  };

  // VIP充值链接
  const vipUpgradeUrl = 'https://t.me/dhtpay_bot?start=premium';

  // 功能菜单
  const menuItems = [
    {
      icon: '📘',
      title: '玩法说明',
      subtitle: '了解投注规则与赔率',
      route: '/rules',
      color: '#FBBF24',
    },
    {
      icon: '⚙️',
      title: '设置',
      subtitle: '密码 邮箱，账号重置设置',
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
      router.push('/settings/password');
    } else if (item.action === 'support') {
      window.open('https://t.me/jqrkfnnbot', '_blank');
    } else if (item.action === 'about') {
      setShowAboutModal(true);
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
      value: currentVip.name,
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

  // 邀请相关：加载邀请数
  const loadInviteCount = async () => {
    if (!user?.id) return;
    try {
      const response = await apiService.getInviteCount(String(user.id));
      if (response.success) {
        setInviteCount(Number(response.data) || 0);
      } else {
        console.warn('加载邀请数失败', response.message);
      }
    } catch (e) {
      console.error('loadInviteCount error', e);
    }
  };

  const generateInviteLink = async () => {
    if (!user?.id) return;
    setInviteLoading(true);
    try {
      const response = await apiService.generateInviteLink(String(user.id));
      if (response.success && response.data) {
        const link = String(response.data);
        setInviteLink(link);
        await loadInviteCount();
        // 打开本地 Modal 显示链接（不要依赖 Telegram showPopup）
        setShowInviteModal(true);
      } else {
        console.warn('生成邀请链接失败', response.message);
        // eslint-disable-next-line no-alert
        alert(response?.message || '生成邀请链接失败');
      }
    } catch (e) {
      console.error('generateInviteLink error', e);
      // eslint-disable-next-line no-alert
      alert('生成邀请链接异常');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) {
      // 如果没有链接，提示并返回
      // eslint-disable-next-line no-alert
      alert('请先生成邀请链接');
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      // 在页面内显示已复制提示（非原生弹窗）
      setCopiedAt(Date.now());
    } catch (e) {
      console.error('copyInviteLink error', e);
      // eslint-disable-next-line no-alert
      alert('复制失败，请手动复制');
    }
  };

  useEffect(() => {
    loadInviteCount();
  }, [user]);
 
  // 简单的 Invite 链接 Modal（供生成后的查看与复制），样式接近截图的简洁模式
  const InviteModal = () => (
    <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="邀请链接">
      <div className="space-y-4">
        <div className="text-sm text-text-secondary">生成的邀请链接（可复制）：</div>
        <div className="font-mono text-lg break-all bg-[#0b0b0b] p-6 rounded text-center">
          {inviteLink || '（暂无）'}
        </div>

        <div className="text-sm text-text-secondary mt-2">
          好友通过该邀请加入游戏有机会获得新手或活动奖励；邀请人在好友完成指定条件（如首次充值或达到有效流水）后可获得相应邀请奖励。
        </div>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (!inviteLink) {
                // eslint-disable-next-line no-alert
                alert('请先生成邀请链接');
                return;
              }
              try {
                await navigator.clipboard.writeText(inviteLink);
                setCopiedAt(Date.now());
              } catch (e) {
                // eslint-disable-next-line no-alert
                alert('复制失败，请手动复制');
              }
            }}
            className="flex-1 py-3 rounded-md bg-primary-gold text-bg-dark font-semibold"
          >
            复制链接
          </button>
          <button onClick={() => setShowInviteModal(false)} className="flex-1 py-3 rounded-md bg-bg-medium/60">
            关闭
          </button>
        </div>

        {copiedAt && (
          <div className="text-sm text-green-400 mt-2">已复制 • {(() => {
            const diff = Math.floor((Date.now() - copiedAt) / 1000);
            if (diff < 60) return '刚刚';
            if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
            return `${Math.floor(diff / 3600)} 小时前`;
          })()}</div>
        )}
      </div>
    </Modal>
  );

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

            {/* VIP等级 - 可点击升级 */}
            <div className="text-right">
              <button
                onClick={() => {
                  if (!isPremiumUser) {
                    window.open(vipUpgradeUrl, '_blank');
                  }
                }}
                className={`text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                  !isPremiumUser ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''
                }`}
                style={{ backgroundColor: `${currentVip.color}20`, color: currentVip.color }}
              >
                {currentVip.name}
              </button>
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
                  {item.label === '邀请数' ? (
                    <button
                      onClick={generateInviteLink}
                      disabled={inviteLoading}
                      className="text-xs bg-primary-gold text-bg-dark rounded-full px-3 py-1 hover:opacity-90 transition"
                    >
                      {inviteLoading ? '生成中...' : '邀请链接'}
                    </button>
                  ) : (
                    item.copyValue && (
                      <button
                        onClick={() => handleCopy(item.copyValue)}
                        className="text-xs text-primary-gold border border-primary-gold/40 rounded-full px-2 py-0.5 hover:bg-primary-gold/10 transition"
                      >
                        复制
                      </button>
                    )
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

      {/* 关于我们弹窗 */}
      <Modal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} title="关于我们">
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 bg-[#FFD700] rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-lg">
            🎲
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">骰宝夺宝</h3>
            <p className="text-sm text-[#A0A0A0] mt-1">DiceTreasure</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-4 text-sm text-[#A0A0A0] space-y-2">
            <p>版本 V1.0.0</p>
            <p>© 2025 DiceTreasure</p>
            <p>All Rights Reserved</p>
          </div>
          <button
            onClick={() => setShowAboutModal(false)}
            className="w-full bg-[#2A2A2A] text-white py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition-all"
          >
            关闭
          </button>
        </div>
      </Modal>

      {/* 生成后展示邀请链接的 Modal */}
      <InviteModal />

      {/* 版本信息 */}
      <div className="text-center py-8 text-xs text-[#505050]">
        <div>骰宝夺宝 / DiceTreasure</div>
        <div className="mt-1">Version 1.0.0</div>
        <div className="mt-1">© 2025 All Rights Reserved</div>
      </div>
    </div>
  );
}
