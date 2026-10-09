import { Flex, Typography, Tooltip, Button } from 'antd'
import { SettingOutlined, BulbOutlined, MoonOutlined } from '@ant-design/icons'
import TaskSearch from '../task/TaskSearch'
import TaskFilter from '../task/TaskFilter'
import TaskList from '../task/TaskList'
import NewTaskButton from '../task/NewTaskButton'
import { useSettingsStore } from '../../stores/settingsStore'

const { Title } = Typography

export default function Sidebar() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)

  return (
    <Flex vertical className="app-drag" style={{ height: '100%', padding: 12, gap: 12 }}>
      {/* 顶部 Logo + 搜索（空白处可拖拽窗口） */}
      <Title level={4} style={{ color: '#1677ff', margin: 0 }}>
        OpenBudy
      </Title>
      <div className="app-no-drag">
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
        <Tooltip title={theme === 'dark' ? '切换到亮色' : '切换到暗色'}>
          <Button
            icon={theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </Tooltip>
      </div>
    </Flex>
  )
}
