import { useEffect } from 'react'
import { ConfigProvider, App as AntdApp, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppLayout from './components/layout/AppLayout'
import { useSettingsStore } from './stores/settingsStore'
import { useTaskStore } from './stores/taskStore'
import { resolveThemeMode, useSystemDark } from './hooks/useThemeToken'

export default function App() {
  const themeSetting = useSettingsStore((s) => s.theme)
  const initSettings = useSettingsStore((s) => s.init)
  const loadTasks = useTaskStore((s) => s.loadTasks)

  const systemDark = useSystemDark()
  const themeMode = resolveThemeMode(themeSetting, systemDark)

  useEffect(() => {
    void initSettings()
    void loadTasks()
  }, [initSettings, loadTasks])

  // 全局背景跟随主题，避免弹窗/滚动区外露出旧底色；同时挂主题类供全局 CSS 变量使用
  useEffect(() => {
    const bg = themeMode === 'dark' ? '#141414' : '#ffffff'
    document.body.style.background = bg
    document.body.classList.toggle('theme-light', themeMode === 'light')
    document.body.classList.toggle('theme-dark', themeMode === 'dark')
  }, [themeMode])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            // Sider 去掉默认深蓝底，交给明暗算法统一渲染
            bodyBg: themeMode === 'dark' ? '#141414' : '#ffffff',
            siderBg: themeMode === 'dark' ? '#141414' : '#fafafa',
            headerBg: themeMode === 'dark' ? '#141414' : '#ffffff',
          },
        },
      }}
    >
      <AntdApp>
        <AppLayout />
      </AntdApp>
    </ConfigProvider>
  )
}
