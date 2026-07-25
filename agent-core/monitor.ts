/**
 * 执行监控：迭代次数、超时与重试策略
 */

/** 最大工具调用迭代次数（防止死循环） */
export const MAX_ITERATIONS = 30

/** 单次任务总超时（10 分钟） */
export const TIMEOUT_MS = 600000

/** 单步最大重试次数 */
export const MAX_RETRIES = 3

/**
 * 创建一个倒计时计时器
 */
export function createTimer(timeoutMs: number): {
  expired: () => boolean
  remaining: () => number
} {
  const start = Date.now()
  return {
    expired: () => Date.now() - start >= timeoutMs,
    remaining: () => Math.max(0, timeoutMs - (Date.now() - start)),
  }
}

/**
 * 判断是否应继续重试
 * @param errorCount 当前已发生的错误次数
 * @returns 是否允许重试
 */
export function shouldRetry(errorCount: number): boolean {
  return errorCount < MAX_RETRIES
}

/**
 * 指数退避延迟（毫秒）
 * 第 1 次 1000ms，第 2 次 2000ms，第 3 次 4000ms
 */
export function backoffDelay(errorCount: number): number {
  return Math.min(8000, 1000 * Math.pow(2, errorCount))
}
