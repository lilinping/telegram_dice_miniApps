'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGame } from '@/contexts/GameContext';
import { getBetChooseId } from '@/lib/betMapping';

/**
 * 规则说明页面
 *
 * 功能：
 * 1. 图文并茂的规则说明
 * 2. 交互式赔率示例（从接口动态获取）
 * 3. 常见问题解答
 * 4. 清晰的投注类型说明
 */

// 投注类型定义（不含赔率，赔率从接口获取）
const betTypeDetailsTemplate = [
  {
    category: '基础投注',
    types: [
      {
        name: '大',
        betId: 'big',
        desc: '总点数11-17（三同号除外）',
        exampleAmount: 100,
        exampleResult: '15点（大）',
      },
      {
        name: '小',
        betId: 'small',
        desc: '总点数4-10（三同号除外）',
        exampleAmount: 100,
        exampleResult: '8点（小）',
      },
      {
        name: '单',
        betId: 'odd',
        desc: '总点数为奇数（三同号除外）',
        exampleAmount: 100,
        exampleResult: '13点（单）',
      },
      {
        name: '双',
        betId: 'even',
        desc: '总点数为偶数（三同号除外）',
        exampleAmount: 100,
        exampleResult: '12点（双）',
      },
    ],
  },
  {
    category: '点数投注',
    types: [
      {
        name: '点数4/17',
        betId: 'num-4',
        desc: '总点数为4或17',
        exampleAmount: 10,
        exampleResult: '4点',
      },
      {
        name: '点数5/16',
        betId: 'num-5',
        desc: '总点数为5或16',
        exampleAmount: 10,
        exampleResult: '5点',
      },
      {
        name: '点数6/15',
        betId: 'num-6',
        desc: '总点数为6或15',
        exampleAmount: 10,
        exampleResult: '6点',
      },
      {
        name: '点数7/14',
        betId: 'num-7',
        desc: '总点数为7或14',
        exampleAmount: 10,
        exampleResult: '7点',
      },
      {
        name: '点数8/13',
        betId: 'num-8',
        desc: '总点数为8或13',
        exampleAmount: 10,
        exampleResult: '8点',
      },
      {
        name: '点数9/12',
        betId: 'num-9',
        desc: '总点数为9或12',
        exampleAmount: 10,
        exampleResult: '9点',
      },
      {
        name: '点数10/11',
        betId: 'num-10',
        desc: '总点数为10或11',
        exampleAmount: 10,
        exampleResult: '10点',
      },
    ],
  },
  {
    category: '特殊投注',
    types: [
      {
        name: '任意三同号',
        betId: 'any-triple',
        desc: '三颗骰子点数相同（任意）',
        exampleAmount: 10,
        exampleResult: '三个6',
      },
      {
        name: '指定三同号',
        betId: 'triple-6',
        desc: '指定某点的三同号',
        exampleAmount: 1,
        exampleResult: '指定三个6并开出',
      },
    ],
  },
  {
    category: '两骰组合',
    types: [
      {
        name: '两骰组合',
        betId: 'pair-1-2',
        desc: '指定两颗骰子点数（如1+2）',
        exampleAmount: 10,
        exampleResult: '1-2-4（含1和2）',
      },
    ],
  },
  {
    category: '单骰号',
    types: [
      {
        name: '单骰号',
        betId: 'single-4',
        desc: '指定点数出现1次、2次或3次',
        exampleAmount: 100,
        exampleResult: '4-4-6（2次）',
      },
    ],
  },
];

const faqs = [
  {
    question: '如何充值？',
    answer:
      '点击钱包页面的"充值"按钮，选择充值金额和支付方式（USDT TRC20/ERC20、TON），按照提示转账至指定地址，区块链确认后自动到账。',
  },
  {
    question: '最小/最大下注是多少？',
    answer:
      '不同投注类型限额不同。基础投注（大小单双）最小10 USDT，最大10,000 USDT；点数投注最小1 USDT，最大500 USDT；特殊投注根据类型有所不同。',
  },
  {
    question: '开奖随机性如何保证？',
    answer:
      '我们使用Provably Fair算法和硬件随机数生成器（RNG）确保开奖的公平性和随机性。每局开奖前会公开哈希值，开奖后公开原始种子，用户可自行验证结果。',
  },
  {
    question: '如何提现？',
    answer:
      '前往钱包页面点击"提现"，输入提现金额和钱包地址，提交后等待审核。小额（<1000 USDT）自动审核2小时内到账，大额人工审核24小时内到账。',
  },
  {
    question: '三同号通杀是什么？',
    answer:
      '当开出任意三同号（如三个1、三个2等）时，所有大/小/单/双投注全部输，这是庄家优势规则。即使三同号的点数符合大小或奇偶条件，这些投注也不会赢。',
  },
];

export default function RulesPage() {
  const router = useRouter();
  const { diceOptions } = useGame();

  // 获取赔率的辅助函数
  const getOdds = (betId: string): string => {
    const chooseId = getBetChooseId(betId);
    if (chooseId === null) return '1:1';
    
    const option = diceOptions.get(chooseId);
    if (!option || !option.multi) return '1:1';
    
    return `${option.multi}:1`;
  };

  // 计算示例收益
  const calculateWinAmount = (betId: string, betAmount: number): number => {
    // 这里返回“净赢金额”（不包含原始下注本金），按照用户要求：
    // 赢得金额 = 押注额度 * 赔率（如赔率为2:1，则净赢 = betAmount * 2）
    const chooseId = getBetChooseId(betId);
    // 默认赔率为 1:1（即净赢 = betAmount * 1）
    const defaultMulti = 1;
    if (chooseId === null) return betAmount * defaultMulti;
    
    const option = diceOptions.get(chooseId);
    if (!option || !option.multi) return betAmount * defaultMulti;
    
    // 处理范围赔率（如 "2-4"，取中间值）
    if (option.multi.includes('-')) {
      const [min, max] = option.multi.split('-').map(Number);
      const avgMulti = (min + max) / 2;
      return betAmount * avgMulti;
    }
    
    const multi = parseFloat(option.multi);
    if (Number.isNaN(multi)) return betAmount * defaultMulti;
    return betAmount * multi;
  };

  // 生成带赔率的投注类型数据
  const betTypeDetails = betTypeDetailsTemplate.map(category => ({
    ...category,
    types: category.types.map(type => ({
      ...type,
      odds: getOdds(type.betId),
      example: `下注${type.exampleAmount} USDT，开出${type.exampleResult}，获得${calculateWinAmount(type.betId, type.exampleAmount).toFixed(0)} USDT`,
    })),
  }));

  return (
    <div className="min-h-screen bg-bg-darkest pb-20">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 h-14 bg-bg-dark border-b border-border flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-primary-gold hover:bg-bg-medium rounded-lg transition-colors"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-text-primary">游戏规则</h1>
        <div className="w-10" />
      </header>

      <div className="p-5 space-y-8">
        {/* 游戏介绍 */}
        <section>
          <h2 className="text-xl font-bold text-primary-gold mb-4 flex items-center gap-2">
            <span>🎲</span>
            <span>游戏介绍</span>
          </h2>
          <div className="bg-bg-dark rounded-xl p-4 border border-border space-y-3">
            <p className="text-sm text-text-primary leading-relaxed">
              骰宝（Sic Bo）是一种传统的骰子博彩游戏，使用三颗骰子进行游戏。玩家在投注面板上选择投注类型，等待开奖后根据骰子点数结果判断输赢。
            </p>
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">
                <span className="text-primary-gold">•</span> 每局使用3颗六面骰子
              </p>
              <p className="text-sm text-text-secondary">
                <span className="text-primary-gold">•</span> 点数范围：3-18点
              </p>
              <p className="text-sm text-text-secondary">
                <span className="text-primary-gold">•</span> 游戏流程：下注 → 封盘 → 开奖 → 结算
              </p>
              <p className="text-sm text-text-secondary">
                <span className="text-primary-gold">•</span> 投注时间：每局 5 分钟开奖，提前 30 秒封盘
              </p>
              <p className="text-sm text-warning">
                <span className="text-warning">⚠️</span> 三同号（豹子）通杀：开出任意三同号时，大/小/单/双投注全部输
              </p>
            </div>
          </div>
        </section>

        {/* 投注类型详解 */}
        <section>
          <h2 className="text-xl font-bold text-primary-gold mb-4 flex items-center gap-2">
            <span>💰</span>
            <span>投注类型</span>
          </h2>

          <div className="space-y-4">
            {betTypeDetails.map((category, idx) => (
              <div key={idx}>
                <h3 className="text-base font-semibold text-text-primary mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.types.map((type, typeIdx) => (
                    <div
                      key={typeIdx}
                      className="bg-bg-dark rounded-xl p-4 border border-border"
                    >
                      {/* 标题和赔率 */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-text-primary">
                          {type.name}
                        </h4>
                        <span className="px-3 py-1 bg-primary-gold/20 text-primary-gold rounded-lg text-sm font-mono font-bold">
                          {type.odds}
                        </span>
                      </div>

                      {/* 描述 */}
                      <p className="text-sm text-text-secondary mb-2">{type.desc}</p>

                      {/* 示例 */}
                      <div className="bg-bg-medium rounded-lg p-3 mt-2">
                        <p className="text-xs text-text-disabled mb-1">示例</p>
                        <p className="text-sm text-text-primary">{type.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 赔率表格 */}
        <section>
          <h2 className="text-xl font-bold text-primary-gold mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>完整赔率表</span>
          </h2>
          <div className="bg-bg-dark rounded-xl p-4 border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-text-secondary font-semibold">投注类型</th>
                  <th className="text-center py-2 text-text-secondary font-semibold">赔率</th>
                  <th className="text-right py-2 text-text-secondary font-semibold">限额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-text-primary">大/小/单/双</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('big')}</td>
                  <td className="text-right text-text-secondary">10-10,000</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">点数4/17</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('num-4')}</td>
                  <td className="text-right text-text-secondary">1-500</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">点数5/16</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('num-5')}</td>
                  <td className="text-right text-text-secondary">1-500</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">任意三同号</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('any-triple')}</td>
                  <td className="text-right text-text-secondary">1-1,000</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">指定三同号</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('triple-1')}</td>
                  <td className="text-right text-text-secondary">1-100</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">两骰组合</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('pair-1-2')}</td>
                  <td className="text-right text-text-secondary">1-1,000</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">单骰号</td>
                  <td className="text-center font-mono text-primary-gold">{getOdds('single-1')}</td>
                  <td className="text-right text-text-secondary">1-1,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 常见问题 */}
        <section>
          <h2 className="text-xl font-bold text-primary-gold mb-4 flex items-center gap-2">
            <span>❓</span>
            <span>常见问题</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-bg-dark rounded-xl border border-border overflow-hidden group"
              >
                <summary className="p-4 cursor-pointer hover:bg-bg-medium transition-colors flex justify-between items-center">
                  <span className="text-sm font-semibold text-text-primary">
                    {faq.question}
                  </span>
                  <span className="text-primary-gold group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 底部提示 */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
          <p className="text-sm text-warning text-center">
            ⚠️ 本游戏仅供娱乐，请理性投注，量力而行
          </p>
        </div>
      </div>
    </div>
  );
}
