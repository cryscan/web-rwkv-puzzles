async function load() {
    const modelElem = document.getElementById("model")!;
    const downloadElem = document.getElementById("download")!;
    const progressElem = document.getElementById("progress") as HTMLProgressElement;
    const statusElem = document.getElementById("status")!;
    const replyElem = document.getElementById("reply")!;
    var url = (document.getElementById("url") as HTMLInputElement).value;

    let response = await fetch(url);

    if ((response.status >= 200 && response.status < 300) || (response.status === 0 /* Loaded from local file */)) {
        replyElem.innerText = "";
        modelElem.style.display = "none";
        downloadElem.style.display = "";
    } else if (response.status === 404 && url.startsWith('http://localhost')) {
        replyElem.innerText = "Model not found locally.";
        return;
    } else {
        replyElem.innerText = "Incorrect URL.";
        return;
    }

    const reader = response.body!.getReader();
    const contentLength = +response.headers!.get('Content-Length')!;

    let receivedLength = 0;
    let chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        receivedLength += value.length;

        progressElem.value = receivedLength / contentLength;
        statusElem.innerHTML = `<p>${url}</p><p>${receivedLength * 1.0e-6} / ${contentLength * 1.0e-6} MB</p>`;
    }

    downloadElem.style.display = "none";

    var worker = new Worker('web/worker.js');
    ;(window as any).rwkv_worker = worker
    console.log('✅ worker loaded')
    worker.onmessage = (e: MessageEvent<string | null>) => {
        const { data } = e
        ;(window as any).rwkv_addLogs(data)
        ;(window as any).rwkv_boardChanged(data)
    }

    worker.postMessage(chunks, chunks.map(x => x.buffer));

}

function randomize_puzzle_15() {
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    function shuffleArray(array: any[]) {
        for (var i = array.length - 1; i >= 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    var board = [
        '0  ', '1  ', '2  ', '3  ',
        '4  ', '5  ', '6  ', '7  ',
        '8  ', '9  ', '10 ', '11 ',
        '12 ', '13 ', '14 ', '15 '
    ];
    shuffleArray(board);

    var output = `${board[0]}${board[1]}${board[2]}${board[3]}
${board[4]}${board[5]}${board[6]}${board[7]}
${board[8]}${board[9]}${board[10]}${board[11]}
${board[12]}${board[13]}${board[14]}${board[15]}
`
    return output;
}

const urls = new Map([
    ["puzzle 15", "../assets/models/rwkv-puzzle15.st"],
    ["puzzle 15 local", "http://localhost:5500/assets/models/rwkv-puzzle15.st"],
    ["puzzle 15 hf", "https://huggingface.co/cryscan/rwkv-puzzles/resolve/main/rwkv-puzzle15.st"],
]);

function loadUrl(id: string, key: string) {
    (document.getElementById(id) as HTMLInputElement).value = urls.get(key)!;
}
