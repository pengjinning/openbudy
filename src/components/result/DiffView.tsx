import { DiffEditor } from '@monaco-editor/react'
import { Empty } from 'antd'
import { useResultStore } from '../../stores/resultStore'

export default function DiffView() {
  const changedFiles = useResultStore((s) => s.changedFiles)

  if (changedFiles.length === 0) {
    return <Empty description="无变更" />
  }

  // 显示第一个变更文件的 diff（mock 空内容）
  const first = changedFiles[0]
  return (
    <div>
      <div
        style={{
          padding: '6px 8px',
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {first.path}{' '}
        <span style={{ color: '#52c41a' }}>+{first.added}</span>{' '}
        <span style={{ color: '#ff4d4f' }}>-{first.deleted}</span>
      </div>
      <DiffEditor
        height="60vh"
        theme="vs-dark"
        original="// 原始内容（只读）"
        modified="// 修改后内容（只读）"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          fontSize: 13,
        }}
      />
    </div>
  )
}
