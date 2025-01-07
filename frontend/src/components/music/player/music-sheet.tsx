import React, { useEffect, useRef, useState } from 'react';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';

export default function MusicSheet({ music }: { music: string }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [synth, setSynth] = useState<any>(null);
  const [synthControl, setSynthControl] = useState<any>(null);
  const endOfSheetRef = useRef<HTMLDivElement>(null);

  const resetAudio = () => {
    if (synthControl) {
      synthControl.pause();
      synthControl.restart();
    }
  };

  useEffect(() => {
    resetAudio();
    if (endOfSheetRef.current) {
      endOfSheetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [music]);

  useEffect(() => {
    if (sheetRef.current) {
      // Render the sheet
      const visualObj = abcjs.renderAbc(sheetRef.current, music, {
        add_classes: true,
        responsive: 'resize'
      });

      // Initialize the synth
      const control = new abcjs.synth.SynthController();
      setSynthControl(control);
      control.load('#audio-controls', null, {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
      });

      // Create the audio synthesizer
      const createSynth = new abcjs.synth.CreateSynth();
      createSynth.init({ visualObj: visualObj[0] }).then(() => {
        setSynth(createSynth);
        control.setTune(visualObj[0], false);
      });

      // 清理函数：组件卸载时停止音乐
      return () => {
        if (control) {
          control.pause();
        }
      };
    }
  }, [music]);

  return (
    <div className='w-full min-h-40 max-h-96 flex flex-col bg-white rounded-lg border shadow-lg p-2'>
      <div className='w-full h-full overflow-y-auto p-2'>
        <div ref={sheetRef}></div>
        <div ref={endOfSheetRef}></div>
      </div>

      <div id="audio-controls" className='mt-auto'></div>
    </div>
  );
}