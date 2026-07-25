import { Select } from 'antd'
import type { TaskStatus } from '../../types'
import { useTaskStore } from '../../stores/taskStore'

const OPTIONS: Array<{ label: string; value: TaskStatus | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
  { label: '已归档', value: 'archived' },
]

export default function TaskFilter() {
  const filterStatus = useTaskStore((s) => s.filterStatus)
  const setFilterStatus = useTaskStore((s) => s.setFilterStatus)

  return (
    <Select
      value={filterStatus}
      onChange={setFilterStatus}
      options={OPTIONS}
      style={{ width: '100%' }}
    />
  )
}
