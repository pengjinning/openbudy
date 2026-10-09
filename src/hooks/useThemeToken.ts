import { useEffect, useState } from 'react'
import { theme as antdTheme } from 'antd'

export type ThemeSetting = 'light' | 'dark' | 'system'

/**
 * 主题 token 便捷 hook
 *
 * 组件内所有颜色一律取自 antd 主题 token，禁止硬编码 rgba(255,255,255,...) / #141414 等，
 * 这样明/暗两套算法都能正确适配。
 *
 * 用法：
 *   const { token } = useThemeToken()
 *   <div style={{ background: token.colorBgContainer, color: token.colorTextSecondary }} />
 */
export function useThemeToken() {
  const { token } = antdTheme.useToken()
  return { token }
}

/**
 * theme === 'system' 时订阅系统 prefers-color-scheme 变化，返回系统是否暗色
 */
export function useSystemDark(): boolean {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', onChange)
    setDark(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return dark
}

/** 主题设置 → 实际生效模式 */
export function resolveThemeMode(
  setting: ThemeSetting,
  systemDark: boolean
): 'light' | 'dark' {
  if (setting === 'system') return systemDark ? 'dark' : 'light'
  return setting
}
