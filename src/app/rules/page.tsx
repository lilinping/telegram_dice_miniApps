'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * 规则说明页面
 *
 * 功能：
 * 1. 图文并茂的规则说明
 * 2. 交互式赔率示例
 * 3. 常见问题解答
 * 4. 清晰的投注类型说明
 */

const betTypeDetails = [
  {
    category: '基础投注',
    types: [
      {
        name: '大',
        desc: '总点数11-17（三同号除外）',
        odds: '1:1',
        example: '下注100 USDT，开出15点（大），获得200 USDT',
      },
      {
        name: '小',
        desc: '总点数4-10（三同号除外）',
        odds: '1:1',
        example: '下注100 USDT，开出8点（小），获得200 USDT',
      },
      {
        name: '单',
        desc: '总点数为奇数',
        odds: '1:1',
        example: '下注100 USDT，开出13点（单），获得200 USDT',
      },
      {
        name: '双',
        desc: '总点数为偶数',
        odds: '1:1',
        example: '下注100 USDT，开出12点（双），获得200 USDT',
      },
    ],
  },
  {
    category: '点数投注',
    types: [
      {
        name: '点数4/17',
        desc: '总点数为4或17',
        odds: '60:1',
        example: '下注10 USDT，开出4点，获得610 USDT',
      },
      {
        name: '点数5/16',
        desc: '总点数为5或16',
        odds: '30:1',
        example: '下注10 USDT，开出5点，获得310 USDT',
      },
      {
        name: '点数6/15',
        desc: '总点数为6或15',
        odds: '18:1',
        example: '下注10 USDT，开出6点，获得190 USDT',
      },
      {
        name: '点数7/14',
        desc: '总点数为7或14',
        odds: '12:1',
        example: '下注10 USDT，开出7点，获得130 USDT',
      },
      {
        name: '点数8/13',
        desc: '总点数为8或13',
        odds: '8:1',
        example: '下注10 USDT，开出8点，获得90 USDT',
      },
      {
        name: '点数9/12',
        desc: '总点数为9或12',
        odds: '7:1',
        example: '下注10 USDT，开出9点，获得80 USDT',
      },
      {
        name: '点数10/11',
        desc: '总点数为10或11',
        odds: '6:1',
        example: '下注10 USDT，开出10点，获得70 USDT',
      },
    ],
  },
  {
    category: '特殊投注',
    types: [
      {
        name: '任意三同号',
        desc: '三颗骰子点数相同（任意）',
        odds: '30:1',
        example: '下注10 USDT，开出三个6，获得310 USDT',
      },
      {
        name: '指定三同号',
        desc: '指定某点的三同号',
        odds: '180:1',
        example: '下注1 USDT，指定三个6并开出，获得181 USDT',
      },
    ],
  },
  {
    category: '两骰组合',
    types: [
      {
        name: '两骰组合',
        desc: '指定两颗骰子点数（如1+2）',
        odds: '6:1',
        example: '下注10 USDT，开出1-2-4（含1和2），获得70 USDT',
      },
    ],
  },
  {
    category: '单骰号',
    types: [
      {
        name: '单骰号',
        desc: '指定点数出现1次、2次或3次',
        odds: '1:1 / 2:1 / 3:1',
        example: '下注100 USDT在4，开出4-4-6（2次），获得300 USDT',
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
      '当开出任意三同号（如三个1、三个2等）时，所有大/小投注全部输，这是庄家优势规则。',
  },
];

export default function RulesPage() {
  const router = useRouter();

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
                <span className="text-primary-gold">•</span> 投注时间：30秒
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
                  <td className="text-center font-mono text-primary-gold">1:1</td>
                  <td className="text-right text-text-secondary">10-10,000</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">点数4/17</td>
                  <td className="text-center font-mono text-primary-gold">60:1</td>
                  <td className="text-right text-text-secondary">1-500</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">点数5/16</td>
                  <td className="text-center font-mono text-primary-gold">30:1</td>
                  <td className="text-right text-text-secondary">1-500</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">任意三同号</td>
                  <td className="text-center font-mono text-primary-gold">30:1</td>
                  <td className="text-right text-text-secondary">1-1,000</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">指定三同号</td>
                  <td className="text-center font-mono text-primary-gold">180:1</td>
                  <td className="text-right text-text-secondary">1-100</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">两骰组合</td>
                  <td className="text-center font-mono text-primary-gold">6:1</td>
                  <td className="text-right text-text-secondary">1-1,000</td>
                </tr>
                <tr>
                  <td className="py-2 text-text-primary">单骰号</td>
                  <td className="text-center font-mono text-primary-gold">1/2/3:1</td>
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
