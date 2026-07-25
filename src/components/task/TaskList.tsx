import { List, Empty } from 'antd'
import TaskCard from './TaskCard'
import { useTaskStore } from '../../stores/taskStore'
import type { Task } from '../../types'

export default function TaskList() {
  const tasks = useTaskStore((s) => s.tasks)
  const searchQuery = useTaskStore((s) => s.searchQuery)
  const filterStatus = useTaskStore((s) => s.filterStatus)

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === 'all' || t.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // 置顶任务排在前面
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt - a.updatedAt
  })

  if (sorted.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无任务"
        style={{ marginTop: 32 }}
      />
    )
  }

  return (
    <List
      dataSource={sorted}
      renderItem={(task: Task) => <TaskCard task={task} />}
      split={false}
    />
  )
}
