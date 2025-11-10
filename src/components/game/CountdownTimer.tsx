'use client';

import { useGame } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';

/**
 * 倒计时组件
 *
 * 功能：
 * 1. 显示剩余下注时间
 * 2. 最后5秒变红并闪烁
 * 3. 倒计时归零后显示"开奖中"
 * 4. 每秒缩放脉冲动画
 */

export default function CountdownTimer() {
  const { countdown, gameState } = useGame();

  // 判断是否进入警告阶段（最后5秒）
  const isWarning = countdown <= 5 && countdown > 0;
  const isEnded = countdown === 0 || gameState !== 'betting';

  // 格式化倒计时显示
  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0');
  };

  return (
    <div className="flex flex-col items-center">
      {/* 倒计时数字 */}
      <div
        className={cn(
          'font-mono font-bold transition-all duration-200',
          // 正常状态
          !isWarning && !isEnded && 'text-4xl text-white',
          // 警告状态（最后5秒）
          isWarning && 'text-5xl text-error animate-pulse-fast',
          // 结束状态
          isEnded && 'text-3xl text-primary-gold'
        )}
      >
        {isEnded ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            <span>开奖中</span>
          </span>
        ) : (
          <span className={cn(
            'inline-block',
            countdown > 0 && 'animate-scale-pulse'
          )}>
            {formatTime(countdown)}
          </span>
        )}
      </div>

      {/* 倒计时标签 */}
      {!isEnded && (
        <div className="mt-1 text-xs text-text-secondary">
          {isWarning ? '即将封盘' : '剩余时间'}
        </div>
      )}

      {/* 进度条（可选） */}
      {!isEnded && (
        <div className="mt-2 w-20 h-1 bg-bg-medium rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-1000 ease-linear',
              isWarning ? 'bg-error' : 'bg-primary-gold'
            )}
            style={{
              width: `${(countdown / 30) * 100}%`, // 假设总时长30秒
            }}
          />
        </div>
      )}
    </div>
  );
}
