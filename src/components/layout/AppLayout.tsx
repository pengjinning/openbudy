import { Layout } from 'antd'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import ResultPanel from './ResultPanel'
import SettingsModal from '../settings/SettingsModal'
import { useThemeToken } from '../../hooks/useThemeToken'

const { Sider, Content } = Layout

export default function AppLayout() {
  const { token } = useThemeToken()

  return (
    <Layout style={{ height: '100vh', width: '100vw', background: token.colorBgLayout }}>
      <Sider
        width={280}
        style={{
          overflow: 'hidden',
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorSplit}`,
        }}
      >
        <Sidebar />
      </Sider>
      <Content style={{ background: token.colorBgLayout, overflow: 'hidden' }}>
        <ChatArea />
      </Content>
      <Sider
        width={360}
        style={{
          overflow: 'hidden',
          background: token.colorBgContainer,
          borderLeft: `1px solid ${token.colorSplit}`,
        }}
      >
        <ResultPanel />
      </Sider>
      <SettingsModal />
    </Layout>
  )
}
