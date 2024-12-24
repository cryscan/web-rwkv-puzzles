import Intro from './intro'
import Setting from './setting'

export default function Controller() {
  return (
    <div className='w-full h-full flex flex-col gap-2'>
      <div className='w-full h-1/2'>
        <Intro />
      </div>
      <div className='w-full h-1/2'>
        <Setting />
      </div>
    </div>
  )
}
