import { Flex, Tooltip, Button } from 'antd'
import {
  SettingOutlined,
  BulbOutlined,
  MoonOutlined,
  DesktopOutlined,
} from '@ant-design/icons'
import TaskSearch from '../task/TaskSearch'
import TaskFilter from '../task/TaskFilter'
import TaskList from '../task/TaskList'
import NewTaskButton from '../task/NewTaskButton'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ThemeSetting } from '../../types'

const THEME_ORDER: ThemeSetting[] = ['system', 'dark', 'light']
const THEME_LABEL: Record<ThemeSetting, string> = {
  system: '主题：跟随系统',
  dark: '主题：暗色',
  light: '主题：亮色',
}

export default function Sidebar() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]
    setTheme(next)
  }

  const ThemeIcon =
    theme === 'system' ? DesktopOutlined : theme === 'dark' ? MoonOutlined : BulbOutlined

  return (
    <Flex vertical className="app-drag" style={{ height: '100%', padding: 12, gap: 12 }}>
      {/* 顶部搜索（macOS 红绿灯按钮区域不可放内容；其余空白处可拖拽窗口） */}
      <div className="app-no-drag" style={{ marginTop: 30 }}>
        <TaskSearch />
      </div>

      {/* 中部：过滤器 + 任务列表 */}
      <div className="app-no-drag">
        <TaskFilter />
      </div>
      <div className="app-no-drag" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <TaskList />
      </div>

      {/* 底部：新建任务 + 设置 + 主题切换 */}
      <div className="app-no-drag" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <NewTaskButton />
        <Tooltip title="设置">
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSettingsOpen(true)}
          />
        </Tooltip>
        <Tooltip title={THEME_LABEL[theme]}>
          <Button
            icon={<ThemeIcon />}
            onClick={cycleTheme}
          />
        </Tooltip>
      </div>
    </Flex>
  )
}
