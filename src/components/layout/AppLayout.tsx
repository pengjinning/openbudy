import { Splitter } from 'antd'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import ResultPanel from './ResultPanel'
import SettingsModal from '../settings/SettingsModal'
import { useThemeToken } from '../../hooks/useThemeToken'

/**
 * 三栏布局：左侧任务栏 | 中间聊天 | 右侧结果面板
 * 栏宽可拖拽调整（antd Splitter），左右栏设了 min/max 防止拖没了或拖过头
 */
export default function AppLayout() {
  const { token } = useThemeToken()

  const panelStyle = {
    overflow: 'hidden',
    background: token.colorBgContainer,
  } as const

  return (
    <div style={{ height: '100vh', width: '100vw', background: token.colorBgLayout }}>
      <Splitter
        style={{ height: '100%' }}
        // 拖拽条样式对齐主题分割线
        className="app-splitter"
      >
        <Splitter.Panel min={200} max={420} defaultSize={280} style={panelStyle}>
          <Sidebar />
        </Splitter.Panel>
        <Splitter.Panel min={380} style={{ ...panelStyle, background: token.colorBgLayout }}>
          <ChatArea />
        </Splitter.Panel>
        <Splitter.Panel min={240} max={560} defaultSize={360} style={panelStyle}>
          <ResultPanel />
        </Splitter.Panel>
      </Splitter>
      <SettingsModal />
    </div>
  )
}
