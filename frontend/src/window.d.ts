export declare global {
  interface Window {
    chat_worker: Worker
    puzzle_worker: Worker

    onChatMessageReceived: (data: any) => void
    onPuzzleMessageReceived: (data: any) => void

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
