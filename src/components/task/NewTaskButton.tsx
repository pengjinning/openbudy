import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTask } from '../../hooks/useTask'
import { useSettingsStore } from '../../stores/settingsStore'

/** 新建任务默认标题（首次对话后根据对话内容自动生成） */
export const DEFAULT_TASK_TITLE = '新任务'

export default function NewTaskButton() {
  const { createAndSelect } = useTask()
  const modelsConfig = useSettingsStore((s) => s.modelsConfig)

  const handleCreate = async () => {
    // 一键创建：默认标题 + 默认模型 + craft 模式（支持工具调用，对话体验最完整）
    const modelId =
      modelsConfig.models.find((m) => m.id === modelsConfig.defaultModel)?.id ??
      modelsConfig.models[0]?.id ??
      ''
    await createAndSelect(DEFAULT_TASK_TITLE, 'craft', modelId)
  }

  return (
    <Button
      type="dashed"
      block
      icon={<PlusOutlined />}
      onClick={() => void handleCreate()}
    >
      新建任务
    </Button>
  )
}
