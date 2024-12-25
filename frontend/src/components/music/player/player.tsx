import { useEffect, useState } from "react";
import Generator from "./generator";


export default function Player() {
  const [generatedMusic, setGeneratedMusic] = useState<string>("");

  useEffect(() => {
    window.music = (data) => {
      if (data?.type === 'token') {
        setGeneratedMusic(prev => prev + data.word);
        console.log('Music token:', data.word);
      } else if (data?.type === 'generation_start') {
        setGeneratedMusic("");
      }
    }
  }, []);

  return (
    <div className='w-full h-full flex flex-col gap-4 p-4'>
      <div className='w-full h-40 overflow-y-auto border p-2 rounded-lg'>
        <pre className="w-full whitespace-pre-wrap">
          {generatedMusic || "Generated music will appear here..."}
        </pre>
      </div>
      <Generator />
    </div>
  )
}
