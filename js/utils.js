/**
 * 工具函数库
 * Utility Functions
 */

// ==================== 本地存储工具 ====================
const Storage = {
  // 设置数据
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  // 获取数据
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  // 清空所有数据
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  }
};

// ==================== 数字格式化工具 ====================
const NumberUtils = {
  // 格式化金额（千分位）
  formatMoney(amount, decimals = 2) {
    if (isNaN(amount)) return '0.00';
    const num = parseFloat(amount);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  // 格式化简短数字（1K, 1M等）
  formatShort(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // 生成随机整数
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // 生成随机数组元素
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};

// ==================== 日期时间工具 ====================
const DateUtils = {
  // 格式化日期时间
  format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 相对时间（如：3分钟前）
  relative(date) {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  // 倒计时格式化
  countdown(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
};

// ==================== DOM操作工具 ====================
const DomUtils = {
  // 查询元素
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  // 查询多个元素
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },

  // 创建元素
  create(tag, options = {}) {
    const el = document.createElement(tag);

    if (options.class) el.className = options.class;
    if (options.id) el.id = options.id;
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
      });
    }
    if (options.style) {
      Object.assign(el.style, options.style);
    }
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        el.addEventListener(event, handler);
      });
    }

    return el;
  },

  // 添加类
  addClass(el, className) {
    if (!el) return;
    el.classList.add(...className.split(' '));
  },

  // 移除类
  removeClass(el, className) {
    if (!el) return;
    el.classList.remove(...className.split(' '));
  },

  // 切换类
  toggleClass(el, className) {
    if (!el) return;
    el.classList.toggle(className);
  },

  // 显示元素
  show(el, display = 'block') {
    if (!el) return;
    el.style.display = display;
  },

  // 隐藏元素
  hide(el) {
    if (!el) return;
    el.style.display = 'none';
  },

  // 移除元素
  remove(el) {
    if (!el) return;
    el.remove();
  }
};

// ==================== Toast通知工具 ====================
const Toast = {
  show(message, type = 'info', duration = 3000) {
    // 移除已存在的toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    // 创建toast元素
    const toast = DomUtils.create('div', {
      class: `toast toast-${type}`,
      html: `
        <span class="toast-icon">${this.getIcon(type)}</span>
        <span class="toast-message">${message}</span>
      `
    });

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

// ==================== 模态框工具 ====================
const Modal = {
  // 显示模态框
  show(options = {}) {
    const {
      title = '提示',
      content = '',
      onConfirm = null,
      onCancel = null,
      confirmText = '确定',
      cancelText = '取消',
      showCancel = true
    } = options;

    // 移除已存在的模态框
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    // 创建模态框
    const overlay = DomUtils.create('div', {
      class: 'modal-overlay',
      html: `
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-footer">
            ${showCancel ? `<button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>` : ''}
            <button class="btn btn-primary modal-confirm-btn">${confirmText}</button>
          </div>
        </div>
      `
    });

    document.body.appendChild(overlay);

    // 绑定事件
    const modal = overlay.querySelector('.modal');
    const closeBtn = modal.querySelector('.modal-close');
    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    const cancelBtn = modal.querySelector('.modal-cancel-btn');

    const close = () => {
      overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
      setTimeout(() => overlay.remove(), 200);
    };

    closeBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      close();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        close();
      });
    }

    confirmBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      close();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (onCancel) onCancel();
        close();
      }
    });

    return { close };
  },

  // 确认对话框
  confirm(message, onConfirm, onCancel) {
    return this.show({
      title: '确认',
      content: `<p style="text-align: center; padding: 20px 0;">${message}</p>`,
      onConfirm,
      onCancel
    });
  },

  // 警告对话框
  alert(message, onConfirm) {
    return this.show({
      title: '提示',
      content: `<p style="text-align: center; padding: 20px 0;">${message}</p>`,
      onConfirm,
      showCancel: false
    });
  }
};

// ==================== 加载动画工具 ====================
const Loading = {
  show(message = '加载中...') {
    // 移除已存在的加载
    const existing = document.querySelector('.loading-overlay');
    if (existing) existing.remove();

    const overlay = DomUtils.create('div', {
      class: 'loading-overlay',
      html: `
        <div class="loader loader-lg"></div>
        <div class="loading-text">${message}</div>
      `
    });

    document.body.appendChild(overlay);
  },

  hide() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
      setTimeout(() => overlay.remove(), 200);
    }
  }
};

// ==================== URL参数工具 ====================
const UrlUtils = {
  // 获取URL参数
  getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  // 获取所有参数
  getAllParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // 设置URL参数（不刷新页面）
  setParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  },

  // 删除URL参数
  removeParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
  }
};

// ==================== 复制到剪贴板 ====================
const ClipboardUtils = {
  async copy(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        Toast.success('已复制到剪贴板');
        return true;
      } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (success) {
          Toast.success('已复制到剪贴板');
        } else {
          Toast.error('复制失败');
        }
        return success;
      }
    } catch (err) {
      console.error('Copy error:', err);
      Toast.error('复制失败');
      return false;
    }
  }
};

// ==================== 设备信息检测 ====================
const DeviceUtils = {
  // 是否移动设备
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // 是否iOS
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  // 是否Android
  isAndroid() {
    return /Android/.test(navigator.userAgent);
  },

  // 获取屏幕尺寸
  getScreenSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  },

  // 是否支持触摸
  hasTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // 触觉反馈（仅支持部分设备）
  vibrate(duration = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
};

// ==================== 防抖和节流 ====================
const ThrottleUtils = {
  // 防抖
  debounce(func, delay = 300) {
    let timer = null;
    return function(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  },

  // 节流
  throttle(func, delay = 300) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        func.apply(this, args);
      }
    };
  }
};

// ==================== 验证工具 ====================
const ValidateUtils = {
  // 验证邮箱
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // 验证手机号（简单验证）
  isPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  // 验证数字
  isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // 验证正整数
  isPositiveInteger(value) {
    return /^\d+$/.test(value) && parseInt(value) > 0;
  },

  // 验证金额（最多2位小数）
  isAmount(value) {
    return /^\d+(\.\d{1,2})?$/.test(value);
  },

  // 验证钱包地址（简单验证）
  isWalletAddress(address) {
    return /^[a-zA-Z0-9]{20,}$/.test(address);
  }
};

// ==================== 动画工具 ====================
const AnimationUtils = {
  // 数字滚动动画
  numberRoll(element, endValue, duration = 1000) {
    const startValue = parseFloat(element.textContent) || 0;
    const diff = endValue - startValue;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = startValue + diff * progress;

      element.textContent = NumberUtils.formatMoney(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = NumberUtils.formatMoney(endValue);
      }
    };

    animate();
  },

  // 淡入动画
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);

      element.style.opacity = opacity;

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  // 淡出动画
  fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(initialOpacity * (1 - progress / duration), 0);

      element.style.opacity = opacity;

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };

    requestAnimationFrame(animate);
  }
};

// ==================== 导出所有工具 ====================
window.Utils = {
  Storage,
  NumberUtils,
  DateUtils,
  DomUtils,
  Toast,
  Modal,
  Loading,
  UrlUtils,
  ClipboardUtils,
  DeviceUtils,
  ThrottleUtils,
  ValidateUtils,
  AnimationUtils
};

// 添加淡出动画的CSS关键帧（如果尚未定义）
if (!document.querySelector('#fadeOutKeyframes')) {
  const style = document.createElement('style');
  style.id = 'fadeOutKeyframes';
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);
}
