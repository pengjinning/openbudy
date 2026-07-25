import { useEffect, useState } from 'react'
import { Spin, Empty } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Editor from '@monaco-editor/react'
import { ipc } from '../../services/ipc'
import { useResultStore } from '../../stores/resultStore'

const CODE_EXT = ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'css', 'scss', 'less', 'go', 'rs', 'java', 'c', 'cpp', 'h']
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
const HTML_EXT = ['html', 'htm']

function getExt(filePath: string): string {
  const parts = filePath.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

function getLanguage(ext: string): string {
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    py: 'python',
    css: 'css',
    scss: 'scss',
    less: 'less',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    md: 'markdown',
    html: 'html',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'shell',
  }
  return map[ext] ?? 'plaintext'
}

export default function FilePreview() {
  const selectedFile = useResultStore((s) => s.selectedFile)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedFile) {
      setContent('')
      return
    }
    void (async () => {
      setLoading(true)
      try {
        const text = await ipc.fileRead(selectedFile)
        setContent(text)
      } finally {
        setLoading(false)
      }
    })()
  }, [selectedFile])

  if (!selectedFile) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="选择文件以预览" />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spin />
      </div>
    )
  }

  const ext = getExt(selectedFile)

  if (IMAGE_EXT.includes(ext)) {
    return (
      <div style={{ textAlign: 'center', padding: 12 }}>
        <img
          src={content}
          alt={selectedFile}
          style={{ maxWidth: '100%', maxHeight: '70vh' }}
        />
      </div>
    )
  }

  if (HTML_EXT.includes(ext)) {
    return (
      <iframe
        title="preview"
        srcDoc={content}
        sandbox="allow-scripts"
        style={{ width: '100%', height: '70vh', border: 'none' }}
      />
    )
  }

  if (ext === 'md') {
    return (
      <div className="markdown-body" style={{ padding: 12 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    )
  }

  if (CODE_EXT.includes(ext)) {
    return (
      <Editor
        height="70vh"
        theme="vs-dark"
        language={getLanguage(ext)}
        value={content}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
        }}
      />
    )
  }

  return (
    <pre
      style={{
        padding: 12,
        background: '#1f1f1f',
        borderRadius: 4,
        maxHeight: '70vh',
        overflow: 'auto',
        fontSize: 12,
      }}
    >
      <code>{content}</code>
    </pre>
  )
}
