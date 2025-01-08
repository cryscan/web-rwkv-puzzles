import React from 'react'
import { AppSidebar } from './components/ui/app-sidebar'
import {
  SidebarProvider,
  SidebarTrigger,
} from './components/ui/SidebarProvider'
import { Routes, Navigate, HashRouter } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Puzzle from './pages/Puzzle'
import Chat from './pages/Chat'
import Music from './pages/Music'
import Replay from './pages/Replay'
const Root: React.FC = () => {

  const basename = process.env.PUBLIC_URL || ''

  return (
    <SidebarProvider>
      <div className='flex w-full h-full'>
        <AppSidebar />
        <div className='flex-1 relative'>
          <div className='absolute top-0 left-0 z-50'>
            <SidebarTrigger />
          </div>
          <div className='flex-1 h-full'>
          
            <HashRouter basename={basename}>
              <Routes>
                <Route path='/' element={<Navigate to='/chat' />} />
                <Route path='/chat' element={<Chat />} />
                <Route path='/15puzzle' element={<Puzzle />} />
                <Route path='/music' element={<Music />} />
                <Route path='/replay' element={<Replay />} />
              </Routes>
            </HashRouter>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Root
