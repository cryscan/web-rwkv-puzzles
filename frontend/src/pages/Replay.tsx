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
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingOutlined,
  UserOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Drawer,
  Flex,
  FloatButton,
  Image,
  Layout,
  message,
  Popover,
  Progress,
  Row,
  Slider,
  Switch,
  Tabs,
  type GetProp,
} from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { P } from './state_chat'
import { useRecoilState, useRecoilValue } from 'recoil'
import { loadData } from '../func/load'
import { setupWorker } from '../setup_worker'
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

  const isLoading = () =>
    tokenTotal > 0 && (tokenIndex == 0 || tokenIndex < tokenTotal - 1)

  const initializeApp = () => {
    window.chat = onWorkerMessageReceived
    console.log('✅ Replay worker callback set')
  }

  useEffect(() => {
    initializeApp()
  }, [])

  const hasAnimation = animation.current.length > 0
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

  const renderStateImages = (index: number) => (
    <Flex
      vertical
      gap='middle'
      style={{
        boxSizing: 'border-box',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100vh',
      }}
    >
      {animation.current[index].visual.images.map((line, layer) => (
        <Row>
          <Col span={1}>Layer {layer}</Col>
          <Col span={23}>
            {line.map((code) => (
              <Image width={64} src={`data:image/png;base64,${code}`} />
            ))}
          </Col>
        </Row>
      ))}
    </Flex>
  )

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
        <Sender
          disabled={!loaded}
          loading={isLoading()}
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
          }}
        />
        {hasAnimation && (
          <Slider
            min={0}
            max={tokenIndex}
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
