import { useEffect, useState } from 'react'
import { Tree, Spin, Empty, Button, Tooltip, App as AntdApp } from 'antd'
import type { TreeDataNode } from 'antd'
import {
  FolderOutlined,
  FileOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons'
import { ipc } from '../../services/ipc'
import { useTaskStore } from '../../stores/taskStore'
import { useResultStore } from '../../stores/resultStore'
import type { FileNode } from '../../types'

export default function FileTree() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const task = tasks.find((t) => t.id === selectedTaskId)
  const setSelectedFile = useResultStore((s) => s.setSelectedFile)
  const selectedFile = useResultStore((s) => s.selectedFile)
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [loading, setLoading] = useState(false)
  const { message } = AntdApp.useApp()

  /** 用系统默认应用打开（文件按类型打开，目录则打开文件夹） */
  const handleOpen = async (path: string) => {
    try {
      await ipc.openPath(path)
    } catch (e) {
      void message.error(`打开失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  /** 在 Finder/资源管理器 中定位（macOS 会选中） */
  const handleReveal = async (path: string) => {
    try {
      await ipc.openInFolder(path)
    } catch (e) {
      void message.error(`打开所在目录失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  /**
   * 节点 title：名称 + hover 操作按钮（与消息气泡的 file_write 操作一致）
   * - 文件：📄 打开文件 + 📂 打开所在目录
   * - 目录：📂 打开文件夹
   */
  const buildTitle = (node: FileNode): TreeDataNode['title'] => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span>{node.name}</span>
      <span
        className="filetree-actions"
        style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!node.isDirectory && (
          <Tooltip title="打开文件">
            <Button
              size="small"
              type="text"
              icon={<FileSearchOutlined />}
              style={{ padding: '0 2px', height: 18, minWidth: 18 }}
              onClick={() => void handleOpen(node.path)}
            />
          </Tooltip>
        )}
        <Tooltip title={node.isDirectory ? '打开文件夹' : '打开所在目录'}>
          <Button
            size="small"
            type="text"
            icon={<FolderOpenOutlined />}
            style={{ padding: '0 2px', height: 18, minWidth: 18 }}
            onClick={() =>
              void (node.isDirectory ? handleOpen(node.path) : handleReveal(node.path))
            }
          />
        </Tooltip>
      </span>
    </span>
  )

  function buildTreeData(nodes: FileNode[]): TreeDataNode[] {
    return nodes.map((node) => ({
      key: node.path,
      title: buildTitle(node),
      icon: node.isDirectory ? <FolderOutlined /> : <FileOutlined />,
      isLeaf: !node.isDirectory,
      children: node.children ? buildTreeData(node.children) : undefined,
    }))
  }

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
