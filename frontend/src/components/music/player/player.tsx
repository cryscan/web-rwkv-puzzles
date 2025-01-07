import { useEffect, useState, useRef } from "react";
import Generator from "./generator";
import MusicSheet from "./music-sheet";


export default function Player() {
  const [generatedMusic, setGeneratedMusic] = useState<string>("");
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const endOfContentRef = useRef<HTMLDivElement>(null);
  const endOfSheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.music = (data) => {
      if (data?.type === 'token') {
        setGeneratedMusic(prev => prev + data.word);
      } else if (data?.type === 'generation_start') {
        setGeneratedMusic(inputPrompt);
      }
    }
  }, [inputPrompt]);

  useEffect(() => {
    if (endOfContentRef.current) {
      endOfContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (endOfSheetRef.current) {
      endOfSheetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedMusic]);

  return (
    <div className='w-full h-full flex flex-col gap-2 md:gap-4'>
      <div className='w-full min-h-40 md:min-h-40 max-h-40 overflow-y-auto p-2 rounded-lg border shadow-lg bg-white'>
        <pre className="w-full whitespace-pre-wrap">
          {generatedMusic || "Generated music will appear here..."}
        </pre>
        <div ref={endOfContentRef}></div>
      </div>
      <MusicSheet music={generatedMusic} />
      <div className='w-full h-full overflow-y-auto p-2 rounded-lg border shadow-lg bg-white'>
        <Generator prompt={inputPrompt} setPrompt={setInputPrompt} />
      </div>
    </div>
  )
}
