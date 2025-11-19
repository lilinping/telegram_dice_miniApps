/**
 * 下注选项ID映射表
 * 前端字符串ID <-> 后端数字ID
 * 
 * 根据后端API /dice/display 返回的数据结构
 */

export const BET_ID_MAPPING: Record<string, number> = {
  // 点数 4-17 (ID: 1-14)
  'num-4': 1,
  'num-5': 2,
  'num-6': 3,
  'num-7': 4,
  'num-8': 5,
  'num-9': 6,
  'num-10': 7,
  'num-11': 8,
  'num-12': 9,
  'num-13': 10,
  'num-14': 11,
  'num-15': 12,
  'num-16': 13,
  'num-17': 14,

  // 大小单双 (ID: 15-18)
  'big': 15,      // 大 (11-17)
  'small': 16,    // 小 (4-10)
  'odd': 17,      // 单
  'even': 18,     // 双

  // 任意三同号 (ID: 19)
  'any-triple': 19,

  // 两骰组合/对子 (ID: 20-40)
  // 格式: 1-1, 1-2, 1-3, 1-4, 1-5, 1-6, 2-2, 2-3, ...
  'double-1': 20,   // 1-1
  'pair-1-2': 21,   // 1-2
  'pair-1-3': 22,   // 1-3
  'pair-1-4': 23,   // 1-4
  'pair-1-5': 24,   // 1-5
  'pair-1-6': 25,   // 1-6
  'double-2': 26,   // 2-2
  'pair-2-3': 27,   // 2-3
  'pair-2-4': 28,   // 2-4
  'pair-2-5': 29,   // 2-5
  'pair-2-6': 30,   // 2-6
  'double-3': 31,   // 3-3
  'pair-3-4': 32,   // 3-4
  'pair-3-5': 33,   // 3-5
  'pair-3-6': 34,   // 3-6
  'double-4': 35,   // 4-4
  'pair-4-5': 36,   // 4-5
  'pair-4-6': 37,   // 4-6
  'double-5': 38,   // 5-5
  'pair-5-6': 39,   // 5-6
  'double-6': 40,   // 6-6

  // 指定三同号/豹子 (ID: 41-46)
  'triple-1': 41,   // 1-1-1
  'triple-2': 42,   // 2-2-2
  'triple-3': 43,   // 3-3-3
  'triple-4': 44,   // 4-4-4
  'triple-5': 45,   // 5-5-5
  'triple-6': 46,   // 6-6-6

  // 单骰号 1-6 (ID: 47-52)
  'single-1': 47,   // 单骰号1
  'single-2': 48,   // 单骰号2
  'single-3': 49,   // 单骰号3
  'single-4': 50,   // 单骰号4
  'single-5': 51,   // 单骰号5
  'single-6': 52,   // 单骰号6
};

/**
 * 将前端betId转换为后端chooseId
 * @param betId 前端使用的字符串ID
 * @returns 后端API需要的数字ID，如果找不到返回null
 */
export function getBetChooseId(betId: string): number | null {
  const chooseId = BET_ID_MAPPING[betId];
  if (chooseId === undefined) {
    console.error(`未找到betId映射: ${betId}`);
    return null;
  }
  return chooseId;
}

/**
 * 反向映射：后端chooseId -> 前端betId
 */
export const CHOOSE_ID_TO_BET_ID: Record<number, string> = Object.entries(BET_ID_MAPPING).reduce(
  (acc, [betId, chooseId]) => {
    acc[chooseId] = betId;
    return acc;
  },
  {} as Record<number, string>
);

/**
 * 将后端chooseId转换为前端betId
 * @param chooseId 后端API返回的数字ID
 * @returns 前端使用的字符串ID，如果找不到返回null
 */
export function getChooseBetId(chooseId: number): string | null {
  const betId = CHOOSE_ID_TO_BET_ID[chooseId];
  if (!betId) {
    console.error(`未找到chooseId映射: ${chooseId}`);
    return null;
  }
  return betId;
}
