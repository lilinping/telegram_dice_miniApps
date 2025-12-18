'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { cn, validateTRC20Address, calculateWithdrawalFee } from '@/lib/utils';
import { apiService } from '@/lib/api';
import { AddressEntity } from '@/lib/types';
import ToastContainer, { toast } from '@/components/ui/Toast';

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

export default function WithdrawPage() {
  const router = useRouter();
  const { balance, refreshBalance } = useWallet();
  const { user } = useTelegram();
  const userId = user?.id;
  
  const [amount, setAmount] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<AddressEntity[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [addressValidationError, setAddressValidationError] = useState<string>('');
  const lastFetchKeyRef = useRef('');
  const [isFreeWithdrawal, setIsFreeWithdrawal] = useState<boolean>(false); // 是否免手续费
  
  // 成功弹框状态
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>('');
  const [successStatus, setSuccessStatus] = useState<string>('');

  const loadAddresses = async (forceRefresh: boolean = false) => {
    if (!userId) return;

    // 防止重复请求（除非强制刷新）
    const fetchKey = `${userId}`;
    if (!forceRefresh && lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;
    try {
      setLoading(true);
      const result = await apiService.getAddressList(String(userId));
      
      if (result.success && result.data) {
        setAddresses(result.data);
        // 自动选择默认地址
        const defaultAddr = result.data.find(addr => addr.defaultAddress);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error('加载地址列表失败:', err);
      setError('加载地址列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 查询是否免手续费
  const checkFreeWithdrawal = async () => {
    if (!userId) return;
    try {
      const result = await apiService.checkFreeWithdrawal(String(userId));
      if (result.success) {
        setIsFreeWithdrawal(result.data === true);
        console.log('💰 免手续费状态:', result.data);
      }
    } catch (err) {
      console.error('查询免手续费状态失败:', err);
    }
  };

  // 加载地址列表和免手续费状态
  useEffect(() => {
    loadAddresses();
    checkFreeWithdrawal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 实时验证地址
  const handleAddressChange = (value: string) => {
    setNewAddress(value);
    
    // 只在有输入内容时才验证
    if (value.trim().length > 0) {
      const validation = validateTRC20Address(value);
      if (!validation.valid) {
        setAddressValidationError(validation.error || '');
      } else {
        setAddressValidationError('');
      }
    } else {
      // 清空输入时，清除错误提示
      setAddressValidationError('');
    }
  };

  // 添加新地址
  const handleAddAddress = async () => {
    // 检查地址数量限制
    if (addresses.length >= 20) {
      setError('已达到地址数量上限（20个）');
      return;
    }

    const validation = validateTRC20Address(newAddress);
    if (!validation.valid) {
      setError(validation.error || '地址验证失败');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await apiService.createAddress(String(userId), newAddress.trim());
      
      if (result.success) {
        setNewAddress('');
        setAddressValidationError('');
        setShowAddAddress(false);
        // 强制刷新地址列表
        await loadAddresses(true);
      } else {
        setError(result.message || '添加地址失败');
      }
    } catch (err) {
      console.error('添加地址失败:', err);
      setError('添加地址失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除地址
  const handleDeleteAddress = async (addressId: number) => {
    // 检查是否为默认地址
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (addressToDelete?.defaultAddress) {
      setError('无法删除默认地址，请先设置其他地址为默认');
      return;
    }

    if (!confirm('确定要删除这个地址吗？')) {
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.deleteAddress(addressId, String(userId));
      
      if (result.success) {
        // 强制刷新地址列表
        await loadAddresses(true);
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
        }
      } else {
        setError(result.message || '删除地址失败');
      }
    } catch (err) {
      console.error('删除地址失败:', err);
      setError('删除地址失败');
    } finally {
      setLoading(false);
    }
  };

  // 设置默认地址
  const handleSetDefault = async (addressId: number) => {
    try {
      setLoading(true);
      const result = await apiService.setDefaultAddress(addressId, String(userId));
      
      if (result.success) {
        // 强制刷新地址列表
        await loadAddresses(true);
      } else {
        setError(result.message || '设置默认地址失败');
      }
    } catch (err) {
      console.error('设置默认地址失败:', err);
      setError('设置默认地址失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算手续费和实际到账
  const withdrawAmount = parseFloat(amount) || 0;
  const fee = isFreeWithdrawal ? 0 : calculateWithdrawalFee(withdrawAmount);
  const actualAmount = withdrawAmount - fee;

  // 处理全部提现
  const handleWithdrawAll = () => {
    setAmount(balance.toString());
  };

  // 处理提现确认
  const handleConfirm = () => {
    setError('');
    
    if (withdrawAmount < 10) {
      setError('最小提现金额为 10 USDT');
      return;
    }

    if (withdrawAmount > balance) {
      setError('余额不足');
      return;
    }

    if (!selectedAddressId) {
      setError('请选择提现地址');
      return;
    }

    setShowConfirm(true);
  };

  // 处理提现提交
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await apiService.withdrawUsdt(String(userId), withdrawAmount.toFixed(2));
      
      console.log('💰 提现API完整返回:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        setShowConfirm(false);
        
        // 安全地获取订单ID - 兼容多种字段名
        let orderId = '处理中';
        let txCode = -1;
        
        if (result.data) {
          // 后端可能返回 orderId(string) 或 id(number)
          const orderIdValue = (result.data as any).orderId || 
                              (result.data as any).id || 
                              (result.data as any).orderid;
          if (orderIdValue) {
            orderId = String(orderIdValue);
          }
          txCode = result.data.txCode ?? -1;
        }
        
        console.log('💰 提现成功 - 订单ID:', orderId, 'txCode:', txCode);
        
        // 根据txCode显示不同的状态
        let statusText = '待审核';
        if (txCode === 0) {
          statusText = '已完成';
        } else if (txCode === 1) {
          statusText = '处理失败';
        }
        
        // 刷新余额
        console.log('💰 刷新余额...');
        await refreshBalance();
        console.log('💰 余额刷新完成');
        
        // 显示成功弹框
        setSuccessOrderId(orderId);
        setSuccessStatus(statusText);
        setShowSuccess(true);
      } else {
        console.error('❌ 提现失败:', result.message);
        setError(result.message || '提现失败');
        setShowConfirm(false);
      }
    } catch (err) {
      console.error('❌ 提现异常:', err);
      setError('提现失败，请稍后重试');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

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
              className={cn(
                "w-full h-12 bg-bg-medium border-2 rounded-lg px-4 pr-24 text-base text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 transition-all",
                amount && parseFloat(amount) > 0 && parseFloat(amount) < 10
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-border focus:border-primary-gold focus:ring-primary-gold/20"
              )}
              min="10"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
              USDT
            </span>
          </div>

          {/* 金额不足提示 */}
          {amount && parseFloat(amount) > 0 && parseFloat(amount) < 10 && (
            <p className="mb-2 text-sm text-red-500 font-medium">
              ⚠️ 最少需要 10 USDT 才可以提取
            </p>
          )}

          {/* 全部提现按钮 */}
          <button
            onClick={handleWithdrawAll}
            className="text-sm text-primary-gold hover:text-primary-light-gold transition-colors"
          >
            全部提现
          </button>

          <p className="mt-2 text-xs text-text-secondary">
            最小提现金额: 10 USDT
          </p>
        </section>

        {/* 提现地址 */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">提现地址</h2>

          {loading && addresses.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">加载中...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p className="mb-4">暂无提现地址</p>
            </div>
          ) : (
            <div className="space-y-2 mb-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 transition-all',
                    selectedAddressId === addr.id
                      ? 'bg-primary-gold/10 border-primary-gold'
                      : 'bg-bg-dark border-border'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 单选按钮 - 点击时直接切换为默认地址 */}
                    <button
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        // 如果点击的不是默认地址，直接设置为默认
                        if (!addr.defaultAddress) {
                          handleSetDefault(addr.id);
                        }
                      }}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5',
                        selectedAddressId === addr.id
                          ? 'border-primary-gold bg-primary-gold'
                          : 'border-border'
                      )}
                    >
                      {selectedAddressId === addr.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-bg-darkest" />
                      )}
                    </button>

                    {/* 地址信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-semibold text-text-primary">
                          钱包地址
                        </p>
                        {addr.defaultAddress && (
                          <span className="px-2 py-0.5 bg-primary-gold text-bg-darkest text-xs font-bold rounded">
                            (默认)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-text-secondary break-all flex-1">
                          {addr.address}
                        </p>
                        {/* 复制地址按钮 */}
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(addr.address);
                              toast.success('地址已复制');
                            } catch (err) {
                              console.error('复制失败:', err);
                              toast.error('复制失败');
                            }
                          }}
                          className="px-2 py-1 bg-bg-medium hover:bg-bg-dark text-text-secondary hover:text-primary-gold rounded text-xs transition-colors flex-shrink-0"
                          title="复制地址"
                        >
                          📋
                        </button>
                      </div>
                      <p className="text-xs text-text-disabled mt-1">
                        网络: TRC20
                      </p>
                      
                      {/* 操作按钮 */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-error hover:text-error/80"
                          disabled={loading}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 添加新地址按钮 */}
          <button
            onClick={() => {
              setShowAddAddress(true);
              setNewAddress('');
              setAddressValidationError('');
              setError('');
            }}
            disabled={loading || addresses.length >= 20}
            className="w-full py-3 border-2 border-dashed border-primary-gold/30 text-primary-gold rounded-lg hover:bg-primary-gold/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="text-xl">➕</span>
            <span>{addresses.length >= 20 ? '已达地址上限' : '添加新地址'}</span>
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
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">手续费</span>
            {isFreeWithdrawal ? (
              <span className="text-sm font-mono text-success flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-success/20 text-success text-xs rounded">免手续费</span>
                0.00 USDT
              </span>
            ) : (
              <span className="text-sm font-mono text-error">
                -{fee.toFixed(2)} USDT
              </span>
            )}
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
              <p className="text-xs text-text-secondary">• 最小提现金额: 10 USDT</p>
              {isFreeWithdrawal ? (
                <p className="text-xs text-success">• 手续费: 免手续费 🎉</p>
              ) : (
                <p className="text-xs text-text-secondary">• 手续费: 2 USDT（统一费率）</p>
              )}
              <p className="text-xs text-text-secondary">• 自动审核，2小时内到账</p>
              <p className="text-xs text-text-secondary">• 不限提现次数</p>
            </div>
          </div>
        </section>

        {/* 提现按钮 */}
        <button
          onClick={handleConfirm}
          disabled={loading || withdrawAmount < 10 || withdrawAmount > balance || !selectedAddressId}
          className="w-full h-14 bg-gradient-to-r from-warning to-orange-600 text-white text-lg font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '处理中...' : '确认提现'}
        </button>
      </div>

      {/* 添加地址弹窗 */}
      {showAddAddress && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-bg-dark border-2 border-primary-gold rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-bold text-primary-gold mb-6">添加提现地址</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  钱包地址 (TRC20)
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="输入 TRON 钱包地址 (T开头)"
                  className={cn(
                    "w-full h-12 bg-bg-medium border-2 rounded-lg px-4 text-sm font-mono text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 transition-all",
                    addressValidationError
                      ? "border-error focus:border-error focus:ring-error/20"
                      : "border-border focus:border-primary-gold focus:ring-primary-gold/20"
                  )}
                />
                {addressValidationError && (
                  <p className="text-xs text-error mt-2">
                    ⚠️ {addressValidationError}
                  </p>
                )}
                {!addressValidationError && newAddress && (
                  <p className="text-xs text-success mt-2">
                    ✓ 地址格式正确
                  </p>
                )}
                <p className="text-xs text-text-disabled mt-2">
                  示例: TMj29MnfCF8zjpjEnbUfiXwVW5onRFoXjR
                </p>
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <p className="text-xs text-warning">
                  ⚠️ 请确保地址正确，转账后无法撤回
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddAddress(false);
                  setNewAddress('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 py-3 bg-bg-medium text-text-primary rounded-lg hover:bg-bg-medium/80 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleAddAddress}
                disabled={loading || !newAddress.trim() || !!addressValidationError}
                className="flex-1 py-3 bg-gradient-to-r from-primary-gold to-primary-light-gold text-bg-darkest rounded-lg hover:opacity-90 transition-all font-semibold disabled:opacity-50"
              >
                {loading ? '添加中...' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">手续费</span>
                  {isFreeWithdrawal ? (
                    <span className="text-sm font-mono text-success">
                      免手续费
                    </span>
                  ) : (
                    <span className="text-sm font-mono text-error">
                      -{fee.toFixed(2)} USDT
                    </span>
                  )}
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
                    {selectedAddress?.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">到账时间</p>
                  <p className="text-xs text-text-primary">
                    2小时内
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
                  disabled={loading}
                  className="flex-1 py-3 bg-bg-medium text-text-primary rounded-lg hover:bg-bg-medium/80 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-warning to-orange-600 text-white rounded-lg hover:opacity-90 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? '提交中...' : '确认提现'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提现成功弹框 */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-dark border border-border rounded-2xl w-[90%] max-w-sm overflow-hidden shadow-2xl">
            {/* 顶部成功图标 */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">提现申请已提交</h3>
            </div>
            
            {/* 订单信息 */}
            <div className="p-6 space-y-4">
              <div className="bg-bg-medium rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">订单编号</span>
                  <span className="text-sm font-mono text-text-primary">{successOrderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">提现金额</span>
                  <span className="text-sm font-semibold text-primary-gold">{withdrawAmount.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">状态</span>
                  <span className={cn(
                    "text-sm font-semibold px-2 py-0.5 rounded",
                    successStatus === '已完成' ? 'bg-green-500/20 text-green-400' :
                    successStatus === '处理失败' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  )}>
                    {successStatus}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-text-secondary text-center">
                预计2小时内到账，请在钱包页面查看提现记录
              </p>
              
              {/* 确认按钮 */}
              <button
                onClick={() => {
                  setShowSuccess(false);
                  router.push('/wallet');
                }}
                className="w-full h-12 bg-gradient-to-r from-primary-gold to-primary-dark-gold text-bg-darkest font-bold rounded-xl transition-all hover:opacity-90"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
