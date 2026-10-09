import { Empty, Flex, Typography } from 'antd'
import ResultTabs from '../result/ResultTabs'
import { useTaskStore } from '../../stores/taskStore'
import { useThemeToken } from '../../hooks/useThemeToken'

const { Title } = Typography

export default function ResultPanel() {
  const { token } = useThemeToken()
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)

  return (
    // 整栏可拖拽窗口（与左侧 Sidebar 一致），交互控件在内部用 app-no-drag 挖除
    <Flex vertical className="app-drag" style={{ height: '100%', padding: 12 }}>
      <Title level={5} style={{ margin: '0 0 12px', color: token.colorText }}>
        结果
      </Title>
      {selectedTaskId ? (
        <div className="app-no-drag" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <ResultTabs />
        </div>
      ) : (
        <Flex align="center" justify="center" style={{ flex: 1 }}>
          <Empty description="无结果" />
        </Flex>
      )}
    </Flex>
  )
}
