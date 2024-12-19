import { UserOutlined } from '@ant-design/icons'
import {
  Bubble,
  PromptProps,
  Prompts,
  PromptsProps,
  Sender,
  useXAgent,
  useXChat,
} from '@ant-design/x'
import { Button, Flex, Progress, type GetProp } from 'antd'
import React, { useEffect } from 'react'
import { P } from './state_chat'
import { useRecoilState, useRecoilValue } from 'recoil'
import { loadData } from '../func/load'
import { BulbOutlined } from '@ant-design/icons'
import { setupWorker } from '../setup_worker'

const items: PromptsProps['items'] = [
  {
    key: '1',
    icon: <BulbOutlined style={{ color: '#FFD700' }} />,
    description: 'Tell me about eiffel tower.',
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
  const onWorkerMessageReceived = (event: any) => {
    if (!event) return

    const { word, token } = event

    const isEnd = token === 261

    if (isEnd) {
      llmContent.current += word
      window.onSuccessBinding(llmContent.current)
    } else {
      llmContent.current += word
      window.onUpdateBinding(llmContent.current)
    }
  }

  const initializeApp = () => {
    window.onChatMessageReceived = onWorkerMessageReceived
  }

  useEffect(() => {
    initializeApp()
  }, [])

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!message) return
      invoke(message)
      window.onUpdateBinding = onUpdate
      window.onSuccessBinding = onSuccess
    },
  })

  // Chat messages
  const { onRequest, messages } = useXChat({
    agent,
  })

  const hasMessages = messages.length > 0

  const [loaded] = useRecoilState(P.loaded)

  return (
    <Flex
      vertical
      gap='middle'
      style={{
        padding: 12,
        boxSizing: 'border-box',
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
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
      {loaded && messages.length == 0 && (
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
    </Flex>
  )
}

const invoke = (message: string) => {
  const options = {
    max_len: 500,
    prompt: `User: Hi!
\nAssistant: Hello! I'm your AI assistant. I'm here to help you with various tasks, such as answering questions, brainstorming ideas, drafting emails, writing code, providing advice, and much more.
\nUser: ${message}
\nAssistant:`,
    stop_tokens: [261],
    temperature: 1.0,
    top_p: 0.5,
    vocab: '../assets/rwkv_vocab_v20230424.json',
    sampler: 'nucleus',
    task: 'chat',
  }
  window.chat_worker.postMessage(JSON.stringify(options))
}

const Info = () => {
  const modelUrl = useRecoilValue(P.modelUrl)
  const [, setLoadedProgress] = useRecoilState(P.loadedProgress)
  const [loading, setLoading] = useRecoilState(P.modelLoading)
  const [loaded, setLoaded] = useRecoilState(P.loaded)
  const [progress, setProgress] = useRecoilState(P.loadedProgress)
  const [contentLength, setContentLength] = useRecoilState(P.modelSize)
  const [loadedLength, setLoadedLength] = useRecoilState(P.loadedSize)

  const onClickLoadModel = async () => {
    setLoading(true)
    setLoaded(false)
    const chunks = await loadData(
      modelUrl,
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
    await setupWorker(chunks, 'chat')
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
