import { Button, Input, Select } from 'antd'
import { useRecoilValue } from 'recoil'
import { M } from '../../../pages/state_music'
import { generateMusic } from '../../../func/music'
import { useState, useEffect } from 'react'

const { TextArea } = Input

const EXAMPLE_PROMPTS = {
  "Simple Melody": "X:1\nT:Simple Melody\nM:4/4\nL:1/4\nK:C\n",
  "Waltz": "X:1\nT:Waltz\nM:3/4\nL:1/4\nK:G\n",
  "Irish Jig": "X:1\nT:Irish Jig\nM:6/8\nL:1/8\nK:D\n"
};

interface GeneratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export default function Generator({ prompt, setPrompt }: GeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const worker = useRecoilValue(M.worker)
  const loaded = useRecoilValue(M.loaded)

  const onClickGenerate = async () => {
    if (!loaded) {
      alert('Please load the model first')
      return
    }
    setIsGenerating(true)
    console.log('Generating music...')
    try {
      await generateMusic(worker, prompt)
    } finally {
      console.log('Music generation completed')
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    setPrompt(EXAMPLE_PROMPTS["Simple Melody"])
  }, [])

  return (
    <div className='w-full flex flex-col gap-2'>
      <Select
        defaultValue="Simple Melody"
        onChange={(value) => setPrompt(EXAMPLE_PROMPTS[value as keyof typeof EXAMPLE_PROMPTS])}
        options={Object.keys(EXAMPLE_PROMPTS).map(key => ({
          value: key,
          label: key
        }))}
      />
      <TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter ABC notation..."
        rows={4}
      />
      <Button
        type="primary"
        onClick={onClickGenerate}
        disabled={!loaded || !prompt || isGenerating}
        loading={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Music'}
      </Button>
    </div>
  )
}