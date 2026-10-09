import { useState, useEffect } from 'react'
import { Tabs, Segmented, Empty, Tag, Typography, Flex } from 'antd'
import type { TabsProps } from 'antd'
import FileTree from './FileTree'
import DiffView from './DiffView'
import BrowserPreview from './BrowserPreview'
import { useTaskStore } from '../../stores/taskStore'
import { useResultStore } from '../../stores/resultStore'
import { useThemeToken } from '../../hooks/useThemeToken'

const { Text } = Typography

type OverviewView = 'files' | 'changes' | 'browser'

export default function ResultTabs() {
  const [overviewView, setOverviewView] = useState<OverviewView>('files')
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const artifacts = useResultStore((s) => s.artifacts)
  const changedFiles = useResultStore((s) => s.changedFiles)
  const loadArtifacts = useResultStore((s) => s.loadArtifacts)
  const { token } = useThemeToken()

  useEffect(() => {
    if (selectedTaskId) {
      void loadArtifacts(selectedTaskId)
    }
  }, [selectedTaskId, loadArtifacts])

  const overviewContent = (
    <div style={{ padding: '8px 0' }}>
      <Segmented
        size="small"
        value={overviewView}
        onChange={(v) => setOverviewView(v as OverviewView)}
        options={[
          { label: '文件树', value: 'files' },
          { label: '变更', value: 'changes' },
          { label: '浏览器', value: 'browser' },
        ]}
        style={{ marginBottom: 12 }}
      />
      {overviewView === 'files' && <FileTree />}
      {overviewView === 'changes' && (
        <div>
          {changedFiles.length === 0 ? (
            <Empty description="无变更" />
          ) : (
            <DiffView />
          )}
        </div>
      )}
      {overviewView === 'browser' && <BrowserPreview />}
    </div>
  )

  const artifactsContent = (
    <div style={{ padding: '8px 0' }}>
      {artifacts.length === 0 ? (
        <Empty description="无产物" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {artifacts.map((a) => (
            <div
              key={a.id}
              style={{ padding: '10px 0', borderBottom: `1px solid ${token.colorSplit}` }}
            >
              <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                <div>
                  <Text>{a.fileName}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {a.fileType} · {(a.size / 1024).toFixed(2)} KB
                    </Text>
                  </div>
                </div>
                <Tag>{a.fileType}</Tag>
              </Flex>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const items: TabsProps['items'] = [
    { key: 'overview', label: '概览', children: overviewContent },
    { key: 'artifacts', label: '产物', children: artifactsContent },
  ]

  return <Tabs defaultActiveKey="overview" items={items} size="small" />
}
