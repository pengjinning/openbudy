import { useState } from 'react'
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Alert,
  Tag,
  App as AntdApp,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { ModelConfig } from '../../types'
import { useSettingsStore } from '../../stores/settingsStore'
import { useDragSuspension } from '../../hooks/useDragSuspension'
import { useThemeToken } from '../../hooks/useThemeToken'
import { ipc } from '../../services/ipc'
import { DEEPSEEK_PRESETS } from '../../../agent-core/llm/deepseek-presets'

const { Text } = Typography

/** 智谱预设 baseUrl（普通 API，OpenAI 兼容接口） */
const ZHIPU_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4'

/** DeepSeek API Key 申请入口 */
const DEEPSEEK_KEY_URL = 'https://platform.deepseek.com/api_keys'

const EMPTY_CUSTOM_MODEL: ModelConfig = {
  id: '',
  name: '',
  provider: '',
  baseUrl: '',
  apiKey: '',
  maxInputTokens: 128000,
  maxOutputTokens: 8192,
  supportsToolCalling: true,
}

export default function SettingsModal() {
  const settingsOpen = useSettingsStore((s) => s.settingsOpen)
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const workspaceRoot = useSettingsStore((s) => s.workspaceRoot)
  const setWorkspaceRoot = useSettingsStore((s) => s.setWorkspaceRoot)
  const modelsConfig = useSettingsStore((s) => s.modelsConfig)
  const setDefaultModel = useSettingsStore((s) => s.setDefaultModel)
  const addModel = useSettingsStore((s) => s.addModel)
  const updateModel = useSettingsStore((s) => s.updateModel)
  const removeModel = useSettingsStore((s) => s.removeModel)

  const { message } = AntdApp.useApp()
  const { token } = useThemeToken()

  const [addingModel, setAddingModel] = useState(false)
  const [newModel, setNewModel] = useState<ModelConfig>(EMPTY_CUSTOM_MODEL)

  // Electron 拖拽区会吞掉弹窗内的真实鼠标点击（合成器层几何命中，浮层无法遮挡），
  // 打开期间挂起全部拖拽区，关闭后恢复。详见 useDragSuspension 注释。
  useDragSuspension(settingsOpen)

  const zhipuModels = modelsConfig.models.filter((m) => m.provider === 'zhipu')
  const zhipuApiKey = zhipuModels[0]?.apiKey ?? ''
  const deepseekModels = modelsConfig.models.filter((m) => m.provider === 'DeepSeek')
  const deepseekApiKey = deepseekModels[0]?.apiKey ?? ''

  /** 智谱 Key 一次填写，同步到所有智谱预设模型 */
  const handleZhipuKeyChange = (key: string) => {
    for (const m of zhipuModels) {
      updateModel(m.id, { apiKey: key })
    }
  }

  /** DeepSeek Key 一次填写，同步到所有 DeepSeek 预设模型 */
  const handleDeepseekKeyChange = (key: string) => {
    for (const m of deepseekModels) {
      updateModel(m.id, { apiKey: key })
    }
  }

  const handleSelectWorkspace = async () => {
    const dir = await ipc.selectDirectory()
    if (dir) {
      setWorkspaceRoot(dir)
    }
  }

  const handleAddModel = () => {
    if (!newModel.id.trim() || !newModel.baseUrl.trim()) {
      void message.warning('请至少填写模型 ID 和 Base URL')
      return
    }
    if (modelsConfig.models.some((m) => m.id === newModel.id)) {
      void message.warning(`模型 ${newModel.id} 已存在`)
      return
    }
    addModel({
      ...newModel,
      name: newModel.name.trim() || newModel.id,
      provider: newModel.provider.trim() || 'custom',
    })
    setNewModel(EMPTY_CUSTOM_MODEL)
    setAddingModel(false)
    void message.success(`已添加模型 ${newModel.id}`)
  }

  const generalTab = (
    <Form layout="vertical" style={{ maxWidth: 480 }}>
      <Form.Item label="界面主题">
        <Select
          value={theme}
          onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
          style={{ width: 200 }}
          options={[
            { label: '跟随系统', value: 'system' },
            { label: '暗色', value: 'dark' },
            { label: '亮色', value: 'light' },
          ]}
        />
      </Form.Item>
      <Form.Item label="工作区根目录" extra="新建任务的工作空间将创建在此目录下">
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={workspaceRoot}
            onChange={(e) => setWorkspaceRoot(e.target.value)}
          />
          <Button icon={<FolderOpenOutlined />} onClick={() => void handleSelectWorkspace()}>
            选择
          </Button>
        </Space.Compact>
      </Form.Item>
    </Form>
  )

  /** 共享的模型列表（provider Key tab 用）：名称 + id + Key 状态 + 设为默认 */
  const renderModelRows = (models: ModelConfig[]) => (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {models.length === 0 && (
        <Text type="secondary">暂无预设模型，可在「模型管理」中添加</Text>
      )}
      {models.map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 6,
          }}
        >
          <Text strong style={{ minWidth: 140 }}>{m.name}</Text>
          <Tag>{m.id}</Tag>
          {m.apiKey ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>已配置 Key</Tag>
          ) : (
            <Tag color="orange">未配置 Key</Tag>
          )}
          <div style={{ flex: 1 }} />
          {modelsConfig.defaultModel === m.id ? (
            <Tag color="blue">默认</Tag>
          ) : (
            <Button
              size="small"
              type="text"
              onClick={() => setDefaultModel(m.id)}
            >
              设为默认
            </Button>
          )}
        </div>
      ))}
    </div>
  )

  const zhipuTab = (
    <div style={{ maxWidth: 560 }}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="智谱开放平台 API Key"
        description={
          <span>
            在{' '}
            <a
              href="https://open.bigmodel.cn/usercenter/apikeys"
              target="_blank"
              rel="noreferrer"
            >
              智谱开放平台 → API Keys
            </a>{' '}
            页面创建。Key 会保存在本地 <Text code>~/.openbudy/config.json</Text>，
            仅用于直接请求 <Text code>open.bigmodel.cn</Text>。
          </span>
        }
      />
      <Form layout="vertical">
        <Form.Item
          label="API Key"
          extra="一次填写即可应用到下方所有智谱模型"
        >
          <Input.Password
            placeholder="例如 xxxxxxxxxx.xxxxxxxxxxxx"
            value={zhipuApiKey}
            onChange={(e) => handleZhipuKeyChange(e.target.value)}
            style={{ maxWidth: 420 }}
          />
        </Form.Item>
      </Form>
      <Text type="secondary" style={{ fontSize: 12 }}>
        可用模型（请求走 {ZHIPU_BASE_URL}）
      </Text>
      {renderModelRows(zhipuModels)}
    </div>
  )

  const deepseekTab = (
    <div style={{ maxWidth: 560 }}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="DeepSeek 开放平台 API Key"
        description={
          <span>
            在{' '}
            <a
              href={DEEPSEEK_KEY_URL}
              target="_blank"
              rel="noreferrer"
            >
              DeepSeek 开放平台 → API Keys
            </a>{' '}
            页面创建。Key 会保存在本地 <Text code>~/.openbudy/config.json</Text>，
            仅用于直接请求 <Text code>api.deepseek.com</Text>。
          </span>
        }
      />
      <Form layout="vertical">
        <Form.Item
          label="API Key"
          extra="一次填写即可应用到下方所有 DeepSeek 模型"
        >
          <Input.Password
            placeholder="sk-xxxxxxxxxxxxxxxx"
            value={deepseekApiKey}
            onChange={(e) => handleDeepseekKeyChange(e.target.value)}
            style={{ maxWidth: 420 }}
          />
        </Form.Item>
      </Form>
      <Text type="secondary" style={{ fontSize: 12 }}>
        可用模型（{DEEPSEEK_PRESETS.map((p) => p.id).join(' / ')}）
      </Text>
      {renderModelRows(deepseekModels)}
    </div>
  )

  const modelsTab = (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          所有模型（含智谱与其他 OpenAI 兼容服务）
        </Text>
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setAddingModel(true)}
        >
          添加模型
        </Button>
      </div>

      {addingModel && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            border: '1px dashed rgba(128,128,128,0.4)',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Space wrap>
            <Input
              size="small"
              placeholder="模型 ID（如 gpt-4o-mini）"
              style={{ width: 180 }}
              value={newModel.id}
              onChange={(e) => setNewModel((m) => ({ ...m, id: e.target.value }))}
            />
            <Input
              size="small"
              placeholder="显示名称（可选）"
              style={{ width: 140 }}
              value={newModel.name}
              onChange={(e) => setNewModel((m) => ({ ...m, name: e.target.value }))}
            />
            <Input
              size="small"
              placeholder="Provider（如 openai）"
              style={{ width: 130 }}
              value={newModel.provider}
              onChange={(e) => setNewModel((m) => ({ ...m, provider: e.target.value }))}
            />
          </Space>
          <Input
            size="small"
            placeholder="Base URL（OpenAI 兼容接口地址，如 https://api.deepseek.com）"
            value={newModel.baseUrl}
            onChange={(e) => setNewModel((m) => ({ ...m, baseUrl: e.target.value }))}
          />
          <Input.Password
            size="small"
            placeholder="API Key"
            style={{ maxWidth: 320 }}
            value={newModel.apiKey}
            onChange={(e) => setNewModel((m) => ({ ...m, apiKey: e.target.value }))}
          />
          <Space>
            <Button size="small" type="primary" onClick={handleAddModel}>
              保存
            </Button>
            <Button size="small" onClick={() => setAddingModel(false)}>
              取消
            </Button>
          </Space>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modelsConfig.models.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 6,
            }}
          >
            <Text strong style={{ minWidth: 140 }}>{m.name}</Text>
            <Tag>{m.id}</Tag>
            <Tag color={m.provider === 'zhipu' ? 'geekblue' : undefined}>{m.provider}</Tag>
            <Text type="secondary" style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.baseUrl}
            </Text>
            {m.apiKey ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>Key 已配置</Tag>
            ) : (
              <Tag color="orange">未配置 Key</Tag>
            )}
            {modelsConfig.defaultModel === m.id ? (
              <Tag color="blue">默认</Tag>
            ) : (
              <Button size="small" type="text" onClick={() => setDefaultModel(m.id)}>
                设为默认
              </Button>
            )}
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeModel(m.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Modal
      open={settingsOpen}
      title="设置"
      footer={null}
      width={720}
      onCancel={() => setSettingsOpen(false)}
      styles={{ body: { maxHeight: '65vh', overflow: 'auto' } }}
    >
      <Tabs
        items={[
          { key: 'general', label: '通用', children: generalTab },
          { key: 'zhipu', label: '智谱 API Key', children: zhipuTab },
          { key: 'deepseek', label: 'DeepSeek API Key', children: deepseekTab },
          { key: 'models', label: '模型管理', children: modelsTab },
        ]}
      />
    </Modal>
  )
}
