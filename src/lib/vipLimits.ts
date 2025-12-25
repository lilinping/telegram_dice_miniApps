/**
 * VIP等级和下注限制工具函数
 */

export interface VIPLevel {
  level: number;
  name: string;
  icon: string;
  color: string;
  requiredAmount: number;
  benefits: {
    withdrawFee: string;
    betLimit: string;
    dailyBonus: string;
    support: string;
    birthday: string;
    other: string;
  };
}

// 