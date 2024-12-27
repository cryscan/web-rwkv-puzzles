import { Button, Input, Select } from 'antd'
import { useRecoilValue } from 'recoil'
import { M } from '../../../pages/state_music'
import { generateMusic } from '../../../func/music'
import { useState, useEffect } from 'react'
import { prompts } from '../../music/assets/example-prompts'

const { TextArea } = Input

interface Prompt {
  name: string;
  prompt: string;
}

const EXAMPLE_PROMPTS: Prompt[] = prompts.map((prompt) => ({
  name: prompt.name,
  prompt: prompt.prompt
}))

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
    setPrompt(EXAMPLE_PROMPTS[0].prompt)
  }, [])

  return (
    <div className='w-full h-full flex flex-col gap-2'>
      <Select
        defaultValue={EXAMPLE_PROMPTS[0].name}
        onChange={(value: string) => {
          const selectedPrompt = EXAMPLE_PROMPTS.find(p => p.name === value);
          if (selectedPrompt) {
            setPrompt(selectedPrompt.prompt);
          }
        }}
        options={EXAMPLE_PROMPTS.map((prompt: Prompt) => ({
          value: prompt.name,
          label: prompt.name
        }))}
      />

        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter ABC notation..."
          rows={4}
          className='h-full'
        />
      <div className='w-full  mt-auto'>
        <Button
          type="primary"
          onClick={onClickGenerate}
          disabled={!loaded || !prompt || isGenerating}
          loading={isGenerating}
          className='w-full'
        >
          {isGenerating ? 'Generating...' : 'Generate Music'}
        </Button>
      </div>
    </div>
  )
}