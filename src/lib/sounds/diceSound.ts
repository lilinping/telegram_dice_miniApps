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
 * 需求文档：摇盅摩擦声、骰子碰撞声、筛盅落下声
 */
export class SimpleSoundGenerator {
  private audioContext: AudioContext | null = null;
  private collisionBuffer: AudioBuffer | null = null;
  private dropBuffer: AudioBuffer | null = null;
  private shakeBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initBuffers();
    }
  }

  /**
   * 初始化音频缓冲区
   */
  private async initBuffers() {
    if (!this.audioContext) return;

    try {
      // 创建碰撞声缓冲区（需求文档：骰子碰撞声）
      this.collisionBuffer = this.createCollisionBuffer();
      
      // 创建落地声缓冲区（需求文档：筛盅落下声，重低频"砰"声）
      this.dropBuffer = this.createDropBuffer();
      
      // 创建摇盅声缓冲区（需求文档：摇盅摩擦声）
      this.shakeBuffer = this.createShakeBuffer();
    } catch (error) {
      console.warn('Failed to initialize audio buffers:', error);
    }
  }

  /**
   * 创建碰撞声缓冲区（需求文档：骰子碰撞声，物理事件触发）
   */
  private createCollisionBuffer(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // 生成碰撞声（短促的噪声）
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // 白噪声 + 衰减包络
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.3;
    }

    return buffer;
  }

  /**
   * 创建落地声缓冲区（需求文档：筛盅落下声，重低频"砰"声）
   */
  private createDropBuffer(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3; // 300ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // 生成重低频"砰"声
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // 低频正弦波 + 噪声 + 衰减
      const freq = 50 + t * 20; // 从50Hz到70Hz
      const noise = (Math.random() * 2 - 1) * 0.1;
      const envelope = Math.exp(-t * 5);
      data[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * envelope * 0.5;
    }

    return buffer;
  }

  /**
   * 创建摇盅声缓冲区（需求文档：摇盅摩擦声，摇盅阶段循环）
   */
  private createShakeBuffer(): AudioBuffer {
    if (!this.audioContext) return null as any;
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5; // 500ms循环
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // 生成摩擦声（中频噪声 + 轻微调制）
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // 带调制的噪声
      const modulation = Math.sin(2 * Math.PI * 5 * t); // 5Hz调制
      const noise = (Math.random() * 2 - 1) * 0.3;
      data[i] = noise * (0.5 + 0.5 * modulation);
    }

    return buffer;
  }

  /**
   * 播放碰撞声（需求文档：骰子碰撞声，物理事件触发，设置阈值）
   */
  public playCollision(intensity: number = 1) {
    if (!this.audioContext || !this.collisionBuffer) return;

    // 需求文档：设置阈值，只有强度足够才播放
    if (intensity < 0.3) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = this.collisionBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 根据强度调整音量
    gainNode.gain.value = Math.min(intensity * 0.5, 0.8);
    
    // 随机音调变化
    source.playbackRate.value = 0.8 + Math.random() * 0.4;

    source.start();
    source.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * 播放落地声（需求文档：筛盅落下声，重低频"砰"声）
   */
  public playDrop() {
    if (!this.audioContext || !this.dropBuffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = this.dropBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.value = 0.6;

    source.start();
    source.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * 播放摇盅摩擦声（需求文档：摇盅摩擦声，摇盅阶段循环）
   */
  public playShake(loop: boolean = true) {
    if (!this.audioContext || !this.shakeBuffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = this.shakeBuffer;
    source.loop = loop;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.value = 0.4;

    source.start();
    
    return { source, gainNode };
  }

  /**
   * 停止摇盅摩擦声
   */
  public stopShake(source?: AudioBufferSourceNode) {
    if (source) {
      try {
        source.stop();
      } catch (error) {
        // 忽略已停止的错误
      }
    }
  }
}
