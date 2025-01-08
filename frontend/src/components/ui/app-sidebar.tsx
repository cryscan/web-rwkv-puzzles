import { Search, MessageSquare, Puzzle, Music, Repeat1 } from "lucide-react"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./SidebarProvider"

const basename = process.env.PUBLIC_URL || ''

// Menu items.
const items = [
  {
    title: "Chat",
    url: `${basename}/#/chat`,
    icon: MessageSquare,
  },
  {
    title: "15 Puzzle",
    url: `${basename}/#/15puzzle`,
    icon: Puzzle,
  },
  {
    title: "Music",
    url: `${basename}/#/music`,
    icon: Music,
  },
  {
    title: "State Replay",
    url: `${basename}/#/replay`,
    icon: Repeat1,
  },
]

export function AppSidebar() {
  const [currentHash, setCurrentHash] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const isCurrentPath = (url: string) => {
    return currentHash === url.substring(1)
  }

  return (
    <Sidebar>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>RWKV Web</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={isCurrentPath(item.url) ? "bg-blue-600 text-zinc-50 font-semibold hover:font-semibold" : " text-zinc-950 hover:bg-blue-600/10 hover:text-zinc-950 font-semibold hover:font-semibold"}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
