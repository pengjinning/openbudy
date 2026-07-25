import { useState } from 'react'
import { Button, Modal, Form, Input, Segmented, Select, Space } from 'antd'
import { PlusOutlined, FolderOpenOutlined } from '@ant-design/icons'
import type { TaskMode } from '../../types'
import { useTask } from '../../hooks/useTask'
import { useSettingsStore } from '../../stores/settingsStore'
import { ipc } from '../../services/ipc'

export default function NewTaskButton() {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const { createAndSelect } = useTask()
  const modelsConfig = useSettingsStore((s) => s.modelsConfig)
  const [submitting, setSubmitting] = useState(false)

  const handleSelectDir = async () => {
    const dir = await ipc.selectDirectory()
    form.setFieldValue('workspacePath', dir)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await createAndSelect(
        values.title,
        values.mode as TaskMode,
        values.modelId,
        values.workspacePath
      )
      setOpen(false)
      form.resetFields()
    } catch {
      // 校验失败
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        新建任务
      </Button>
      <Modal
        title="新建任务"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            mode: 'ask',
            modelId: modelsConfig.defaultModel,
            workspacePath: '',
          }}
        >
          <Form.Item
            name="title"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <Input placeholder="输入任务描述..." autoFocus />
          </Form.Item>
          <Form.Item name="mode" label="模式">
            <Segmented
              options={[
                { label: '问一问', value: 'ask' },
                { label: '做一做', value: 'craft' },
                { label: '想一想', value: 'plan' },
              ]}
            />
          </Form.Item>
          <Form.Item name="modelId" label="模型">
            <Select
              options={modelsConfig.models.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="workspacePath" label="工作目录">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={form.getFieldValue('workspacePath')}
                placeholder="选择工作目录"
                readOnly
              />
              <Button icon={<FolderOpenOutlined />} onClick={handleSelectDir} />
            </Space.Compact>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
