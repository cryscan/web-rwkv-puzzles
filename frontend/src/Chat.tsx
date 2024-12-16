import { UserOutlined } from '@ant-design/icons'
import { Bubble, Sender, useXAgent, useXChat } from '@ant-design/x'
import { Flex, type GetProp } from 'antd'
import React, { useEffect } from 'react'

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
    window.workerMessageReceived = onWorkerMessageReceived
  }

  useEffect(() => {
    initializeApp()
  }, [])

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!window.rwkv_worker) {
        console.log('🔄 Loading worker')
        await window.load()
        console.log('✅ Worker loaded')
      }

      window.rwkv_worker.postMessage(message)
      window.onUpdateBinding = onUpdate
      window.onSuccessBinding = onSuccess
    },
  })

  // Chat messages
  const { onRequest, messages } = useXChat({
    agent,
  })

  return (
    <Flex vertical gap='middle'>
      <Bubble.List
        roles={roles}
        style={{ maxHeight: 300 }}
        items={messages.map(({ id, message, status }) => ({
          key: id,
          role: status === 'local' ? 'local' : 'ai',
          content: message,
        }))}
      />
      <Sender
        loading={agent.isRequesting()}
        value={content}
        onChange={setContent}
        onSubmit={(nextContent) => {
          onRequest(nextContent)
          setContent('')
          llmContent.current = ''
        }}
      />
    </Flex>
  )
}

export default Chat
