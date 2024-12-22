import {
  Bubble,
  Prompts,
  PromptsProps,
  Sender,
  useXAgent,
  useXChat,
} from '@ant-design/x'
import { BarChartOutlined, BulbOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Drawer, Flex, FloatButton, Progress, type GetProp } from 'antd'
import React, { useEffect, useState } from 'react'
import { P } from './state_chat'
import { useRecoilState, useRecoilValue } from 'recoil'
import { loadData } from '../func/load'
import { setupWorker } from '../setup_worker'
import { Violin } from '@ant-design/charts'

const stop = 24281 // User

const items: PromptsProps['items'] = [
  {
    key: '1',
    icon: <BulbOutlined style={{ color: '#FFD700' }} />,
    description: 'Tell me about the Eiffel Tower.',
  },
  {
    key: '2',
    icon: <BulbOutlined style={{ color: '#FFD700' }} />,
    description: 'How many major planets are there in the Solar System?',
  },
]

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
  },
  local: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
}

const Chat = () => {
  const [content, setContent] = React.useState('')
  const llmContent = React.useRef('')

  const worker = useRecoilValue(P.worker)
  const stateKey = useRecoilValue(P.stateKey)
  const [stateValue, setStateValue] = useRecoilState(P.stateValue)

  const onWorkerMessageReceived = (event: any) => {
    if (!event) return
    switch (event.type) {
      case 'state':
        console.log('✅ State updated')
        setStateValue(event.state_data)
        break
      case 'token':
        const { word, token } = event
        if (token === stop) {
          console.log(llmContent.current)
          window.onSuccessBinding(llmContent.current)
        } else {
          llmContent.current += word
          window.onUpdateBinding(llmContent.current)
        }
        break
    }
  }

  const initializeApp = () => {
    window.chat = onWorkerMessageReceived;
  }

  useEffect(() => {
    initializeApp()
  }, [])

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!message) return
      invoke(worker, message, llmContent.current, stateKey)
      window.onUpdateBinding = onUpdate
      window.onSuccessBinding = onSuccess
    },
  })

  // Chat messages
  const { onRequest, messages } = useXChat({
    agent,
  })

  const hasMessages = messages.length > 0
  const hasState = stateValue !== undefined
  const [loaded] = useRecoilState(P.loaded)
  const [stateStatsOpen, setStateStatsOpen] = useState(false)

  return (
    <Flex
      vertical
      gap='middle'
      style={{
        padding: 12,
        boxSizing: 'border-box',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '92vh',
      }}
    >
      {!hasMessages && <Info />}
      {hasMessages && (
        <Bubble.List
          style={{ flex: 1 }}
          roles={roles}
          items={messages.map(({ id, message, status }) => ({
            key: id,
            role: status === 'local' ? 'local' : 'ai',
            content: message,
          }))}
        />
      )}
      {loaded && !hasMessages && (
        <Prompts
          title='✨ Inspirational Sparks and Marvelous Tips'
          items={items}
          style={{ marginLeft: 24, marginRight: 24 }}
          onItemClick={(data) => {
            onRequest(data.data.description as string)
            console.log(data)
            setContent('')
            llmContent.current = ''
          }}
          wrap
        />
      )}
      <Sender
        disabled={!loaded}
        loading={agent.isRequesting()}
        value={content}
        style={{
          marginLeft: 20,
          marginRight: 20,
          boxSizing: 'border-box',
          width: 'auto',
        }}
        onChange={setContent}
        placeholder='Ask me anything...'
        onSubmit={(nextContent) => {
          onRequest(nextContent)
          setContent('')
          llmContent.current = ''
        }}
      />
      <div style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>
        Disclaimer: Generated content may be inaccurate or false.
      </div>
      {loaded && hasState && (
        <FloatButton
          icon={<BarChartOutlined />}
          onClick={() => setStateStatsOpen(true)}
        />)}
      {loaded && hasState && (
        <Drawer
          title='State Statistics'
          size='large'
          placement='bottom'
          onClose={() => setStateStatsOpen(false)}
          destroyOnClose={true}
          open={stateStatsOpen}>
          <Violin
            violinType='normal'
            data={stateValue}
            xField='head'
            yField='value'
            seriesField='layer'
          />
        </Drawer>
      )}
    </Flex>
  )
}

const invoke = (worker: Worker, message: string, history: string, state: string) => {
  let prompt: string
  if (history === '') prompt = `User: Hi!\n\nAssistant: Hello! I'm your AI assistant. I'm here to help you with various tasks, such as answering questions, brainstorming ideas, drafting emails, writing code, providing advice, and much more.\n\nUser: ${message}\n\nAssistant:`
  else prompt = `User: ${message}\n\nAssistant:`

  const options = {
    task: 'chat',
    max_len: 500,
    prompt,
    state_key: state,
    stop_tokens: [stop],
    temperature: 1.0,
    top_p: 0.5,
    presence_penalty: 0.5,
    count_penalty: 0.5,
    penalty_decay: 0.996,
    vocab: '../assets/rwkv_vocab_v20230424.json',
    sampler: 'nucleus',
  }
  worker.postMessage(JSON.stringify(options))
}

const Info = () => {
  const kDebugMode = process.env.NODE_ENV == 'development'

  const modelUrl = useRecoilValue(P.modelUrl)
  const remoteUrl = useRecoilValue(P.remoteUrl)
  const remoteKey = useRecoilValue(P.remoteKey)
  const [, setLoadedProgress] = useRecoilState(P.loadedProgress)
  const [loading, setLoading] = useRecoilState(P.modelLoading)
  const [loaded, setLoaded] = useRecoilState(P.loaded)
  const [progress] = useRecoilState(P.loadedProgress)
  const [contentLength, setContentLength] = useRecoilState(P.modelSize)
  const [loadedLength, setLoadedLength] = useRecoilState(P.loadedSize)
  const [, setStateKey] = useRecoilState(P.stateKey)
  const [, setStateValue] = useRecoilState(P.stateValue)
  const worker = useRecoilValue(P.worker)

  setStateKey(new Date().toUTCString())
  setStateValue(undefined)

  const onClickLoadModel = async () => {
    setLoading(true)
    setLoaded(false)
    const chunks = await loadData(
      "chat",
      kDebugMode ? modelUrl : remoteUrl,
      remoteKey,
      (progress) => {
        setLoadedProgress(progress)
      },
      (contentLength) => {
        setContentLength(contentLength)
      },
      (loadedLength) => {
        setLoadedLength(loadedLength)
      }
    )
    await setupWorker(worker, chunks, 'chat')
    setLoading(false)
    setLoaded(true)
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <img
        src='./assets/logo.png'
        alt='RWKV WebGPU Logo'
        style={{ height: 128 }}
      />
      <div style={{ fontSize: 48, fontWeight: 'bold' }}>RWKV WebGPU</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          width: 300,
          textAlign: 'center',
        }}
      >
        A blazingly fast and powerful AI chatbot that runs locally in your
        browser.
      </div>
      <div style={{ maxWidth: 410, textAlign: 'left' }}>
        You are about to load{' '}
        <a
          style={{ fontWeight: 700 }}
          href='https://huggingface.co/BlinkDL/rwkv-7-world/tree/main'
        >
          RWKV-x070-World-0.1B
        </a>
        , a 0.1B parameter LLM optimized for in-browser inference. Runs entirely
        in your browser with{' '}
        <a
          style={{ fontWeight: 700 }}
          href='https://github.com/cryscan/web-rwkv'
        >
          Web-RWKV
        </a>
        , so no data is sent to a server. Once loaded, it can be used offline.
      </div>
      <div style={{ maxWidth: 410, textAlign: 'left' }}>
        Disclaimer: This model handles general knowledge, creative writing, and
        basic Python. It may struggle with arithmetic, editing, and complex
        reasoning.
      </div>
      <div style={{ height: 36 }}></div>

      {loading && (
        <div>
          {(loadedLength / (1000 * 1000)).toFixed(1)}MB /{' '}
          {(contentLength / (1000 * 1000)).toFixed(1)}MB
        </div>
      )}
      {loading && (
        <Progress
          style={{ maxWidth: 300 }}
          percent={progress}
          format={() => ''}
        />
      )}
      {!loaded && (
        <Button
          type='primary'
          size='large'
          onClick={onClickLoadModel}
          loading={loading}
        >
          {loading ? 'Loading...' : 'Load Model'}
        </Button>
      )}
    </div>
  )
}

export default Chat
