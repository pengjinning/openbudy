import { useCallback, useState } from 'react'
import { App as AntdApp } from 'antd'
import { ipc } from '../services/ipc'

interface UploadedFile {
  name: string
  path: string
  size: number
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadedFile | null>
  uploading: boolean
  fileList: UploadedFile[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function useFileUpload(taskId: string | null): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<UploadedFile[]>([])
  const { message: antdMessage } = AntdApp.useApp()

  const upload = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      if (!taskId) {
        antdMessage.warning('请先选择一个任务')
        return null
      }
      if (file.size > MAX_FILE_SIZE) {
        antdMessage.error('文件大小不能超过 10MB')
        return null
      }

      setUploading(true)
      try {
        // 读取文件内容
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('文件读取失败'))
          reader.readAsText(file)
        })

        // 写入 workspace/uploads/
        const filePath = `~/openbudy-workspace/${taskId}/uploads/${file.name}`
        await ipc.fileWrite(filePath, content)

        const uploaded: UploadedFile = {
          name: file.name,
          path: filePath,
          size: file.size,
        }
        setFileList((prev) => [...prev, uploaded])
        antdMessage.success(`文件 ${file.name} 上传成功`)
        return uploaded
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '上传失败'
        antdMessage.error(errorMsg)
        return null
      } finally {
        setUploading(false)
      }
    },
    [taskId, antdMessage]
  )

  return { upload, uploading, fileList }
}
