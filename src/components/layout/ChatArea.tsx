import { Empty, Flex } from 'antd'
import ChatHeader from '../chat/ChatHeader'
import MessageList from '../chat/MessageList'
import ChatInput from '../chat/ChatInput'
import { useTaskStore } from '../../stores/taskStore'

export default function ChatArea() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)

  if (!selectedTaskId) {
    return (
      <Flex
        className="app-drag"
        align="center"
        justify="center"
        vertical
        style={{ height: '100%', gap: 12 }}
      >
        <Empty description="尚未选择任务" />
        <div style={{ color: 'rgba(255,255,255,0.45)' }}>
          创建一个新任务开始
        </div>
      </Flex>
    )
  }

  return (
    <Flex vertical style={{ height: '100%' }}>
      <ChatHeader />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <MessageList />
      </div>
      <ChatInput />
    </Flex>
  )
}
