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
  Progress,
  Slider,
  Space,
  Switch,
  App,
  Tabs,
  Tooltip,
  type GetProp,
  Row,
} from 'antd'
import React, { useEffect, useRef, useState } from 'react'
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

const stops = [24281, 0, 82] // User, Q

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
  const [content, setContent] = React.useState('')
  const llmContent = React.useRef('')

  const worker = useRecoilValue(P.worker)
  const [, setLoading] = useRecoilState(P.modelLoading)
  const [, setLoaded] = useRecoilState(P.modelLoaded)

  const stateKey = useRef(new Date().toUTCString())
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
        if (stops.includes(token)) {
          window.onSuccessBinding(llmContent.current)
        } else {
          llmContent.current += word
          window.onUpdateBinding(llmContent.current)
        }
        break
    }
  }

  const initializeApp = () => {
    worker.postMessage(JSON.stringify({ task: 'abort' }))
    window.chat = onWorkerMessageReceived
    console.log('✅ Chat worker callback set')
  }

  useEffect(() => {
    initializeApp()
  }, [])

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      if (!message) return
      invoke(
        worker,
        message,
        llmContent.current,
        stateKey.current,
        samplerOptionsRef.current,
      )
      window.onUpdateBinding = onUpdate
      window.onSuccessBinding = onSuccess
    },
  })

  const { onRequest, messages } = useXChat({
    agent,
  })

  const hasMessages = messages.length > 0
  const hasStateVisual = stateVisual !== null
  const [loaded] = useRecoilState(P.modelLoaded)
  const [stateVisualOpen, setStateVisualOpen] = useState(false)
  const [stateVisualFull, setStateVisualFull] = useState(false)
  const [stateStatsOutliers, setStateStatsOutliers] = useState(true)
  const [sampleOptionsCollapsed, setSampleOptionsCollapsed] = useState(false)
  const { message: AppMessage } = App.useApp()
  const [editingIndex, setEditingIndex] = useRecoilState(P.editingIndex)
  const [editingText, setEditingText] = useRecoilState(P.editingText)

  const onCopyButtonClick = (message: MessageInfo<string>) => {
    AppMessage.success('Copied to clipboard')
    navigator.clipboard.writeText(message.message)
  }

  const onEditButtonClick = (message: MessageInfo<string>) => {
    setEditingIndex(message.id)
    setEditingText(message.message)
  }

  const renderMessages = () => {
    return messages.map((message: MessageInfo<string>) => {
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
            />
            <Flex justify='end' gap={4}>
              <Button
                type='primary'
                onClick={() => {
                  setEditingIndex(null)
                  setEditingText(undefined)
                  // TODO: send the message
                }}
              >
                {renderingBot ? 'Modify' : 'Send'}
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
            <Markdown>{message.message}</Markdown>
            {!renderingBot && (
              <Row justify='end'>
                <Tooltip title='Edit'>
                  <Button
                    color='default'
                    variant='text'
                    size='small'
                    icon={<EditOutlined />}
                    onClick={() => onEditButtonClick(message)}
                  />
                </Tooltip>
                <Tooltip title='Copy'>
                  <Button
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
                  color='default'
                  variant='text'
                  size='small'
                  icon={<SyncOutlined />}
                />
              </Tooltip>
              <Tooltip title='Copy'>
                <Button
                  color='default'
                  variant='text'
                  size='small'
                  onClick={() => onCopyButtonClick(message)}
                  icon={<CopyOutlined />}
                />
              </Tooltip>
              <Tooltip title='Edit'>
                <Button
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

  const renderStateStats = () =>
    stateVisual!.stats.flatMap((x) => {
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

  const renderStateImages = () =>
    stateVisual!.images.map((line, layer) => (
      <Flex>
        <Text
          strong
          style={{ minWidth: 100, textAlign: 'center', alignSelf: 'center' }}
        >
          Layer {layer}
        </Text>
        <>
          {line.map((code) => (
            <Image width={64} src={`data:image/png;base64,${code}`} />
          ))}
        </>
      </Flex>
    ))

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
        {hasMessages && <Bubble.List roles={roles} items={renderMessages()} />}
        {loaded && !hasMessages && (
          <Prompts
            title='✨ Inspirational Sparks and Marvelous Tips'
            items={items}
            style={{ marginLeft: 24, marginRight: 24 }}
            onItemClick={(data) => {
              onRequest(data.data.description as string)
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
          Disclaimer: Contents generated by this model may possibly be false.
        </div>
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
  message: string,
  history: string,
  state: string,
  sampler: SamplerOptions,
) => {
  let prompt: string

  if (history === '') {
    prompt = `${P.firstPrompt}\n\nUser: ${message}\n\nAssistant:`
  } else if (history.length >= 2 && history.slice(-2) === '\n\n') {
    prompt = `User: ${message}\n\nAssistant:`
  } else {
    prompt = `\n\nUser: ${message}\n\nAssistant:`
  }

  // prettier-ignore
  const {
    temperature,
    top_p,
    presence_penalty,
    count_penalty,
    half_life,
  } = sampler

  const options = {
    task: 'chat',
    max_len: 2048,
    prompt,
    state_key: state,
    stop_tokens: stops,
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
  const [heartBeatSet, setHeartBeatSet] = useRecoilState(P.heartBeatSet)
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

  const initializeApp = () => {
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
  })

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
        Alternatively, download converted safetensors model from{' '}
        <a
          style={{ fontWeight: 700 }}
          href='https://huggingface.co/cgisky/ai00_rwkv_x060/tree/main'
        >
          HuggingFace
        </a>{' '}
        and load locally.
      </div>
      <div style={{ maxWidth: 410, textAlign: 'left' }}>
        Note that this demo runs on WebGPU so make sure that your browser
        support it before running (See{' '}
        <a href='https://webgpureport.org/' target='_blank'>
          WebGPU Report
        </a>
        ).
      </div>
      <div style={{ maxWidth: 410, textAlign: 'left' }}>
        Disclaimer: This model handles general knowledge, creative writing,
        basic multilingual, and basic coding. It may struggle with arithmetic,
        editing, and complex reasoning.
      </div>

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
          {loading ? 'Loading...' : 'Load Model Online'}
        </Button>
      )}
    </div>
  )
}

export default Chat
