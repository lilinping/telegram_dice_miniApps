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
  // 大小单双（用于后续行/其他区域）
  bigSmall: [
    { id: 'big', name: '大', desc: '11-17', odds: '1:1', icon: '⬆️' },
    { id: 'small', name: '小', desc: '4-10', odds: '1:1', icon: '⬇️' },
    { id: 'odd', name: '单', desc: '奇数', odds: '1:1', icon: '1️⃣' },
    { id: 'even', name: '双', desc: '偶数', odds: '1:1', icon: '2️⃣' },
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

  // 两骰组合（15种）- 带骰子点数
  pairs: [
    { id: 'pair-1-2', name: '1-2', odds: '5:1', dice: [1, 2] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-3', name: '1-3', odds: '5:1', dice: [1, 3] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-4', name: '1-4', odds: '5:1', dice: [1, 4] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-5', name: '1-5', odds: '5:1', dice: [1, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-1-6', name: '1-6', odds: '5:1', dice: [1, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-3', name: '2-3', odds: '5:1', dice: [2, 3] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-4', name: '2-4', odds: '5:1', dice: [2, 4] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-5', name: '2-5', odds: '5:1', dice: [2, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-2-6', name: '2-6', odds: '5:1', dice: [2, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-3-4', name: '3-4', odds: '5:1', dice: [3, 4] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-3-5', name: '3-5', odds: '5:1', dice: [3, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-3-6', name: '3-6', odds: '5:1', dice: [3, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-4-5', name: '4-5', odds: '5:1', dice: [4, 5] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-4-6', name: '4-6', odds: '5:1', dice: [4, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
    { id: 'pair-5-6', name: '5-6', odds: '5:1', dice: [5, 6] as [1 | 2 | 3 | 4 | 5 | 6, 1 | 2 | 3 | 4 | 5 | 6] },
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
    <div className="px-sm py-xs space-y-0.5">
      {/* 第一排：小 / 单 / 任意三 / 双 / 大 （浅色瓷片风格） */}
      <div
        className="grid gap-0.5"
        style={{
          // 使用比例列宽，避免固定像素在小屏溢出；整体自适应父容器宽度
          // 小/大略宽，奇/偶更窄，中间“任意三”最宽
          gridTemplateColumns: '1.35fr 0.75fr 1.45fr 0.75fr 1.35fr',
        }}
      >
        {[
          { id: 'small', name: '小', desc: '4-10', odds: '1:1' },
          { id: 'odd', name: '单', desc: '奇数', odds: '1:1' },
          { id: 'any-triple', name: '任意三', desc: '', odds: '30:1' },
          { id: 'even', name: '双', desc: '偶数', odds: '1:1' },
          { id: 'big', name: '大', desc: '11-17', odds: '1:1' },
        ].map((bet) => (
          <BetCell
            key={bet.id}
            id={bet.id}
            name={bet.name}
            desc={bet.desc}
            odds={bet.odds}
            amount={bets[bet.id] || 0}
            onClick={() => placeBet(bet.id)}
            disabled={disabled}
            type="primary"
            size={bet.id === 'odd' || bet.id === 'even' ? 'small' : 'medium'}
          />
        ))}
      </div>

      {/* 第二排：双骰（对子）- 可下注 */}
      <div className="grid gap-0.5"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
        }}
      >
        {[
          { id: 'double-1', dice: [1, 1] as const, odds: '11:1' },
          { id: 'double-2', dice: [2, 2] as const, odds: '11:1' },
          { id: 'double-3', dice: [3, 3] as const, odds: '11:1' },
          { id: 'double-4', dice: [4, 4] as const, odds: '11:1' },
          { id: 'double-5', dice: [5, 5] as const, odds: '11:1' },
          { id: 'double-6', dice: [6, 6] as const, odds: '11:1' },
        ].map((bet) => (
          <button
            key={bet.id}
            onClick={() => !disabled && placeBet(bet.id)}
            disabled={disabled}
            className="relative flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all duration-200 active:scale-95 p-xs"
            style={{
              background: bets[bet.id]
                ? 'linear-gradient(180deg, #D4AF37 0%, #C09020 100%)'
                : 'linear-gradient(180deg, #F5EDE3 0%, #EADFCC 100%)',
              border: bets[bet.id]
                ? '2px solid var(--gold-bright)'
                : '1px solid rgba(0,0,0,0.15)',
              boxShadow: bets[bet.id]
                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 16px rgba(255, 215, 0, 0.6)'
                : 'none',
              minHeight: 50,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <div className="flex flex-row items-center justify-center gap-1">
              <DiceIcon value={bet.dice[0]} size="xs" dotColor="#FFFFFF" bgColor="#C40000" borderColor="rgba(0,0,0,0.25)" />
              <DiceIcon value={bet.dice[1]} size="xs" dotColor="#FFFFFF" bgColor="#C40000" borderColor="rgba(0,0,0,0.25)" />
            </div>
            {/* 下注金额 */}
            {bets[bet.id] > 0 && (
              <div
                className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded text-tiny font-bold font-mono"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid var(--gold-bright)',
                  color: 'var(--gold-bright)',
                  fontSize: '9px',
                }}
              >
                ${bets[bet.id]}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 第三排：三同号（豹子）- 可下注 */}
      <div className="grid gap-0.5"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
        }}
      >
        {[
          { id: 'triple-1', dice: [1, 1, 1] as const, name: '111', odds: '180:1' },
          { id: 'triple-2', dice: [2, 2, 2] as const, name: '222', odds: '180:1' },
          { id: 'triple-3', dice: [3, 3, 3] as const, name: '333', odds: '180:1' },
          { id: 'triple-4', dice: [4, 4, 4] as const, name: '444', odds: '180:1' },
          { id: 'triple-5', dice: [5, 5, 5] as const, name: '555', odds: '180:1' },
          { id: 'triple-6', dice: [6, 6, 6] as const, name: '666', odds: '180:1' },
        ].map((bet) => (
          <button
            key={bet.id}
            onClick={() => !disabled && placeBet(bet.id)}
            disabled={disabled}
            className="relative flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 active:scale-95 p-xs"
            style={{
              background: bets[bet.id]
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)',
              border: bets[bet.id]
                ? '3px solid var(--gold-bright)'
                : '2px solid var(--gold-primary)',
              boxShadow: bets[bet.id]
                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.8)'
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
              minHeight: 60,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <div className="flex flex-col items-center justify-center gap-0.5">
              {bet.dice.map((v, i) => (
                <DiceIcon key={i} value={v} size="xs" dotColor="#FFFFFF" bgColor="#C40000" borderColor="rgba(0,0,0,0.25)" />
              ))}
            </div>
            {/* 下注金额 */}
            {bets[bet.id] > 0 && (
              <div
                className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded text-tiny font-bold font-mono"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid var(--gold-bright)',
                  color: 'var(--gold-bright)',
                  fontSize: '9px',
                }}
              >
                ${bets[bet.id]}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 第二排：点数4-10 */}
      <div>
        <div className="grid grid-cols-7 gap-0.5">
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
        <div className="grid grid-cols-7 gap-0.5">
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

      {/* 第五排：两骰组合（3行5列）- 显示骰子图案 */}
      <div>
        <div className="grid grid-cols-5 gap-0.5">
          {betTypes.pairs.map((bet) => (
            <button
              key={bet.id}
              onClick={() => !disabled && placeBet(bet.id)}
              disabled={disabled}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all duration-200 active:scale-95 min-h-[40px] p-xs"
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

      {/* 第六排：单骰号1-6 - 显示骰子图案（2行3列） */}
      <div>
        <div className="grid grid-cols-3 gap-0.5">
          {betTypes.single.map((bet) => {
            // 中文数字映射
            const chineseNumbers = ['一', '二', '三', '四', '五', '六'];
            const chineseName = chineseNumbers[bet.value - 1];
            
            return (
            <button
              key={bet.id}
              onClick={() => !disabled && placeBet(bet.id)}
              disabled={disabled}
                className="relative flex flex-row items-center justify-between gap-2 rounded-lg transition-all duration-200 active:scale-95 min-h-[50px] p-sm px-md"
              style={{
                background: bets[bet.id]
                  ? 'linear-gradient(135deg, var(--burgundy) 0%, var(--casino-red) 100%)'
                    : 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
                border: bets[bet.id]
                  ? '2px solid var(--gold-bright)'
                  : '2px solid var(--gold-primary)',
                boxShadow: bets[bet.id]
                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 16px rgba(255, 215, 0, 0.6)'
                    : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                opacity: disabled ? 0.5 : 1,
              }}
            >
                {/* 中文数字 - 左边 */}
              <span
                  className="text-h3 font-bold"
                  style={{
                    color: '#000000',
                    textShadow: 'none',
                  }}
              >
                  {chineseName}
              </span>
                
                {/* 骰子图标 - 右边 */}
                <DiceIcon value={bet.value} size="sm" />

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
            );
          })}
        </div>
      </div>

      {/* 底部说明 */}
      <div
        className="text-center"
        style={{
          paddingTop: '12px',
          paddingBottom: '10px',
        }}
      >
        <p
          className="text-tiny"
          style={{ color: 'rgba(255, 255, 255, 0.45)' }}
        >
          点击投注格进行下注 · 可重复点击累加金额
        </p>
      </div>
    </div>
  );
}
