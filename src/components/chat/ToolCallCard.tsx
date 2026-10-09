import { Collapse, Tag } from 'antd'
import type { CollapseProps } from 'antd'
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import type { ToolCall, ToolResult } from '../../types'
import { useThemeToken } from '../../hooks/useThemeToken'

interface ToolCallCardProps {
  toolCall: ToolCall
  result?: ToolResult
}

export default function ToolCallCard({ toolCall, result }: ToolCallCardProps) {
  const hasResult = !!result
  const isError = result?.isError
  const { token } = useThemeToken()

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
