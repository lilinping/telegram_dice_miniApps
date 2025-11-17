'use client';

/**
 * 骰子图标组件 - 专业赌场风格
 *
 * 支持1-6点的骰子显示，使用点阵布局
 * 可自定义大小、颜色、边框
 */

interface DiceIconProps {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dotColor?: string;
  bgColor?: string;
  borderColor?: string;
  className?: string;
}

export default function DiceIcon({
  value,
  size = 'md',
  dotColor = '#FFFFFF',
  bgColor = '#C40000',
  borderColor = 'rgba(0, 0, 0, 0.25)',
  className = '',
}: DiceIconProps) {
  // 尺寸映射
  const sizes = {
    xs: { container: 20, dot: 3 },
    sm: { container: 28, dot: 4 },
    md: { container: 36, dot: 5 },
    lg: { container: 48, dot: 6 },
  };

  const { container, dot } = sizes[size];

  // 骰子点位布局 (9宫格坐标系)
  const dotPositions: Record<number, [number, number][]> = {
    1: [[1, 1]], // 中心
    2: [[0, 0], [2, 2]], // 左上、右下
    3: [[0, 0], [1, 1], [2, 2]], // 左上、中心、右下
    4: [[0, 0], [0, 2], [2, 0], [2, 2]], // 四个角
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], // 四角 + 中心
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]], // 左右两列
  };

  const dots = dotPositions[value];

  // 计算点的位置（基于3x3网格）
  const getDotPosition = (row: number, col: number) => {
    const gap = (container - dot) / 3;
    return {
      left: gap * (col + 0.5),
      top: gap * (row + 0.5),
    };
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded ${className}`}
      style={{
        width: container,
        height: container,
        background: bgColor,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.35)',
      }}
    >
      {dots.map(([row, col], index) => {
        const pos = getDotPosition(row, col);
        return (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              width: dot,
              height: dot,
              left: pos.left,
              top: pos.top,
              transform: 'translate(-50%, -50%)',
              backgroundColor: dotColor,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * 两骰组合图标 - 显示两个骰子
 */
export function DoubleDiceIcon({
  value1,
  value2,
  size = 'sm',
  className = '',
}: {
  value1: 1 | 2 | 3 | 4 | 5 | 6;
  value2: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={`flex gap-1 items-center justify-center ${className}`}>
      <DiceIcon value={value1} size={size} />
      <DiceIcon value={value2} size={size} />
    </div>
  );
}
