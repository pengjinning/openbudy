import { useEffect } from 'react'
import { ConfigProvider, App as AntdApp, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppLayout from './components/layout/AppLayout'
import { useSettingsStore } from './stores/settingsStore'
import { useTaskStore } from './stores/taskStore'

export default function App() {
  const themeMode = useSettingsStore((s) => s.theme)
  const initSettings = useSettingsStore((s) => s.init)
  const loadTasks = useTaskStore((s) => s.loadTasks)

  useEffect(() => {
    void initSettings()
    void loadTasks()
  }, [initSettings, loadTasks])

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
      }}
    >
      <AntdApp>
        <AppLayout />
      </AntdApp>
    </ConfigProvider>
  )
}
