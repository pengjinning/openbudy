import { useState } from 'react'
import { Card, Dropdown, Modal, Input, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  ClockCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  PauseCircleOutlined,
  PushpinOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { Task, TaskStatus } from '../../types'
import { useTaskStore } from '../../stores/taskStore'
import { useTask } from '../../hooks/useTask'
import { useThemeToken } from '../../hooks/useThemeToken'
import { useDragSuspension } from '../../hooks/useDragSuspension'

const { Text } = Typography

const STATUS_ICON: Record<
  TaskStatus,
  { icon: React.ReactNode; color: string }
> = {
  planning: { icon: <ClockCircleOutlined />, color: '#fa8c16' },
  running: { icon: <LoadingOutlined />, color: '#1677ff' }, // 与 antd colorPrimary 一致
  completed: { icon: <CheckCircleOutlined />, color: '#52c41a' },
  failed: { icon: <CloseCircleOutlined />, color: '#ff4d4f' },
  archived: { icon: <InboxOutlined />, color: '#8c8c8c' },
  stopped: { icon: <PauseCircleOutlined />, color: '#faad14' },
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  return new Date(ts).toLocaleDateString()
}

export default function TaskCard({ task }: { task: Task }) {
  const selectTask = useTaskStore((s) => s.selectTask)
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const { archive, togglePin, remove, update } = useTask()
  const { token } = useThemeToken()
  const [renameOpen, setRenameOpen] = useState(false)

  useDragSuspension(renameOpen)
  const [renameValue, setRenameValue] = useState(task.title)

  const statusInfo = STATUS_ICON[task.status]
  const selected = selectedTaskId === task.id

  const handleRename = async () => {
    if (renameValue.trim() && renameValue !== task.title) {
      await update(task.id, { title: renameValue.trim() })
    }
    setRenameOpen(false)
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除任务 "${task.title}" 吗？相关消息和产物将一并删除。`,
      okType: 'danger',
      onOk: () => remove(task.id),
    })
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'pin',
      icon: <PushpinOutlined />,
      label: task.pinned ? '取消置顶' : '置顶',
      onClick: () => togglePin(task.id),
    },
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => {
        setRenameValue(task.title)
        setRenameOpen(true)
      },
    },
    {
      key: 'archive',
      icon: <InboxOutlined />,
      label: '归档',
      onClick: () => archive(task.id),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: handleDelete,
    },
  ]

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
        <Card
          size="small"
          hoverable
          onClick={() => selectTask(task.id)}
          style={{
            marginBottom: 6,
            cursor: 'pointer',
            border: selected
              ? `1px solid ${token.colorPrimary}`
              : `1px solid ${token.colorSplit}`,
            background: selected
              ? token.colorPrimaryBg
              : token.colorBgContainer,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: statusInfo.color, fontSize: 14 }}>
              {statusInfo.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                ellipsis
                style={{
                  display: 'block',
                  color: token.colorText,
                }}
              >
                {task.pinned && (
                  <PushpinOutlined style={{ marginRight: 4, color: '#faad14' }} />
                )}
                {task.title}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 12 }}
              >
                {formatRelativeTime(task.updatedAt)}
              </Text>
            </div>
          </div>
        </Card>
      </Dropdown>

      <Modal
        title="重命名任务"
        open={renameOpen}
        onCancel={() => setRenameOpen(false)}
        onOk={handleRename}
      >
        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onPressEnter={handleRename}
          autoFocus
        />
      </Modal>
    </>
  )
}
