'use client';

import { useGame } from '@/contexts/GameContext';
import BetCell from './BetCell';
import DiceIcon, { DoubleDiceIcon } from './DiceIcon';

/**
 * 投注面板组件 V2.0 - 专业赌场布局
 *
 * 完整骰宝投注类型：
 * 1. 大/小/单/双（4种，赔率1:1）
 * 2. 点数4-17（14种，赔率6:1~60:1）
 * 3. 任意三同号、指定三同号（2种，赔率30:1和180:1）
 * 4. 两骰组合（15种，赔率6:1）- 显示骰子图案
 * 5. 单骰号1-6（6种，赔率1/2/3:1）- 显示骰子图案
 *
 * 布局参考澳门/新加坡赌场标准
 */

interface BetPanelProps {
  disabled?: boolean;
}

// 投注类型定义
const betTypes = {
  // 大小单双
  bigSmall: [
    { id: 'big', name: '大', desc: '11-17', odds: '1:1', icon: '⬆️' },
    { id: 'small', name: '小', desc: '4-10', odds: '1:1', icon: '⬇️' },
    { id: 'odd', name: '单', desc: 'ODD', odds: '1:1', icon: '1️⃣' },
    { id: 'even', name: '双', desc: 'EVEN', odds: '1:1', icon: '2️⃣' },
  ],

  // 点数4-10
  numbersLow: [
    { id: 'num-4', name: '4', odds: '60:1' },
    { id: 'num-5', name: '5', odds: '30:1' },
    { id: 'num-6', name: '6', odds: '18:1' },
    { id: 'num-7', name: '7', odds: '12:1' },
    { id: 'num-8', name: '8', odds: '8:1' },
    { id: 'num-9', name: '9', odds: '7:1' },
    { id: 'num-10', name: '10', odds: '6:1' },
  ],

  // 点数11-17
  numbersHigh: [
    { id: 'num-11', name: '11', odds: '6:1' },
    { id: 'num-12', name: '12', odds: '7:1' },
    { id: 'num-13', name: '13', odds: '8:1' },
    { id: 'num-14', name: '14', odds: '12:1' },
    { id: 'num-15', name: '15', odds: '18:1' },
    { id: 'num-16', name: '16', odds: '30:1' },
    { id: 'num-17', name: '17', odds: '60:1' },
  ],

  // 特殊投注
  special: [
    { id: 'any-triple', name: '任意三同号', desc: '任意', odds: '30:1', icon: '🎲🎲🎲' },
    { id: 'specific-triple', name: '指定三同号', desc: '指定', odds: '180:1', icon: '🎯' },
  ],

  // 两骰组合（15种）- 带骰子点数
  pairs: [
    { id: 'pair-1-2', name: '1-2', odds: '6:1', dice: [1, 2] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-3', name: '1-3', odds: '6:1', dice: [1, 3] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-4', name: '1-4', odds: '6:1', dice: [1, 4] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-5', name: '1-5', odds: '6:1', dice: [1, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-6', name: '1-6', odds: '6:1', dice: [1, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-3', name: '2-3', odds: '6:1', dice: [2, 3] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-4', name: '2-4', odds: '6:1', dice: [2, 4] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-5', name: '2-5', odds: '6:1', dice: [2, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-6', name: '2-6', odds: '6:1', dice: [2, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-3-4', name: '3-4', odds: '6:1', dice: [3, 4] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-3-5', name: '3-5', odds: '6:1', dice: [3, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-3-6', name: '3-6', odds: '6:1', dice: [3, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-4-5', name: '4-5', odds: '6:1', dice: [4, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-4-6', name: '4-6', odds: '6:1', dice: [4, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-5-6', name: '5-6', odds: '6:1', dice: [5, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
  ],

  // 单骰号 - 带骰子点数
  single: [
    { id: 'single-1', name: '1', odds: '1/2/3:1', icon: '⚀', value: 1 as 1 | 2 | 3 | 4 | 5 | 6 },
    { id: 'single-2', name: '2', odds: '1/2/3:1', icon: '⚁', value: 2 as 1 | 2 | 3 | 4 | 5 | 6 },
    { id: 'single-3', name: '3', odds: '1/2/3:1', icon: '⚂', value: 3 as 1 | 2 | 3 | 4 | 5 | 6 },
    { id: 'single-4', name: '4', odds: '1/2/3:1', icon: '⚃', value: 4 as 1 | 2 | 3 | 4 | 5 | 6 },
    { id: 'single-5', name: '5', odds: '1/2/3:1', icon: '⚄', value: 5 as 1 | 2 | 3 | 4 | 5 | 6 },
    { id: 'single-6', name: '6', odds: '1/2/3:1', icon: '⚅', value: 6 as 1 | 2 | 3 | 4 | 5 | 6 },
  ],
};

export default function BetPanel({ disabled = false }: BetPanelProps) {
  const { bets, placeBet } = useGame();

  return (
    <div className="p-md space-y-md">
      {/* 第一排：大/小/单/双 */}
      <div className="grid grid-cols-4 gap-sm">
        {betTypes.bigSmall.map((bet) => (
          <BetCell
            key={bet.id}
            id={bet.id}
            name={bet.name}
            desc={bet.desc}
            odds={bet.odds}
            icon={bet.icon}
            amount={bets[bet.id] || 0}
            onClick={() => placeBet(bet.id)}
            disabled={disabled}
            type="primary"
            size="medium"
          />
        ))}
      </div>

      {/* 第二排：点数4-10 */}
      <div>
        <p
          className="text-tiny mb-xs"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          点数投注（低）
        </p>
        <div className="grid grid-cols-7 gap-xs">
          {betTypes.numbersLow.map((bet) => (
            <BetCell
              key={bet.id}
              id={bet.id}
              name={bet.name}
              odds={bet.odds}
              amount={bets[bet.id] || 0}
              onClick={() => placeBet(bet.id)}
              disabled={disabled}
              type="points"
              size="small"
            />
          ))}
        </div>
      </div>

      {/* 第三排：点数11-17 */}
      <div>
        <p
          className="text-tiny mb-xs"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          点数投注（高）
        </p>
        <div className="grid grid-cols-7 gap-xs">
          {betTypes.numbersHigh.map((bet) => (
            <BetCell
              key={bet.id}
              id={bet.id}
              name={bet.name}
              odds={bet.odds}
              amount={bets[bet.id] || 0}
              onClick={() => placeBet(bet.id)}
              disabled={disabled}
              type="points"
              size="small"
            />
          ))}
        </div>
      </div>

      {/* 第四排：特殊投注（任意三同号、指定三同号） */}
      <div>
        <p
          className="text-tiny mb-xs"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          特殊投注
        </p>
        <div className="grid grid-cols-2 gap-sm">
          {betTypes.special.map((bet) => (
            <BetCell
              key={bet.id}
              id={bet.id}
              name={bet.name}
              desc={bet.desc}
              odds={bet.odds}
              icon={bet.icon}
              amount={bets[bet.id] || 0}
              onClick={() => placeBet(bet.id)}
              disabled={disabled}
              type="triple"
              size="medium"
            />
          ))}
        </div>
      </div>

      {/* 第五排：两骰组合（3行5列）- 显示骰子图案 */}
      <div>
        <p
          className="text-tiny mb-xs"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          两骰组合
        </p>
        <div className="grid grid-cols-5 gap-xs">
          {betTypes.pairs.map((bet) => (
            <button
              key={bet.id}
              onClick={() => !disabled && placeBet(bet.id)}
              disabled={disabled}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all duration-200 active:scale-95 min-h-[55px] p-xs"
              style={{
                background: bets[bet.id]
                  ? 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)'
                  : 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
                border: bets[bet.id]
                  ? '2px solid var(--gold-bright)'
                  : '2px solid var(--gold-primary)',
                boxShadow: bets[bet.id]
                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 16px rgba(255, 215, 0, 0.6)'
                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {/* 骰子图标 */}
              <DoubleDiceIcon
                value1={bet.dice[0]}
                value2={bet.dice[1]}
                size="xs"
              />

              {/* 赔率 */}
              <span
                className="text-tiny font-semibold font-mono"
                style={{ color: 'var(--gold-bright)' }}
              >
                {bet.odds}
              </span>

              {/* 下注金额 */}
              {bets[bet.id] > 0 && (
                <div
                  className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded text-tiny font-bold font-mono"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid var(--gold-bright)',
                    color: 'var(--gold-bright)',
                    fontSize: '10px',
                  }}
                >
                  ${bets[bet.id]}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 第六排：单骰号1-6 - 显示骰子图案 */}
      <div>
        <p
          className="text-tiny mb-xs"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          单骰号（出现1/2/3次）
        </p>
        <div className="grid grid-cols-6 gap-xs">
          {betTypes.single.map((bet) => (
            <button
              key={bet.id}
              onClick={() => !disabled && placeBet(bet.id)}
              disabled={disabled}
              className="relative flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 active:scale-95 min-h-[70px] p-sm"
              style={{
                background: bets[bet.id]
                  ? 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)'
                  : 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
                border: bets[bet.id]
                  ? '2px solid var(--gold-bright)'
                  : '2px solid var(--gold-primary)',
                boxShadow: bets[bet.id]
                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 16px rgba(255, 215, 0, 0.6)'
                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {/* 骰子图标 */}
              <DiceIcon value={bet.value} size="sm" />

              {/* 赔率 */}
              <span
                className="text-tiny font-semibold font-mono text-center"
                style={{ color: 'var(--gold-bright)' }}
              >
                {bet.odds}
              </span>

              {/* 下注金额 */}
              {bets[bet.id] > 0 && (
                <div
                  className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded text-tiny font-bold font-mono"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid var(--gold-bright)',
                    color: 'var(--gold-bright)',
                    fontSize: '10px',
                  }}
                >
                  ${bets[bet.id]}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="pt-sm pb-xs text-center">
        <p
          className="text-tiny"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
        >
          点击投注格进行下注 · 可重复点击累加金额
        </p>
      </div>
    </div>
  );
}
