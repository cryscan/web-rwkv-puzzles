import Setting from "./setting";

export default function Intro() {
  return (
    <div className='w-full h-full flex flex-col gap-2 items-center justify-center border border-zinc-500 border-dashed rounded-lg'>
      <h1 className='text-2xl font-bold'>RWKV Music</h1>
      <p className='text-md '>
        A blazingly fast and powerful AI music generator that runs locally in
        your browser.
      </p>
      <Setting/>
    </div>
  )
}
