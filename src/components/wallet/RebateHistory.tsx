'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useTelegram } from '@/contexts/TelegramContext';
import { RebateHistory as RebateHistoryType } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * 反水历史记录组件
 * 
 * 显示反水历史记录列表，支持分页加载
 */

export default function RebateHistory() {
  const { user } = useTelegram();
  const [historyList, setHistoryList] = useState<RebateHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 加载历史记录
  const loadHistory = async (page: number = 1) => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const response = await apiService.getRebateHistory(
        String(user.id),
        page,
        pageSize
      );

      if (response.success && response.data) {
        const { list, totalCount: total } = response.data;
        
        if (page === 1) {
          setHistoryList(list);
        } else {
          setHistoryList((prev) => [...prev, ...list]);
        }

        setTotalCount(total);
        setHasMore(list.length === pageSize && (page * pageSize) < total);
        setPageIndex(page);
      }
    } catch (error) {
      console.error('❌ 加载反水历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载更多
  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadHistory(pageIndex + 1);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  // 初始化加载
  useEffect(() => {
    if (user) {
      loadHistory(1);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-3">
      {historyList.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-text-secondary">
          <p className="text-sm">暂无反水记录</p>
        </div>
      ) : (
        <>
          {historyList.map((item) => {
            // rebate 是流水金额，fee 是反水金额
            const turnover = parseFloat(item.rebate) || 0;  // 流水金额
            const rebateAmount = parseFloat(item.fee) || 0;  // 反水金额

            console.log('📊 反水记录项:', item, '解析值:', { rebateAmount, turnover });

            return (
              <div
                key={item.id}
                className="bg-bg-medium rounded-xl p-4 border border-border hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <span className="text-sm font-semibold text-text-primary">
                      反水记录
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {formatTime(item.createTime)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">反水金额</p>
                    <p className="text-base font-semibold font-mono text-purple-400">
                      +{rebateAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">流水金额</p>
                    <p className="text-base font-semibold font-mono text-info">
                      {turnover.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 加载更多按钮 */}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className={cn(
                'w-full py-3 rounded-xl bg-bg-medium border border-border text-text-secondary hover:border-purple-500/30 hover:text-purple-400 transition-colors',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? '加载中...' : '加载更多'}
            </button>
          )}

          {/* 加载提示 */}
          {isLoading && historyList.length > 0 && (
            <div className="text-center py-4 text-text-secondary text-sm">
              加载中...
            </div>
          )}
        </>
      )}
    </div>
  );
}

