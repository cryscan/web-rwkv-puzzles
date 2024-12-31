import React, { useEffect, useState } from 'react'
import {
  BlockOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Layout, Menu, theme } from 'antd'
import { Routes, useNavigate } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Puzzle from './pages/Puzzle'
import Chat from './pages/Chat'
import Music from './pages/Music'
import Replay from './pages/Replay'

const { Content, Footer, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem
}

const menuItems: MenuItem[] = [
  getItem('Chat', 'chat', <MessageOutlined />),
  getItem('15 Puzzle', '15puzzle', <BlockOutlined />),
  getItem('Music', 'music', <CustomerServiceOutlined />),
  getItem('State Replay', 'replay', <PlayCircleOutlined />),
]

const Root: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {} = theme.useToken()
  const navigate = useNavigate()
  const currentPath = window.location.pathname.substring(1)

  useEffect(() => {
    if (currentPath === '') {
      navigate('/chat')
    }
  }, [currentPath])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Menu
          theme='dark'
          defaultSelectedKeys={[currentPath || 'chat']}
          mode='inline'
          items={menuItems}
          onClick={(e) => {
            navigate(e.key)
          }}
        />
      </Sider>
      <Layout>
        <Content>
          <Routes>
            <Route path='/chat' element={<Chat />} />
            <Route path='/15puzzle' element={<Puzzle />} />
            <Route path='/music' element={<Music />} />
            <Route path='/replay' element={<Replay />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          {/* <Link href='https://beian.miit.gov.cn/'>粤ICP备2024242518号-1</Link> ©
          2024 RWKV CN. All Rights Reserved. */}
        </Footer>
      </Layout>
    </Layout>
  )
}

export default Root
