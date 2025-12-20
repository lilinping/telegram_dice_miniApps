'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { useTelegram } from './TelegramContext';
import { AccountModel } from '@/lib/types';

interface WalletContextType {
  // 余额
  balance: number;
  frozenBalance: number;
  bonusBalance: number;
  depositAmount: number;

  // 账户信息
  accountInfo: AccountModel | null;

  // 更新余额
  setBalance: (amount: number) => void;
  setFrozenBalance: (amount: number) => void;
  setBonusBalance: (amount: number) => void;

  // 刷新余额
  refreshBalance: () => Promise<void>;

  // 充值/提现
  deposit: (amount: number, method: string) => Promise<boolean>;
  withdraw: (amount: number, address: string) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isInitialized } = useTelegram();
  // 服务器端和客户端都从 0 开始，避免 hydration 错误
  const [balance, setBalance] = useState(0);
  const [frozenBalance, setFrozenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [accountInfo, setAccountInfo] = useState<AccountModel | null>(null);
  const isFetchingRef = useRef(false);
  const hasLoadedFromCacheRef = useRef(false);

  // 使用 ref 存储 user，避免 refreshBalance 依赖 user 导致循环依赖
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 刷新余额 - 使用 ref 访问 user，避免依赖变化
  const refreshBalance = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      console.error('用户未登录');
      return;
    }

    if (isFetchingRef.current) {
      console.log('⏸️ 余额刷新中，跳过重复请求');
      return;
    }
    isFetchingRef.current = true;

    try {
      console.log('📡 开始请求余额...', currentUser.id, '当前余额:', balance);
      const response = await apiService.queryAccount(String(currentUser.id));
      console.log('📡 API响应:', { 
        success: response.success, 
        hasData: !!response.data,
        message: response.message 
      });
      
      if (response.success && response.data) {
        const account = response.data;
        console.log('📡 账户数据:', account);
        setAccountInfo(account);

        // 将字符串金额转换为数字
        const newBalance = parseFloat(account.cash) || 0;
        const newFrozenBalance = parseFloat(account.frozen) || 0;
        const newBonusBalance = parseFloat(account.redPack) || 0;
        const newDepositAmount = parseFloat(account.deposit) || 0;

        // 只在成功时更新余额，失败时保留当前值
        console.log('💰 更新余额:', {
          旧余额: balance,
          新余额: newBalance,
          cash: account.cash,
          frozen: account.frozen,
          redPack: account.redPack,
        });
        
        setBalance(newBalance);
        setFrozenBalance(newFrozenBalance);
        setBonusBalance(newBonusBalance);
        setDepositAmount(newDepositAmount);
        // 缓存到本地，避免刷新时闪 0
        if (typeof window !== 'undefined') {
          localStorage.setItem('wallet_balance', String(newBalance));
          localStorage.setItem('wallet_frozen_balance', String(newFrozenBalance));
          localStorage.setItem('wallet_bonus_balance', String(newBonusBalance));
          localStorage.setItem('wallet_deposit_amount', String(newDepositAmount));
        }

        console.log('✅ 余额刷新成功');
      } else {
        console.error('❌ 获取余额失败:', {
          success: response.success,
          message: response.message,
          data: response.data,
          当前余额: balance,
        });
        // 不更新余额，保留当前值
      }
    } catch (error) {
      console.error('❌ 刷新余额异常:', {
        error,
        当前余额: balance,
        userId: currentUser.id,
      });
      // 不更新余额，保留当前值
    } finally {
      isFetchingRef.current = false;
    }
  }, []); // 空依赖数组，使用 ref 访问 user

  // 客户端挂载后从缓存读取余额（避免 hydration 错误）
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasLoadedFromCacheRef.current) {
      hasLoadedFromCacheRef.current = true;
      const cachedBalance = localStorage.getItem('wallet_balance');
      const cachedFrozen = localStorage.getItem('wallet_frozen_balance');
      const cachedBonus = localStorage.getItem('wallet_bonus_balance');
      const cachedDeposit = localStorage.getItem('wallet_deposit_amount');
      
      if (cachedBalance) {
        const val = parseFloat(cachedBalance);
        if (!isNaN(val)) {
          console.log('📦 从缓存恢复余额:', val);
          setBalance(val);
        }
      }
      if (cachedFrozen) {
        const val = parseFloat(cachedFrozen);
        if (!isNaN(val)) {
          setFrozenBalance(val);
        }
      }
      if (cachedBonus) {
        const val = parseFloat(cachedBonus);
        if (!isNaN(val)) {
          setBonusBalance(val);
        }
      }
      if (cachedDeposit) {
        const val = parseFloat(cachedDeposit);
        if (!isNaN(val)) {
          setDepositAmount(val);
        }
      }
    }
  }, []);

  // 初始化时加载余额 - 等待用户初始化完成
  useEffect(() => {
    if (user && isInitialized) {
      console.log('🔄 WalletContext: 用户已初始化，开始刷新余额...', user.id);
      refreshBalance();
    } else if (user && !isInitialized) {
      console.log('⏳ WalletContext: 用户已登录但后端未初始化，等待中...', user.id);
    }
  }, [user, isInitialized, refreshBalance]);
  
  // 添加调试日志：监控余额变化
  useEffect(() => {
    if (balance > 0 || frozenBalance > 0 || bonusBalance > 0) {
      console.log('💰 余额状态更新:', { balance, frozenBalance, bonusBalance });
    }
  }, [balance, frozenBalance, bonusBalance]);

  // 充值
  const deposit = useCallback(
    async (amount: number, method: string) => {
      if (!user) {
        console.error('用户未登录');
        return false;
      }

      try {
        console.log('充值:', amount, method);

        // 调用后端充值接口
        const response = await apiService.rechargeAccount(String(user.id), String(amount));

        if (response.success) {
          console.log('充值成功');

          // 刷新余额
          await refreshBalance();

          return true;
        } else {
          console.error('充值失败:', response.message);
          return false;
        }
      } catch (error) {
        console.error('充值失败:', error);
        return false;
      }
    },
    [user, refreshBalance]
  );

  // 提现
  const withdraw = useCallback(
    async (amount: number, address: string) => {
      if (!user) {
        console.error('用户未登录');
        return false;
      }

      console.log('提现:', amount, address);

      // TODO: 后端暂无提现接口，这里仅做模拟
      // 等待后端提供提现接口后再实现

      // 模拟提现成功
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 刷新余额
      await refreshBalance();

      return true;
    },
    [user, refreshBalance]
  );

  return (
    <WalletContext.Provider
      value={{
        balance,
        frozenBalance,
        bonusBalance,
        depositAmount,
        accountInfo,
        setBalance,
        setFrozenBalance,
        setBonusBalance,
        refreshBalance,
        deposit,
        withdraw,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
