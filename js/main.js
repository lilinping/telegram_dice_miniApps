/**
 * 全局主逻辑
 * Main Global Logic
 */

// ==================== 应用状态管理 ====================
const AppState = {
  user: {
    id: null,
    nickname: '玩家',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    balance: 1000.00,
    frozen: 0,
    bonus: 0,
    vipLevel: 0
  },

  game: {
    round: 123456,
    countdown: 30,
    status: 'betting', // betting, drawing, settling
    selectedChip: 100,
    bets: {}, // {cellId: amount}
    lastResults: []
  },

  init() {
    // 尝试从本地存储恢复状态
    const savedUser = Utils.Storage.get('user');
    if (savedUser) {
      this.user = { ...this.user, ...savedUser };
    }

    const savedGame = Utils.Storage.get('game');
    if (savedGame) {
      this.game = { ...this.game, ...savedGame };
    }
  },

  saveUser() {
    Utils.Storage.set('user', this.user);
  },

  saveGame() {
    Utils.Storage.set('game', this.game);
  },

  updateBalance(amount) {
    this.user.balance = parseFloat(this.user.balance) + parseFloat(amount);
    this.saveUser();
    this.renderBalance();
  },

  getTotalBet() {
    return Object.values(this.game.bets).reduce((sum, val) => sum + val, 0);
  },

  renderBalance() {
    const balanceElements = document.querySelectorAll('.balance-amount');
    balanceElements.forEach(el => {
      el.textContent = Utils.NumberUtils.formatMoney(this.user.balance);
    });
  }
};

// ==================== 页面导航 ====================
const Navigation = {
  init() {
    // 设置当前页面的导航高亮
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && href.includes(currentPage.replace('.html', ''))) {
        item.classList.add('active');
      } else if (currentPage === 'index.html' && href && href.includes('game-hall')) {
        item.classList.add('active');
      }
    });

    // 返回按钮
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'game-hall.html';
        }
      });
    });
  },

  goTo(page) {
    window.location.href = page;
  }
};

// ==================== Telegram WebApp集成 ====================
const TelegramApp = {
  init() {
    // 检查是否在Telegram环境中
    if (window.Telegram && window.Telegram.WebApp) {
      const webapp = window.Telegram.WebApp;

      // 展开WebApp
      webapp.ready();
      webapp.expand();

      // 设置主题颜色
      webapp.setHeaderColor('#1A1A1A');
      webapp.setBackgroundColor('#0A0A0A');

      // 获取用户信息
      if (webapp.initDataUnsafe && webapp.initDataUnsafe.user) {
        const user = webapp.initDataUnsafe.user;
        AppState.user.id = user.id;
        AppState.user.nickname = user.first_name || user.username || '玩家';
        if (user.photo_url) {
          AppState.user.avatar = user.photo_url;
        }
        AppState.saveUser();
      }

      // 返回按钮
      webapp.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          Navigation.goTo('game-hall.html');
        }
      });

      // 在非首页显示返回按钮
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage !== 'index.html' && currentPage !== 'game-hall.html') {
        webapp.BackButton.show();
      }
    } else {
      console.log('Not in Telegram environment, using demo mode');
    }
  },

  // 触发触觉反馈
  hapticFeedback(type = 'impact', style = 'medium') {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      if (type === 'impact') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style); // light, medium, heavy
      } else if (type === 'notification') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(style); // error, success, warning
      } else if (type === 'selection') {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      }
    } else {
      // 降级到普通震动
      Utils.DeviceUtils.vibrate(50);
    }
  },

  // 显示主按钮
  showMainButton(text, onClick) {
    if (window.Telegram && window.Telegram.WebApp) {
      const btn = window.Telegram.WebApp.MainButton;
      btn.setText(text);
      btn.onClick(onClick);
      btn.show();
    }
  },

  // 隐藏主按钮
  hideMainButton() {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.MainButton.hide();
    }
  }
};

// ==================== 底部导航栏生成 ====================
function createBottomNav() {
  const navItems = [
    { href: 'game-hall.html', icon: '🎲', label: '首页', id: 'home' },
    { href: 'history.html', icon: '📊', label: '记录', id: 'history' },
    { href: 'leaderboard.html', icon: '🏆', label: '排行', id: 'leaderboard' },
    { href: 'wallet.html', icon: '💰', label: '钱包', id: 'wallet' },
    { href: 'profile.html', icon: '👤', label: '我的', id: 'profile' }
  ];

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';

  navItems.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-item';
    a.innerHTML = `
      <div class="nav-icon">${item.icon}</div>
      <div class="nav-label">${item.label}</div>
    `;
    nav.appendChild(a);
  });

  return nav;
}

// ==================== 初始化应用 ====================
function initApp() {
  // 初始化状态
  AppState.init();

  // 初始化Telegram WebApp
  TelegramApp.init();

  // 初始化导航
  Navigation.init();

  // 添加底部导航（如果页面需要）
  const pageWrapper = document.querySelector('.page-wrapper');
  if (pageWrapper && !document.querySelector('.bottom-nav')) {
    const currentPage = window.location.pathname.split('/').pop();
    // 启动页不需要底部导航
    if (currentPage !== 'index.html') {
      document.body.appendChild(createBottomNav());
      Navigation.init(); // 重新初始化导航高亮
    }
  }

  // 渲染用户信息
  renderUserInfo();

  // 添加全局点击音效（可选）
  addClickSound();

  // 监听在线状态
  monitorOnlineStatus();
}

// ==================== 渲染用户信息 ====================
function renderUserInfo() {
  // 更新所有显示用户信息的地方
  const nicknameElements = document.querySelectorAll('.user-nickname');
  nicknameElements.forEach(el => {
    el.textContent = AppState.user.nickname;
  });

  const avatarElements = document.querySelectorAll('.user-avatar');
  avatarElements.forEach(el => {
    el.src = AppState.user.avatar;
  });

  // 更新余额
  AppState.renderBalance();
}

// ==================== 全局点击音效 ====================
function addClickSound() {
  // 为所有按钮添加点击反馈
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, .bet-cell, .chip');
    if (btn && !btn.disabled && !btn.classList.contains('disabled')) {
      TelegramApp.hapticFeedback('impact', 'light');
    }
  });
}

// ==================== 监听在线状态 ====================
function monitorOnlineStatus() {
  window.addEventListener('online', () => {
    Utils.Toast.success('网络已连接');
  });

  window.addEventListener('offline', () => {
    Utils.Toast.error('网络已断开，请检查您的连接');
  });
}

// ==================== 模拟API请求 ====================
const API = {
  // 基础URL（实际项目中应该是真实的后端API）
  baseURL: '/api',

  // 模拟延迟
  delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // 获取用户信息
  async getUserInfo() {
    await this.delay();
    return {
      success: true,
      data: AppState.user
    };
  },

  // 获取余额
  async getBalance() {
    await this.delay();
    return {
      success: true,
      data: {
        available: AppState.user.balance,
        frozen: AppState.user.frozen,
        bonus: AppState.user.bonus
      }
    };
  },

  // 下注
  async placeBet(bets) {
    await this.delay();
    const total = Object.values(bets).reduce((sum, val) => sum + val, 0);

    if (total > AppState.user.balance) {
      return {
        success: false,
        message: '余额不足'
      };
    }

    AppState.user.balance -= total;
    AppState.user.frozen += total;
    AppState.saveUser();

    return {
      success: true,
      data: {
        orderId: Date.now(),
        round: AppState.game.round,
        bets: bets,
        total: total
      }
    };
  },

  // 开奖
  async drawResult() {
    await this.delay(3000);

    // 模拟骰子结果
    const dice1 = Utils.NumberUtils.randomInt(1, 6);
    const dice2 = Utils.NumberUtils.randomInt(1, 6);
    const dice3 = Utils.NumberUtils.randomInt(1, 6);
    const total = dice1 + dice2 + dice3;

    const result = {
      round: AppState.game.round,
      dice: [dice1, dice2, dice3],
      total: total,
      big: total >= 11 && total <= 17,
      small: total >= 4 && total <= 10,
      odd: total % 2 === 1,
      even: total % 2 === 0,
      triple: dice1 === dice2 && dice2 === dice3
    };

    return {
      success: true,
      data: result
    };
  },

  // 获取交易记录
  async getTransactions(type = 'all', page = 1, limit = 20) {
    await this.delay();

    // 模拟交易数据
    const transactions = [
      {
        id: 1,
        type: 'deposit',
        amount: 100,
        status: 'success',
        desc: '充值',
        time: Date.now() - 3600000
      },
      {
        id: 2,
        type: 'bet',
        amount: -50,
        status: 'success',
        desc: '下注-局号123455',
        time: Date.now() - 1800000
      },
      {
        id: 3,
        type: 'win',
        amount: 100,
        status: 'success',
        desc: '中奖-局号123455',
        time: Date.now() - 1700000
      }
    ];

    return {
      success: true,
      data: {
        list: transactions,
        total: transactions.length,
        page: page
      }
    };
  },

  // 获取历史记录
  async getHistory(page = 1, limit = 20) {
    await this.delay();

    // 模拟历史数据
    const history = [];
    for (let i = 0; i < 20; i++) {
      const round = AppState.game.round - i - 1;
      const dice1 = Utils.NumberUtils.randomInt(1, 6);
      const dice2 = Utils.NumberUtils.randomInt(1, 6);
      const dice3 = Utils.NumberUtils.randomInt(1, 6);
      const total = dice1 + dice2 + dice3;

      history.push({
        round: round,
        dice: [dice1, dice2, dice3],
        total: total,
        big: total >= 11,
        small: total <= 10,
        time: Date.now() - i * 60000
      });
    }

    return {
      success: true,
      data: {
        list: history,
        total: 100,
        page: page
      }
    };
  },

  // 获取排行榜
  async getLeaderboard(type = 'daily') {
    await this.delay();

    // 模拟排行榜数据
    const players = [
      { rank: 1, name: '神秘玩家***', amount: 50000, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
      { rank: 2, name: '幸运玩家***', amount: 35000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { rank: 3, name: '高手玩家***', amount: 28000, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
      { rank: 4, name: '大神玩家***', amount: 22000, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
      { rank: 5, name: '土豪玩家***', amount: 18000, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
    ];

    return {
      success: true,
      data: {
        list: players,
        myRank: 15,
        myAmount: 1000
      }
    };
  }
};

// ==================== 页面加载完成后初始化 ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ==================== 导出全局对象 ====================
window.AppState = AppState;
window.Navigation = Navigation;
window.TelegramApp = TelegramApp;
window.API = API;
