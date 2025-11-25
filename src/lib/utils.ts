import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化货币金额
 * @param amount 金额
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化时间
 * @param timestamp 时间戳
 * @param format 格式类型
 */
export function formatTime(timestamp: number, format: 'full' | 'date' | 'time' = 'full'): string {
  const date = new Date(timestamp)

  if (format === 'date') {
    return date.toLocaleDateString('zh-CN')
  }

  if (format === 'time') {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleString('zh-CN')
}

/**
 * 计算骰子总点数
 */
export function calculateTotalPoints(diceResults: number[]): number {
  return diceResults.reduce((sum, val) => sum + val, 0)
}

/**
 * 判断是否为大（11-17点，非三同号）
 */
export function isBig(diceResults: number[]): boolean {
  const total = calculateTotalPoints(diceResults)
  const isTriple = diceResults[0] === diceResults[1] && diceResults[1] === diceResults[2]
  return total >= 11 && total <= 17 && !isTriple
}

/**
 * 判断是否为小（4-10点，非三同号）
 */
export function isSmall(diceResults: number[]): boolean {
  const total = calculateTotalPoints(diceResults)
  const isTriple = diceResults[0] === diceResults[1] && diceResults[1] === diceResults[2]
  return total >= 4 && total <= 10 && !isTriple
}

/**
 * 判断是否为单数
 */
export function isOdd(diceResults: number[]): boolean {
  const total = calculateTotalPoints(diceResults)
  return total % 2 !== 0
}

/**
 * 判断是否为双数
 */
export function isEven(diceResults: number[]): boolean {
  const total = calculateTotalPoints(diceResults)
  return total % 2 === 0
}

/**
 * 判断是否为任意三同号
 */
export function isAnyTriple(diceResults: number[]): boolean {
  return diceResults[0] === diceResults[1] && diceResults[1] === diceResults[2]
}

/**
 * 判断是否为指定三同号
 */
export function isSpecificTriple(diceResults: number[], targetNumber: number): boolean {
  return isAnyTriple(diceResults) && diceResults[0] === targetNumber
}

/**
 * 判断是否包含指定两骰组合
 */
export function hasPairCombination(diceResults: number[], num1: number, num2: number): boolean {
  const sorted = [...diceResults].sort()
  return sorted.includes(num1) && sorted.includes(num2)
}

/**
 * 统计指定点数出现次数
 */
export function countOccurrences(diceResults: number[], targetNumber: number): number {
  return diceResults.filter(n => n === targetNumber).length
}

/**
 * 计算投注赔率
 */
export function getOdds(betType: string): number {
  const oddsMap: Record<string, number> = {
    // 大小单双
    'big': 1,
    'small': 1,
    'odd': 1,
    'even': 1,
    // 点数
    '4': 60,
    '5': 30,
    '6': 18,
    '7': 12,
    '8': 8,
    '9': 7,
    '10': 6,
    '11': 6,
    '12': 7,
    '13': 8,
    '14': 12,
    '15': 18,
    '16': 30,
    '17': 60,
    // 特殊
    'any-triple': 30,
    'specific-triple': 180,
    'pair': 5,
    'single-1': 1,
    'single-2': 2,
    'single-3': 3,
  }

  return oddsMap[betType] || 1
}

/**
 * 检查投注是否中奖
 */
export function checkWin(betType: string, diceResults: number[]): boolean {
  const total = calculateTotalPoints(diceResults)

  // 大小单双
  if (betType === 'big') return isBig(diceResults)
  if (betType === 'small') return isSmall(diceResults)
  if (betType === 'odd') return isOdd(diceResults)
  if (betType === 'even') return isEven(diceResults)

  // 点数投注
  if (['4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'].includes(betType)) {
    return total === parseInt(betType)
  }

  // 任意三同号
  if (betType === 'any-triple') {
    return isAnyTriple(diceResults)
  }

  // 指定三同号
  if (betType.startsWith('triple-')) {
    const num = parseInt(betType.split('-')[1])
    return isSpecificTriple(diceResults, num)
  }

  // 两骰组合
  if (betType.startsWith('pair-')) {
    const [, num1, num2] = betType.split('-').map(Number)
    return hasPairCombination(diceResults, num1, num2)
  }

  // 单骰号
  if (betType.startsWith('single-')) {
    const num = parseInt(betType.split('-')[1])
    const count = countOccurrences(diceResults, num)
    return count > 0
  }

  return false
}

/**
 * 生成随机骰子结果（仅用于演示）
 */
export function generateRandomDice(): number[] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ]
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 触觉反馈（仅移动端）
 */
export function vibrate(duration: number = 50): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        textArea.remove()
        return true
      } catch (error) {
        console.error('Failed to copy:', error)
        textArea.remove()
        return false
      }
    }
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return function(...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 验证TRC20地址格式
 * @param address 钱包地址
 * @returns 验证结果和错误消息
 */
export function validateTRC20Address(address: string): { valid: boolean; error?: string } {
  if (!address || address.trim() === '') {
    return { valid: false, error: '请输入钱包地址' }
  }

  const trimmedAddress = address.trim()

  if (!trimmedAddress.startsWith('T')) {
    return { valid: false, error: '地址必须以T开头' }
  }

  if (trimmedAddress.length !== 34) {
    return { valid: false, error: '地址长度必须为34个字符' }
  }

  // 检查是否只包含有效的Base58字符
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  if (!base58Regex.test(trimmedAddress)) {
    return { valid: false, error: '地址包含无效字符' }
  }

  return { valid: true }
}

/**
 * 计算提币手续费
 * @param amount 提币金额
 * @returns 手续费金额
 */
export function calculateWithdrawalFee(amount: number): number {
  if (amount < 1000) {
    return 5
  }
  return amount * 0.02
}
