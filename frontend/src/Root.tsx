import React, { useState } from 'react'
import { BlockOutlined, MessageOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { App, Layout, Menu, theme } from 'antd'
import Link from 'antd/es/typography/Link'
import { BrowserRouter, Router, Routes, useNavigate } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Puzzle from './pages/Puzzle'
import Chat from './pages/Chat'

const { Content, Footer, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
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
]

const Root: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const navigate = useNavigate()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Menu
          theme='dark'
          defaultSelectedKeys={['chat']}
          mode='inline'
          items={menuItems}
          onClick={(e) => {
            navigate(e.key)
          }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px', display: 'flex', flex: 1 }}>
          <Routes>
            <Route path='/chat' element={<Chat />} />
            <Route path='/15puzzle' element={<Puzzle />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <Link href='https://beian.miit.gov.cn/'>粤ICP备2024242518号-1</Link> ©
          2024 RWKV CN. All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  )
}

export default Root
