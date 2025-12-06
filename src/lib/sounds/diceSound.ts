/**
 * 骰子声效系统
 * 使用Howler.js管理音效
 */

import { Howl } from 'howler';

export class DiceSoundManager {
  private sounds: Map<string, Howl> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.loadSounds();
  }

  /**
   * 加载所有音效
   */
  private loadSounds() {
    // 摇盅摩擦声（循环）
    this.sounds.set('cup_shake', new Howl({
      src: ['/sounds/cup-shake.mp3', '/sounds/cup-shake.ogg'],
      loop: true,
      volume: this.volume * 0.6,
      onloaderror: () => {
        console.warn('摇盅音效加载失败，使用静音模式');
      },
    }));

    // 骰子碰撞声
    this.sounds.set('dice_collision', new Howl({
      src: ['/sounds/dice-collision.mp3', '/sounds/dice-collision.ogg'],
      volume: this.volume * 0.8,
      onloaderror: () => {
        console.warn('碰撞音效加载失败，使用静音模式');
      },
    }));

    // 筛盅落下声
    this.sounds.set('cup_drop', new Howl({
      src: ['/sounds/cup-drop.mp3', '/sounds/cup-drop.ogg'],
      volume: this.volume,
      onloaderror: () => {
        console.warn('落盅音效加载失败，使用静音模式');
      },
    }));

    // 抬盅声
    this.sounds.set('cup_lift', new Howl({
      src: ['/sounds/cup-lift.mp3', '/sounds/cup-lift.ogg'],
      volume: this.volume * 0.7,
      onloaderror: () => {
        console.warn('抬盅音效加载失败，使用静音模式');
      },
    }));

    // 结果展示音效
    this.sounds.set('result_show', new Howl({
      src: ['/sounds/result-show.mp3', '/sounds/result-show.ogg'],
      volume: this.volume * 0.9,
      onloaderror: () => {
        console.warn('结果音效加载失败，使用静音模式');
      },
    }));
  }

  /**
   * 播放摇盅声（循环）
   */
  public playCupShake() {
    if (!this.enabled) return;
    const sound = this.sounds.get('cup_shake');
    if (sound && !sound.playing()) {
      sound.play();
    }
  }

  /**
   * 停止摇盅声
   */
  public stopCupShake() {
    const sound = this.sounds.get('cup_shake');
    if (sound) {
      sound.fade(sound.volume(), 0, 300); // 淡出
      setTimeout(() => sound.stop(), 300);
    }
  }

  /**
   * 播放骰子碰撞声
   * @param intensity 碰撞强度（0-1）
   */
  public playDiceCollision(intensity: number = 1) {
    if (!this.enabled) return;
    const sound = this.sounds.get('dice_collision');
    if (sound) {
      // 根据强度调整音量和音调
      const volume = Math.min(intensity * this.volume * 0.8, 1);
      const rate = 0.8 + Math.random() * 0.4; // 随机音调变化
      
      sound.volume(volume);
      sound.rate(rate);
      sound.play();
    }
  }

  /**
   * 播放落盅声
   */
  public playCupDrop() {
    if (!this.enabled) return;
    const sound = this.sounds.get('cup_drop');
    if (sound) {
      sound.play();
    }
  }

  /**
   * 播放抬盅声
   */
  public playCupLift() {
    if (!this.enabled) return;
    const sound = this.sounds.get('cup_lift');
    if (sound) {
      sound.play();
    }
  }

  /**
   * 播放结果展示音效
   */
  public playResultShow() {
    if (!this.enabled) return;
    const sound = this.sounds.get('result_show');
    if (sound) {
      sound.play();
    }
  }

  /**
   * 设置音量
   * @param volume 音量（0-1）
   */
  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume(this.volume);
    });
  }

  /**
   * 启用/禁用音效
   */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * 停止所有音效
   */
  public stopAll() {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }

  /**
   * 清理资源
   */
  public dispose() {
    this.sounds.forEach((sound) => {
      sound.unload();
    });
    this.sounds.clear();
  }
}

/**
 * 创建简单的音效（如果没有音频文件）
 * 使用Web Audio API生成基础音效
 */
export class SimpleSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * 播放简单的碰撞声
   */
  public playCollision(intensity: number = 1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 白噪声效果
    oscillator.type = 'square';
    oscillator.frequency.value = 100 + Math.random() * 200;

    gainNode.gain.setValueAtTime(intensity * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * 播放简单的落地声
   */
  public playDrop() {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }
}
