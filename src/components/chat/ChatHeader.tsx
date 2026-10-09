import { Flex, Typography, Tooltip, Button } from 'antd'
import {
  SearchOutlined,
  ShareAltOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import ModelSelector from './ModelSelector'
import { useTaskStore } from '../../stores/taskStore'
import { useThemeToken } from '../../hooks/useThemeToken'

const { Text } = Typography

export default function ChatHeader() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const task = tasks.find((t) => t.id === selectedTaskId)
  const { token } = useThemeToken()

  return (
    <Flex
      className="app-drag"
      align="center"
      justify="space-between"
      style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${token.colorSplit}`,
        background: token.colorBgContainer,
      }}
    >
      <Text
        ellipsis
        style={{ flex: 1, marginRight: 12, color: token.colorText }}
      >
        {task?.title ?? '未选择任务'}
      </Text>
      <Flex className="app-no-drag" align="center" gap={8}>
        <ModelSelector />
        <Tooltip title="搜索">
          <Button size="small" icon={<SearchOutlined />} />
        </Tooltip>
        <Tooltip title="分享">
          <Button size="small" icon={<ShareAltOutlined />} />
        </Tooltip>
        <Tooltip title="历史">
          <Button size="small" icon={<HistoryOutlined />} />
        </Tooltip>
      </Flex>
    </Flex>
  )
}
