/**
 * 骰子动画测试页面
 * 用于测试Three.js骰子动画效果
 */

'use client';

import { useState } from 'react';
import DiceCupAnimation from '@/components/game/DiceCupAnimation';
import { GameProvider } from '@/contexts/GameContext';
import { TelegramProvider } from '@/contexts/TelegramContext';
import { WalletProvider } from '@/contexts/WalletContext';

export default function TestDicePage() {
  const [testResults, setTestResults] = useState<number[]>([4, 5, 6]);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [gameState, setGameState] = useState<'betting' | 'rolling' | 'settled'>('betting');

  const handleRandomTest = () => {
    const random = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    setTestResults(random);
    console.log('🎲 测试结果:', random);
  };

  const startAnimation = () => {
    console.log('🎯 开始测试动画，目标结果:', testResults);
    setGameState('rolling');
  };

  const handleAnimationComplete = () => {
    console.log('✅ 动画完成');
    setGameState('settled');
  };

  const resetAnimation = () => {
    setGameState('betting');
  };

  return (
    <TelegramProvider>
      <WalletProvider>
        <GameProvider>
          <div style={{ 
            width: '100vw', 
            height: '100vh', 
            background: '#0a0a0a',
            position: 'relative',
          }}>
            {/* 测试控制面板 */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '15px',
              borderRadius: '8px',
              color: 'white',
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                骰子动画测试
              </h3>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={isFullscreen}
                    onChange={(e) => setIsFullscreen(e.target.checked)}
                    style={{ marginRight: '5px' }}
                  />
                  全屏模式
                </label>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <button
                  onClick={handleRandomTest}
                  style={{
                    padding: '8px 16px',
                    background: '#FFD700',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#000',
                    marginRight: '8px',
                  }}
                >
                  随机测试
                </button>
                <button
                  onClick={startAnimation}
                  disabled={gameState === 'rolling'}
                  style={{
                    padding: '8px 16px',
                    background: gameState === 'rolling' ? '#666' : '#4CAF50',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: gameState === 'rolling' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginRight: '8px',
                  }}
                >
                  开始动画
                </button>
                <button
                  onClick={resetAnimation}
                  style={{
                    padding: '8px 16px',
                    background: '#2196F3',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  重置
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#888' }}>
                <div>当前结果: {testResults.join(', ')}</div>
                <div>总点数: {testResults.reduce((a, b) => a + b, 0)}</div>
                <div>游戏状态: {gameState}</div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                <div>提示：</div>
                <div>- 点击&ldquo;随机测试&rdquo;生成新结果</div>
                <div>- 查看控制台了解详细日志</div>
                <div>- 检查FPS显示（右上角）</div>
              </div>
            </div>

            {/* 骰子动画 */}
            <DiceCupAnimation
              diceResults={testResults}
              gameState={gameState}
              winAmount={100}
              hasWon={true}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>
        </GameProvider>
      </WalletProvider>
    </TelegramProvider>
  );
}
