import { Sender } from '@ant-design/x'
import {
  Affix,
  Col,
  Flex,
  Image,
  Layout,
  Progress,
  Row,
  Slider,
  Switch,
  Tabs,
  Tour,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { P } from './state_chat'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Typography } from 'antd'
import { Frame } from '../func/type'
import { Violin } from '@ant-design/charts'

const { Text } = Typography

const Replay = () => {
  const [content, setContent] = useState('')
  const llmContent = useRef('')

  const [tokenIndex, setTokenIndex] = useState(0)
  const [tokenTotal, setTokenTotal] = useState(0)
  const [animationReady, setAnimationReady] = useState(true)
  const animation = useRef<Frame[]>([])

  const [tourOpen, setTourOpen] = useState(false)
  const tourOpened = useRef(false)
  const refFrameSlider = useRef(null)
  const refSender = useRef(null)

  const worker = useRecoilValue(P.worker)
  const onWorkerMessageReceived = (event: any) => {
    if (!event) return
    switch (event.type) {
      case 'replay':
        const { index, total, word, visual } = event
        setTokenIndex(index)
        setTokenTotal(total)
        setAnimationReady(false)

        if (!tourOpened.current) setTourOpen(true)

        const frame = {
          history: llmContent.current,
          word,
          visual,
        }
        animation.current.push(frame)
        console.log(frame)
        llmContent.current += word

        break
      case 'replay_end':
        setAnimationReady(true)
        break
    }
  }

  const sendRequest = (prompt: string) => {
    if (!prompt) return
    const options = {
      task: 'replay',
      vocab: '../assets/rwkv_vocab_v20230424.json',
      prompt,
    }
    worker.postMessage(JSON.stringify(options))
  }

  const initializeApp = () => {
    if (!navigator.gpu) {
      setTimeout(() => {
        alert('WebGPU is not supported by this browser.')
      }, 1000)
    }

    worker.postMessage(JSON.stringify({ task: 'abort' }))
    window.chat = onWorkerMessageReceived
    console.log('✅ Replay worker callback set')
  }

  useEffect(() => {
    initializeApp()
  }, [])

  const hasAnimation = animation.current.length > 0
  const percent = Math.round((tokenIndex / (tokenTotal - 1)) * 100)
  const [loaded] = useRecoilState(P.modelLoaded)
  const [stateStatsOutliers, setStateStatsOutliers] = useState(true)
  const [frameIndex, setFrameIndex] = useState(0)

  const renderStateStats = (index: number) =>
    animation.current[index].visual.stats.flatMap((x) => {
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
  const renderStateImages = (index: number) =>
    animation.current[index].visual.images.map((line, layer) => (
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
    <>
      <Tour
        closable={false}
        open={tourOpen}
        onClose={() => {
          setTourOpen(false)
          tourOpened.current = true
        }}
        steps={[
          {
            title: 'Visualize Tokens',
            description: 'Slide to visualize states on inputting tokens.',
            target: refFrameSlider.current,
          },
        ]}
      />
      <Layout style={{ height: '100vh' }}>
        <Flex
          vertical
          gap='middle'
          style={{
            padding: 12,
            boxSizing: 'border-box',
            overflowY: 'scroll',
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
          }}
        >
          <Sender
            ref={refSender}
            disabled={!loaded || !animationReady}
            loading={!animationReady}
            value={content}
            style={{
              marginLeft: 20,
              marginRight: 20,
              boxSizing: 'border-box',
              width: 'auto',
            }}
            onChange={setContent}
            placeholder='Input some text to visualize the evolving of states...'
            onSubmit={(message) => {
              sendRequest(message)
              setContent('')
              setTokenIndex(0)
              setTokenTotal(0)
              setFrameIndex(0)
              setAnimationReady(false)
              animation.current = []
            }}
          />
          {hasAnimation && <Progress percent={percent} />}
          {hasAnimation && (
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
                        data={renderStateStats(frameIndex)}
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
                  children: <>{renderStateImages(frameIndex)}</>,
                },
              ]}
            />
          )}
          {hasAnimation && (
            <Affix offsetBottom={0}>
              <Row>
                <Col span={1}></Col>
                <Col span={2}>
                  <Text strong underline style={{ textAlign: 'right' }}>
                    {animation.current[frameIndex].word}
                  </Text>
                </Col>
                <Col span={18} ref={refFrameSlider}>
                  <Slider
                    min={0}
                    max={animation.current.length - 1}
                    step={1}
                    onChange={(value) => setFrameIndex(value)}
                    value={frameIndex}
                  />
                </Col>
                <Col span={3}></Col>
              </Row>
            </Affix>
          )}
        </Flex>
      </Layout>
    </>
  )
}

export default Replay
