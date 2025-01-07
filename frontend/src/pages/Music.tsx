import Keyboard from '../components/music/keyboard/keyboard'
import Player from '../components/music/player/player'
import Controller from '../components/music/controller/controller'
import Intro from '../components/music/controller/intro'
import { ScrollArea } from "../components/ui/scroll-area"

type MusicSection = {
  Component: React.ComponentType
  label: string
}

export default function Music(): JSX.Element {
  const MUSIC_SECTIONS: MusicSection[] = [
    // { Component: Intro, label: 'introduction-section' },
    { Component: Controller, label: 'controller-section' },
    { Component: Player, label: 'player-section' },
    { Component: Keyboard, label: 'keyboard-section' },
  ]

  return (

    <ScrollArea className='w-full h-[calc(100vh-8px)] gap-2 p-2 '>
      <div className='w-full h-40 flex shrink-0 '>
        <Intro />
      </div>

      <div className='w-full h-full mt-2 md:mt-4'>
        <Player />
      </div>
    </ScrollArea>
  )
}