import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 音效类型定义
 */
export type SoundType =
  | 'dice-roll'      // 骰子滚动声
  | 'dice-land'      // 骰子落地声
  | 'bet-click'      // 下注点击
  | 'chip-select'    // 筹码选择
  | 'win-small'      // 小额中奖
  | 'win-big'        // 大额中奖
  | 'round-start';   // 开盘提示

/**
 * 音效文件路径映射
 */
const SOUND_PATHS: Record<SoundType, string> = {
  'dice-roll': '/sounds/dice-roll.mp3',
  'dice-land': '/sounds/dice-land.mp3',
  'bet-click': '/sounds/bet-click.mp3',
  'chip-select': '/sounds/chip-select.mp3',
  'win-small': '/sounds/win-small.mp3',
  'win-big': '/sounds/win-big.mp3',
  'round-start': '/sounds/round-start.mp3',
};

/**
 * 音效管理 Hook
 *
 * 功能：
 * 1. 按需加载音效文件
 * 2. 支持音效开关
 * 3. 防止音效重叠
 * 4. 自动内存管理
 */
export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const playingAudios = useRef<Set<HTMLAudioElement>>(new Set());

  /**
   * 预加载音效文件
   */
  const preloadSound = useCallback((type: SoundType) => {
    if (audioCache.current.has(type)) {
      return;
    }

    const audio = new Audio(SOUND_PATHS[type]);
    audio.preload = 'auto';
    audioCache.current.set(type, audio);
  }, []);

  /**
   * 播放音效
   */
  const playSound = useCallback((type: SoundType, options?: { loop?: boolean; volume?: number }) => {
    if (!enabled) return;

    let audio = audioCache.current.get(type);

    // 如果未加载，先加载
    if (!audio) {
      audio = new Audio(SOUND_PATHS[type]);
      audioCache.current.set(type, audio);
    }

    // 设置音量
    if (options?.volume !== undefined) {
      audio.volume = Math.max(0, Math.min(1, options.volume));
    } else {
      audio.volume = 0.5; // 默认音量 50%
    }

    // 设置循环
    audio.loop = options?.loop || false;

    // 从头播放
    audio.currentTime = 0;

    // 播放音效
    const playPromise = audio.play();

    if (playPromise) {
      playPromise
        .then(() => {
          playingAudios.current.add(audio!);
        })
        .catch((error) => {
          console.warn(`Failed to play sound: ${type}`, error);
        });

      // 播放结束后清理
      audio.onended = () => {
        playingAudios.current.delete(audio!);
      };
    }

    return audio;
  }, [enabled]);

  /**
   * 停止音效
   */
  const stopSound = useCallback((type: SoundType) => {
    const audio = audioCache.current.get(type);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      playingAudios.current.delete(audio);
    }
  }, []);

  /**
   * 停止所有音效
   */
  const stopAllSounds = useCallback(() => {
    playingAudios.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    playingAudios.current.clear();
  }, []);

  /**
   * 切换音效开关
   */
  const toggleSound = useCallback(() => {
    setEnabled((prev) => {
      const newValue = !prev;
      if (!newValue) {
        stopAllSounds();
      }
      // 保存到本地存储
      if (typeof window !== 'undefined') {
        localStorage.setItem('sound-enabled', String(newValue));
      }
      return newValue;
    });
  }, [stopAllSounds]);

  /**
   * 从本地存储恢复设置
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sound-enabled');
      if (saved !== null) {
        setEnabled(saved === 'true');
      }
    }
  }, []);

  /**
   * 清理资源
   */
  useEffect(() => {
    return () => {
      stopAllSounds();
      audioCache.current.clear();
    };
  }, [stopAllSounds]);

  return {
    enabled,
    playSound,
    stopSound,
    stopAllSounds,
    toggleSound,
    preloadSound,
  };
}

/**
 * 游戏音效快捷方法
 */
export function useGameSounds() {
  const { playSound, enabled, toggleSound } = useSound();

  const playBetClick = useCallback(() => {
    playSound('bet-click', { volume: 0.3 });
  }, [playSound]);

  const playChipSelect = useCallback(() => {
    playSound('chip-select', { volume: 0.4 });
  }, [playSound]);

  const playRoundStart = useCallback(() => {
    playSound('round-start', { volume: 0.6 });
  }, [playSound]);

  const playDiceRoll = useCallback(() => {
    return playSound('dice-roll', { loop: true, volume: 0.5 });
  }, [playSound]);

  const playDiceLand = useCallback(() => {
    playSound('dice-land', { volume: 0.7 });
  }, [playSound]);

  const playWinSmall = useCallback(() => {
    playSound('win-small', { volume: 0.6 });
  }, [playSound]);

  const playWinBig = useCallback(() => {
    playSound('win-big', { volume: 0.8 });
  }, [playSound]);

  return {
    enabled,
    toggleSound,
    playBetClick,
    playChipSelect,
    playRoundStart,
    playDiceRoll,
    playDiceLand,
    playWinSmall,
    playWinBig,
  };
}
