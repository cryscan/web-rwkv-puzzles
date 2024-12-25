import { Sender } from '@ant-design/x'
import {
  Button,
  Flex,
  Image,
  Layout,
  Progress,
  Slider,
  Space,
  Switch,
  Tabs,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { P } from './state_chat'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Typography } from 'antd'
import { StateVisual } from '../func/gluon'
import { Violin } from '@ant-design/charts'

const { Text, Title } = Typography

interface Frame {
  word: string
  history: string
  visual: StateVisual
}

const Replay = () => {
  const [content, setContent] = useState('')
  const llmContent = useRef('')

  const [tokenIndex, setTokenIndex] = useState(0)
  const [tokenTotal, setTokenTotal] = useState(0)
  const [animationReady, setAnimationReady] = useState(true)
  const animation = useRef<Frame[]>([])

  const worker = useRecoilValue(P.worker)
  const onWorkerMessageReceived = (event: any) => {
    if (!event) return
    switch (event.type) {
      case 'replay':
        const { index, total, word, visual } = event
        setTokenIndex(index)
        setTokenTotal(total)

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
    window.chat = onWorkerMessageReceived
    console.log('✅ Replay worker callback set')
  }

  useEffect(() => {
    initializeApp()
  }, [])

  const hasAnimation = animation.current.length > 0
  const percent = Math.round((tokenIndex / (tokenTotal - 1)) * 100)
  const [loaded] = useRecoilState(P.loaded)
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
      <Space>
        <Button style={{ minWidth: 100 }}>Layer {layer}</Button>
        <>
          {line.map((code) => (
            <Image width={64} src={`data:image/png;base64,${code}`} />
          ))}
        </>
      </Space>
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
          flex: '1',
        }}
      >
        <Sender
          disabled={!loaded}
          loading={!animationReady}
          value={content}
          style={{
            marginLeft: 20,
            marginRight: 20,
            boxSizing: 'border-box',
            width: 'auto',
          }}
          onChange={setContent}
          placeholder='Input prompt to process...'
          onSubmit={(message) => {
            sendRequest(message)
            setContent('')
            setTokenIndex(0)
            setTokenTotal(0)
            setFrameIndex(0)
            setAnimationReady(false)
          }}
        />
        {hasAnimation && <Progress percent={percent} />}
        {hasAnimation && (
          <Slider
            min={0}
            max={animation.current.length - 1}
            step={1}
            onChange={(value) => setFrameIndex(value)}
            value={frameIndex}
          />
        )}
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
      </Flex>
    </Layout>
  )
}

export default Replay
