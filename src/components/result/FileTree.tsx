import { useEffect, useState } from 'react'
import { Tree, Spin, Empty } from 'antd'
import type { TreeDataNode } from 'antd'
import { FolderOutlined, FileOutlined } from '@ant-design/icons'
import { ipc } from '../../services/ipc'
import { useTaskStore } from '../../stores/taskStore'
import { useResultStore } from '../../stores/resultStore'
import type { FileNode } from '../../types'

function buildTreeData(nodes: FileNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.path,
    title: node.name,
    icon: node.isDirectory ? <FolderOutlined /> : <FileOutlined />,
    isLeaf: !node.isDirectory,
    children: node.children ? buildTreeData(node.children) : undefined,
  }))
}

export default function FileTree() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const task = tasks.find((t) => t.id === selectedTaskId)
  const setSelectedFile = useResultStore((s) => s.setSelectedFile)
  const selectedFile = useResultStore((s) => s.selectedFile)
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!task?.workspacePath) {
      setTreeData([])
      return
    }
    void (async () => {
      setLoading(true)
      try {
        const files = await ipc.fileList(task.workspacePath)
        setTreeData(buildTreeData(files))
      } finally {
        setLoading(false)
      }
    })()
  }, [task?.workspacePath])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spin />
      </div>
    )
  }

  if (treeData.length === 0) {
    return <Empty description="无文件" />
  }

  return (
    <Tree.DirectoryTree
      treeData={treeData}
      selectedKeys={selectedFile ? [selectedFile] : []}
      onSelect={(keys) => {
        setSelectedFile(keys[0] ? String(keys[0]) : null)
      }}
      showIcon
    />
  )
}
