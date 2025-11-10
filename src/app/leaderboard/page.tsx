'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { motion, AnimatePresence } from 'framer-motion';

// 排行榜类型
type LeaderboardType = 'daily' | 'weekly' | 'total';

// 排行榜数据接口
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  winAmount: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('daily');
  const [isLoading, setIsLoading] = useState(false);

  // 模拟排行榜数据
  const leaderboardData: Record<LeaderboardType, LeaderboardEntry[]> = {
    daily: [
      { rank: 1, userId: '001', username: 'Lucky Dragon', avatar: 'https://i.pravatar.cc/150?img=1', winAmount: 15888.88 },
      { rank: 2, userId: '002', username: 'Golden Tiger', avatar: 'https://i.pravatar.cc/150?img=2', winAmount: 12500.00 },
      { rank: 3, userId: '003', username: 'Fortune King', avatar: 'https://i.pravatar.cc/150?img=3', winAmount: 9800.50 },
      { rank: 4, userId: '004', username: 'Rich Winner', avatar: 'https://i.pravatar.cc/150?img=4', winAmount: 7500.00 },
      { rank: 5, userId: '005', username: 'Dice Master', avatar: 'https://i.pravatar.cc/150?img=5', winAmount: 6200.00 },
      { rank: 6, userId: '006', username: 'Lucky Star', avatar: 'https://i.pravatar.cc/150?img=6', winAmount: 5500.00 },
      { rank: 7, userId: '007', username: 'Big Winner', avatar: 'https://i.pravatar.cc/150?img=7', winAmount: 4800.00 },
      { rank: 8, userId: '008', username: 'Gold Rush', avatar: 'https://i.pravatar.cc/150?img=8', winAmount: 4200.00 },
      { rank: 9, userId: '009', username: 'Fortune Wheel', avatar: 'https://i.pravatar.cc/150?img=9', winAmount: 3900.00 },
      { rank: 10, userId: '010', username: 'Jackpot Hero', avatar: 'https://i.pravatar.cc/150?img=10', winAmount: 3500.00 },
      { rank: 15, userId: 'me', username: 'You', avatar: 'https://i.pravatar.cc/150?img=15', winAmount: 1888.88, isCurrentUser: true },
    ],
    weekly: [
      { rank: 1, userId: '001', username: 'Weekly Champion', avatar: 'https://i.pravatar.cc/150?img=11', winAmount: 88888.88 },
      { rank: 2, userId: '002', username: 'Mega Winner', avatar: 'https://i.pravatar.cc/150?img=12', winAmount: 65000.00 },
      { rank: 3, userId: '003', username: 'Top Player', avatar: 'https://i.pravatar.cc/150?img=13', winAmount: 52000.00 },
      { rank: 4, userId: '004', username: 'Pro Gambler', avatar: 'https://i.pravatar.cc/150?img=14', winAmount: 42000.00 },
      { rank: 5, userId: '005', username: 'Elite Winner', avatar: 'https://i.pravatar.cc/150?img=15', winAmount: 35000.00 },
      { rank: 22, userId: 'me', username: 'You', avatar: 'https://i.pravatar.cc/150?img=20', winAmount: 8888.88, isCurrentUser: true },
    ],
    total: [
      { rank: 1, userId: '001', username: 'Legend Player', avatar: 'https://i.pravatar.cc/150?img=21', winAmount: 888888.88 },
      { rank: 2, userId: '002', username: 'Eternal Winner', avatar: 'https://i.pravatar.cc/150?img=22', winAmount: 650000.00 },
      { rank: 3, userId: '003', username: 'Ultimate King', avatar: 'https://i.pravatar.cc/150?img=23', winAmount: 520000.00 },
      { rank: 4, userId: '004', username: 'Master Gambler', avatar: 'https://i.pravatar.cc/150?img=24', winAmount: 420000.00 },
      { rank: 5, userId: '005', username: 'Supreme Winner', avatar: 'https://i.pravatar.cc/150?img=25', winAmount: 350000.00 },
      { rank: 50, userId: 'me', username: 'You', avatar: 'https://i.pravatar.cc/150?img=30', winAmount: 28888.88, isCurrentUser: true },
    ],
  };

  const currentData = leaderboardData[activeTab];
  const myRanking = currentData.find(entry => entry.isCurrentUser);
  const topRankings = currentData.filter(entry => !entry.isCurrentUser).slice(0, 100);

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  // 获取排名颜色
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
  };

  // 标签页切换
  const handleTabChange = (tab: LeaderboardType) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 300);
  };

  // 刷新排行榜
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] pb-32">
      {/* 顶部导航 */}
      <TopBar title="排行榜" showBack />

      {/* 标签页切换 */}
      <div className="sticky top-14 z-40 bg-[#1A1A1A] border-b border-[#3A3A3A] px-5 pt-4">
        <div className="flex justify-around mb-4">
          {[
            { key: 'daily' as LeaderboardType, label: '日榜' },
            { key: 'weekly' as LeaderboardType, label: '周榜' },
            { key: 'total' as LeaderboardType, label: '总榜' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className="relative pb-3 px-6 transition-all"
            >
              <span
                className={`text-base font-semibold ${
                  activeTab === tab.key ? 'text-[#FFD700]' : 'text-[#A0A0A0]'
                }`}
              >
                {tab.label}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 刷新按钮 */}
      <div className="px-5 py-3">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-sm text-[#FFD700] flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新
        </button>
      </div>

      {/* 排行榜列表 */}
      <div className="px-5 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {topRankings.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1A1A1A] rounded-xl p-4 mb-3 border border-[#3A3A3A] hover:border-[#FFD700] transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className="w-12 text-center">
                    {getRankIcon(entry.rank) ? (
                      <span className="text-3xl">{getRankIcon(entry.rank)}</span>
                    ) : (
                      <span className={`text-xl font-bold ${getRankColor(entry.rank)}`}>
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* 头像 */}
                  <div className="relative">
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className={`w-14 h-14 rounded-full object-cover ${
                        entry.rank <= 3 ? 'ring-2 ring-[#FFD700]' : 'ring-1 ring-[#3A3A3A]'
                      }`}
                    />
                    {entry.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                        <span className="text-xs">👑</span>
                      </div>
                    )}
                  </div>

                  {/* 用户信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{entry.username}</div>
                    <div className="text-xs text-[#A0A0A0]">ID: {entry.userId}</div>
                  </div>

                  {/* 中奖金额 */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#FFD700] font-mono">
                      {entry.winAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-[#A0A0A0]">USDT</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* 查看更多 */}
        {topRankings.length >= 10 && (
          <button className="w-full py-3 text-[#FFD700] text-sm font-semibold border border-[#FFD700] rounded-lg hover:bg-[#FFD700] hover:text-[#0A0A0A] transition-all mt-4">
            查看更多
          </button>
        )}
      </div>

      {/* 我的排名卡片 - 固定在底部 */}
      {myRanking && (
        <div className="fixed bottom-16 left-0 right-0 px-5 pb-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-6">
          <div className="bg-gradient-to-r from-[#2A1010] to-[#1A1A1A] rounded-xl p-4 border-2 border-[#FFD700] shadow-[0_0_24px_rgba(255,215,0,0.6)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-[#0A0A0A]">#{myRanking.rank}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">我的排名</div>
                  <div className="text-sm text-[#A0A0A0]">
                    距离上一名还差{' '}
                    {(
                      (topRankings.find(e => e.rank === myRanking.rank - 1)?.winAmount || 0) -
                      myRanking.winAmount
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    USDT
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#FFD700] font-mono">
                  {myRanking.winAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-xs text-[#A0A0A0]">USDT</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
