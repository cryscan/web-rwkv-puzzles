import Keyboard from "../components/music/keyboard/keyboard";
import Player from "../components/music/player/player";
import Controller from "../components/music/controller/controller";
// import Intro from "../components/music/intro/intro";


type MusicSection = {
    Component: React.ComponentType;
    label: string;
}

export default function Music(): JSX.Element {

    const MUSIC_SECTIONS: MusicSection[] = [
        // { Component: Intro, label: 'introduction-section' },
        { Component: Controller, label: 'controller-section' },
        { Component: Player, label: 'player-section' },
        { Component: Keyboard, label: 'keyboard-section' }
    ];

    return (
        <div className='w-full h-full flex flex-col gap-2 p-2'>
            {MUSIC_SECTIONS.map(({ Component, label }) => (
                <div
                    key={label}
                    className="w-full h-1/3 "
                    aria-label={label}
                >
                    <Component />
                </div>
            ))}
        </div>
    )
}