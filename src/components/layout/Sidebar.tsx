import { useState } from 'react'
import { Flex, Tooltip, Button, Input, Select, Popover } from 'antd'
import {
  SettingOutlined,
  BulbOutlined,
  MoonOutlined,
  DesktopOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import TaskList from '../task/TaskList'
import NewTaskButton from '../task/NewTaskButton'
import { useTaskStore } from '../../stores/taskStore'
import { useThemeToken } from '../../hooks/useThemeToken'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ThemeSetting, TaskStatus } from '../../types'

const THEME_ORDER: ThemeSetting[] = ['system', 'dark', 'light']
const THEME_LABEL: Record<ThemeSetting, string> = {
  system: '主题：跟随系统',
  dark: '主题：暗色',
  light: '主题：亮色',
}

const FILTER_OPTIONS: Array<{ label: string; value: TaskStatus | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
  { label: '已归档', value: 'archived' },
]

export default function Sidebar() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)

  const searchQuery = useTaskStore((s) => s.searchQuery)
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery)
  const filterStatus = useTaskStore((s) => s.filterStatus)
  const setFilterStatus = useTaskStore((s) => s.setFilterStatus)

  const { token } = useThemeToken()

  const [searchOpen, setSearchOpen] = useState(false)

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]
    setTheme(next)
  }

  const ThemeIcon =
    theme === 'system' ? DesktopOutlined : theme === 'dark' ? MoonOutlined : BulbOutlined

  const activeFilter = filterStatus !== 'all'

  return (
    <Flex vertical className="app-drag" style={{ height: '100%', padding: 12, gap: 8 }}>
      {/* 顶部一行：新建任务 + 搜索/筛选图标（macOS 红绿灯按钮区域下方） */}
      <div className="app-no-drag" style={{ marginTop: 30, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <NewTaskButton />
        </div>
        <Popover
          open={searchOpen}
          onOpenChange={setSearchOpen}
          placement="bottomRight"
          trigger="click"
          styles={{ container: { padding: 4 } }}
          content={
            <Input
              autoFocus
              allowClear
              placeholder="搜索任务..."
              defaultValue={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />
          }
        >
          <Tooltip title="搜索任务">
            <Button icon={<SearchOutlined />} />
          </Tooltip>
        </Popover>
        <Popover
          placement="bottomRight"
          trigger="click"
          styles={{ container: { padding: 4 } }}
          content={
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={FILTER_OPTIONS}
              style={{ width: 120 }}
            />
          }
        >
          <Tooltip title="按状态筛选">
            <Button icon={<FilterOutlined />} type={activeFilter ? 'primary' : 'default'} />
          </Tooltip>
        </Popover>
      </div>

      {/* 搜索激活时显示的完整搜索框 */}
      {searchOpen && (
        <div className="app-no-drag">
          <Input
            autoFocus
            allowClear
            placeholder="搜索任务..."
            defaultValue={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* 中部：任务列表 */}
      <div className="app-no-drag" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <TaskList />
      </div>

      {/* 底部：设置 + 主题切换 */}
      <div className="app-no-drag" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
