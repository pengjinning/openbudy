import { useState } from 'react'
import { Input, Button, Space, Tooltip } from 'antd'
import {
  ReloadOutlined,
  LinkOutlined,
} from '@ant-design/icons'

export default function BrowserPreview() {
  const [url, setUrl] = useState('https://www.example.com')
  const [currentUrl, setCurrentUrl] = useState('https://www.example.com')

  const handleRefresh = () => {
    setCurrentUrl(`${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`)
  }

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleEnter = () => {
    setCurrentUrl(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPressEnter={handleEnter}
          placeholder="输入 URL"
          size="small"
        />
        <Tooltip title="刷新">
          <Button size="small" icon={<ReloadOutlined />} onClick={handleRefresh} />
        </Tooltip>
        <Tooltip title="外部打开">
          <Button
            size="small"
            icon={<LinkOutlined />}
            onClick={handleOpenExternal}
          />
        </Tooltip>
      </Space.Compact>
      <iframe
        title="browser-preview"
        src={currentUrl}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: '60vh',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          background: '#fff',
        }}
      />
    </div>
  )
}
