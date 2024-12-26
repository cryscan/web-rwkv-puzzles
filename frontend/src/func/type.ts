export interface SamplerOptions {
  temperature: number
  top_p: number
  presence_penalty: number
  count_penalty: number
  half_life: number
}

export interface StateVisual {
  num_layer: number
  num_head: number
  stats: StateHeadStats[]
  images: string[][]
}

export interface StateHeadStats {
  layer: number
  head: number
  bins: number[]
}

export interface Frame {
  word: string
  history: string
  visual: StateVisual
}
