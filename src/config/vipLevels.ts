export interface VipLevel {
  level: number
  name: string
  icon: string
  color: string
  requiredAmount: number
  benefits: {
    withdrawFee: string
    betLimit: string
    dailyBonus: string
    support: string
    birthday: string
    other: string
  }
}

export const vipLevels: VipLevel[] = [
  {
    level: 0,
    name: '普通用户',
    icon: '👤',
    color: '#808080',
    requiredAmount: 0,
    benefits: {
      withdrawFee: '2%',
      betLimit: '10,000 USDT',
      dailyBonus: '10 USDT',
      support: '普通客服',
      birthday: '无',
      other: '基础权益',
    },
  },
  {
    level: 1,
    name: 'VIP会员',
    icon: '⭐',
    color: '#FFD700',
    requiredAmount: 1000,
    benefits: {
      withdrawFee: '1.5%',
      betLimit: '20,000 USDT',
      dailyBonus: '20 USDT',
      support: '优先客服',
      birthday: '50 USDT',
      other: '周返水0.5%',
    },
  },
  {
    level: 2,
    name: '白银',
    icon: '🥈',
    color: '#C0C0C0',
    requiredAmount: 3000,
    benefits: {
      withdrawFee: '1%',
      betLimit: '50,000 USDT',
      dailyBonus: '50 USDT',
      support: '专属客服',
      birthday: '100 USDT',
      other: '周返水1%',
    },
  },
  {
    level: 3,
    name: '黄金',
    icon: '🥇',
    color: '#FFD700',
    requiredAmount: 5000,
    benefits: {
      withdrawFee: '0.8%',
      betLimit: '100,000 USDT',
      dailyBonus: '100 USDT',
      support: '专属经理',
      birthday: '200 USDT',
      other: '周返水1.5%',
    },
  },
  {
    level: 4,
    name: '铂金',
    icon: '💎',
    color: '#E5E4E2',
    requiredAmount: 10000,
    benefits: {
      withdrawFee: '0.5%',
      betLimit: '200,000 USDT',
      dailyBonus: '200 USDT',
      support: '专属经理24/7',
      birthday: '500 USDT',
      other: '周返水2%',
    },
  },
  {
    level: 5,
    name: '钻石',
    icon: '💠',
    color: '#B9F2FF',
    requiredAmount: 50000,
    benefits: {
      withdrawFee: '0%',
      betLimit: '无限制',
      dailyBonus: '500 USDT',
      support: '专属团队',
      birthday: '1,000 USDT',
      other: '周返水3%',
    },
  },
]

export const getVipLevelByDeposit = (depositAmount: number | null | undefined): VipLevel => {
  if (!depositAmount || depositAmount <= 0) {
    return vipLevels[0]
  }

  // 找到满足充值要求的最高等级
  for (let i = vipLevels.length - 1; i >= 0; i -= 1) {
    if (depositAmount >= vipLevels[i].requiredAmount) {
      return vipLevels[i]
    }
  }

  return vipLevels[0]
}
