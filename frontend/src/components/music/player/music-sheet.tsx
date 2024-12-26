import React, { useEffect, useRef, useState } from 'react';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';

export default function MusicSheet({ music }: { music: string }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [synth, setSynth] = useState<any>(null);
  const endOfSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    if (endOfSheetRef.current) {
      endOfSheetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [music]);

  useEffect(() => {
    if (sheetRef.current) {
      // 渲染乐谱
      const visualObj = abcjs.renderAbc(sheetRef.current, music, {
        add_classes: true,
        responsive: 'resize'
      });

      // 初始化合成器
      const synthControl = new abcjs.synth.SynthController();
      synthControl.load('#audio-controls', null, {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
      });

      // 创建音频合成器
      const createSynth = new abcjs.synth.CreateSynth();
      createSynth.init({ visualObj: visualObj[0] }).then(() => {
        setSynth(createSynth);
        synthControl.setTune(visualObj[0], false);
      });
    }
  }, [music]);

  return (
    <div className='w-full'>
      <div className='w-full h-80 overflow-y-auto  p-2 rounded-lg'>
        <div ref={sheetRef}></div>
        <div ref={endOfSheetRef}></div>
      </div>

      <div id="audio-controls"></div>
    </div>
  );
}