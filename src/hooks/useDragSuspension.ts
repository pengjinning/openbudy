import { useEffect } from 'react'

/**
 * 挂起全局窗口拖拽区（Electron）
 *
 * 背景：无边框窗口用 -webkit-app-region: drag 定义标题栏拖拽区。
 * Electron 在合成器层按几何矩形判定 drag 命中，DOM 浮层（Modal/Drawer/Select 下拉）
 * 无法在 z 轴上遮挡它 —— 空状态的聊天区是整块拖拽区，弹窗恰好浮在其上，
 * 导致弹窗内的真实鼠标点击被当作"拖拽窗口"而吞掉（tab 无法点击、表单无法聚焦）。
 *
 * 用法：在弹窗组件中 `useDragSuspension(open)`，打开期间 body 挂起所有 .app-drag，
 * 关闭后自动恢复。浏览器模式下无副作用。
 */
export function useDragSuspension(active: boolean): void {
  useEffect(() => {
    if (!active) return
    document.body.classList.add('app-drag-suspended')
    return () => {
      document.body.classList.remove('app-drag-suspended')
    }
  }, [active])
}
