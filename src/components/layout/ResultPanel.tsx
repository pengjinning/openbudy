import { Empty, Flex, Typography } from 'antd'
import ResultTabs from '../result/ResultTabs'
import { useTaskStore } from '../../stores/taskStore'

const { Title } = Typography

export default function ResultPanel() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)

  return (
    <Flex vertical style={{ height: '100%', padding: 12 }}>
      <Title level={5} style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.85)' }}>
        结果
      </Title>
      {selectedTaskId ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
