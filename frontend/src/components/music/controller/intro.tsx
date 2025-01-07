import Setting from "./setting";

export default function Intro() {
  return (
    <div className='w-full h-full flex flex-col gap-2 items-center justify-center rounded-lg bg-gradient-to-r from-slate-900 to-slate-700' >
      <h1 className='text-xl md:text-2xl font-bold text-white'>RWKV Music</h1>
      <p className='text-sm md:text-lg bg-gradient-to-t from-zinc-50 to-gray-50 bg-clip-text text-transparent text-center'>
        A blazingly fast and powerful AI music generator that runs locally in
        your browser.
      </p>
      <Setting />
    </div>
  )
}
