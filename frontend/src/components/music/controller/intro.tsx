import Setting from "./setting";

export default function Intro() {
  return (
    <div className='w-full h-full flex flex-col gap-2 items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg' >
      <h1 className='text-2xl font-bold text-white'>RWKV Music</h1>
      <p className='text-md bg-gradient-to-t from-zinc-200 to-gray-300 bg-clip-text text-transparent'>
        A blazingly fast and powerful AI music generator that runs locally in
        your browser.
      </p>
      <Setting />
    </div>
  )
}
