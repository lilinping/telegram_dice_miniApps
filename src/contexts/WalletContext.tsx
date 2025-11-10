'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface WalletContextType {
  // 余额
  balance: number;
  frozenBalance: number;
  bonusBalance: number;

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
  const [balance, setBalance] = useState(1000.0); // 模拟初始余额
  const [frozenBalance, setFrozenBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(50.0);

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    // TODO: 从后端获取最新余额
    console.log('刷新余额');

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 这里应该从后端获取真实余额
    // const response = await fetch('/api/wallet/balance');
    // const data = await response.json();
    // setBalance(data.balance);
  }, []);

  // 充值
  const deposit = useCallback(async (amount: number, method: string) => {
    console.log('充值:', amount, method);

    // TODO: 调用充值API
    // const response = await fetch('/api/wallet/deposit', {
    //   method: 'POST',
    //   body: JSON.stringify({ amount, method }),
    // });

    // 模拟充值成功
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setBalance((prev) => prev + amount);

    return true;
  }, []);

  // 提现
  const withdraw = useCallback(async (amount: number, address: string) => {
    console.log('提现:', amount, address);

    // TODO: 调用提现API
    // const response = await fetch('/api/wallet/withdraw', {
    //   method: 'POST',
    //   body: JSON.stringify({ amount, address }),
    // });

    // 模拟提现成功
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setBalance((prev) => prev - amount);

    return true;
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balance,
        frozenBalance,
        bonusBalance,
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
