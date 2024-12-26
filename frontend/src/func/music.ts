export async function generateMusic(worker: Worker, prompt: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      task: 'music',
      max_len: 1024,
      prompt,
      state_key: 'music',
      stop_tokens: [3],
      temperature: 1.0,
      top_p: 0.8,
      presence_penalty: 0, // presence penalty should not be applied on ABC models
      count_penalty: 0,
      penalty_decay: 0,
      vocab: '/assets/abctokenizer_vocab.json'
    }

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'generation_complete') {
        worker.removeEventListener('message', handleMessage);
        resolve();
      }
    };

    worker.addEventListener('message', handleMessage);
    window.music?.({ type: 'generation_start' });
    worker.postMessage(JSON.stringify(options));
  });
}