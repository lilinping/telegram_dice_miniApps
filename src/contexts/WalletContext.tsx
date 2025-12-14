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
  const [balance, setBalance] = useState(0);
  const [frozenBalance, setFrozenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [accountInfo, setAccountInfo] = useState<AccountModel | null>(null);
  const isFetchingRef = useRef(false);

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
      console.log('📡 开始请求余额...', currentUser.id);
      const response = await apiService.queryAccount(String(currentUser.id));
      if (response.success && response.data) {
        const account = response.data;
        setAccountInfo(account);

        // 将字符串金额转换为数字
        setBalance(parseFloat(account.cash) || 0);
        setFrozenBalance(parseFloat(account.frozen) || 0);
        setBonusBalance(parseFloat(account.redPack) || 0);
        setDepositAmount(parseFloat(account.deposit) || 0);

        console.log('✅ 余额刷新成功:', account);
      } else {
        console.error('❌ 获取余额失败:', response.message);
      }
    } catch (error) {
      console.error('❌ 刷新余额失败:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, []); // 空依赖数组，使用 ref 访问 user

  // 初始化时加载余额 - 等待用户初始化完成
  useEffect(() => {
    if (user && isInitialized) {
      console.log('🔄 WalletContext: 用户已初始化，开始刷新余额...', user.id);
      refreshBalance();
    } else if (user && !isInitialized) {
      console.log('⏳ WalletContext: 用户已登录但后端未初始化，等待中...', user.id);
    } else if (user) {
      // 即使 isInitialized 为 false，也尝试刷新余额（可能后端初始化很快）
      console.log('🔄 WalletContext: 用户已登录，尝试刷新余额...', user.id);
      refreshBalance();
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
