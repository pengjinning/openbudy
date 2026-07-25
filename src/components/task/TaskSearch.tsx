import { useRef } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useTaskStore } from '../../stores/taskStore'

export default function TaskSearch() {
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setSearchQuery(value)
    }, 300)
  }

  return (
    <Input
      prefix={<SearchOutlined />}
      placeholder="搜索任务..."
      allowClear
      onChange={handleChange}
    />
  )
}
