import { useEffect, useRef } from 'react'
import { Spin, Empty, Flex } from 'antd'
import MessageItem from './MessageItem'
import { useChatStore } from '../../stores/chatStore'
import { useTaskStore } from '../../stores/taskStore'
import { useThemeToken } from '../../hooks/useThemeToken'

export default function MessageList() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const messagesByTask = useChatStore((s) => s.messagesByTask)
  const streamingTasks = useChatStore((s) => s.streamingTasks)
  const loadMessages = useChatStore((s) => s.loadMessages)
  const containerRef = useRef<HTMLDivElement>(null)
  const { token } = useThemeToken()

  const messages = selectedTaskId ? messagesByTask[selectedTaskId] ?? [] : []
  const isStreaming = selectedTaskId
    ? streamingTasks.has(selectedTaskId)
    : false

  useEffect(() => {
    if (selectedTaskId) {
      void loadMessages(selectedTaskId)
    }
  }, [selectedTaskId, loadMessages])

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length, isStreaming])

  if (messages.length === 0 && !isStreaming) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: '100%' }}
      >
        <Empty description="开始对话吧" />
      </Flex>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '16px 20px',
      }}
    >
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
      {isStreaming && (
        <Flex
          align="center"
          gap={8}
          style={{ padding: '8px 0', color: token.colorTextSecondary }}
        >
          <Spin size="small" />
          <span>正在思考...</span>
        </Flex>
      )}
    </div>
  )
}
