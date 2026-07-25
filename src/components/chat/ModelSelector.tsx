import { Select } from 'antd'
import { useTaskStore } from '../../stores/taskStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useTask } from '../../hooks/useTask'

export default function ModelSelector() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const modelsConfig = useSettingsStore((s) => s.modelsConfig)
  const { update } = useTask()

  const task = tasks.find((t) => t.id === selectedTaskId)

  if (!task) {
    return null
  }

  const handleChange = (value: string) => {
    if (task.id) {
      void update(task.id, { modelId: value })
    }
  }

  return (
    <Select
      size="small"
      value={task.modelId || modelsConfig.defaultModel}
      onChange={handleChange}
      style={{ width: 160 }}
      options={modelsConfig.models.map((m) => ({
        label: m.name,
        value: m.id,
      }))}
    />
  )
}
