import { useState } from 'react'
import { Card, Avatar, Tooltip, Button } from 'antd'
import { UserOutlined, RobotOutlined, CopyOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import type { Message } from '../../types'
import ToolCallCard from './ToolCallCard'

interface MessageItemProps {
  message: Message
}

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const text = typeof children === 'string' ? children : String(children)
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div style={{ position: 'relative' }}>
      <pre className={className} style={{ margin: 0 }}>
        {children}
      </pre>
      <Tooltip title={copied ? '已复制' : '复制'}>
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={handleCopy}
          style={{ position: 'absolute', top: 8, right: 8, opacity: 0.7 }}
        />
      </Tooltip>
    </div>
  )
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'
  const avatar = isUser ? <UserOutlined /> : <RobotOutlined />

  const alignStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: 16,
    gap: 8,
  }

  const bubbleStyle: React.CSSProperties = isUser
    ? {
        maxWidth: '75%',
        background: 'rgba(22, 119, 255, 0.15)',
        border: '1px solid rgba(22, 119, 255, 0.3)',
        borderRadius: 12,
        padding: '8px 12px',
      }
    : {
        maxWidth: '80%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '8px 12px',
      }

  const avatarOrder = isUser ? 'row-reverse' : 'row'

  return (
    <div
      style={{
        ...alignStyle,
        flexDirection: avatarOrder as 'row' | 'row-reverse',
      }}
    >
      <Avatar
        icon={avatar}
        style={{
          background: isUser ? '#1677ff' : '#52c41a',
          flexShrink: 0,
        }}
      />
      <div style={bubbleStyle}>
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </div>
        ) : (
          <>
            {message.content ? (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: ({ children, className }) => (
                      <CodeBlock className={className}>{children}</CodeBlock>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>...</span>
            )}

            {message.toolCalls && message.toolCalls.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {message.toolCalls.map((tc) => {
                  const result = message.toolResults?.find(
                    (r) => r.toolCallId === tc.id
                  )
                  return <ToolCallCard key={tc.id} toolCall={tc} result={result} />
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
