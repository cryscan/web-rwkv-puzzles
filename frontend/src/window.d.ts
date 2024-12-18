export declare global {
  interface Window {
    /**
     * load model, implement in web/app.ts
     */
    load: () => Promise<void>

    rwkv_worker: Worker

    workerMessageReceived: (data: any) => void

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
