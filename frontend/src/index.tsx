import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import reportWebVitals from './reportWebVitals'
import { RecoilRoot } from 'recoil'
import Root from './Root'
import { HashRouter } from 'react-router-dom'
import { App } from 'antd'
import { SidebarProvider } from './components/ui/SidebarProvider'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <App>
    <HashRouter>
      <RecoilRoot>
        <React.StrictMode>
          <SidebarProvider>
            <Root />
          </SidebarProvider>
        </React.StrictMode>
      </RecoilRoot>
    </HashRouter>
  </App>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
