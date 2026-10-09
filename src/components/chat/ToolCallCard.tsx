import { Collapse, Tag, Button, Tooltip, App as AntdApp } from 'antd'
import type { CollapseProps } from 'antd'
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons'
import type { ToolCall, ToolResult } from '../../types'
import { useThemeToken } from '../../hooks/useThemeToken'
import { useTaskStore } from '../../stores/taskStore'
import { ipc } from '../../services/ipc'

interface ToolCallCardProps {
  toolCall: ToolCall
  result?: ToolResult
}

export default function ToolCallCard({ toolCall, result }: ToolCallCardProps) {
  const hasResult = !!result
  const isError = result?.isError
  const { token } = useThemeToken()
  const { message } = AntdApp.useApp()

  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const task = tasks.find((t) => t.id === selectedTaskId)

  // file_write 成功后提供"打开文件 / 打开所在目录"操作
  // 注：渲染进程无 Node path 模块，用简单拼接（主进程侧会规范化）
  const isSuccessfulWrite =
    toolCall.name === 'file_write' && hasResult && !isError
  const writtenFile =
    isSuccessfulWrite && task?.workspacePath
      ? `${task.workspacePath.replace(/\/+$/, '')}/${String(toolCall.arguments?.path ?? '').replace(/^\/+/, '')}`
      : null

  const handleOpenFile = async () => {
    if (!writtenFile) return
    try {
      await ipc.openPath(writtenFile)
    } catch (e) {
      void message.error(`打开文件失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleOpenFolder = async () => {
    if (!writtenFile) return
    try {
      await ipc.openInFolder(writtenFile)
    } catch (e) {
      void message.error(`打开目录失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  let statusTag = (
    <Tag color="blue" icon={<LoadingOutlined />}>
      执行中
    </Tag>
  )
  if (hasResult) {
    statusTag = isError ? (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        失败
      </Tag>
    ) : (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        成功
      </Tag>
    )
  }

  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
        {toolCall.name}
      </span>
      {statusTag}
      {writtenFile && (
        <span style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
          <Tooltip title={`打开文件：${toolCall.arguments?.path}`}>
            <Button
              size="small"
              type="text"
              icon={<FileOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                void handleOpenFile()
              }}
            />
          </Tooltip>
          <Tooltip title="打开所在目录">
            <Button
              size="small"
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                void handleOpenFolder()
              }}
            />
          </Tooltip>
        </span>
      )}
    </div>
  )

  const items: CollapseProps['items'] = [
    {
      key: toolCall.id,
      label: header,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div
              style={{
                color: token.colorTextSecondary,
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              参数
            </div>
            <pre
              style={{
                background: token.colorFillQuaternary,
                padding: 8,
                borderRadius: 4,
                margin: 0,
                fontSize: 12,
                overflow: 'auto',
              }}
            >
              <code>{JSON.stringify(toolCall.arguments, null, 2)}</code>
            </pre>
          </div>
          {result && (
            <div>
              <div
                style={{
                  color: token.colorTextSecondary,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                输出
              </div>
              <pre
                style={{
                  background: token.colorFillQuaternary,
                  padding: 8,
                  borderRadius: 4,
                  margin: 0,
                  fontSize: 12,
                  maxHeight: 240,
                  overflow: 'auto',
                  color: isError ? '#ff7875' : 'inherit',
                }}
              >
                <code>{result.output}</code>
              </pre>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <Collapse
      size="small"
      items={items}
      style={{ marginBottom: 4, background: 'transparent' }}
    />
  )
}
