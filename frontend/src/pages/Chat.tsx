import {
  Bubble,
  Prompts,
  PromptsProps,
  Sender,
  useXAgent,
  useXChat,
} from '@ant-design/x'
import {
  BarChartOutlined,
  BulbOutlined,
  SettingOutlined,
  UserOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
  InboxOutlined,
  SyncOutlined,
  CopyOutlined,
  EditOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Drawer,
  Flex,
  FloatButton,
  Image,
  Layout,
  Popover,
  App,
  Tooltip,
  Row,
  Progress,
  Slider,
  Switch,
  Tabs,
  type GetProp,
  Divider,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { P } from './state_chat'
import { useRecoilState, useRecoilValue } from 'recoil'
import { loadData, loadFile } from '../func/load'
import { setupWorker } from '../setup_worker'
import { Violin } from '@ant-design/charts'
import Markdown from 'react-markdown'
import Sider from 'antd/es/layout/Sider'
import { Typography } from 'antd'
import { SamplerOptions, StateVisual } from '../func/type'
import Dragger from 'antd/es/upload/Dragger'
import { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { MessageInfo } from '@ant-design/x/es/useXChat'
import TextArea from 'antd/es/input/TextArea'

const { Text, Title } = Typography

const stopTokens = [24281, 0, 82] // User, Q

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
    avatar: { icon: <img src='./assets/logo.png' alt='RWKV WebGPU Logo' /> },
  },
  local: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
}

const Chat = () => {
  const [content, setContent] = useState('')

  const llmContentRef = useRef('')
  const chatHistoryRef = useRef<string[]>([])
  const stateKeyRef = useRef(new Date().toUTCString())

  const worker = useRecoilValue(P.worker)
  const [, setLoading] = useRecoilState(P.modelLoading)
  const [, setLoaded] = useRecoilState(P.modelLoaded)
  const [heartBeatSet, setHeartBeatSet] = useRecoilState(P.heartBeatSet)

  const [, setStateValue] = useState<null | Float32Array>(null)
  const [stateVisual, setStateVisual] = useState<null | StateVisual>(null)

  const [samplerOptions, setSamplerOptions] = useState({
    temperature: 2.0,
    top_p: 0.5,
    presence_penalty: 0.5,
    count_penalty: 0.5,
    half_life: 200,
  })

  const samplerOptionsRef = useRef(samplerOptions)

  const updateSamplerOptions = (updated: SamplerOptions) => {
    setSamplerOptions(updated)
    samplerOptionsRef.current = updated
  }

  const onWorkerMessageReceived = (event: any) => {
    if (!event) return
    switch (event.type) {
      case 'info':
        setLoading(false)
        setLoaded(true)
        break
      case 'error':
        setLoading(false)
        setLoaded(false)
        alert(`Model loading error: ${event.error}`)
        break
      case 'state':
        console.log('✅ State updated')
        const { state, visual } = event
        setStateValue(state)
        setStateVisual(visual)
        break
      case 'token':
        const { word, token } = event
        if (stopTokens.includes(token)) {
          chatHistoryRef.current.push(llmContentRef.current)
          window.onSuccessBinding(llmContentRef.current)
        } else {
          llmContentRef.current += word
          window.onUpdateBinding(llmContentRef.current)
        }
        break
    }
  }

  const initializeApp = () => {
    if (!navigator.gpu) {
      setTimeout(() => {
        alert('WebGPU is not supported by this browser.')
      }, 1000)
    }

    worker.postMessage(JSON.stringify({ task: 'abort' }))
    window.chat = onWorkerMessageReceived
    console.log('✅ Chat worker callback set')

    if (!heartBeatSet) {
      const heartBeat = () => {
        worker.postMessage(JSON.stringify({ task: 'info' }))
      }
      setInterval(heartBeat, 1000)
      setHeartBeatSet(true)
    }
  }

  useEffect(() => {
    initializeApp()
  }, [])

  const { message: AppMessage } = App.useApp()
  const [editingIndex, setEditingIndex] = useRecoilState(P.editingIndex)
  const [editingText, setEditingText] = useRecoilState(P.editingText)

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!message) return
      chatHistoryRef.current.push(message)

      console.log({
        h: [...chatHistoryRef.current],
        m: 'useXAgent.request',
      })

      invoke(
        worker,
        chatHistoryRef.current,
        stateKeyRef.current,
        samplerOptionsRef.current,
      )
      window.onUpdateBinding = onUpdate
      window.onSuccessBinding = onSuccess

      setTimeout(() => {
        console.log({
          h: [...chatHistoryRef.current],
          m: 'useXAgent.request',
        })
      }, 5000)
    },
  })

  // Chat messages
  const { onRequest, messages, setMessages } = useXChat({
    agent,
  })

  const onCopyButtonClick = (message: MessageInfo<string>) => {
    AppMessage.success('Copied to clipboard')
    navigator.clipboard.writeText(message.message)
  }

  const onEditButtonClick = (message: MessageInfo<string>) => {
    setEditingIndex(message.id)
    setEditingText(message.message)
  }

  const onSendButtonInBubbleClicked = (
    message: MessageInfo<string>,
    index: number,
  ) => {
    if (
      editingText === undefined ||
      editingText === '' ||
      editingText === null
    ) {
      AppMessage.warning('Please enter the message first')
      return
    }
    console.log({
      h: [...chatHistoryRef.current],
      m: 'onSendButtonInBubbleClicked',
    })

    setMessages((prevMessages) => {
      const newMessages = [...prevMessages].slice(0, index)
      return newMessages
    })
    chatHistoryRef.current = [...[...chatHistoryRef.current].slice(0, index)]

    llmContentRef.current = ''

    onRequest(editingText)

    setEditingIndex(null)
    setEditingText('')

    console.log({
      h: [...chatHistoryRef.current],
      m: 'onSendButtonInBubbleClicked',
    })

    setTimeout(() => {
      console.log({
        h: [...chatHistoryRef.current],
        m: 'onSendButtonInBubbleClicked',
      })
    }, 5000)
  }

  const onRegenerateButtonClick = (
    message: MessageInfo<string>,
    index: number,
  ) => {
    console.log({
      h: [...chatHistoryRef.current],
      m: 'onRegenerateButtonClick',
    })

    setMessages((prevMessages) => {
      const newMessages = [...prevMessages].slice(0, index - 1)
      return newMessages
    })
    const userMessage = chatHistoryRef.current[index - 1]
    chatHistoryRef.current = [
      ...[...chatHistoryRef.current].slice(0, index - 1),
    ]

    llmContentRef.current = ''

    onRequest(userMessage)

    console.log({
      h: [...chatHistoryRef.current],
      m: 'onRegenerateButtonClick',
    })

    setTimeout(() => {
      console.log({
        h: [...chatHistoryRef.current],
        m: 'onRegenerateButtonClick',
      })
    }, 5000)
  }

  const onModifyButtonInBubbleClick = (
    message: MessageInfo<string>,
    index: number,
  ) => {
    console.log({
      h: [...chatHistoryRef.current],
      m: 'onModifyButtonInBubbleClick',
    })
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages].slice(0, index)
      newMessages[index] = {
        ...newMessages[index],
        message: editingText!,
      }
      return newMessages
    })

    chatHistoryRef.current = [
      ...[...chatHistoryRef.current].slice(0, index),
      editingText!,
    ]

    setEditingText(undefined)
    setEditingIndex(null)

    console.log({
      h: [...chatHistoryRef.current],
      m: 'onModifyButtonInBubbleClick',
    })
  }

  const renderMessages = () => {
    return messages.map((message: MessageInfo<string>, index: number) => {
      const { status, id } = message
      const renderingBot = status !== 'local'
      const editing = editingIndex === id
      const bubbleData: BubbleDataType = {
        key: id,
        role: renderingBot ? 'ai' : 'local',
        styles: editing
          ? {
              content: {
                width: '100%',
              },
            }
          : undefined,
        content: editing ? (
          <Flex vertical gap={4}>
            <TextArea
              autoSize
              style={{ width: '100%' }}
              value={editingText}
              onChange={(e) => {
                setEditingText(e.target.value)
              }}
              onPressEnter={(e) => {
                console.log({ onPressEnter: e })
                if (e.shiftKey) return
                if (renderingBot) {
                  onModifyButtonInBubbleClick(message, index)
                } else {
                  onSendButtonInBubbleClicked(message, index)
                }
              }}
            />
            <Flex justify='end' gap={4} align='center'>
              <Text style={{ color: '#999' }}>
                {'shift + ⏎ to change line'}
              </Text>
              <Divider type='vertical' />
              <Button
                type='primary'
                onClick={() => {
                  if (renderingBot) {
                    onModifyButtonInBubbleClick(message, index)
                  } else {
                    onSendButtonInBubbleClicked(message, index)
                  }
                }}
              >
                {renderingBot ? 'Modify (⏎)' : 'Send (⏎)'}
              </Button>
              <Button
                onClick={() => {
                  setEditingIndex(null)
                  setEditingText(undefined)
                }}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex vertical>
            <Markdown>{message.message.trim()}</Markdown>
            {!renderingBot && (
              <Row justify='end'>
                <Tooltip title='Edit'>
                  <Button
                    disabled={agent.isRequesting()}
                    color='default'
                    variant='text'
                    size='small'
                    icon={<EditOutlined />}
                    onClick={() => onEditButtonClick(message)}
                  />
                </Tooltip>
                <Tooltip title='Copy'>
                  <Button
                    disabled={agent.isRequesting()}
                    color='default'
                    variant='text'
                    size='small'
                    onClick={() => onCopyButtonClick(message)}
                    icon={<CopyOutlined />}
                  />
                </Tooltip>
              </Row>
            )}
          </Flex>
        ),
        header: renderingBot ? <Text>RWKV</Text> : undefined,
        footer:
          renderingBot && !editing ? (
            <>
              <Tooltip title='Regenerate'>
                <Button
                  disabled={agent.isRequesting()}
                  color='default'
                  variant='text'
                  size='small'
                  icon={<SyncOutlined />}
                  onClick={() => onRegenerateButtonClick(message, index)}
                />
              </Tooltip>
              <Tooltip title='Copy'>
                <Button
                  disabled={agent.isRequesting()}
                  color='default'
                  variant='text'
                  size='small'
                  onClick={() => onCopyButtonClick(message)}
                  icon={<CopyOutlined />}
                />
              </Tooltip>
              <Tooltip title='Edit'>
                <Button
                  disabled={agent.isRequesting()}
                  color='default'
                  variant='text'
                  size='small'
                  icon={<EditOutlined />}
                  onClick={() => onEditButtonClick(message)}
                />
              </Tooltip>
            </>
          ) : undefined,
      }
      return bubbleData
    })
  }

  const hasMessages = messages.length > 0
  const hasStateVisual = stateVisual !== null
  const [loaded] = useRecoilState(P.modelLoaded)
  const [stateVisualOpen, setStateVisualOpen] = useState(false)
  const [stateVisualFull, setStateVisualFull] = useState(false)
  const [stateStatsOutliers, setStateStatsOutliers] = useState(true)
  const [sampleOptionsCollapsed, setSampleOptionsCollapsed] = useState(false)

  const renderStateStats = () => {
    return stateVisual!.stats.flatMap((x) => {
      return [
        {
          layer: x.layer,
          head: x.head,
          value: x.bins[stateStatsOutliers ? 0 : 1],
        },
        { layer: x.layer, head: x.head, value: x.bins[2] },
        { layer: x.layer, head: x.head, value: x.bins[3] },
        { layer: x.layer, head: x.head, value: x.bins[4] },
        {
          layer: x.layer,
          head: x.head,
          value: x.bins[stateStatsOutliers ? 6 : 5],
        },
      ]
    })
  }

  const renderStateImages = () => {
    return stateVisual!.images.map((line, layer) => (
      <Flex key={layer}>
        <Text
          strong
          style={{ minWidth: 100, textAlign: 'center', alignSelf: 'center' }}
        >
          Layer {layer}
        </Text>
        <>
          {line.map((code) => (
            <Image
              key={code}
              width={64}
              src={`data:image/png;base64,${code}`}
            />
          ))}
        </>
      </Flex>
    ))
  }

  return (
    <Layout>
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
          height: '100vh',
        }}
      >
        {!hasMessages && <Info />}
        {hasMessages && (
          <Bubble.List
            style={{ flex: 1 }}
            roles={roles}
            items={renderMessages()}
          />
        )}
        {loaded && !hasMessages && (
          <Prompts
            title='✨ Inspirational Sparks and Marvelous Tips'
            items={items}
            style={{ marginLeft: 24, marginRight: 24 }}
            onItemClick={(data) => {
              onRequest(data.data.description as string)
              setContent('')
              llmContentRef.current = ''
            }}
            wrap
          />
        )}
        <Sender
          allowSpeech
          disabled={!loaded || agent.isRequesting() || editingIndex !== null}
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
            llmContentRef.current = ''
          }}
        />
        <Text style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>
          Disclaimer: The content generated by this model may contain
          inaccuracies.
        </Text>
        {
          <FloatButton.Group>
            {loaded && hasStateVisual && (
              <FloatButton
                icon={<BarChartOutlined />}
                onClick={() => setStateVisualOpen(true)}
              />
            )}
            {sampleOptionsCollapsed && (
              <FloatButton
                icon={<SettingOutlined />}
                onClick={() =>
                  setSampleOptionsCollapsed(!sampleOptionsCollapsed)
                }
              />
            )}
          </FloatButton.Group>
        }
        {loaded && hasStateVisual && (
          <Drawer
            title='State Visualizer'
            height={stateVisualFull ? '100vh' : 738}
            placement='bottom'
            onClose={() => setStateVisualOpen(false)}
            destroyOnClose={true}
            open={stateVisualOpen}
            extra={
              <Button
                icon={stateVisualFull ? <DownOutlined /> : <UpOutlined />}
                onClick={() => setStateVisualFull(!stateVisualFull)}
              />
            }
          >
            <Tabs
              defaultActiveKey='1'
              items={[
                {
                  key: '1',
                  label: 'Statistics',
                  children: (
                    <>
                      <Switch
                        value={stateStatsOutliers}
                        checkedChildren='Include Outliers'
                        unCheckedChildren='Exclude Outliers'
                        onChange={(value) => setStateStatsOutliers(value)}
                      />
                      <Violin
                        violinType='normal'
                        data={renderStateStats()}
                        xField='head'
                        yField='value'
                        seriesField='layer'
                      />
                    </>
                  ),
                },
                {
                  key: '2',
                  label: 'Images',
                  children: <>{renderStateImages()}</>,
                },
              ]}
            />
          </Drawer>
        )}
      </Flex>
      <Sider
        style={{
          background: '#0000',
          borderLeft: sampleOptionsCollapsed ? 'none' : '1px solid #00000033',
          padding: sampleOptionsCollapsed ? 0 : 12,
        }}
        theme='light'
        width={250}
        collapsedWidth={0}
        breakpoint='lg'
        collapsible
        collapsed={!loaded || sampleOptionsCollapsed}
        onCollapse={(value) => setSampleOptionsCollapsed(value)}
        trigger={null}
      >
        <Flex justify='space-between' gap='middle'>
          <Title level={4}>Sampler Options</Title>
          <Button
            icon={<RightOutlined />}
            onClick={() => setSampleOptionsCollapsed(!sampleOptionsCollapsed)}
          />
        </Flex>
        <Flex vertical gap={18}>
          <Popover
            overlayStyle={{ maxWidth: 300 }}
            title='Explanation of Temperature'
            content={
              <Text>
                Temperature controls the randomness of the generated text.
                Higher values (e.g., 1.0 or above) result in more randomness,
                while lower values (e.g., 0.2) make the output more
                deterministic and focused on high-probability words.
              </Text>
            }
          >
            <Flex gap={4} style={{ cursor: 'help' }}>
              <Col span={16}>
                <Text>Temperature</Text>
              </Col>
              <Col span={8}>
                <Text strong>{samplerOptions.temperature}</Text>
              </Col>
            </Flex>
          </Popover>
          <Slider
            min={0}
            max={5}
            step={0.1}
            onChange={(value) =>
              updateSamplerOptions({ ...samplerOptions, temperature: value })
            }
            value={samplerOptions.temperature}
          />
        </Flex>
        <Flex vertical gap={18}>
          <Popover
            overlayStyle={{ maxWidth: 300 }}
            title='Explanation of Top P'
            content={
              <Text>
                Top-p (nucleus sampling) limits the candidate word set by
                choosing words whose cumulative probabilities reach a threshold
                (e.g., 0.9). It balances diversity while avoiding complete
                randomness.
              </Text>
            }
          >
            <Flex gap={4} style={{ cursor: 'help' }}>
              <Col span={16}>
                <Text>Top P</Text>
              </Col>
              <Col span={8}>
                <Text strong>{samplerOptions.top_p}</Text>
              </Col>
            </Flex>
          </Popover>
          <Slider
            min={0}
            max={1}
            step={0.01}
            onChange={(value) =>
              updateSamplerOptions({ ...samplerOptions, top_p: value })
            }
            value={samplerOptions.top_p}
          />
        </Flex>
        <Flex vertical gap={18}>
          <Popover
            overlayStyle={{ maxWidth: 300 }}
            title='Explanation of Presence Penalty'
            content={
              <Text>
                Presence penalty reduces the likelihood of the model reusing
                words or topics it has already generated. Higher values
                encourage the model to introduce new words or ideas.
              </Text>
            }
          >
            <Flex gap={4} style={{ cursor: 'help' }}>
              <Col span={16}>
                <Text>Presence Penalty</Text>
              </Col>
              <Col span={8}>
                <Text strong>{samplerOptions.presence_penalty}</Text>
              </Col>
            </Flex>
          </Popover>
          <Slider
            min={0}
            max={5}
            step={0.1}
            onChange={(value) =>
              updateSamplerOptions({
                ...samplerOptions,
                presence_penalty: value,
              })
            }
            value={samplerOptions.presence_penalty}
          />
        </Flex>
        <Flex vertical gap={18}>
          <Popover
            title='Explanation of Count Penalty'
            overlayStyle={{ maxWidth: 300 }}
            content={
              <Text>
                Count penalty (frequency penalty) discourages overuse of
                repeated words in the generated text. Higher values impose
                stronger penalties on frequently used words.
              </Text>
            }
          >
            <Flex gap={4} style={{ cursor: 'help' }}>
              <Col span={16}>
                <Text>Count Penalty</Text>
              </Col>
              <Col span={8}>
                <Text strong>{samplerOptions.count_penalty}</Text>
              </Col>
            </Flex>
          </Popover>
          <Slider
            min={0}
            max={5}
            step={0.1}
            onChange={(value) =>
              updateSamplerOptions({ ...samplerOptions, count_penalty: value })
            }
            value={samplerOptions.count_penalty}
          />
        </Flex>
        <Flex vertical gap={18}>
          <Popover
            overlayStyle={{ maxWidth: 300 }}
            title='Explanation of Penalty Half Life'
            content={
              <Text>
                Half-life dynamically adjusts the influence of penalties over
                time. Longer half-life means the effect lasts longer, while
                shorter half-life results in quicker dissipation of the
                adjustment.
              </Text>
            }
          >
            <Flex gap={4} style={{ cursor: 'help' }}>
              <Col span={16}>
                <Text>Penalty Half Life</Text>
              </Col>
              <Col span={8}>
                <Text strong>{samplerOptions.half_life}</Text>
              </Col>
            </Flex>
          </Popover>
          <Slider
            min={1}
            max={2048}
            step={1}
            onChange={(value) =>
              updateSamplerOptions({ ...samplerOptions, half_life: value })
            }
            value={samplerOptions.half_life}
          />
        </Flex>
      </Sider>
    </Layout>
  )
}

const invoke = (
  worker: Worker,
  history: string[],
  state: string,
  samplerOptions: SamplerOptions,
) => {
  // let prompt: string
  // if (history === '') prompt = `${assistant}\n\nUser: ${message}\n\nAssistant:`
  // else if (history.length >= 2 && history.slice(-2) === '\n\n')
  //   prompt = `User: ${message}\n\nAssistant:`
  // else prompt = `\n\nUser: ${message}\n\nAssistant:`

  let prompt = history
    .map((text, index) => {
      const role = index % 2 === 0 ? 'User' : 'Assistant'
      return `${role}: ${text.trim()}`
    })
    .join('\n\n')
  prompt = `${P.intro}\n\n${prompt}\n\nAssistant:`

  const { temperature, top_p, presence_penalty, count_penalty, half_life } =
    samplerOptions
  const options = {
    task: 'chat',
    max_len: 2048,
    prompt,
    state_key: state,
    stop_tokens: stopTokens,
    temperature,
    top_p,
    presence_penalty,
    count_penalty,
    penalty_decay: Math.exp(-0.69314718 / Math.max(half_life, 1)),
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
  const [loaded, setLoaded] = useRecoilState(P.modelLoaded)
  const [progress] = useRecoilState(P.loadedProgress)
  const [contentLength, setContentLength] = useRecoilState(P.modelSize)
  const [loadedLength, setLoadedLength] = useRecoilState(P.loadedSize)
  const worker = useRecoilValue(P.worker)

  const onClickLoadModel = async () => {
    setLoading(true)
    setLoaded(false)
    const chunks = await loadData(
      'chat',
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
      },
    )
    await setupWorker(worker, chunks, 'chat')
  }

  const onUploadModel = async (file: any) => {
    if (file instanceof File) {
      setLoading(true)
      setLoaded(false)
      const chunks = await loadFile(
        file,
        (progress) => {
          setLoadedProgress(progress)
        },
        (contentLength) => {
          setContentLength(contentLength)
        },
        (loadedLength) => {
          setLoadedLength(loadedLength)
        },
      )
      await setupWorker(worker, chunks, 'chat')
    }
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
      <Text
        style={{
          fontSize: 16,
          fontWeight: 700,
          width: 300,
          textAlign: 'center',
        }}
      >
        An ultra-fast and efficient AI runs directly in your browser.
      </Text>
      <Text style={{ maxWidth: 410, textAlign: 'left' }}>
        Get ready to experience{' '}
        <a
          style={{ fontWeight: 700 }}
          href='https://huggingface.co/BlinkDL/rwkv-7-world/tree/main'
        >
          RWKV-x070-World-0.1B
        </a>
        , a compact language model with 0.1 billion parameters, optimized for
        seamless in-browser inference. This model operates entirely within your
        browser via{' '}
        <a
          style={{ fontWeight: 700 }}
          href='https://github.com/cryscan/web-rwkv'
        >
          Web-RWKV
        </a>
        , ensuring your data remains private and secure. Once loaded, it
        functions offline without requiring any server communication.
        Alternatively, download converted safetensors model from{' '}
        <a
          style={{ fontWeight: 700 }}
          href='https://huggingface.co/cgisky/RWKV-x070-Ai00/resolve/main/world_v2.8/0.1B/0.1B-20241210-ctx4096.st'
        >
          HuggingFace
        </a>{' '}
        and load locally.
      </Text>
      <Text style={{ maxWidth: 410, textAlign: 'left' }}>
        Note that this demo runs on WebGPU, so make sure that your browser
        supports it before running (See{' '}
        <a href='https://webgpureport.org/' target='_blank'>
          WebGPU Report
        </a>
        ).
      </Text>
      <Text style={{ maxWidth: 410, textAlign: 'left' }}>
        Disclaimer: RWKV-x070-World-0.1B excels in general knowledge, creative
        writing, basic multilingual tasks, and simple coding. However, it may
        face challenges with arithmetic, editing, and complex reasoning.
      </Text>

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
      {!loaded && !loading && (
        <Dragger customRequest={(options) => onUploadModel(options.file)}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>
            Click or drag file to this area to open local .st model.
          </p>
        </Dragger>
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
