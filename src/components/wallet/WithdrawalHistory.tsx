'use client';

import { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { WithdrawalOrder } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WithdrawalHistoryProps {
  userId: string;
}

/**
 * 获取提币状态显示文本
 * @param txCode 状态码：-1=处理中, 0=成功, 1=失败, -2=人工审核中, -3=拒绝
 */
export function getWithdrawalStatusText(txCode: number): string {
  switch (txCode) {
    case -1:
      return '处理中';
    case 0:
      return '成功';
    case 1:
      return '失败';
    case -2:
      return '人工审核中';
    case -3:
      return '已拒绝';
    default:
      return '未知';
  }
}

/**
 * 获取提币状态颜色类
 */
export function getWithdrawalStatusColor(txCode: number): string {
  switch (txCode) {
    case -1:
      return 'text-warning bg-warning/10 border-warning/30';
    case 0:
      return 'text-success bg-success/10 border-success/30';
    case 1:
      return 'text-error bg-error/10 border-error/30';
    case -2:
      return 'text-info bg-info/10 border-info/30';
    case -3:
      return 'text-error bg-error/10 border-error/30';
    default:
      return 'text-text-secondary bg-bg-medium border-border';
  }
}

export default function WithdrawalHistory({ userId }: WithdrawalHistoryProps) {
  const [orders, setOrders] = useState<WithdrawalOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const lastFetchKeyRef = useRef('');

  // 加载提币订单
  const loadOrders = async (page: number = 1) => {
    // 防止重复请求
    const fetchKey = `${userId}-${page}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    try {
      setLoading(true);
      setError('');
      const result = await apiService.getWithdrawalOrders(userId, page, pageSize);
      
      if (result.success && result.data) {
        // 转换后端数据格式以适配前端显示
        const transformedOrders = result.data.list.map(order => {
          const moneyNum = parseFloat(order.money || '0');
          // 后端可能返回 fee 字段（字符串 "0" 或 "2.00"），优先使用后端返回值
          const backendFeeNum = order.fee !== undefined && order.fee !== null ? parseFloat((order as any).fee as any) : NaN;
          const feeNum = Number.isFinite(backendFeeNum) ? backendFeeNum : 2.0; // fallback to 2.00
          // 实际到账 = 提现金额（手续费从余额额外扣除，不影响到账金额）
          const actualNum = moneyNum;
          return {
          ...order,
          amount: order.money,
          address: order.toAddress,
          txid: order.txId,
          confirmTime: order.modifyTime,
            fee: feeNum.toFixed(2),
            actualAmount: actualNum.toFixed(2),
          };
        });
        
        setOrders(transformedOrders);
        setTotalCount(result.data.totalCount);
        setCurrentPage(page);
      } else {
        setError(result.message || '加载失败');
      }
    } catch (err) {
      console.error('加载提币记录失败:', err);
      setError('加载提币记录失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 计算手续费
  const calculateFee = (amount: number): string => {
    // 统一手续费: 2 USDT
    return '2.00';
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadOrders(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 刷新订单
  const handleRefresh = () => {
    loadOrders(currentPage);
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化地址（显示前6位和后4位）
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">提币记录</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm text-primary-gold hover:text-primary-light-gold disabled:opacity-50 transition-colors"
        >
          {loading ? '刷新中...' : '🔄 刷新'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-error flex-1">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-error hover:text-error/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading && orders.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
          <p className="mt-4 text-sm text-text-secondary">加载中...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-text-secondary">暂无提币记录</p>
        </div>
      )}

      {/* 订单列表 */}
      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-bg-dark rounded-xl p-4 border border-border hover:border-primary-gold/30 transition-all"
            >
              {/* 订单头部 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full border',
                        getWithdrawalStatusColor(order.txCode)
                      )}
                    >
                      {getWithdrawalStatusText(order.txCode)}
                    </span>
                  </div>
                  <p className="text-xs text-text-disabled">
                    {formatTime(order.createTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-mono text-text-primary">
                    -{order.money} USDT
                  </p>
                  <p className="text-xs text-text-secondary">
                    手续费: {order.fee || '0.00'} USDT
                  </p>
                </div>
              </div>

              {/* 订单详情 */}
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">实际到账</span>
                  <span className="font-mono font-semibold text-primary-gold">
                    {order.actualAmount || order.money} USDT
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">提币地址</span>
                  <span className="font-mono text-text-primary">
                    {formatAddress(order.toAddress)}
                  </span>
                </div>
                {/* 只有非人工审核和非拒绝状态才显示交易ID */}
                {order.txId && order.txCode !== -2 && order.txCode !== -3 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">交易ID</span>
                    <span className="font-mono text-xs text-text-primary break-all">
                      {order.txId}
                    </span>
                  </div>
                )}
                {order.modifyTime && order.modifyTime !== order.createTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">确认时间</span>
                    <span className="text-text-primary">
                      {formatTime(order.modifyTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* 状态说明 */}
              {order.txCode === -1 && (
                <div className="mt-3 p-2 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs text-warning">
                    ⏳ 交易正在处理中，请耐心等待确认
                  </p>
                </div>
              )}
              {order.txCode === 1 && (
                <div className="mt-3 p-2 bg-error/5 border border-error/20 rounded-lg">
                  <p className="text-xs text-error">
                    ❌ 交易失败，资金已退回账户
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => loadOrders(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-bg-medium text-text-primary rounded-lg hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-sm text-text-secondary">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => loadOrders(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 bg-bg-medium text-text-primary rounded-lg hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
