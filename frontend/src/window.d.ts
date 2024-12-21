export declare global {
  interface Window {
    chat: (data: any) => void
    puzzle: (data: any) => void

    /**
     * Update binding for Ant Design X
     */
    onUpdateBinding: (data: any) => void

    /**
     * Success binding for Ant Design X
     */
    onSuccessBinding: (data: any) => void
  }

  interface Navigator {
    gpu: GPU
  }
}
