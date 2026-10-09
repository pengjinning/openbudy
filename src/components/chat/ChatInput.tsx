import { useState } from 'react'
import { Input, Button, Upload, Popover, Tooltip, Flex } from 'antd'
import type { UploadFile } from 'antd'
import {
  SendOutlined,
  PaperClipOutlined,
  SnippetsOutlined,
} from '@ant-design/icons'
import { useTaskStore } from '../../stores/taskStore'
import { useAgent } from '../../hooks/useAgent'
import { useFileUpload } from '../../hooks/useFileUpload'
import { useSettingsStore } from '../../stores/settingsStore'
import { useThemeToken } from '../../hooks/useThemeToken'
import { ipc } from '../../services/ipc'

const ACCEPT =
  '.txt,.md,.json,.js,.ts,.tsx,.jsx,.py,.css,.html,.xml,.yaml,.yml,.csv,.pdf,.png,.jpg,.jpeg,.gif'

export default function ChatInput() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const task = tasks.find((t) => t.id === selectedTaskId)
  const { execute, isRunning, stop } = useAgent(selectedTaskId)
  const { upload, uploading } = useFileUpload(selectedTaskId)
  const { token } = useThemeToken()
  const modelsConfig = useSettingsStore((s) => s.modelsConfig)
  const [value, setValue] = useState('')
  const [refFiles, setRefFiles] = useState<{ name: string; path: string }[]>([])

  const handleSend = async () => {
    if (!value.trim() || !selectedTaskId) return
    const msg = value
    setValue('')
    await execute(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 发送
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      void handleSend()
      return
    }
    // Shift+Enter 换行，默认行为即可，无需拦截
  }

  const handleUpload = async (file: File): Promise<boolean> => {
    await upload(file)
    return false // 阻止 antd 默认上传行为
  }

  const loadRefFiles = async () => {
    if (!task) return
    const list = await ipc.fileList(task.workspacePath)
    setRefFiles(
      list
        .filter((f: { name: string; path: string; isDirectory: boolean }) => !f.isDirectory)
        .map((f: { name: string; path: string }) => ({ name: f.name, path: f.path }))
    )
  }

  const refPopoverContent = (
    <div
      style={{
        maxHeight: 240,
        overflow: 'auto',
        width: 280,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {refFiles.length === 0 ? (
        <span style={{ fontSize: 12, color: token.colorTextSecondary, padding: '6px 8px' }}>
          无文件
        </span>
      ) : (
        refFiles.map((item) => (
          <div
            key={item.path}
            style={{ cursor: 'pointer', padding: '6px 8px', fontSize: 12 }}
            onClick={() => {
              setValue((v) => `${v} @${item.name}`)
            }}
          >
            {item.name}
          </div>
        ))
      )}
    </div>
  )

  if (!task) {
    return null
  }

  const uploadProps = {
    accept: ACCEPT,
    showUploadList: false,
    beforeUpload: handleUpload,
    fileList: [] as UploadFile[],
  }

  return (
    <div
      style={{
        borderTop: `1px solid ${token.colorSplit}`,
        padding: 12,
        background: token.colorBgContainer,
      }}
    >
      <Input.TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息... (Ctrl+Enter 发送, Shift+Enter 换行)"
        autoSize={{ minRows: 1, maxRows: 6 }}
        style={{ marginBottom: 8 }}
      />
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <Upload {...uploadProps}>
            <Tooltip title="上传附件">
              <Button
                size="small"
                icon={<PaperClipOutlined />}
                loading={uploading}
              />
            </Tooltip>
          </Upload>
          <Popover
            content={refPopoverContent}
            title="引用文件"
            trigger="click"
            onOpenChange={(open) => open && void loadRefFiles()}
          >
            <Tooltip title="@ 引用文件">
              <Button size="small" icon={<SnippetsOutlined />} />
            </Tooltip>
          </Popover>
        </Flex>
        {isRunning ? (
          <Button danger size="small" onClick={stop}>
            停止
          </Button>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!value.trim()}
          >
            发送
          </Button>
        )}
      </Flex>
    </div>
  )
}
