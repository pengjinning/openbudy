import { Layout } from 'antd'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import ResultPanel from './ResultPanel'

const { Sider, Content } = Layout

export default function AppLayout() {
  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Sider
        width={280}
        theme="dark"
        style={{ overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Sidebar />
      </Sider>
      <Content style={{ background: '#141414', overflow: 'hidden' }}>
        <ChatArea />
      </Content>
      <Sider
        width={360}
        theme="dark"
        style={{ overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        <ResultPanel />
      </Sider>
    </Layout>
  )
}
