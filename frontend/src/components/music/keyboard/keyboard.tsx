import 'react-piano/dist/styles.css';
import './keyboard.css';
// @ts-ignore
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import SoundFont from 'soundfont-player';
import { useEffect, useState } from 'react';


export default function Keyboard() {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [soundfontInstance, setSoundfontInstance] = useState<any>(null);

    // 设置钢琴的第一个和最后一个音符（88键）
    const firstNote = MidiNumbers.fromNote('A0');
    const lastNote = MidiNumbers.fromNote('C8');

    useEffect(() => {
        // 初始化音频上下文和音色
        const ac = new AudioContext();
        setAudioContext(ac);
        
        SoundFont.instrument(ac, 'acoustic_grand_piano')
            .then((piano: any) => {
                setSoundfontInstance(piano);
            });
    }, []);

    const playNote = (midiNumber: number) => {
        if (soundfontInstance) {
            soundfontInstance.play(midiNumber);
        }
    };

    const stopNote = (midiNumber: number) => {
        if (soundfontInstance) {
            soundfontInstance.stop();
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-full p-2 bg-black rounded-lg" >
                {audioContext && (
                    <Piano
                        noteRange={{ first: firstNote, last: lastNote }}
                        playNote={playNote}
                        stopNote={stopNote}
                     
                        className="responsive-piano"
                    />
                )}
            </div>
        </div>
    );
}