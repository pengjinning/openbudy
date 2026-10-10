import { useMemo, useState } from 'react'
import { Button, Collapse, Empty, Flex, Tag, Tooltip, Typography } from 'antd'
import type { CollapseProps } from 'antd'
import {
  ClearOutlined,
  CopyOutlined,
  DownOutlined,
  RightOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import type { AgentLLMRequestEvent, AgentLLMResponseEvent } from '../../types'
import type { LLMTraceEntry } from '../../stores/debugStore'
import { useDebugStore } from '../../stores/debugStore'
import { useTaskStore } from '../../stores/taskStore'
import { useThemeToken } from '../../hooks/useThemeToken'

const { Text } = Typography

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatDuration(ms?: number): string {
  if (ms == null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTokens(n?: number): string {
  if (n == null) return '-'
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function PreBlock({ text, isError }: { text: string; isError?: boolean }) {
  const { token } = useThemeToken()
  return (
    <pre
      style={{
        background: token.colorFillQuaternary,
        padding: 8,
        borderRadius: 4,
        margin: 0,
        fontSize: 12,
        maxHeight: 300,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: isError ? token.colorError : 'inherit',
      }}
    >
      <code>{text}</code>
    </pre>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { token } = useThemeToken()
  return (
    <Tooltip title={label}>
      <Button
        size="small"
        type="text"
        icon={<CopyOutlined />}
        onClick={() => {
          void navigator.clipboard?.writeText(text)
        }}
        style={{ color: token.colorTextTertiary }}
      />
    </Tooltip>
  )
}

/** 请求详情：system / messages（含用户输入与历史）/ tools 定义 */
function RequestDetail({ request }: { request: AgentLLMRequestEvent }) {
  const { token } = useThemeToken()
  const sectionTitle = (t: string) => (
    <div style={{ color: token.colorTextSecondary, fontSize: 12, margin: '8px 0 4px' }}>
      {t}
    </div>
  )

  return (
    <div>
      {sectionTitle(`System Prompt（${request.systemPrompt.length} 字符）`)}
      <PreBlock text={request.systemPrompt || '（空）'} />
      {sectionTitle(`Messages（${request.messages.length} 条，含用户输入与历史）`)}
      <PreBlock text={JSON.stringify(request.messages, null, 2)} />
      {sectionTitle(`Tools（${request.tools.length} 个）`)}
      {request.tools.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 12 }}>
          无
        </Text>
      ) : (
        <Flex vertical gap={4}>
          {request.tools.map((t) => (
            <div key={t.name}>
              <Text code style={{ fontSize: 12 }}>
                {t.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                {t.description.slice(0, 80)}
                {t.description.length > 80 ? '…' : ''}
              </Text>
            </div>
          ))}
        </Flex>
      )}
    </div>
  )
}

/** 响应详情：文本 / 思考 / 工具调用 / 用量 */
function ResponseDetail({ response }: { response: AgentLLMResponseEvent }) {
  const { token } = useThemeToken()
  const sectionTitle = (t: string) => (
    <div style={{ color: token.colorTextSecondary, fontSize: 12, margin: '8px 0 4px' }}>
      {t}
    </div>
  )

  return (
    <div>
      {response.error ? (
        <>
          {sectionTitle('错误')}
          <PreBlock text={response.error} isError />
        </>
      ) : (
        <>
          {response.thinking ? (
            <>
              {sectionTitle('思考过程')}
              <PreBlock text={response.thinking} />
            </>
          ) : null}
          {sectionTitle('回复文本')}
          <PreBlock text={response.text || '（空）'} />
          {response.toolCalls.length > 0 ? (
            <>
              {sectionTitle(`工具调用（${response.toolCalls.length} 个）`)}
              <PreBlock text={JSON.stringify(response.toolCalls, null, 2)} />
            </>
          ) : null}
          {response.usage ? (
            <>
              {sectionTitle('Token 用量')}
              <Flex gap={12} wrap="wrap" style={{ fontSize: 12 }}>
                <Text type="secondary">
                  输入 {formatTokens(response.usage.input)}
                </Text>
                <Text type="secondary">
                  输出 {formatTokens(response.usage.output)}
                </Text>
                <Text type="secondary">
                  缓存读 {formatTokens(response.usage.cacheRead)}
                </Text>
                <Text type="secondary">
                  缓存写 {formatTokens(response.usage.cacheWrite)}
                </Text>
                <Text type="secondary">
                  合计 {formatTokens(response.usage.totalTokens)}
                </Text>
              </Flex>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

function TraceItem({ entry }: { entry: LLMTraceEntry }) {
  const { token } = useThemeToken()
  const [activeView, setActiveView] = useState<'request' | 'response'>(
    'request'
  )

  const hasRequest = !!entry.request
  const hasResponse = !!entry.response
  const response = entry.response
  const isError = !!response?.error

  const header = (
    <Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
      <Tag
        color={isError ? 'red' : entry.iteration % 2 === 0 ? 'geekblue' : 'cyan'}
        style={{ marginInlineEnd: 0 }}
      >
        #{entry.iteration}
      </Tag>
      <Text style={{ fontSize: 12 }} ellipsis>
        {entry.request?.model.name ?? response?.model.name ?? `迭代 ${entry.iteration}`}
      </Text>
      {hasResponse && !isError && (
        <Tag style={{ marginInlineEnd: 0 }} icon={<SendOutlined />}>
          {response?.toolCalls.length ? `${response.toolCalls.length} 工具` : '纯文本'}
        </Tag>
      )}
      {isError && (
        <Tag color="red" style={{ marginInlineEnd: 0 }}>
          失败
        </Tag>
      )}
      <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
        {formatTime(entry.timestamp)}
        {response ? ` · ${formatDuration(response.durationMs)}` : ' · 请求中…'}
      </Text>
    </Flex>
  )

  const requestJson = entry.request
    ? JSON.stringify(entry.request, null, 2)
    : ''
  const responseJson = response ? JSON.stringify(response, null, 2) : ''

  const items: CollapseProps['items'] = [
    {
      key: entry.id,
      label: header,
      children: (
        <div>
          <Flex
            align="center"
            gap={4}
            style={{ marginBottom: 8, borderBottom: `1px solid ${token.colorSplit}`, paddingBottom: 8 }}
          >
            <Button
              size="small"
              type={activeView === 'request' ? 'link' : 'text'}
              icon={<ArrowLeftOutlined />}
              disabled={!hasRequest}
              onClick={() => setActiveView('request')}
              style={{ paddingInline: 6 }}
            >
              请求
            </Button>
            <Button
              size="small"
              type={activeView === 'response' ? 'link' : 'text'}
              icon={<SendOutlined />}
              disabled={!hasResponse}
              onClick={() => setActiveView('response')}
              style={{ paddingInline: 6 }}
            >
              响应
            </Button>
            <Text type="secondary" style={{ marginLeft: 'auto', fontSize: 12 }}>
              {activeView === 'request' ? '完整请求 JSON' : '完整响应 JSON'}
            </Text>
            {activeView === 'request' && hasRequest && (
              <CopyButton text={requestJson} label="复制请求 JSON" />
            )}
            {activeView === 'response' && hasResponse && (
              <CopyButton text={responseJson} label="复制响应 JSON" />
            )}
          </Flex>
          {activeView === 'request' ? (
            entry.request ? (
              <RequestDetail request={entry.request} />
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                无请求数据
              </Text>
            )
          ) : response ? (
            <ResponseDetail response={response} />
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              等待响应…
            </Text>
          )}
        </div>
      ),
    },
  ]

  return (
    <Collapse
      size="small"
      items={items}
      expandIcon={({ isActive }) =>
        isActive ? <DownOutlined /> : <RightOutlined />
      }
      style={{ background: 'transparent' }}
    />
  )
}

export default function DebugTraces() {
  const { token } = useThemeToken()
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tracesByTask = useDebugStore((s) => s.tracesByTask)
  const clearTask = useDebugStore((s) => s.clearTask)

  const traces = useMemo(
    () => (selectedTaskId ? (tracesByTask[selectedTaskId] ?? []) : []),
    [selectedTaskId, tracesByTask]
  )

  // 统计：总请求数、总 token、总耗时
  const stats = useMemo(() => {
    let totalTokens = 0
    let totalCost = 0
    let requestCount = 0
    for (const t of traces) {
      if (t.request) requestCount += 1
      if (t.response?.usage) {
        totalTokens += t.response.usage.totalTokens
        totalCost += t.response.usage.cost.total
      }
    }
    return { requestCount, totalTokens, totalCost }
  }, [traces])

  if (!selectedTaskId) {
    return <Empty description="未选择任务" />
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: 8 }}
      >
        <Flex gap={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {stats.requestCount} 次请求
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatTokens(stats.totalTokens)} tokens
          </Text>
          {stats.totalCost > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${stats.totalCost.toFixed(4)}
            </Text>
          )}
        </Flex>
        <Button
          size="small"
          type="text"
          icon={<ClearOutlined />}
          disabled={traces.length === 0}
          onClick={() => clearTask(selectedTaskId)}
        >
          清空
        </Button>
      </Flex>
      {traces.length === 0 ? (
        <Empty
          description="暂无模型请求记录，发送消息后此处将显示完整的请求与响应"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Flex vertical gap={2}>
          {traces.map((entry) => (
            <div
              key={entry.id}
              style={{ borderBottom: `1px solid ${token.colorSplit}`, paddingBottom: 2 }}
            >
              <TraceItem entry={entry} />
            </div>
          ))}
        </Flex>
      )}
    </div>
  )
}
